# InfinitiRoute MCP Server Documentation (ไทย)

🌐 **Languages:** 🇺🇸 [English](../../../../docs/MCP-SERVER.md) · 🇪🇸 [es](../../es/docs/MCP-SERVER.md) · 🇫🇷 [fr](../../fr/docs/MCP-SERVER.md) · 🇩🇪 [de](../../de/docs/MCP-SERVER.md) · 🇮🇹 [it](../../it/docs/MCP-SERVER.md) · 🇷🇺 [ru](../../ru/docs/MCP-SERVER.md) · 🇨🇳 [zh-CN](../../zh-CN/docs/MCP-SERVER.md) · 🇯🇵 [ja](../../ja/docs/MCP-SERVER.md) · 🇰🇷 [ko](../../ko/docs/MCP-SERVER.md) · 🇸🇦 [ar](../../ar/docs/MCP-SERVER.md) · 🇮🇳 [hi](../../hi/docs/MCP-SERVER.md) · 🇮🇳 [in](../../in/docs/MCP-SERVER.md) · 🇹🇭 [th](../../th/docs/MCP-SERVER.md) · 🇻🇳 [vi](../../vi/docs/MCP-SERVER.md) · 🇮🇩 [id](../../id/docs/MCP-SERVER.md) · 🇲🇾 [ms](../../ms/docs/MCP-SERVER.md) · 🇳🇱 [nl](../../nl/docs/MCP-SERVER.md) · 🇵🇱 [pl](../../pl/docs/MCP-SERVER.md) · 🇸🇪 [sv](../../sv/docs/MCP-SERVER.md) · 🇳🇴 [no](../../no/docs/MCP-SERVER.md) · 🇩🇰 [da](../../da/docs/MCP-SERVER.md) · 🇫🇮 [fi](../../fi/docs/MCP-SERVER.md) · 🇵🇹 [pt](../../pt/docs/MCP-SERVER.md) · 🇷🇴 [ro](../../ro/docs/MCP-SERVER.md) · 🇭🇺 [hu](../../hu/docs/MCP-SERVER.md) · 🇧🇬 [bg](../../bg/docs/MCP-SERVER.md) · 🇸🇰 [sk](../../sk/docs/MCP-SERVER.md) · 🇺🇦 [uk-UA](../../uk-UA/docs/MCP-SERVER.md) · 🇮🇱 [he](../../he/docs/MCP-SERVER.md) · 🇵🇭 [phi](../../phi/docs/MCP-SERVER.md) · 🇧🇷 [pt-BR](../../pt-BR/docs/MCP-SERVER.md) · 🇨🇿 [cs](../../cs/docs/MCP-SERVER.md) · 🇹🇷 [tr](../../tr/docs/MCP-SERVER.md)

---

> สร้างโมเดลเซิร์ฟเวอร์ Context Protocol ด้วยเครื่องมืออัจฉริยะ 16 รายการ## ติดตั้ง

InfinitiRoute MCP มีอยู่ในตัว เริ่มต้นด้วย:```bash
infinitiroute --mcp

````

หรือผ่านการขนส่งแบบ open-sse:```bash
# HTTP streamable transport (port 20130)
infinitiroute --dev  # MCP auto-starts on /mcp endpoint
````

## IDE Configuration

ดู [IDE Configs](integrations/ide-configs.md) สำหรับการตั้งค่า Antigravity, Cursor, Copilot และ Claude Desktop---

## Essential Tools (8)

| เครื่องมือ                          | คำอธิบาย                                                  |
| :---------------------------------- | :-------------------------------------------------------- | --------------------- |
| `infinitiroute_get_health`          | ความสมบูรณ์ของเกตเวย์, เซอร์กิตเบรกเกอร์, สถานะการออนไลน์ |
| `infinitiroute_list_combos`         | คอมโบที่กำหนดค่าทั้งหมดพร้อมโมเดล                         |
| `infinitiroute_get_combo_metrics`   | ตัวชี้วัดประสิทธิภาพสำหรับคอมโบเฉพาะ                      |
| `infinitiroute_switch_combo`        | สลับคำสั่งผสมที่ใช้งานอยู่ด้วย ID/ชื่อ                    |
| `infinitiroute_check_quota`         | สถานะโควต้าต่อผู้ให้บริการหรือทั้งหมด                     |
| `infinitiroute_route_request`       | ส่งการแชทให้เสร็จสิ้นผ่าน InfinitiRoute                   |
| `infinitiroute_cost_report`         | การวิเคราะห์ต้นทุนสำหรับช่วงเวลาหนึ่ง                     |
| `infinitiroute_list_models_catalog` | แคตตาล็อกรุ่นเต็มพร้อมความสามารถ                          | ## Advanced Tools (8) |

