# ET OPC Company — AI Agent & Automation Workspace

เว็บแอปพลิเคชันระบบ **Enterprise AI Agent & Automation Workspace** สำหรับการปฏิบัติงาน สรุปรายงาน ประมวลผลเอกสารมัลติโมดอล (PDF / รูปภาพ / CSV / ข้อความ) และระบบอัตโนมัติประจำองค์กร สถาบันการจัดการปัญญาภิวัฒน์ (PIM)

---

## 🌟 ภาพรวมและการประเมินระบบ (System Status & Roadmap)

### 🟢 ส่วนที่สมบูรณ์และใช้งานได้ดีเยี่ยม (Ready & Production-Grade UX)
1. **Enterprise AI Workspace Concept**: ออกแบบรองรับการทำงานของ AI Agent ประจำแผนกองค์กร
2. **Branding & UI**: ผสานเอกลักษณ์ PIM (Maroon & Navy) และ AIX CHAT อย่างลงตัว
3. **Multi-Department Agents**: มี Agent ประจำฝ่ายครอบคลุมทั้ง HR ET (คัดกรอง CV & ปรับปรุงเรซูเม่), Executive Summary, Operations, Data Analyst
4. **Chat / Memory / Favorites**: บันทึกประวัติการแชทแยกตามผู้ใช้และ Agent พร้อมระบบบันทึกรายการโปรด
5. **Automation Suite**: คำสั่งลัดอัตโนมัติ (คัดกรองเรซูเม่, ปรับปรุง CV, สรุปใจความ, สกัด Action Items, ร่างอีเมล, สรุปตาราง Matrix, วิเคราะห์เจาะลึก) (สรุปใจความ, สกัด Action Items, ร่างอีเมล, สรุปตาราง Matrix, วิเคราะห์เจาะลึก)
6. **Universal AI Provider**: รองรับทั้ง Google Gemini API (Multimodal PDF/Vision) และ OpenAI / OpenRouter / DeepSeek

---

### 🟡 การปรับปรุง UX และความเสถียร (Phase 2 Refinements)
1. **Single-Pill Filter Navigation**:
   - ปุ่ม **"ทั้งหมด"** สำหรับรีเซ็ตตัวกรองและแสดง Agent ทั้งหมดทันที
   - ปุ่ม **"ตัวกรองแท็ก"** แสดง Badge จำนวนแท็กที่เลือกพร้อม Popup ค้นหาแท็ก
2. **Code Structure & Robust Error Handling**:
   - แก้ไขโครงสร้าง JavaScript ให้รองรับ Multiline Strings และ Regular Expressions 100%
   - แจ้งเตือนข้อผิดพลาดเป็นภาษาไทยอย่างชัดเจนเมื่อยังไม่ระบุ API Key หรือเกิดปัญหาเครือข่าย
3. **Interactive Workspace**:
   - ปุ่ม **"📋 คัดลอกตาราง"** และ **"📋 คัดลอกโค้ด"**
   - ปุ่ม **"🔊 อ่านออกเสียง (TTS)"** ภาษาไทย
   - ปุ่ม **"📥 ส่งออกสรุปงาน (.md)"** ดาวน์โหลดรายงานพร้อมประทับเวลา

---

### 🟠 การปรับปรุงที่พร้อมสำหรับการ Demo (Demo-Ready Features)
1. **Native Multimodal PDF Processing**:
   - ส่งไฟล์ PDF ในรูปแบบ `inlineData` (Base64) ไปยัง Google Gemini API โดยตรง AI สามารถอ่านกราฟ ตาราง และสรุปรายงาน PDF ได้อย่างแม่นยำ
2. **Drag & Drop / Clipboard Paste (`Ctrl+V`)**:
   - ลากไฟล์ PDF, รูปภาพ หรือเอกสารมาวางในหน้าต่างแชทเพื่อแนบไฟล์ได้ทันที
   - กด `Ctrl+V` เพื่อแนบรูปภาพหรือข้อความจากคลิปบอร์ด
3. **Admin Logic & Protected Accounts**:
   - Super Admin: `@ETPIM` (รหัสผ่านเริ่มต้น: `ET@PIMadminpass`) ได้รับการปกป้องไม่สามารถลบหรือลดสิทธิ์ได้
   - ระบบจัดการและลบบัญชีผู้ใช้พร้อมประวัติแชทสำหรับผู้ดูแลระบบ
4. **Seamless Login Flow**:
   - รองรับ Remember Me ด้วย `localStorage` / `sessionStorage`
   - ระบบป้องกัน Login Loop และ Session Sync อย่างสมบูรณ์

---

### 🔴 แผนพัฒนาระบบหลังบ้านสำหรับ Production จริง (Production Roadmap)
สำหรับองค์กรที่ต้องการนำไป Deploy บน Production จริง แนะนำให้ปรับสถาปัตยกรรมดังนี้ (รายละเอียดอยู่ในไฟล์ `BACKEND_ARCHITECTURE.md`):

1. **Backend API Proxy**: ย้ายการเก็บ API Key และการเรียก LLM ไปไว้ที่เซิร์ฟเวอร์หลังบ้าน (Node.js Express / Python FastAPI)
2. **Database & Persistence**: เปลี่ยนจาก `localStorage` เป็นฐานข้อมูล **PostgreSQL** หรือ **Redis**
3. **Authentication & RBAC**: เข้ารหัสรหัสผ่านด้วย `bcrypt` และใช้ **JWT Bearer Token** ในการยืนยันตัวตน
4. **Audit Logging**: เพิ่มระบบบันทึกประวัติการใช้งาน (Audit Trail) ทุกกิจกรรม
5. **HTTPS & Security Policies**: บังคับใช้ TLS 1.3, Content Security Policy (CSP) และ Rate Limiting

---

## 👥 บัญชีผู้ใช้เริ่มต้นสำหรับ Demo
- **Super Admin**: Username `@ETPIM` / Password `ET@PIMadminpass`
- **ผู้ใช้งานทั่วไป**: สามารถสมัครสมาชิกใหม่ได้ที่หน้า `login.html`

---

## 🚀 วิธีเปิดใช้งาน
1. แตกไฟล์ `ET_OPC_Company_v2_Phase2.zip`
2. เปิดไฟล์ `login.html` บนเว็บเบราว์เซอร์
3. เข้าสู่ระบบด้วยบัญชี `@ETPIM`
4. กดปุ่ม **"ตั้งค่า API & Model"** เพื่อใส่ Google Gemini API Key
5. เริ่มต้นเลือก Agent และแนบไฟล์ PDF/รูปภาพเพื่อสั่งงานได้ทันที!
