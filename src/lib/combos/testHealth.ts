type JsonRecord = Record<string, unknown>;

const COMBO_TEST_MAX_TOKENS = 2048;
const COMBO_TEST_OPERAND_MIN = 10000;
const COMBO_TEST_OPERAND_RANGE = 90000;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function joinNonEmpty(parts: string[]) {
  return parts.filter(Boolean).join("\n").trim();
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") return content.trim();

  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part.trim();

      const block = asRecord(part);
      const blockType = typeof block.type === "string" ? block.type : "";
      const blockText = typeof block.text === "string" ? block.text.trim() : "";

      if (blockText && (blockType === "" || blockType === "text" || blockType === "output_text")) {
        return blockText;
      }

      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractReasoningText(record: JsonRecord): string {
  const reasoningDetails = Array.isArray(record.reasoning_details) ? record.reasoning_details : [];
  const detailText = reasoningDetails
    .map((detail) => {
      const detailRecord = asRecord(detail);
      const detailType = typeof detailRecord.type === "string" ? detailRecord.type : "";
      const text =
        typeof detailRecord.text === "string"
          ? detailRecord.text.trim()
          : typeof detailRecord.content === "string"
            ? detailRecord.content.trim()
            : "";

      if (
        text &&
        (detailType === "" ||
          detailType === "reasoning" ||
          detailType === "reasoning.text" ||
          detailType === "thinking")
      ) {
        return text;
      }

      return "";
    })
    .filter(Boolean);

  return joinNonEmpty([
    typeof record.reasoning_content === "string" ? record.reasoning_content.trim() : "",
    typeof record.reasoning === "string" ? record.reasoning.trim() : "",
    typeof record.reasoning_text === "string" ? record.reasoning_text.trim() : "",
    joinNonEmpty(detailText),
  ]);
}

function getUsageReasoningTokens(body: JsonRecord): number {
  const usage = asRecord(body.usage);
  if (!usage) return 0;

  const completionDetails = asRecord(usage.completion_tokens_details);
  const topLevelReasoning =
    typeof usage.reasoning_tokens === "number" && Number.isFinite(usage.reasoning_tokens)
      ? usage.reasoning_tokens
      : 0;
  const detailedReasoning =
    typeof completionDetails.reasoning_tokens === "number" &&
    Number.isFinite(completionDetails.reasoning_tokens)
      ? completionDetails.reasoning_tokens
      : 0;

  return Math.max(topLevelReasoning, detailedReasoning);
}

function hasReasoningOnlyCompletion(body: JsonRecord): boolean {
  if (!Array.isArray(body.choices) || body.choices.length === 0) return false;
  if (getUsageReasoningTokens(body) <= 0) return false;

  return body.choices.some((choice) => {
    const choiceRecord = asRecord(choice);
    const message = asRecord(choiceRecord.message);
    const finishReason =
      typeof choiceRecord.finish_reason === "string" ? choiceRecord.finish_reason : "";

    if (!message || message.role !== "assistant") return false;
    if (!finishReason) return false;
    if (extractTextFromContent(message.content)) return false;
    if (extractReasoningText(message)) return false;
    return true;
  });
}

function getRandomFiveDigitNumber() {
  return COMBO_TEST_OPERAND_MIN + Math.floor(Math.random() * COMBO_TEST_OPERAND_RANGE);
}

function buildComboTestPrompt() {
  const left = getRandomFiveDigitNumber();
  const right = getRandomFiveDigitNumber();

  return `Calculate ${left}+${right}, and reply with the result only.`;
}

export function buildComboTestRequestBody(modelStr: string) {
  return {
    model: modelStr,
    // Randomize the arithmetic prompt so upstream providers are less likely to
    // satisfy the smoke test with cached completions.
    messages: [{ role: "user", content: buildComboTestPrompt() }],
    // Give reasoning-heavy models enough headroom to finish the request and
    // still emit a visible answer without immediate truncation.
    max_tokens: COMBO_TEST_MAX_TOKENS,
    stream: false,
  };
}

export function extractComboTestResponseText(responseBody: unknown): string {
  const body = asRecord(responseBody);

  if (typeof body.output_text === "string" && body.output_text.trim()) {
    return body.output_text.trim();
  }

  if (Array.isArray(body.choices)) {
    for (const choice of body.choices) {
      const choiceRecord = asRecord(choice);
      const message = asRecord(choiceRecord.message);
      const messageText = extractTextFromContent(message.content);
      if (messageText) return messageText;

      const reasoningText = extractReasoningText(message);
      if (reasoningText) return reasoningText;

      if (typeof choiceRecord.text === "string" && choiceRecord.text.trim()) {
        return choiceRecord.text.trim();
      }
    }
  }

  if (Array.isArray(body.output)) {
    for (const item of body.output) {
      const itemRecord = asRecord(item);
      const contentText = extractTextFromContent(itemRecord.content);
      if (contentText) return contentText;

      const reasoningText = extractReasoningText(itemRecord);
      if (reasoningText) return reasoningText;
    }
  }

  const topLevelText = extractTextFromContent(body.content);
  if (topLevelText) return topLevelText;

  const topLevelReasoning = extractReasoningText(body);
  if (topLevelReasoning) return topLevelReasoning;

  if (hasReasoningOnlyCompletion(body)) {
    return "[reasoning-only completion]";
  }

  return "";
}

/**
 * Send a minimal but real chat request for `modelStr` through the same
 * internal /v1 pipeline an external OpenAI-compatible client would use.
 *
 * Used by combo health checks and provider per-model tests. The internal
 * test header bypasses REQUIRE_API_KEY for authenticated dashboard callers,
 * and the no-cache header forces a fresh execution path so tests can never
 * be satisfied by the semantic cache or other request-reuse layers.
 */
export async function testModelViaPipeline(
  modelStr: string,
  internalUrl: string,
  requestIdPrefix = "model-test"
): Promise<{
  model: string;
  status: "ok" | "error";
  statusCode?: number;
  latencyMs: number;
  error?: string;
  responseText?: string;
}> {
  const startTime = Date.now();
  try {
    const testBody = buildComboTestRequestBody(modelStr);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let res: Response;
    try {
      res = await fetch(internalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Test": "combo-health-check",
          "X-InfinitiRoute-No-Cache": "true",
          "X-Request-Id": `${requestIdPrefix}-${crypto.randomUUID()}`,
        },
        body: JSON.stringify(testBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      let responseBody: unknown = null;
      try {
        responseBody = await res.json();
      } catch {
        responseBody = null;
      }

      const responseText = extractComboTestResponseText(responseBody);
      if (!responseText) {
        return {
          model: modelStr,
          status: "error",
          statusCode: res.status,
          error: "Provider returned HTTP 200 but no text content.",
          latencyMs,
        };
      }

      return { model: modelStr, status: "ok", latencyMs, responseText };
    }

    let errorMsg = "";
    try {
      const errBody = await res.json();
      errorMsg = errBody?.error?.message || errBody?.error || res.statusText;
    } catch {
      errorMsg = res.statusText;
    }

    return {
      model: modelStr,
      status: "error",
      statusCode: res.status,
      error: errorMsg,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      model: modelStr,
      status: "error",
      error: error.name === "AbortError" ? "Timeout (20s)" : error.message,
      latencyMs,
    };
  }
}

/**
 * Get the base URL for internal requests (VPS-safe: respects reverse proxy headers)
 */
export function getBaseUrl(request: Request): string {
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") || "https";
  if (fwdHost) return `${fwdProto}://${fwdHost}`;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
