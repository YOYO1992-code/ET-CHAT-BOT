// ====================================================================
// 🚀 ET OPC Company — Google Drive Auto-Evaluation & Gmail Workflow
// คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — สถาบันการจัดการปัญญาภิวัฒน์ (PIM)
// ====================================================================

// ⚙️ 1. การตั้งค่าระบบ (Configuration)
const CONFIG = {
  GEMINI_API_KEY: "วาง_GEMINI_API_KEY_ของคุณที่นี่", // รับฟรีจาก aistudio.google.com
  GEMINI_MODEL: "gemini-3.6-flash",
  DRIVE_FOLDER_NAME: "Mockup CV", // ชื่อโฟลเดอร์ใน Google Drive ที่ให้คนมาวางไฟล์
  PASSING_SCORE: 70, // เกณฑ์คะแนนผ่านขั้นต่ำ (เต็ม 100)
  RECIPIENT_EMAIL: "ai.yoshi2006@gmail.com" // อีเมลที่จะรับแจ้งเตือน
};

// 🤖 2. ฟังก์ชันตรวจสอบไฟล์ใน Google Drive และประเมินอัตโนมัติ (Auto-Run)
function autoEvaluateDriveFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  if (!folders.hasNext()) {
    Logger.log("❌ ไม่พบโฟลเดอร์: " + CONFIG.DRIVE_FOLDER_NAME);
    return;
  }
  
  const folder = folders.next();
  const files = folder.getFiles();
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    
    // ข้ามไฟล์ที่เคยประเมินแล้ว (มีคำว่า [ประเมินแล้ว] ในชื่อ)
    if (fileName.includes("[ประเมินแล้ว]") || fileName.includes("[ผ่านเกณฑ์]")) {
      continue;
    }
    
    // ตรวจสอบเฉพาะไฟล์ PDF หรือรูปภาพ
    const mimeType = file.getMimeType();
    if (mimeType !== "application/pdf" && !mimeType.startsWith("image/")) {
      continue;
    }
    
    Logger.log("🔍 กำลังประเมินไฟล์: " + fileName);
    
    try {
      // แปลงไฟล์เป็น Base64 ส่งให้ Gemini 3.6
      const blob = file.getBlob();
      const base64Data = Utilities.base64Encode(blob.getBytes());
      
      const evaluationResult = callGeminiApi(base64Data, mimeType, fileName);
      const score = extractScore(evaluationResult);
      
      Logger.log("🏆 ผลคะแนนของ " + fileName + " คือ: " + score + "/100");
      
      // ถ้าคะแนนผ่านเกณฑ์ ➔ ส่งอีเมลแจ้งเตือนพร้อมแนบไฟล์เข้า Gmail
      if (score >= CONFIG.PASSING_SCORE) {
        sendNotificationEmail(fileName, score, evaluationResult, blob);
        file.setName("[ผ่านเกณฑ์_" + score + "คะแนน] " + fileName);
      } else {
        file.setName("[ประเมินแล้ว_" + score + "คะแนน] " + fileName);
      }
      
    } catch (err) {
      Logger.log("⚠️ เกิดข้อผิดพลาดกับไฟล์ " + fileName + ": " + err.toString());
    }
  }
}

// 🧠 3. ฟังก์ชันเรียกใช้ Google Gemini API (Multimodal Native)
function callGeminiApi(base64Data, mimeType, fileName) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + CONFIG.GEMINI_MODEL + ":generateContent?key=" + CONFIG.GEMINI_API_KEY;
  
  const systemPrompt = `คุณคือ 'HR ET Specialist' ผู้เชี่ยวชาญการประเมินเรซูเม่ประจำ ET OPC Company คณะวิศวกรรมศาสตร์และเทคโนโลยี PIM
กรุณาอ่านไฟล์แนบนี้และประเมินเทียบกับ 4 มิติความต้องการ (คะแนนเต็ม 100):
1. ประสบการณ์ทำงานตรงสาย (40 คะแนน)
2. ทักษะเฉพาะทางและความสามารถหลัก (30 คะแนน)
3. วุฒิการศึกษาและใบรับรอง (15 คะแนน)
4. ผลงานเชิงประจักษ์และการนำเสนอ (15 คะแนน)

โครงสร้างการตอบ:
- ระบุชื่อผู้สมัคร (ถ้ามีในไฟล์)
- สรุปตารางคะแนน 4 ด้าน
- เขียนบรรทัดสรุปคะแนนชัดเจนในรูปแบบ: "คะแนนความเหมาะสมรวม: [คะแนน]/100 คะแนน"
- สรุปจุดเด่นและคำแนะนำสำหรับคณะกรรมการ`;

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{
      role: "user",
      parts: [
        { text: "กรุณาประเมินเรซูเม่จากไฟล์แนบนี้: " + fileName },
        { inlineData: { mimeType: mimeType, data: base64Data } }
      ]
    }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2500 }
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const res = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(res.getContentText());
  
  if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
    return json.candidates[0].content.parts.map(p => p.text).join("");
  }
  throw new Error("Gemini API Error: " + res.getContentText());
}

