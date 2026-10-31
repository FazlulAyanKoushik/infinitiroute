# InfinitiRoute

**Unlimited local AI gateway** — one OpenAI-compatible endpoint for all your models, with smart multi-provider fallback and **zero gateway-side token caps**.

InfinitiRoute is a fork of [OmniRoute](https://github.com/diegosouzapw/OmniRoute) (MIT) by diegosouzapw, rebuilt around one principle: **the gateway never limits you**. Provider-side quotas still exist — InfinitiRoute's job is to squeeze every drop out of them and fall over to the next provider before you ever notice.

```
┌─────────────┐
│  Your tool  │  (Claude Code, Codex CLI, Gemini CLI, Cursor, Cline, OpenClaw…)
└──────┬──────┘
       │ http://localhost:20128/v1
       ↓
┌──────────────────────────────────────────┐
│            InfinitiRoute Gateway         │
│  • OpenAI ↔ Claude ↔ Gemini translation  │
│  • OAuth auto-refresh (multi-account)    │
│  • Combo fallback chains                 │
│  • NO gateway-side token limits          │
└──────┬───────────────────────────────────┘
       ↓  fallback until one works
  Claude · ChatGPT/Codex · Gemini · Grok · 70+ more
```

## Why InfinitiRoute instead of stock OmniRoute

|                         | OmniRoute                    | InfinitiRoute                             |
| ----------------------- | ---------------------------- | ----------------------------------------- |
| Gateway-side token caps | Provider `max_tokens` clamps | `INFINITIROUTE_UNLIMITED_TOKENS=1` bypass |
| Daily token quotas      | None by default              | None by default — and never               |
| API-key budgets         | Optional                     | Optional, still opt-in per key            |
| Focus                   | Broad provider catalog       | Unlimited-throughput routing              |

Everything else is the same hardened engine: 4-tier fallback (Subscription → API Key → Cheap → Free), multi-account round-robin per provider, circuit breakers, quota preflight (including Codex 5h/7d windows), semantic cache, MCP server (25 tools), A2A protocol, and a full dashboard in 30 languages.

## Quick start

### npm (Windows, macOS, Linux)

```bash
npm install -g infinitiroute
infinitiroute
```

Dashboard: `http://localhost:20128` · API base: `http://localhost:20128/v1`

> **pnpm users:** run `pnpm approve-builds -g` after install (native builds for `better-sqlite3`).

### From source

```bash
npm install
PORT=20128 DASHBOARD_PORT=20129 NEXT_PUBLIC_BASE_URL=http://localhost:20129 npm run dev
```

### Docker (build locally — no image published yet)

```bash
docker build -t infinitiroute:latest .
docker run -d --name infinitiroute --restart unless-stopped --stop-timeout 40 \
  -p 20128:20128 -v infinitiroute-data:/app/data \
  infinitiroute:latest
```

Dashboard: `http://localhost:20128`. The image builds for your current platform; use `docker buildx` with `--platform linux/amd64,linux/arm64` if you need multi-arch images for a registry.

📖 **Everyday Docker operations** — stop/start, logs, switching the port, updating the image, backups, troubleshooting: see [DOCKER.md](DOCKER.md).

### Desktop app (Electron)

```bash
npm run electron:build:win     # Windows (.exe, NSIS)
npm run electron:build:mac     # macOS (.dmg, x64 + arm64)
npm run electron:build:linux   # Linux (.AppImage)
```

## Connect your providers

Dashboard → **Providers**:

| Provider            | Method                   | Notes                                                  |
| ------------------- | ------------------------ | ------------------------------------------------------ |
| **Claude**          | OAuth (Claude Code flow) | Multi-account supported                                |
| **ChatGPT / Codex** | OAuth (Codex flow)       | Quota preflight included                               |
| **Gemini**          | OAuth (Gemini CLI flow)  | 180K tok/mo free tier                                  |
| **Grok (xAI)**      | API key                  | `grok-4`, `grok-4.1-fast`, `grok-code-fast-1`…         |
| 70+ others          | API key / OAuth          | OpenAI, DeepSeek, Groq, OpenRouter, Kiro, Qwen, Qoder… |

Then Dashboard → **Endpoints** to create an API key, and point any tool at:

```txt
Base URL: http://localhost:20128/v1
API Key:  [from Endpoints page]
Model:    cc/claude-... · cx/gpt-... · gemini/gemini-... · xai/grok-4
```

## Unlimited mode

```bash
# .env  (or $DATA_DIR/.env, or ~/.infinitiroute/.env)
INFINITIROUTE_UNLIMITED_TOKENS=1
```

By default InfinitiRoute clamps outgoing `max_tokens` for a few strict providers (Groq, OpenAI) because those APIs return 400 when the value exceeds their limit. Setting the flag above removes every gateway-side clamp — requests pass through exactly as your client sent them.

There are **no daily token quotas, no throttles, and no usage ceilings added by the gateway**, ever. Per-key budgets remain strictly opt-in (Dashboard → Limits).

> **Reality check:** provider-side limits (subscription windows, free-tier caps) still apply. InfinitiRoute maximizes them — multi-account rotation, pre-quota account switching, automatic fallback — but cannot remove them. Using subscription OAuth tokens through a proxy may conflict with provider terms; use accounts you're willing to accept that risk on.

## CLI

| Command                        | Description               |
| ------------------------------ | ------------------------- |
| `infinitiroute`                | Start server (port 20128) |
| `infinitiroute --port 3000`    | Custom port               |
| `infinitiroute --mcp`          | MCP server over stdio     |
| `infinitiroute --no-open`      | Don't open the browser    |
| `infinitiroute-reset-password` | Reset dashboard password  |

Split-port mode: `PORT=20128 DASHBOARD_PORT=20129 infinitiroute`

## Development

```bash
npm run check          # lint + unit tests
npm run test:unit      # Node test runner suite
npm run typecheck:core # TypeScript core check
npm run build          # production build
npm run check:cycles   # circular dependency check
```

Engine: Node.js ≥18 <24 · Windows / macOS / Linux · SQLite (WAL) stored in `~/.infinitiroute` (or `$DATA_DIR`).

## License & credits

MIT — see [LICENSE](LICENSE). Built on [OmniRoute](https://github.com/diegosouzapw/OmniRoute) by diegosouzapw (originally [9router by decolua](https://github.com/decolua/9router)). The original MIT copyright notice is preserved in the license file.
