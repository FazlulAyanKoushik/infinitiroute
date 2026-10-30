# InfinitiRoute MCP Server Documentation (Dansk)

🌐 **Languages:** 🇺🇸 [English](../../../../docs/MCP-SERVER.md) · 🇪🇸 [es](../../es/docs/MCP-SERVER.md) · 🇫🇷 [fr](../../fr/docs/MCP-SERVER.md) · 🇩🇪 [de](../../de/docs/MCP-SERVER.md) · 🇮🇹 [it](../../it/docs/MCP-SERVER.md) · 🇷🇺 [ru](../../ru/docs/MCP-SERVER.md) · 🇨🇳 [zh-CN](../../zh-CN/docs/MCP-SERVER.md) · 🇯🇵 [ja](../../ja/docs/MCP-SERVER.md) · 🇰🇷 [ko](../../ko/docs/MCP-SERVER.md) · 🇸🇦 [ar](../../ar/docs/MCP-SERVER.md) · 🇮🇳 [hi](../../hi/docs/MCP-SERVER.md) · 🇮🇳 [in](../../in/docs/MCP-SERVER.md) · 🇹🇭 [th](../../th/docs/MCP-SERVER.md) · 🇻🇳 [vi](../../vi/docs/MCP-SERVER.md) · 🇮🇩 [id](../../id/docs/MCP-SERVER.md) · 🇲🇾 [ms](../../ms/docs/MCP-SERVER.md) · 🇳🇱 [nl](../../nl/docs/MCP-SERVER.md) · 🇵🇱 [pl](../../pl/docs/MCP-SERVER.md) · 🇸🇪 [sv](../../sv/docs/MCP-SERVER.md) · 🇳🇴 [no](../../no/docs/MCP-SERVER.md) · 🇩🇰 [da](../../da/docs/MCP-SERVER.md) · 🇫🇮 [fi](../../fi/docs/MCP-SERVER.md) · 🇵🇹 [pt](../../pt/docs/MCP-SERVER.md) · 🇷🇴 [ro](../../ro/docs/MCP-SERVER.md) · 🇭🇺 [hu](../../hu/docs/MCP-SERVER.md) · 🇧🇬 [bg](../../bg/docs/MCP-SERVER.md) · 🇸🇰 [sk](../../sk/docs/MCP-SERVER.md) · 🇺🇦 [uk-UA](../../uk-UA/docs/MCP-SERVER.md) · 🇮🇱 [he](../../he/docs/MCP-SERVER.md) · 🇵🇭 [phi](../../phi/docs/MCP-SERVER.md) · 🇧🇷 [pt-BR](../../pt-BR/docs/MCP-SERVER.md) · 🇨🇿 [cs](../../cs/docs/MCP-SERVER.md) · 🇹🇷 [tr](../../tr/docs/MCP-SERVER.md)

---

> Model Context Protocol server med 16 intelligente værktøjer## Installer

InfinitiRoute MCP er indbygget. Start det med:```bash
infinitiroute --mcp

````

Eller via open-sse transport:```bash
# HTTP streamable transport (port 20130)
infinitiroute --dev  # MCP auto-starts on /mcp endpoint
````

## IDE Configuration

Se [IDE Configs](integrations/ide-configs.md) for opsætning af Antigravity, Cursor, Copilot og Claude Desktop.---

## Essential Tools (8)

| Værktøj                             | Beskrivelse                                   |
| :---------------------------------- | :-------------------------------------------- | --------------------- |
| `infinitiroute_get_health`          | Gateway-sundhed, afbrydere, oppetid           |
| `infinitiroute_list_combos`         | Alle konfigurerede kombinationer med modeller |
| `infinitiroute_get_combo_metrics`   | Ydeevnemålinger for en specifik kombination   |
| `infinitiroute_switch_combo`        | Skift aktiv kombination efter ID/navn         |
| `infinitiroute_check_quota`         | Kvotestatus pr. udbyder eller alle            |
| `infinitiroute_route_request`       | Send en chatafslutning via InfinitiRoute      |
| `infinitiroute_cost_report`         | Omkostningsanalyse for en periode             |
| `infinitiroute_list_models_catalog` | Komplet modelkatalog med muligheder           | ## Advanced Tools (8) |

| Værktøj                                | Beskrivelse                                                       |
| :------------------------------------- | :---------------------------------------------------------------- | ----------------- |
| `infinitiroute_simulate_route`         | Dry-run routingsimulering med fallback tree                       |
| `infinitiroute_set_budget_guard`       | Sessionsbudget med handlinger for forringelse/blokering/advarsel  |
| `infinitiroute_set_resilience_profile` | Anvend konservativ/afbalanceret/aggressiv forudindstilling        |
| `infinitiroute_test_combo`             | Live-test alle modeller i en combo via en ægte upstream-anmodning |
| `infinitiroute_get_provider_metrics`   | Detaljerede metrics for én udbyder                                |
| `infinitiroute_best_combo_for_task`    | Task-fitness anbefaling med alternativer                          |
| `infinitiroute_explain_route`          | Forklar en tidligere routingbeslutning                            |
| `infinitiroute_get_session_snapshot`   | Fuld sessionstilstand: omkostninger, tokens, fejl                 | ## Authentication |

MCP-værktøjer autentificeres via API-nøgleomfang. Hvert værktøj kræver specifikke omfang:

| Omfang                | Værktøjer                                        |
| :-------------------- | :----------------------------------------------- | ---------------- |
| `læs:sundhed`         | get_health, get_provider_metrics                 |
| `læs:kombinationer`   | list_combos, get_combo_metrics                   |
| `skriv:kombinationer` | switch_combo                                     |
| `læs:kvote`           | check_quota                                      |
| `skriv:rute`          | rute_anmodning, simuler_rute, test_kombination   |
| `læs:brug`            | cost_report, get_session_snapshot, explain_route |
| `write:config`        | set_budget_guard, set_resilience_profile         |
| `læs:modeller`        | list_models_catalog, best_combo_for_task         | ## Audit Logging |

Hvert værktøjskald logges til `mcp_tool_audit` med:

- Værktøjsnavn, argumenter, resultat
- Varighed (ms), succes/fiasko
- API-nøglehash, tidsstempel## Files

| Fil                                          | Formål                                           |
| :------------------------------------------- | :----------------------------------------------- |
| `open-sse/mcp-server/server.ts`              | MCP-serveroprettelse + 16 værktøjsregistreringer |
| `open-sse/mcp-server/transport.ts`           | Stdio + HTTP-transport                           |
| `open-sse/mcp-server/auth.ts`                | API nøgle + scope validering                     |
| `open-sse/mcp-server/audit.ts`               | Værktøjsopkald revisionslogning                  |
| `open-sse/mcp-server/tools/advancedTools.ts` | 8 avancerede værktøjshåndteringer                |
