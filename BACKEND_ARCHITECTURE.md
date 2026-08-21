# ET OPC Company — Production Backend & Security Architecture (Phase 3 Roadmap)

เอกสารสถาปัตยกรรมระบบหลังบ้าน (Backend Architecture) ความปลอดภัย และฐานข้อมูล สำหรับการเปลี่ยนผ่านระบบ **ET OPC Company** จาก Client-Side Prototype ไปสู่ระบบ Enterprise Production เต็มรูปแบบ

---

## 🏗️ 1. สถาปัตยกรรมระบบ (System Architecture)

```
[ Frontend: Web Browser ] 
       │  (HTTPS / JWT Bearer Token)
       ▼
[ Reverse Proxy / NGINX / Cloudflare ]
       │
[ API Gateway & Auth Middleware (Node.js / FastAPI) ]
       ├── 1. Rate Limiting & Helmet Security
       ├── 2. JWT Verification & Role-Based Access Control (RBAC)
       ├── 3. Audit Logger (Activity Tracking)
       ▼
[ Internal Service Controllers ]
       ├── User & Profile Controller (bcrypt pass)
       ├── Agent Management Controller
       ├── Chat History & Memory Controller
       └── AI Gateway Proxy (Keeps API Keys Server-Side)
               │
               ├── Google Gemini 2.5 API (Multimodal PDF/Vision)
               ├── OpenAI / Anthropic / DeepSeek APIs
               └── Ollama / Local LLM
       ▼
[ PostgreSQL / Redis Database ]
       ├── Users, Roles, Permissions
       ├── Agents & Prompts
       ├── Chat Sessions & Vector Embeddings
       └── Audit Logs & Rate Limit Cache
```

---

## 🗄️ 2. โครงสร้างฐานข้อมูล (Database Schema - PostgreSQL)

### 2.1 Table: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt (cost 12)
    display_name VARCHAR(100) NOT NULL,
    persona TEXT,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Table: `agents`
```sql
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role_category VARCHAR(50) NOT NULL,
    bio TEXT,
    prompt TEXT NOT NULL,
    opener TEXT NOT NULL,
    image_url TEXT,
    color_gradient VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    chat_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Table: `chat_sessions` & `messages`
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE CASCADE,
    title VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('user', 'bot', 'system')),
    content TEXT NOT NULL,
    attached_file_meta JSONB, -- { name, mimeType, s3_url, size }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.4 Table: `audit_logs` (ความปลอดภัยและตรวจสอบย้อนหลัง)
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'LOGIN', 'AGENT_CREATED', 'PROMPT_EXECUTED', 'FILE_UPLOADED'
    resource VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔒 3. แนวทางด้านความปลอดภัย (Security & Compliance)

1. **Server-Side API Key Storage**:
   - API Key ของ Gemini และ OpenAI จะถูกเก็บไว้ใน `.env` / Vault ฝั่งเซิร์ฟเวอร์เท่านั้น ฝั่ง Client จะไม่เห็น API Key เลย
   - การเรียก AI จะผ่าน Endpoint `/api/v1/chat/completions` ของเซิร์ฟเวอร์

2. **Authentication & Password Hashing**:
   - รหัสผ่านถูกแฮชด้วย `bcrypt` (Salt Rounds 12)
   - การเข้าสู่ระบบจะออก **JWT (JSON Web Token)** ที่มีอายุจำกัด (เช่น Access Token 15 นาที + Refresh Token HttpOnly Cookie 7 วัน)

3. **Content Security Policy & File Scanning**:
   - กำหนดขนาดอัปโหลดไฟล์ไม่เกิน 25 MB ต่อไฟล์
   - สแกนไวรัสไฟล์ที่อัปโหลดก่อนส่งเข้า Object Storage (S3 / GCS)
   - บังคับการเชื่อมต่อผ่าน **HTTPS / TLS 1.3** เท่านั้น

---

## 🚀 4. ตัวอย่าง Node.js / Express AI Gateway Proxy (Backend Snippet)

```javascript
// server/routes/aiProxy.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { agentId, history, message, attachedFile } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const parts = [{ text: message }];
        if (attachedFile && attachedFile.base64) {
            parts.push({
                inlineData: {
                    mimeType: attachedFile.mimeType,
                    data: attachedFile.base64
                }
            });
        }

        const result = await model.generateContent(parts);
        const responseText = result.response.text();

        // Write Audit Log
        await logAudit(req.user.id, 'AI_INFERENCE', agentId, { promptLength: message.length });

        return res.json({ success: true, text: responseText });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
```
