import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getBaseUrl, testModelViaPipeline } from "@/lib/combos/testHealth";
import { providerTestModelsSchema } from "@/shared/validation/schemas";
import { isValidationFailure, validateBody } from "@/shared/validation/helpers";
import {
  APIKEY_PROVIDERS,
  FREE_PROVIDERS,
  OAUTH_PROVIDERS,
  OPENAI_COMPATIBLE_PREFIX,
  ANTHROPIC_COMPATIBLE_PREFIX,
} from "@/shared/constants/providers";

const MAX_CONCURRENCY = 3;

function isKnownProvider(providerId) {
  if (FREE_PROVIDERS[providerId] || OAUTH_PROVIDERS[providerId] || APIKEY_PROVIDERS[providerId]) {
    return true;
  }
  return (
    typeof providerId === "string" &&
    (providerId.startsWith(OPENAI_COMPATIBLE_PREFIX) ||
      providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX))
  );
}

/**
 * POST /api/providers/[id]/test-models
 *
 * Per-model health test: sends a minimal but REAL chat completion for each
 * requested model through the normal /v1 pipeline (translation → executor →
 * upstream → account selection), so a passing result proves the model works
 * end to end with the currently connected account — not merely that the
 * credential looks valid (that is what the connection "Retest" does).
 */
export async function POST(request, context) {
  const { id: providerId } = await context.params;

  if (!isKnownProvider(providerId)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Invalid request",
          details: [{ field: "body", message: "Invalid JSON body" }],
        },
      },
      { status: 400 }
    );
  }

  const validation = validateBody(providerTestModelsSchema, rawBody);
  if (isValidationFailure(validation)) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const internalUrl = `${getBaseUrl(request)}/v1/chat/completions`;

  // Models arrive fully prefixed ("antigravity/claude-opus-4-6-thinking"),
  // exactly as the dashboard displays them. Dedupe while preserving order.
  const models = [...new Set(validation.data.models)];

  // Limited concurrency — a "test all" click must not open MAX_CONCURRENCY
  // simultaneous upstream calls per provider and trip rate limits.
  const results = [];
  for (let i = 0; i < models.length; i += MAX_CONCURRENCY) {
    const batch = models.slice(i, i + MAX_CONCURRENCY);
    const settled = await Promise.all(
      batch.map((modelStr) => testModelViaPipeline(modelStr, internalUrl, "provider-model-test"))
    );
    results.push(...settled);
  }

  return NextResponse.json({
    providerId,
    results,
    testedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter((r) => r.status === "ok").length,
      failed: results.filter((r) => r.status !== "ok").length,
    },
    requestId: `provider-test-${randomUUID()}`,
  });
}