// 🔢 4. ฟังก์ชันสกัดตัวเลขคะแนนจากข้อความตอบกลับ
function extractScore(text) {
  const match = text.match(/(?:คะแนน(?:ความเหมาะสม)?(?:รวม)?|Match\s*Score|Overall\s*Score|Total\s*Score)[^0-9
]{0,40}?([0-9]{1,3})\s*(?:\/\s*100|%|\s*คะแนน)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 75; // ค่าเริ่มต้นถ้าตรวจไม่พบคะแนน
}

// 📧 5. ฟังก์ชันส่งอีเมลแจ้งผลพร้อมแนบไฟล์เข้า Gmail
function sendNotificationEmail(fileName, score, evaluationSummary, fileBlob) {
  const dateStr = new Date().toLocaleString("th-TH");
  
  const htmlBody = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; border: 2px solid #8B0000; border-radius: 16px; max-width: 640px; background: #ffffff;">
    <div style="border-bottom: 2px solid #8B0000; padding-bottom: 10px; margin-bottom: 16px;">
      <h2 style="color: #8B0000; margin: 0;">ET OPC Company — แจ้งเตือนผู้สมัครผ่านเกณฑ์ (Auto-Drive)</h2>
      <small style="color: #64748B;">คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — สถาบันการจัดการปัญญาภิวัฒน์ (PIM)</small>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6;">
      <strong>📁 ไฟล์เรซูเม่:</strong> ${fileName}<br>
      <strong>🤖 ตรวจประเมินโดย:</strong> HR ET Specialist (ระบบอัตโนมัติ 24/7)<br>
      <strong>📅 วันที่ตรวจ:</strong> ${dateStr}<br>
      <strong>🏆 คะแนนความเหมาะสม:</strong> <span style="color: #059669; font-size: 18px; font-weight: bold;">${score} / 100 คะแนน (ผ่านเกณฑ์)</span>
    </p>
    
    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;">
    
    <div style="background: #F8FAFC; padding: 14px; border-radius: 10px; font-size: 13px; line-height: 1.6; border: 1px solid #E2E8F0;">
      ${evaluationSummary.replace(/\n/g, "<br>")}
    </div>
    
    <p style="margin-top: 14px; color: #059669; font-weight: bold;">📎 มีไฟล์เรซูเม่แนบมากับอีเมลฉบับนี้</p>
    <br>
    <small style="color: #94A3B8;">ระบบพัฒนาโดย MR.ST • ET OPC Workspace</small>
  </div>`;
  
  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAIL,
    subject: `[ET OPC #TeamET] 🎉 ผู้สมัครผ่านเกณฑ์: ${fileName} (คะแนน: ${score}/100)`,
    htmlBody: htmlBody,
    attachments: [fileBlob]
  });
  
  Logger.log("✅ ส่งอีเมลแจ้งเตือนไปยัง " + CONFIG.RECIPIENT_EMAIL + " เรียบร้อยแล้ว");
}

// ⏰ 6. ฟังก์ชันติดตั้ง Trigger ให้ทำงานอัตโนมัติทุกๆ 10 นาที (กด Run ฟังก์ชันนี้ 1 ครั้ง)
function setupAutoTrigger() {
  // ลบ Trigger เก่าออกก่อนเพื่อไม่ให้ซ้ำซ้อน
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // สร้าง Trigger ใหม่ให้ตรวจจับไฟล์ใน Drive ทุก 10 นาที
  ScriptApp.newTrigger("autoEvaluateDriveFolder")
    .timeBased()
    .everyMinutes(10)
    .create();
    
  Logger.log("⏰ ติดตั้งระบบตรวจจับ Drive อัตโนมัติทุก 10 นาทีเรียบร้อยแล้ว!");
}
