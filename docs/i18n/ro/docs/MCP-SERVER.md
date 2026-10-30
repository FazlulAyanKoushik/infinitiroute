# InfinitiRoute MCP Server Documentation (Română)

🌐 **Languages:** 🇺🇸 [English](../../../../docs/MCP-SERVER.md) · 🇪🇸 [es](../../es/docs/MCP-SERVER.md) · 🇫🇷 [fr](../../fr/docs/MCP-SERVER.md) · 🇩🇪 [de](../../de/docs/MCP-SERVER.md) · 🇮🇹 [it](../../it/docs/MCP-SERVER.md) · 🇷🇺 [ru](../../ru/docs/MCP-SERVER.md) · 🇨🇳 [zh-CN](../../zh-CN/docs/MCP-SERVER.md) · 🇯🇵 [ja](../../ja/docs/MCP-SERVER.md) · 🇰🇷 [ko](../../ko/docs/MCP-SERVER.md) · 🇸🇦 [ar](../../ar/docs/MCP-SERVER.md) · 🇮🇳 [hi](../../hi/docs/MCP-SERVER.md) · 🇮🇳 [in](../../in/docs/MCP-SERVER.md) · 🇹🇭 [th](../../th/docs/MCP-SERVER.md) · 🇻🇳 [vi](../../vi/docs/MCP-SERVER.md) · 🇮🇩 [id](../../id/docs/MCP-SERVER.md) · 🇲🇾 [ms](../../ms/docs/MCP-SERVER.md) · 🇳🇱 [nl](../../nl/docs/MCP-SERVER.md) · 🇵🇱 [pl](../../pl/docs/MCP-SERVER.md) · 🇸🇪 [sv](../../sv/docs/MCP-SERVER.md) · 🇳🇴 [no](../../no/docs/MCP-SERVER.md) · 🇩🇰 [da](../../da/docs/MCP-SERVER.md) · 🇫🇮 [fi](../../fi/docs/MCP-SERVER.md) · 🇵🇹 [pt](../../pt/docs/MCP-SERVER.md) · 🇷🇴 [ro](../../ro/docs/MCP-SERVER.md) · 🇭🇺 [hu](../../hu/docs/MCP-SERVER.md) · 🇧🇬 [bg](../../bg/docs/MCP-SERVER.md) · 🇸🇰 [sk](../../sk/docs/MCP-SERVER.md) · 🇺🇦 [uk-UA](../../uk-UA/docs/MCP-SERVER.md) · 🇮🇱 [he](../../he/docs/MCP-SERVER.md) · 🇵🇭 [phi](../../phi/docs/MCP-SERVER.md) · 🇧🇷 [pt-BR](../../pt-BR/docs/MCP-SERVER.md) · 🇨🇿 [cs](../../cs/docs/MCP-SERVER.md) · 🇹🇷 [tr](../../tr/docs/MCP-SERVER.md)

---

> Server Model Context Protocol cu ​​16 instrumente inteligente## Instalare

InfinitiRoute MCP este încorporat. Începeți cu:```bash
infinitiroute --mcp

````

Sau prin transportul open-sse:```bash
# HTTP streamable transport (port 20130)
infinitiroute --dev  # MCP auto-starts on /mcp endpoint
````

## IDE Configuration

Consultați [IDE Configs](integrations/ide-configs.md) pentru configurarea Antigravity, Cursor, Copilot și Claude Desktop.---

## Essential Tools (8)

| Instrument                          | Descriere                                                |
| :---------------------------------- | :------------------------------------------------------- | --------------------- |
| `infinitiroute_get_health`          | Sănătate gateway, întrerupătoare, timp de funcționare    |
| `infinitiroute_list_combos`         | Toate combinațiile configurate cu modele                 |
| `infinitiroute_get_combo_metrics`   | Valori de performanță pentru un anumit combo             |
| `infinitiroute_switch_combo`        | Comutați combinația activă după ID/nume                  |
| `infinitiroute_check_quota`         | Starea cotei pentru fiecare furnizor sau pentru toate    |
| `infinitiroute_route_request`       | Trimiteți o finalizare a conversației prin InfinitiRoute |
| `raport_cost_infinitiroute`         | Analiza costurilor pentru o perioadă de timp             |
| `infinitiroute_list_models_catalog` | Catalog complet de modele cu capabilități                | ## Advanced Tools (8) |

| Instrument                             | Descriere                                                                      |
| :------------------------------------- | :----------------------------------------------------------------------------- | ----------------- |
| `infinitiroute_simulate_route`         | Simulare de rutare de rulare uscată cu arbore de rezervă                       |
| `infinitiroute_set_budget_guard`       | Bugetul sesiunii cu acțiuni de degradare/blocare/alertare                      |
| `infinitiroute_set_resilience_profile` | Aplicați presetarea conservatoare/echilibrate/agresive                         |
| `combo_test_infinitiroute`             | Testați în direct toate modelele într-un combo printr-o cerere reală în amonte |
| `infinitiroute_get_provider_metrics`   | Valori detaliate pentru un furnizor                                            |
| `infinitiroute_best_combo_for_task`    | Recomandare sarcină-fitness cu alternative                                     |
| `infinitiroute_explain_route`          | Explicați o decizie trecută de rutare                                          |
| `infinitiroute_get_session_snapshot`   | Stare completă a sesiunii: costuri, jetoane, erori                             | ## Authentication |

Instrumentele MCP sunt autentificate prin domeniile cheii API. Fiecare instrument necesită domenii specifice:

| Domeniul de aplicare | Instrumente                                     |
| :------------------- | :---------------------------------------------- | ---------------- |
| `citește:sănătate`   | get_health, get_provider_metrics                |
| `citește:combo-uri`  | list_combo, get_combo_metrics                   |
| `write:combo`        | switch_combo                                    |
| `citește:cotă`       | verifica_cota                                   |
| `write:route`        | ruta_cerere, simulare_rută, test_combo          |
| `citește:utilizare`  | cost_report, get_session_snapshot, explica_ruta |
| `write:config`       | set_budget_guard, set_resilience_profile        |
| `citește:modele`     | list_models_catalog, best_combo_for_task        | ## Audit Logging |

Fiecare apel de instrument este înregistrat în `mcp_tool_audit` cu:

- Nume instrument, argumente, rezultat
- Durata (ms), succes/eșec
- Hash cheie API, marca temporală## Files

| Fișier                                       | Scop                                                 |
| :------------------------------------------- | :--------------------------------------------------- |
| `open-sse/mcp-server/server.ts`              | Creare server MCP + 16 înregistrări de instrumente   |
| `open-sse/mcp-server/transport.ts`           | Stdio + transport HTTP                               |
| `open-sse/mcp-server/auth.ts`                | Cheia API + validarea domeniului                     |
| `open-sse/mcp-server/audit.ts`               | Înregistrare de auditare a apelurilor instrumentului |
| `open-sse/mcp-server/tools/advancedTools.ts` | 8 instrumente de manipulare avansate                 |