| เครื่องมือ                             | คำอธิบาย                                                  |
| :------------------------------------- | :-------------------------------------------------------- | ----------------- |
| `infinitiroute_simulate_route`         | การจำลองการกำหนดเส้นทางแบบ Dry-run พร้อมแผนผังทางเลือก    |
| `infinitiroute_set_budget_guard`       | งบประมาณเซสชันพร้อมการดำเนินการลดระดับ/บล็อก/การแจ้งเตือน |
| `infinitiroute_set_resilience_profile` | ใช้ค่าที่ตั้งไว้ล่วงหน้าแบบอนุรักษ์นิยม/สมดุล/เชิงรุก     |
| `infinitiroute_test_combo`             | ทดสอบสดทุกรุ่นในคอมโบผ่านคำขออัปสตรีมจริง                 |
| `infinitiroute_get_provider_metrics`   | ตัวชี้วัดโดยละเอียดสำหรับผู้ให้บริการรายหนึ่ง             |
| `infinitiroute_best_combo_for_task`    | คำแนะนำด้านการออกกำลังกายพร้อมทางเลือกอื่น                |
| `infinitiroute_explain_route`          | อธิบายการตัดสินใจกำหนดเส้นทางที่ผ่านมา                    |
| `infinitiroute_get_session_snapshot`   | สถานะเซสชันเต็ม: ต้นทุน โทเค็น ข้อผิดพลาด                 | ## Authentication |

เครื่องมือ MCP ได้รับการตรวจสอบสิทธิ์ผ่านขอบเขตคีย์ API เครื่องมือแต่ละอย่างต้องมีขอบเขตเฉพาะ:

| ขอบเขต           | เครื่องมือ                                    |
| :--------------- | :-------------------------------------------- | ---------------- |
| `อ่าน:สุขภาพ`    | get_health, get_provider_metrics              |
| `อ่าน:คอมโบ`     | list_combos, get_combo_metrics                |
| `เขียน:คอมโบ`    | switch_combo                                  |
| `อ่าน:โควต้า`    | check_quota                                   |
| `เขียน:เส้นทาง`  | route_request, simulate_route, test_combo     |
| `อ่าน:การใช้งาน` | cost_report, get_session_snapshot, expl_route |
| `เขียน:config`   | set_budget_guard, set_resilience_profile      |
| `อ่าน:โมเดล`     | list_models_catalog, best_combo_for_task      | ## Audit Logging |

การเรียกใช้เครื่องมือทุกครั้งจะถูกบันทึกไว้ใน `mcp_tool_audit` ด้วย:

- ชื่อเครื่องมือ อาร์กิวเมนต์ ผลลัพธ์
- ระยะเวลา (มิลลิวินาที) สำเร็จ/ล้มเหลว
- แฮชคีย์ API, การประทับเวลา## Files

| ไฟล์                                         | วัตถุประสงค์                                               |
| :------------------------------------------- | :--------------------------------------------------------- |
| `open-sse/mcp-server/server.ts`              | การสร้างเซิร์ฟเวอร์ MCP + การลงทะเบียนเครื่องมือ 16 รายการ |
| `open-sse/mcp-server/transport.ts`           | การขนส่ง Stdio + HTTP                                      |
| `open-sse/mcp-server/auth.ts`                | คีย์ API + การตรวจสอบขอบเขต                                |
| `open-sse/mcp-server/audit.ts`               | การบันทึกการตรวจสอบการเรียกเครื่องมือ                      |
| `open-sse/mcp-server/tools/advancedTools.ts` | 8 เครื่องมือจัดการขั้นสูง                                  |
