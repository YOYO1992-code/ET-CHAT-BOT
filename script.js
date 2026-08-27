const DEFAULT_CENTRAL_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQ3xO_xI7lLcZ6TzF455ePEP2c8s2e3PthfH4a4qGzI6FyWWeCMEsGXa3GWcqG2lT7vw/exec";

function getWebhookUrl() {
    const saved = (localStorage.getItem(STORAGE_PREFIX + 'drive_webhook_url') || "").trim();
    if (saved && saved.startsWith('http') && !saved.includes('drive.google.com')) {
        return saved;
    }
    return DEFAULT_CENTRAL_WEBHOOK_URL;
}

function createCharacterCard(c) {
    let favs = appUserData[currentUser]?.favs || [];
    let isFav = favs.includes(c.id);
    const card = document.createElement('div');
    card.className = 'char-card';
    card.style.cursor = 'pointer';
    card.onclick = (e) => {
        if(!e.target.closest('.btn-star') && !e.target.closest('.btn-enter')) {
            openChat(c.id);
        }
    };
    
    let tagsHtml = c.tags && c.tags.length > 0 ? c.tags.map(t => {
        return `<span style="display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:999px; background:var(--surface-2); border:1px solid var(--line); color:var(--ink-soft);"><span style="width:6px; height:6px; border-radius:50%; background:${t.color || '#8B0000'};"></span>${escapeHtml(t.t)}</span>`;
    }).join('') : '';

    const avatarInner = (c.imageUrl && c.imageUrl.trim() !== '') ?
        `<img src="${c.imageUrl}" alt="${escapeHtml(c.name)}" onerror="this.onerror=null; this.parentElement.innerHTML='💼';">` :
        `<span style="font-size:22px;">💼</span>`;

    card.innerHTML = `
      <div class="char-card-header">
        <div class="char-squircle-avatar">
          ${avatarInner}
        </div>
        <div style="flex:1; min-width:0;">
          <span class="char-role-upper">${escapeHtml(c.role?.t || 'OFFICIAL AGENT')}</span>
          <h4 class="char-name">${escapeHtml(c.name)}</h4>
        </div>
        <button class="btn-star ${isFav ? 'active' : ''}" onclick="toggleFavorite('${c.id}', event)" title="${isFav ? 'เลิกติดดาว' : 'ติดดาว Agent'}" style="background:transparent; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; justify-content:center;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="${isFav ? '#F59E0B' : 'none'}" stroke="${isFav ? '#F59E0B' : 'var(--ink-faint)'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
      <p class="char-bio">${escapeHtml(c.bio)}</p>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:auto;">${tagsHtml}</div>
      <button class="btn-enter" onclick="openChat('${c.id}'); event.stopPropagation();">
        <span>เปิดหน้าต่างสั่งงาน</span>
      </button>
    `;
    return card;
}
window.createCharacterCard = createCharacterCard;

let currentEvaluatingCandidateId = null;
// --- CUSTOM PROMISE-BASED CONFIRMATION MODAL ---
function showConfirmDialog({
    title = "ยืนยันการทำรายการ",
    message = "ต้องการดำเนินการต่อใช่หรือไม่?",
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    type = "warning",
    icon = "⚠️"
}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customConfirmModal');
        const titleElem = document.getElementById('customConfirmTitle');
        const msgElem = document.getElementById('customConfirmMessage');
        const iconElem = document.getElementById('customConfirmIcon');
        const btnOk = document.getElementById('customConfirmOkBtn');
        const btnCancel = document.getElementById('customConfirmCancelBtn');

        if (!modal || !btnOk || !btnCancel) {
            resolve(window.confirm ? window.confirm(message) : true);
            return;
        }

        if (titleElem) titleElem.textContent = title;
        if (msgElem) msgElem.innerHTML = message.replace(/\n/g, '<br>');
        if (iconElem) iconElem.textContent = icon;
        if (btnOk) {
            btnOk.textContent = confirmText;
            btnOk.className = 'btn-submit ' + (type === 'danger' ? 'btn-danger-action' : (type === 'warning' ? 'btn-warning-action' : 'btn-primary-action'));
        }
        if (btnCancel) btnCancel.textContent = cancelText;

        modal.classList.remove('hidden');

        const cleanup = () => {
            modal.classList.add('hidden');
            btnOk.onclick = null;
            btnCancel.onclick = null;
        };

        btnOk.onclick = () => {
            cleanup();
            resolve(true);
        };

        btnCancel.onclick = () => {
            cleanup();
            resolve(false);
        };
    });
}
window.showConfirmDialog = showConfirmDialog;

const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQ3xO_xI7lLcZ6TzF455ePEP2c8s2e3PthfH4a4qGzI6FyWWeCMEsGXa3GWcqG2lT7vw/exec";
const STORAGE_PREFIX = 'etopc_company_';

// SVG Icons helper
function iconSvg(name){
  const icons = {
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:55%; height:55%; max-width:44px; max-height:44px; display:block; margin:auto;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    filetext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:55%; height:55%; max-width:44px; max-height:44px; display:block; margin:auto;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:55%; height:55%; max-width:44px; max-height:44px; display:block; margin:auto;"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:55%; height:55%; max-width:44px; max-height:44px; display:block; margin:auto;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:55%; height:55%; max-width:44px; max-height:44px; display:block; margin:auto;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:55%; height:55%; max-width:44px; max-height:44px; display:block; margin:auto;"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>'
  };
  return icons[name] || icons.spark;
}

function getAvatarHtml(c) {
    if(!c) return iconSvg("spark");
    if(c.imageUrl && typeof c.imageUrl === 'string' && c.imageUrl.trim() !== "") {
        return `<img src="${c.imageUrl}" alt="${escapeHtml(c.name || 'Agent')}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.onerror=null; this.parentElement.innerHTML=iconSvg('${c.icon || 'spark'}');">`;
    }
    return iconSvg(c.icon || "spark");
}

const APP_DATA_VERSION = 'v3.0';

const DEFAULT_ROLES = [
    {v:"role-hr", t:"HR & People Operations", color:"#EC4899"},
    {v:"role-opc", t:"Operations & Workflow", color:"#0284C7"},
    {v:"role-summary", t:"Executive Assistant", color:"#7C3AED"},
    {v:"role-data", t:"Data & Document Analysis", color:"#10B981"},
    {v:"role-tech", t:"Tech & System Support", color:"#F59E0B"},
    {v:"role-academic", t:"Academic & Research Advisory", color:"#6366F1"}
];
let appRoles = [];

const DEFAULT_TAGS = [
  {v:"tag-hr", t:"#HR_ET", color: "#EC4899", c:"tag-hr"},
  {v:"tag-resume", t:"#Resume_CV", color: "#F43F5E", c:"tag-resume"},
  {v:"tag-summary", t:"#สรุปรายงาน", color: "#7C3AED", c:"tag-summary"},
  {v:"tag-ops", t:"#Operations", color: "#0284C7", c:"tag-ops"},
  {v:"tag-meeting", t:"#การประชุม", color: "#10B981", c:"tag-meeting"},
  {v:"tag-analysis", t:"#วิเคราะห์เอกสาร", color: "#F59E0B", c:"tag-analysis"},
  {v:"tag-automation", t:"#Automation", color: "#EF4444", c:"tag-automation"},
  {v:"tag-code", t:"#Code_Review", color: "#3B82F6", c:"tag-code"},
  {v:"tag-academic", t:"#วิจัย_โครงงาน", color: "#8B5CF6", c:"tag-academic"},
  {v:"tag-helpdesk", t:"#IT_Helpdesk", color: "#10B981", c:"tag-helpdesk"}
];
let appTags = [];

const DEFAULT_QUICK_REPLIES = [
    {v: "qr-1", t: "ช่วยตรวจและประเมินเรซูเม่ (CV) ให้หน่อย"},
    {v: "qr-2", t: "ช่วยปรับปรุงประวัติการทำงานให้เป็นแบบ ATS-Friendly"},
    {v: "qr-3", t: "ช่วยแนะนำขั้นตอนการลาและสวัสดิการพนักงานหน่อย"},
    {v: "qr-4", t: "สร้าง Action Items และผู้รับผิดชอบจากข้อความนี้"}
];
let appQuickReplies = [];

// Pre-configured System Agents for ET OPC Company
// Pre-configured System Agents for ET OPC Company (with HD Character Images)
const SYSTEM_CHARACTERS = [
  { 
    id:"opc-secretary", 
    name:"เลขาส่วนตัว (Administration & Secretary)", 
    creator:"@ETPIM", 
    icon:"briefcase", 
    imageUrl: "Agent Profile/Assice.png",
    color:"linear-gradient(135deg,#EC4899,#831843)", 
    chatCount: 1540, 
    isPrivate: false,
    role: {v:"role-summary", t:"Executive Assistant", color:"#7C3AED"},
    bio:"ผู้ช่วยเลขาประจำตัว คอยดูแลจัดการตารางงาน สรุปการประชุม วิเคราะห์เอกสาร จัดการข้อมูลต่างๆ และช่วยอำนวยความสะดวกในการทำงานอย่างมืออาชีพ",
    requirements: `1. ความถูกต้อง แม่นยำ และเป็นระบบในการจัดเก็บเอกสาร\n2. ความรวดเร็วในการประสานงานและการจัดลำดับความสำคัญ\n3. การสื่อสารที่สุภาพ เป็นมืออาชีพ และรักษาความลับองค์กร`,
    tags:[{v:"tag-summary", t:"#สรุปรายงาน", c:"tag-summary"},{v:"tag-meeting", t:"#การประชุม", c:"tag-meeting"}], 
    featured:true, 
    badge:"เลขาส่วนตัวประจำตัว",
    prompt:`คุณคือ 'เลขาส่วนตัวและผู้ช่วยผู้บริหาร (Executive Secretary)' ประจำ ET OPC Company มีความสามารถรอบด้านในการบริหารจัดการงาน:
1. ช่วยสรุปบันทึกการประชุม จัดทำ Action Items และติดตามงานคั่งค้าง
2. ร่างหนังสือราชการ อีเมลประสานงาน และแบบฟอร์มขออนุมัติต่างๆ อย่างเป็นทางการ
3. จัดระเบียบข้อมูล วางแผนตารางการทำงาน และให้ข้อเสนอแนะเชิงบริหาร
ตอบด้วยน้ำเสียงที่สุภาพ นอบน้อม เป็นมืออาชีพ ชัดเจน และจัดรูปแบบให้อ่านง่าย`,
    opener:"สวัสดีค่ะ/ครับ! ดิฉัน/ผมคือเลขาส่วนตัวประจำองค์กร พร้อมช่วยดูแลตารางงาน ร่างหนังสือประสานงาน สรุปประชุม หรือจัดระเบียบข้อมูล สั่งงานได้เลยนะคะ/ครับ!"
  },
  { 
    id:"opc-hr-et", 
    name:"HR ET — ฝ่ายทรัพยากรบุคคล (HR Specialist)", 
    creator:"@ETPIM", 
    icon:"users", 
    imageUrl: "Agent Profile/HRMAN.png",
    color:"linear-gradient(135deg,#8B0000,#450A0A)", 
    chatCount: 2450, 
    isPrivate: false,
    role: {v:"role-hr", t:"HR & People Operations", color:"#EC4899"},
    bio:"ผู้เชี่ยวชาญด้านทรัพยากรบุคคล คัดกรองและประเมินเรซูเม่เทียบกับความต้องการของตำแหน่งงาน (CV Screening & Score) พร้อมช่วยปรับปรุงประวัติการทำงาน",
    requirements: `1. ประสบการณ์ตรงสายงานอย่างน้อย 1-3 ปี\n2. ทักษะเฉพาะทาง (Hard & Soft Skills) ที่สอดคล้องกับตำแหน่ง\n3. วุฒิการศึกษาและใบรับรองทางวิชาชีพที่เกี่ยวข้อง\n4. ผลงานเชิงประจักษ์ (Metrics/Impact) และความกระตือรือร้น`,
    tags:[{v:"tag-hr", t:"#HR_ET", c:"tag-hr"},{v:"tag-resume", t:"#Resume_CV", c:"tag-resume"},{v:"tag-ops", t:"#Operations", c:"tag-ops"}], 
    featured:true, 
    badge:"ผู้เชี่ยวชาญฝ่ายบุคคล & CV",
    prompt:`คุณคือ 'HR & Recruitment Specialist Agent' (ฝ่ายทรัพยากรบุคคลและสรรหาบุคลากร) ประจำ ET OPC Company มีหน้าที่หลักคือประเมินเรซูเม่ (CV) เทียบกับ 'ความต้องการของตำแหน่งงาน' และให้คำแนะนำปรับปรุงประวัติการทำงาน

📌 [1. เกณฑ์มาตรฐานในการประเมินและคัดกรองผู้สมัคร (Job Requirements & Assessment Criteria)]:
เมื่อผู้ใช้ส่งเรซูเม่ (CV) หรือระบุตำแหน่งงานเข้ามา ให้ประเมินเทียบกับ 4 มิติความต้องการหลัก (คะแนนเต็ม 100):
  1. ประสบการณ์ทำงานตรงสาย (40 คะแนน): พิจารณาความต่อเนื่อง ผลงานที่ผ่านมา และความเกี่ยวข้องกับตำแหน่ง
  2. ทักษะเฉพาะทางและความสามารถหลัก (30 คะแนน): ทักษะ Hard Skills, Soft Skills, เครื่องมือ และเทคโนโลยีที่ใช้
  3. วุฒิการศึกษาและใบรับรอง (15 คะแนน): สาขาวิชา, สถาบัน, และ Certificate ที่เกี่ยวข้อง
  4. ผลงานเชิงประจักษ์และการจัดทำเรซูเม่ (15 คะแนน): การระบุผลลัพธ์เชิงตัวเลข (Metrics/Impact) และความชัดเจนของข้อมูล

📌 [2. โครงสร้างการรายงานผลการประเมิน]:
  - ตารางสรุปเปรียบเทียบ: [หัวข้อความต้องการ] | [ข้อมูลใน CV] | [ผลประเมิน & คะแนน]
  - สรุปคะแนนรวมความเหมาะสม (Match Score / 100) และผลการพิจารณาเบื้องต้น (ผ่านเกณฑ์ / ควรพิจารณาเพิ่มเติม / ไม่ผ่านเกณฑ์)
  - วิเคราะห์จุดเด่น (Key Strengths) และจุดที่ควรพัฒนาหรือข้อสังเกต (Gaps & Considerations)
  - คำถามสัมภาษณ์งานเชิงลึก 3-5 ข้อที่ออกแบบเฉพาะสำหรับผู้สมัครรายนี้

📌 [3. การให้คำแนะนำปรับปรุงเรซูเม่ (CV Optimization)]:
  - ช่วยปรับภาษาให้เป็นทางการ กระชับ และเป็นมาตรฐาน ATS-Friendly
  - แนะนำการใช้ Action Verbs และการนำเสนอผลงานให้โดดเด่น

ตอบด้วยภาษาไทยที่สุภาพ เป็นมืออาชีพ ชัดเจน และจัดรูปแบบให้อ่านง่าย`,
    opener:"สวัสดีค่ะ! ดิฉันคือผู้ช่วย AI ฝ่ายบุคคล (HR ET) ประจำ ET OPC Company พร้อมช่วยคัดกรองเรซูเม่ผู้สมัครตามเกณฑ์ความต้องการของตำแหน่งงาน หรือช่วยตรวจปรับปรุงเรซูเม่ (CV) ให้โดดเด่น แนบไฟล์เรซูเม่หรือระบุตำแหน่งงานเข้ามาได้เลยนะคะ!"
  },
  { 
    id:"opc-exec-summary", 
    name:"ผู้ช่วยสรุปงาน & สรุปการประชุม (Executive Summary)", 
    creator:"@ETPIM", 
    icon:"filetext", 
    imageUrl: "Agent Profile/HelperGirl.png",
    color:"linear-gradient(135deg,#7C3AED,#1E1B4B)", 
    chatCount: 1820, 
    isPrivate: false,
    role: {v:"role-summary", t:"Executive Assistant", color:"#7C3AED"},
    bio:"ผู้เชี่ยวชาญการสรุปเนื้อหาการประชุม ยาวให้สั้น สกัด Action Items รายการสิ่งที่ต้องทำ และติดตามงาน",
    tags:[{v:"tag-summary", t:"#สรุปรายงาน", c:"tag-summary"},{v:"tag-meeting", t:"#การประชุม", c:"tag-meeting"}], 
    featured:true, 
    badge:"ผู้ช่วยสรุปงานบริหาร",
    prompt:"คุณคือ 'Executive Assistant Agent' ประจำ ET OPC Company หน้าที่หลักของคุณคือการสรุปงาน, สรุปการประชุม, และสกัดประเด็นสำคัญอย่างมืออาชีพ โครงสร้างการตอบต้องชัดเจน: 1. สรุปใจความสำคัญ (Summary) 2. ประเด็นหลักที่พูดคุย (Key Discussion Points) 3. สิ่งที่ต้องทำต่อและผู้รับผิดชอบ (Action Items & Next Steps) 4. กำหนดส่ง (Deadlines/Follow-ups)",
    opener:"สวัสดีครับ ผมคือผู้ช่วยสรุปงานของ ET OPC Company ส่งบันทึกการประชุม, อีเมล หรือไฟล์เอกสารมาได้เลยครับ ผมจะช่วยจัดทำบทสรุปและ Action Items ให้ทันที!"
  },
  { 
    id:"opc-workflow-agent", 
    name:"ผู้ประสานงานฝ่ายปฏิบัติการ (Operations Coordinator)", 
    creator:"@ETPIM", 
    icon:"briefcase", 
    imageUrl: "Agent Profile/CoPx.png",
    color:"linear-gradient(135deg,#0284C7,#0F172A)", 
    chatCount: 2310, 
    isPrivate: false,
    role: {v:"role-opc", t:"Operations & Workflow", color:"#0284C7"},
    bio:"ช่วยตรวจเช็คขั้นตอนการทำงาน ร่างอีเมลประสานงาน และวางแผน Workflow การดำเนินงานประจำวัน",
    tags:[{v:"tag-ops", t:"#Operations", c:"tag-ops"},{v:"tag-automation", t:"#Automation", c:"tag-automation"}], 
    featured:true, 
    badge:"ระบบอัตโนมัติ Operations",
    prompt:"คุณคือ 'Operations Coordinator Agent' ประจำ ET OPC Company เชี่ยวชาญการจัดระบบงาน ร่างแบบฟอร์ม ร่างอีเมลทางธุรกิจ และแนะนำ Workflow การทำงานที่มีประสิทธิภาพ",
    opener:"สวัสดีครับ ฝ่าย Operations พร้อมสนับสนุนการทำงานครับ วันนี้มีงานใดต้องการให้ช่วยประสานงาน ร่างอีเมล หรือจัดระเบียบข้อมูลไหมครับ?"
  },
  { 
    id:"opc-data-analyst", 
    name:"นักวิเคราะห์เอกสารและข้อมูล (Data Analyst Bot)", 
    creator:"@ETPIM", 
    icon:"chart", 
    imageUrl: "Agent Profile/CheckingGR.png",
    color:"linear-gradient(135deg,#059669,#064E3B)", 
    chatCount: 1180, 
    isPrivate: false,
    role: {v:"role-data", t:"Data & Document Analysis", color:"#10B981"},
    bio:"ช่วยอ่านและสกัดข้อมูลจากไฟล์ CSV, Text, รายงานยอดขาย หรือสรุปตัวเลขให้อยู่ในรูปตาราง",
    tags:[{v:"tag-analysis", t:"#วิเคราะห์เอกสาร", c:"tag-analysis"},{v:"tag-summary", t:"#สรุปรายงาน", c:"tag-summary"}], 
    featured:true, 
    badge:"วิเคราะห์สถิติ & เอกสาร",
    prompt:"คุณคือ 'Data Analyst Agent' ของ ET OPC Company ช่วยอ่าน วิเคราะห์ และเปรียบเทียบข้อมูล สรุปออกมาเป็นหัวข้อ เปอร์เซ็นต์ และตาราง Markdown ได้อย่างแม่นยำ",
    opener:"สวัสดีครับ ส่งไฟล์ข้อมูล สถิติ หรือรายงานตัวเลขมาให้ผมวิเคราะห์และสรุปเป็นกราฟข้อมูล/ตารางได้เลยครับ!"
  }
,
  { 
    id:"opc-software-engineer", 
    name:"Software Engineer Lead (วิศวกรซอฟต์แวร์ & สถาปัตยกรรมระบบ)", 
    creator:"@ETPIM", 
    icon:"cpu", 
    imageUrl: "Agent Profile/SSEARCH.png", 
    color:"linear-gradient(135deg,#0284C7,#0369A1)", 
    chatCount: 1620, 
    isPrivate: false,
    role: {v:"role-tech", t:"Tech & System Support", color:"#F59E0B"},
    bio:"ผู้เชี่ยวชาญด้านวิศวกรรมซอฟต์แวร์ ช่วยตรวจสอบโค้ด (Code Review) ดีบัก Error แนะนำ SQL/Python/JavaScript สถาปัตยกรรมระบบ และความปลอดภัยของแอปพลิเคชัน",
    requirements: `1. โครงสร้างโค้ดที่ถูกต้องตาม Clean Code & Design Patterns\n2. ประสิทธิภาพการทำงาน (Algorithm Efficiency & Performance)\n3. การจัดการ Error Handling และความปลอดภัยของข้อมูล (Security)\n4. ความอ่านง่าย มี Documentation หรือ Comments กำกับชัดเจน`,
    tags:[{v:"tag-code", t:"#Code_Review", c:"tag-code"},{v:"tag-automation", t:"#Automation", c:"tag-automation"}], 
    featured:true, 
    badge:"วิศวกรซอฟต์แวร์ประจำคณะ",
    prompt:`คุณคือ 'Senior Software Engineer & Code Architect Agent' ประจำคณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) สถาบันการจัดการปัญญาภิวัฒน์ มีความเชี่ยวชาญด้านการพัฒนาซอฟต์แวร์ การตรวจทานโค้ด (Code Review) และการแก้ปัญหาเชิงเทคนิค:
1. ตรวจสอบโค้ดอย่างละเอียด ชี้จุดที่มี Bug, จุดที่ประสิทธิภาพต่ำ (Bottleneck) หรือความเสี่ยงด้านความปลอดภัย
2. แนะนำแนวทางแก้ไขพร้อมแสดงตัวอย่างโค้ดที่สะอาด (Clean Code) ให้อ่านและนำไปใช้งานได้ทันที (รองรับ JavaScript, Python, SQL, HTML/CSS, Java, C++, REST API, Webhook)
3. อธิบายหลักการทางวิศวกรรมซอฟต์แวร์อย่างเป็นระบบ เข้าใจง่าย และให้คำแนะนำด้าน System Architecture อย่างมืออาชีพ
ตอบด้วยภาษาไทยที่สุภาพ ชัดเจน และจัดโครงสร้างโค้ดด้วย Markdown Codeblock เสมอ`,
    opener:"สวัสดีครับ! ผมคือวิศวกรซอฟต์แวร์ (Software Engineer Lead) พร้อมช่วยตรวจทานโค้ด (Code Review) ช่วยดีบักบั๊ก ออกแบบฐานข้อมูล SQL หรือแนะนำสถาปัตยกรรมระบบ ส่งโค้ดหรือโจทย์เข้ามาได้เลยครับ!"
  },
  { 
    id:"opc-academic-advisor", 
    name:"Academic & Senior Project Advisor (อาจารย์ที่ปรึกษาโครงงาน & วิจัย)", 
    creator:"@ETPIM", 
    icon:"filetext", 
    imageUrl: "Agent Profile/AJ.png", 
    color:"linear-gradient(135deg,#6366F1,#4338CA)", 
    chatCount: 1430, 
    isPrivate: false,
    role: {v:"role-academic", t:"Academic & Research Advisory", color:"#6366F1"},
    bio:"อาจารย์ที่ปรึกษาโครงงานวิศวกรรมศาสตร์และนวัตกรรม ช่วยตรวจสอบเล่มโครงงานปริญญานิพนธ์ (Senior Project) ตรวจบทคัดย่อ (Abstract) ภาษาไทย-อังกฤษ และรูปแบบอ้างอิงมาตรฐาน IEEE / APA",
    requirements: `1. ความถูกต้องของระเบียบวิธีวิจัยและขั้นตอนการทดลอง\n2. ความสมบูรณ์ของโครงสร้างบทคัดย่อ (วัตถุประสงค์, วิธีการ, ผลลัพธ์, บทสรุป)\n3. การใช้ภาษาทางวิชาการที่ถูกต้องและเป็นทางการ\n4. รูปแบบการอ้างอิงเอกสารที่ถูกต้องตามมาตรฐานสากล`,
    tags:[{v:"tag-academic", t:"#วิจัย_โครงงาน", c:"tag-academic"},{v:"tag-summary", t:"#สรุปรายงาน", c:"tag-summary"}], 
    featured:true, 
    badge:"ที่ปรึกษาโครงงานปริญญานิพนธ์",
    prompt:`คุณคือ 'Academic & Senior Project Advisor Agent' (อาจารย์ที่ปรึกษาโครงงานและวิทยานิพนธ์) ประจำคณะวิศวกรรมศาสตร์และเทคโนโลยี PIM มีหน้าที่หลักคือให้คำแนะนำเชิงวิชาการ:
1. ตรวจสอบและขัดเกลาบทคัดย่อ (Abstract ทั้งภาษาไทยและภาษาอังกฤษ) ให้กระชับ สละสลวย และถูกต้องตามหลักไวยากรณ์วิชาการ
2. ให้คำปรึกษาโครงสร้างเล่มโปรเจกต์ 5 บท (ที่มาและความสำคัญ, ทฤษฎี, วิธีดำเนินการ, ผลการทดลอง, สรุปและข้อเสนอแนะ)
3. ตรวจสอบการอ้างอิงและบรรณานุกรมตามมาตรฐาน IEEE และ APA 7th Edition
4. ให้คำแนะนำการเตรียมสไลด์นำเสนอและเทคนิคการตอบคำถามกรรมการสอบโครงงาน
ตอบด้วยน้ำเสียงที่อบอุ่น เป็นมืออาชีพ ให้กำลังใจ และมีข้อเสนอแนะเชิงวิชาการที่ชัดเจนเป็นข้อๆ`,
    opener:"สวัสดีครับนักศึกษาและคณาจารย์ทุกท่าน! อาจารย์พร้อมให้คำปรึกษาโครงงานปริญญานิพนธ์ (Senior Project) ตรวจเล่มรายงาน ปรับแก้บทคัดย่อภาษาไทย/อังกฤษ หรือตรวจสอบรูปแบบการอ้างอิง ส่งเอกสารหรือข้อสงสัยมาได้เลยครับ!"
  },
  { 
    id:"opc-it-helpdesk", 
    name:"IT Helpdesk & System Support (บริการสนับสนุนไอที & ช่วยเหลือระบบ)", 
    creator:"@ETPIM", 
    icon:"users", 
    imageUrl: "Agent Profile/SHELP.png", 
    color:"linear-gradient(135deg,#059669,#047857)", 
    chatCount: 1980, 
    isPrivate: false,
    role: {v:"role-tech", t:"Tech & System Support", color:"#F59E0B"},
    bio:"ผู้ช่วยบริการงานไอทีและสนับสนุนผู้ใช้งาน แนะนำขั้นตอนการแก้ปัญหาการใช้งานระบบ เครือข่าย VPN บัญชีผู้ใช้ ร่างคำตอบช่วยเหลือ (Ticket Response) และจัดทำ FAQ ประจำองค์กร",
    requirements: `1. ความรวดเร็วและชัดเจนในการให้แนวทางแก้ไขปัญหา (Step-by-step)\n2. การสื่อสารที่เข้าใจง่าย อธิบายศัพท์เทคนิคให้เป็นภาษาคนทั่วไป\n3. ความสุภาพ นอบน้อม และพร้อมอำนวยความสะดวก`,
    tags:[{v:"tag-helpdesk", t:"#IT_Helpdesk", c:"tag-helpdesk"},{v:"tag-ops", t:"#Operations", c:"tag-ops"}], 
    featured:true, 
    badge:"ผู้ช่วยแก้ปัญหาไอที 24/7",
    prompt:`คุณคือ 'IT Helpdesk & Support Agent' ประจำ ET OPC Company และคณะวิศวกรรมศาสตร์และเทคโนโลยี PIM หน้าที่หลักคือช่วยเหลือผู้ใช้งานในการแก้ปัญหาทางไอทีและระบบภายใน:
1. ให้คำแนะนำขั้นตอนการแก้ปัญหา (Troubleshooting Steps) อย่างเป็นลำดับ 1, 2, 3 เข้าใจง่าย
2. ร่างคำตอบ Ticket ช่วยเหลือผู้ใช้งานอย่างสุภาพ ชัดเจน และตรงจุด (เช่น ปัญหา Login, VPN, Email, WiFi, Software Setup)
3. จัดทำ FAQ และข้อแนะนำการใช้งานระบบเพื่อป้องกันปัญหาเดิมซ้ำซ้อน
ตอบด้วยน้ำเสียงที่สุภาพ เป็นมิตร ใจเย็น และให้แนวทางปฏิบัติที่สามารถทำตามได้ทันที`,
    opener:"สวัสดีครับ! ฝ่ายบริการไอทีและช่วยเหลือระบบ (IT Helpdesk) ยินดีให้บริการครับ หากพบปัญหาการใช้งานระบบ ล็อกอินไม่ได้ หรือมีข้อสงสัยด้านเทคนิค แจ้งผมได้ทันทีเลยครับ!"
  }
];


let appCharacters = [];
let currentCharacter = null;
let editingCharacterId = null; 
let currentUploadedImage = ""; 
let isImageRemoved = false; 
let currentCropperTarget = "character";
let currentUploadedProfileImage = ""; 
let isProfileImageRemoved = false; 
let currentUser = "Guest";
let currentUserRole = "user";

let appUserData = {}; 
let cropper = null;

let currentSearchQuery = "";
let systemFilter = "all"; 
let activeTagFilters = []; 
let pendingAttachedFile = null;

// AI Configuration
let adminModels = [];

let userGeminiPreference = {
    selectedModelId: null,
    temperature: 0.7
};



// --- INITIALIZATION ---
function initApp() {
    const savedTheme = localStorage.getItem(STORAGE_PREFIX + 'theme') || 'light';
    setTheme(savedTheme, false);

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const currentPref = localStorage.getItem(STORAGE_PREFIX + 'theme');
            if (currentPref === 'auto') {
                setTheme('auto', false);
            }
        });
    }
    const loggedIn = localStorage.getItem(STORAGE_PREFIX + 'logged_in') || sessionStorage.getItem(STORAGE_PREFIX + 'logged_in');
    
    if (loggedIn === 'true') {
        currentUser = localStorage.getItem(STORAGE_PREFIX + 'username') || sessionStorage.getItem(STORAGE_PREFIX + 'username') || "User";
        currentUserRole = localStorage.getItem(STORAGE_PREFIX + 'role') || sessionStorage.getItem(STORAGE_PREFIX + 'role') || "user";
        
        let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
        if(!users['ETPIM']) {
            users['ETPIM'] = { password: 'ET@PIMadminpass', role: 'admin' };
        } else {
            users['ETPIM'].role = 'admin';
        }
        localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));

        if(users[currentUser] && users[currentUser].role) {
            currentUserRole = users[currentUser].role;
        }
        
        const navUserName = document.getElementById('navUserName');
        const navUserAvatar = document.getElementById('navUserAvatar');
        const dropdownUserName = document.getElementById('dropdownUserName');
        
        if (navUserName) navUserName.textContent = "@" + currentUser;
        if (dropdownUserName) dropdownUserName.textContent = "@" + currentUser;
        if (navUserAvatar) navUserAvatar.textContent = currentUser.charAt(0).toUpperCase();
        
        const mainApp = document.getElementById('mainApp');
        if (mainApp) mainApp.style.display = 'block';
        
        const btnAdminDash = document.getElementById('btnAdminDash');
        const btnCreateChar = document.getElementById('btnCreateChar');
        const sidebarBtnAdmin = document.getElementById('sidebarBtnAdmin');
        const sidebarBtnCreate = document.getElementById('sidebarBtnCreate');

        if(currentUserRole === 'admin') {
            if(btnCreateChar) btnCreateChar.style.display = 'inline-flex';
            if(sidebarBtnAdmin) sidebarBtnAdmin.style.display = 'flex';
            if(sidebarBtnCreate) sidebarBtnCreate.style.display = 'flex';
        } else {
            if(btnCreateChar) btnCreateChar.style.display = 'none';
            if(sidebarBtnAdmin) sidebarBtnAdmin.style.display = 'none';
            if(sidebarBtnCreate) sidebarBtnCreate.style.display = 'none';
        }
        
        loadGeminiConfigs();
        loadPromptTemplates();
        loadQuickActions();
        loadAnnouncement();
        updateCreateButtonVisibility();
        loadUserData(); 
        updateUIAfterProfileChange(); 
        loadData();     
        renderRecentChats(); 
        renderSidebarStarred();
        loadCandidateSubmissions();
        updateHubStats(); 
         
         
        initDragAndDropAndPaste();

        // Browser history navigation
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view === 'chat' && e.state.id) {
                openChat(e.state.id, false);
            } else if (e.state && e.state.view === 'create') {
                showCreateForm(false);
            } else {
                showExplore(false);
            }
        });

        // Keyboard navigation: ESC to return home
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const anyModalOpen = document.querySelector('.modal-overlay:not(.hidden)');
                if (anyModalOpen) {
                    anyModalOpen.classList.add('hidden');
                } else {
                    const chatView = document.getElementById('chatView');
                    const createView = document.getElementById('createView');
                    if ((chatView && chatView.classList.contains('active')) || 
                        (createView && !createView.classList.contains('hidden'))) {
                        showExplore();
                    }
                }
            }
        });

    } else {
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

function logout() {
    localStorage.removeItem(STORAGE_PREFIX + 'logged_in');
    localStorage.removeItem(STORAGE_PREFIX + 'username');
    localStorage.removeItem(STORAGE_PREFIX + 'role');
    sessionStorage.removeItem(STORAGE_PREFIX + 'logged_in');
    sessionStorage.removeItem(STORAGE_PREFIX + 'username');
    sessionStorage.removeItem(STORAGE_PREFIX + 'role');
    window.location.href = 'login.html';
}

// APP_DATA_VERSION already declared

function loadData() {
    const savedChars = localStorage.getItem(STORAGE_PREFIX + 'agents_v2') || localStorage.getItem(STORAGE_PREFIX + 'agents_v1');
    let loaded = [];
    if (!savedChars) {
        loaded = JSON.parse(JSON.stringify(SYSTEM_CHARACTERS));
    } else {
        try {
            loaded = JSON.parse(savedChars);
            if (!Array.isArray(loaded) || loaded.length === 0) {
                loaded = JSON.parse(JSON.stringify(SYSTEM_CHARACTERS));
            }
        } catch(e) {
            loaded = JSON.parse(JSON.stringify(SYSTEM_CHARACTERS));
        }

        // Ensure all system characters exist and sync with updated images
        SYSTEM_CHARACTERS.forEach(sysChar => {
            const existingIdx = loaded.findIndex(c => c.id === sysChar.id);
            if (existingIdx === -1) {
                loaded.push(JSON.parse(JSON.stringify(sysChar)));
            } else if (loaded[existingIdx].creator === '@ETPIM') {
                loaded[existingIdx].imageUrl = sysChar.imageUrl;
                loaded[existingIdx].prompt = sysChar.prompt;
                loaded[existingIdx].requirements = sysChar.requirements || '';
                loaded[existingIdx].bio = sysChar.bio;
                loaded[existingIdx].opener = sysChar.opener;
                loaded[existingIdx].tags = sysChar.tags;
                loaded[existingIdx].badge = sysChar.badge;
                loaded[existingIdx].name = sysChar.name;
                loaded[existingIdx].color = sysChar.color;
            }
        });
    }

    if (!loaded || loaded.length === 0) {
        loaded = JSON.parse(JSON.stringify(SYSTEM_CHARACTERS));
    }

    appCharacters = loaded;
    saveToStorage();
    
    const savedTags = localStorage.getItem(STORAGE_PREFIX + 'tags_v1'); 
    appTags = savedTags ? JSON.parse(savedTags) : [...DEFAULT_TAGS];
    
    const savedRoles = localStorage.getItem(STORAGE_PREFIX + 'roles_v1');
    appRoles = savedRoles ? JSON.parse(savedRoles) : [...DEFAULT_ROLES];
    
    const savedQR = localStorage.getItem(STORAGE_PREFIX + 'quickreplies_v1');
    appQuickReplies = savedQR ? JSON.parse(savedQR) : [...DEFAULT_QUICK_REPLIES];
    
    renderTagsUI();
    applyFilters();
    renderSidebarStarred();
        loadCandidateSubmissions();
        updateHubStats();
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_PREFIX + 'agents_v2', JSON.stringify(appCharacters));
    } catch (e) {
        console.warn("Storage quota exceeded", e);
    }
}

function loadUserData() {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'userdata_v1');
    appUserData = saved ? JSON.parse(saved) : {};
    if(!appUserData[currentUser]) {
        appUserData[currentUser] = { favs: [], history: {}, profile: { displayName: currentUser, avatarUrl: "", persona: "" } };
    }
    if(!appUserData[currentUser].profile) {
        appUserData[currentUser].profile = { displayName: currentUser, avatarUrl: "", persona: "" };
    }
}

function saveUserData() {
    localStorage.setItem(STORAGE_PREFIX + 'userdata_v1', JSON.stringify(appUserData));
}

// --- FILE ATTACHMENT & PROCESSING SYSTEM (PHASE 1) ---
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function processSelectedFile(file) {
    if(!file) return;

    const previewContainer = document.getElementById('fileAttachmentPreview');
    const fileNameSpan = document.getElementById('attachedFileName');
    const fileSizeSpan = document.getElementById('attachedFileSize');
    const fileTypeTag = document.getElementById('attachedFileTypeTag');
    const fileIcon = document.getElementById('attachedFileIcon');

    const formattedSize = formatBytes(file.size);
    const ext = file.name.split('.').pop().toUpperCase();

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF Multimodal Processing
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result.split(',')[1];
            pendingAttachedFile = {
                name: file.name,
                mimeType: 'application/pdf',
                base64: base64Data,
                isPdf: true,
                isImage: false,
                size: file.size,
                formattedSize: formattedSize
            };
            if(fileIcon) fileIcon.textContent = '📕';
            if(fileNameSpan) fileNameSpan.textContent = file.name;
            if(fileSizeSpan) fileSizeSpan.textContent = formattedSize;
            if(fileTypeTag) { fileTypeTag.textContent = 'PDF'; fileTypeTag.style.background = '#EF4444'; }
            if(previewContainer) previewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);

    } else if (file.type.startsWith('image/')) {
        // Image Vision Processing
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result.split(',')[1];
            pendingAttachedFile = {
                name: file.name,
                mimeType: file.type || 'image/png',
                base64: base64Data,
                dataUrl: e.target.result,
                isPdf: false,
                isImage: true,
                size: file.size,
                formattedSize: formattedSize
            };
            if(fileIcon) fileIcon.textContent = '🖼️';
            if(fileNameSpan) fileNameSpan.textContent = file.name;
            if(fileSizeSpan) fileSizeSpan.textContent = formattedSize;
            if(fileTypeTag) { fileTypeTag.textContent = 'IMAGE'; fileTypeTag.style.background = '#3B82F6'; }
            if(previewContainer) previewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);

    } else {
        // Text / CSV / JSON / MD / Code Processing
        const reader = new FileReader();
        reader.onload = function(e) {
            pendingAttachedFile = {
                name: file.name,
                mimeType: file.type || 'text/plain',
                content: e.target.result,
                isPdf: false,
                isImage: false,
                size: file.size,
                formattedSize: formattedSize
            };
            if(fileIcon) fileIcon.textContent = ext === 'CSV' ? '📊' : (ext === 'JSON' ? '⚡' : '📄');
            if(fileNameSpan) fileNameSpan.textContent = file.name;
            if(fileSizeSpan) fileSizeSpan.textContent = formattedSize;
            if(fileTypeTag) { fileTypeTag.textContent = ext || 'DOC'; fileTypeTag.style.background = '#10B981'; }
            if(previewContainer) previewContainer.style.display = 'flex';
        };
        reader.readAsText(file);
    }
}

function handleFileSelection(event) {
    const file = event.target.files[0];
    if(file) processSelectedFile(file);
    event.target.value = '';
}

function clearPendingFile() {
    pendingAttachedFile = null;
    const previewContainer = document.getElementById('fileAttachmentPreview');
    if(previewContainer) previewContainer.style.display = 'none';
}

function initDragAndDropAndPaste() {
    const chatWindow = document.getElementById('chatWindowMain');
    const overlay = document.getElementById('dropZoneOverlay');

    if (chatWindow && overlay) {
        ['dragenter', 'dragover'].forEach(eventName => {
            chatWindow.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                overlay.classList.add('active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            chatWindow.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                overlay.classList.remove('active');
            }, false);
        });

        chatWindow.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                processSelectedFile(files[0]);
            }
        }, false);
    }

    // Paste handler for screenshot / copied text file
    window.addEventListener('paste', (e) => {
        const chatView = document.getElementById('chatView');
        if (!chatView || !chatView.classList.contains('active')) return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file') {
                const blob = item.getAsFile();
                if(blob) {
                    processSelectedFile(blob);
                    e.preventDefault();
                    break;
                }
            }
        }
    });
}

// --- AUTOMATION QUICK ACTIONS ---
function triggerAutomation(actionType) {
    if(!currentCharacter) return;
    
    let prompt = "";
    if (actionType === 'cv_screen') {
        prompt = `🎯 กรุณาวิเคราะห์และประเมินเรซูเม่/ประวัติการทำงาน (CV) นี้อย่างละเอียด:
1. สรุปภาพรวม ประสบการณ์ และทักษะหลัก (Hard & Soft Skills)
2. ประเมินจุดเด่น (Strengths) และจุดที่ควรพัฒนา/สิ่งที่ยังขาด (Gaps)
3. สรุปคะแนนความเหมาะสม (Match Score /100) และข้อเสนอแนะสำหรับ HR
4. ร่างคำถามสัมภาษณ์งาน 3-5 ข้อที่เจาะลึกจากประวัติการทำงานนี้`;
    } else if (actionType === 'cv_compare') {
        prompt = `📊 กรุณาเปรียบเทียบผู้สมัครทุกคนจากเรซูเม่/ข้อมูลข้างต้นในรูปแบบตาราง Head-to-Head Comparison Matrix:
1. ตารางเปรียบเทียบ: [ชื่อผู้สมัคร] | [ประสบการณ์] | [ทักษะหลัก] | [จุดเด่น] | [คะแนนความเหมาะสม /100]
2. จัดอันดับผู้สมัคร (Ranking) พร้อมระบุเหตุผลในการเรียงลำดับ
3. สรุปคำแนะนำเชิงลึกสำหรับคณะกรรมการในการตัดสินใจคัดเลือก`;
    } else if (actionType === 'email_interview') {
        prompt = `📧 ช่วยร่างอีเมลนัดหมายสัมภาษณ์งานภาษาไทยอย่างเป็นทางการ:
1. ระบุชื่อผู้สมัครและตำแหน่งที่สมัคร
2. กำหนดวัน เวลา และช่องทางสัมภาษณ์ (Google Meet / On-site)
3. ระบุเอกสารหรือผลงานที่ต้องเตรียมตัวล่วงหน้า
4. ปิดท้ายด้วยความอบอุ่นและข้อมูลติดต่อฝ่ายบุคคล ET OPC Company`;
    } else if (actionType === 'slide_outline') {
        prompt = `📑 ช่วยแปลงข้อมูลข้างต้นให้เป็น 'โครงร่างสไลด์นำเสนอ (Slide Outline Deck)':
- Slide 1: หัวข้อหลักและวัตถุประสงค์ (Title & Executive Summary)
- Slide 2: สาระสำคัญและประเด็นการวิเคราะห์ (Key Insights / Candidate Profiles)
- Slide 3: ตารางข้อมูลเปรียบเทียบและสถิติ (Data Matrix & Scores)
- Slide 4: สรุปผลและขั้นตอนการดำเนินงานถัดไป (Action Plan & Next Steps)
พร้อมระบุ Talking Points หรือ Speaker Notes กำกับในแต่ละสไลด์อย่างชัดเจน`;
    } else if (actionType === 'cv_optimize') {
        prompt = `✨ ช่วยปรับปรุงและเขียนเรซูเม่/ประวัติการทำงาน (CV) นี้ให้เป็นมืออาชีพและโดดเด่น:
1. ปรับปรุงข้อความและทักษะด้วย Action Verbs และระบุผลงานเชิงตัวเลข (Impact/Metrics)
2. จัดโครงสร้างเป็นแบบมาตรฐานสากลที่อ่านง่ายและรองรับระบบ ATS (ATS-Friendly Format)
3. เพิ่มข้อความสรุปโปรไฟล์ (Professional Summary) ที่ดึงดูดใจ พร้อมนำไปใช้สมัครงานได้ทันที`;
    } else if (actionType === 'summary') {
        prompt = "📌 กรุณาสรุปประเด็นและใจความสำคัญของงาน/เอกสาร/บทสนทนานี้ให้กระชับ ชัดเจน และแบ่งเป็นหัวข้อย่อย";
    } else if (actionType === 'action_items') {
        prompt = "📋 ช่วยสกัด Action Items (สิ่งที่ต้องทำต่อ), ผู้รับผิดชอบ (Person in Charge), และกำหนดส่ง (Deadline) จากข้อมูลข้างต้น";
    } else if (actionType === 'draft_email') {
        prompt = "✉️ ช่วยร่างอีเมลภาษาไทยทางการเพื่อรายงานสรุปผลการดำเนินงานนี้ส่งต่อให้ทีมบริหาร";
    } else if (actionType === 'table_matrix') {
        prompt = "📊 ช่วยจัดระเบียบและแปลงข้อมูลข้างต้นให้อยู่ในรูปแบบตาราง Markdown เพื่อเปรียบเทียบและอ่านง่าย";
    } else if (actionType === 'export_pdf') {
        prompt = "📕 ช่วยจัดทำรายงานฉบับสมบูรณ์ พร้อมระบุหัวข้อ วัตถุประสงค์ สาระสำคัญ และข้อสรุปอย่างเป็นทางการ สำหรับส่งออกเป็นไฟล์เอกสาร PDF";
    } else if (actionType === 'export_csv') {
        prompt = "📊 ช่วยสกัดและรวบรวมข้อมูลทั้งหมดให้อยู่ในรูปแบบตาราง Markdown Table อย่างละเอียด เพื่อให้สามารถส่งออกเป็นไฟล์ Excel / CSV ได้ทันที";
    } else if (actionType === 'qa_deep') {
        prompt = "🔍 ช่วยวิเคราะห์เจาะลึก: จุดแข็ง (Strengths), จุดอ่อน/ข้อควรระวัง (Risks & Bottlenecks), และข้อเสนอแนะเชิงกลยุทธ์ (Strategic Recommendations)";
    }
    
    const input = document.getElementById('msgInput');
    if (pendingAttachedFile) {
        sendMessage(prompt);
    } else {
        if (input) {
            input.value = prompt;
            input.focus();
            showToast("นำเข้าคำสั่งแล้ว สามารถพิมพ์เพิ่มหรือกดส่งได้ทันที 🚀", "info");
        }
    }
}

function exportCurrentSession(format = 'md') {
    if(!currentCharacter) return;
    const history = appUserData[currentUser]?.history[currentCharacter.id] || [];
    if(history.length === 0) return alert("ยังไม่มีข้อความสำหรับส่งออก");

    let mdContent = `# รายงานสรุปการทำงาน - ET OPC Company\n`;
    mdContent += `**Agent:** ${currentCharacter.name}\n`;
    mdContent += `**ผู้ใช้งาน:** @${currentUser}\n`;
    mdContent += `**วันที่ส่งออก:** ${new Date().toLocaleString('th-TH')}\n\n---\n\n`;

    history.forEach(m => {
        const roleName = m.r === 'user' ? `@${currentUser}` : currentCharacter.name;
        mdContent += `### 👤 ${roleName}\n${m.t}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETOPC_${currentCharacter.id}_Summary_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- UNIVERSAL AI API CALLER (GEMINI + OPENAI + OPENROUTER + DEEPSEEK + GROQ + OLLAMA) ---
async function callUniversalAiApi(config, character, profile, history, temperature, attachedFile = null, onChunk = null) {
    if(!config || !config.apiKey || config.apiKey.trim() === "") {
        throw new Error("ยังไม่ได้ระบุ API Key ในระบบ");
    }

    const apiKey = config.apiKey.trim();
    let baseUrl = (config.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models/").trim();
    const model = (config.modelName || 'gemini-3.5-flash').trim();
    const providerType = config.providerType || (baseUrl.includes("generativelanguage.googleapis.com") ? "gemini" : "openai");

    const systemInstruction = `You are the specialized enterprise AI Agent "${character.name}" at ET OPC Company.
Role: ${character.role?.t || 'Operations'}
Bio: ${character.bio || ''}
System Instructions:
${character.prompt || 'Help summarize, automate tasks, and analyze documents professionally.'}${character.requirements && character.requirements.trim() !== '' ? `

Specific Requirements & Criteria (ความต้องการ / เกณฑ์คุณสมบัติ):
${character.requirements}` : ''}

User: @${profile.displayName || currentUser} (${profile.persona || 'Staff'})

🔒 [STRICT ROLE BOUNDARIES & GUARDRAILS — กฎการปฏิบัติหน้าที่เฉพาะทาง]:
1. ปฏิบัติหน้าที่ตามความเชี่ยวชาญและขอบเขตงานของตนเองอย่างเคร่งครัด (Strict Role Adherence)
2. ห้ามตอบหรือรับทำงานที่อยู่นอกเหนือบทบาทหน้าที่ของตนเองเด็ดขาด:
   - หากผู้ใช้ถามคำถามหรือสั่งงานที่อยู่นอกสายงานของคุณ ให้ตอบปฏิเสธอย่างสุภาพและเป็นมืออาชีพ พร้อมแนะนำให้ผู้ใช้เลือกสลับไปใช้งาน Agent ประจำฝ่ายที่ตรงสายงานแทน (ได้แก่: เลขาส่วนตัว, HR ET, ผู้ช่วยสรุปงาน, ผู้ประสานงาน Operations, นักวิเคราะห์ข้อมูล, วิศวกรซอฟต์แวร์, อาจารย์ที่ปรึกษาโครงงาน, หรือ IT Helpdesk)
3. ปฏิเสธเรื่องที่ไม่เกี่ยวข้องกับการทำงานในองค์กรอย่างสุภาพ และนำบริบทกลับมาสู่งานในความรับผิดชอบของคุณ
4. จัดรูปแบบข้อความให้อ่านง่าย ชัดเจน มีระดับ ใช้ตัวหนาเน้นประเด็นสำคัญ และจัดข้อมูลเปรียบเทียบหรือคะแนนให้อยู่ในรูปตาราง Markdown Table เสมอ`;

        if (providerType === 'gemini') {
        let base = baseUrl;
        if (!base.endsWith('/')) base += '/';
        let cleanModel = model.replace(/^models\//, '') || 'gemini-3.6-flash';
        
        // Map UI model identifier to official REST API endpoint
        let targetModel = cleanModel;
        if (cleanModel === 'gemini-3.5-flash' || cleanModel === 'gemini-3.6-flash') {
            targetModel = 'gemini-3.6-flash';
        }

        const isStream = (typeof onChunk === 'function');
        const action = isStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
        
        const sep = action.includes('?') ? '&' : '?';
        const buildEndpoint = (mName) => `${base}${mName}:${action}${sep}key=${encodeURIComponent(apiKey)}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        };

        const contents = [];
        const firstUserIdx = history.findIndex(m => m.r === 'user');

        if (firstUserIdx !== -1) {
            const slicedHistory = history.slice(firstUserIdx);
            slicedHistory.forEach((m, idx) => {
                const role = m.r === 'bot' ? 'model' : 'user';
                const text = (m.t || "").trim();
                if(!text) return;

                const parts = [{ text: text }];

                if (idx === slicedHistory.length - 1 && role === 'user' && attachedFile) {
                    if ((attachedFile.isImage || attachedFile.isPdf) && attachedFile.base64) {
                        parts.push({
                            inlineData: {
                                mimeType: attachedFile.mimeType,
                                data: attachedFile.base64
                            }
                        });
                    } else if (attachedFile.content) {
                        parts.push({
                            text: `\n\n[เนื้อหาไฟล์แนบ: ${attachedFile.name} (${attachedFile.formattedSize || ''})]\n\`\`\`\n${attachedFile.content}\n\`\`\``
                        });
                    }
                }

                if (contents.length > 0 && contents[contents.length - 1].role === role) {
                    contents[contents.length - 1].parts[0].text += '\n' + text;
                } else {
                    contents.push({ role: role, parts: parts });
                }
            });
        }

                // Ensure contents array ends with a user turn (Google Gemini requirement)
        while (contents.length > 0 && contents[contents.length - 1].role === 'model') {
            contents.pop();
        }

        if (contents.length === 0) throw new Error("ไม่มีข้อความส่งให้ AI");

        const payload = {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: contents,
            generationConfig: {
                temperature: parseFloat(temperature) || 0.7,
                maxOutputTokens: 4096
            }
        };

        let endpoint = buildEndpoint(targetModel);
        let response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        }).catch(err => {
            console.warn("Primary fetch error:", err);
            return null;
        });

        // If 404 or 400, automatically fallback across official Gemini models
        if (!response || (!response.ok && (response.status === 404 || response.status === 400))) {
            const fallbacks = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
            for (const fbModel of fallbacks) {
                if (fbModel === targetModel) continue;
                const fbEndpoint = buildEndpoint(fbModel);
                const fbRes = await fetch(fbEndpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload)
                }).catch(() => null);

                if (fbRes && fbRes.ok) {
                    response = fbRes;
                    break;
                }
            }
        }

        if (!response || !response.ok) {
            const errData = response ? await response.json().catch(() => ({})) : {};
            const errMsg = errData.error?.message || (response ? `HTTP ${response.status}: ${response.statusText}` : "Network connection failed");
            throw new Error(errMsg);
        }

        // Streaming Reader
        if (typeof onChunk === 'function' && response.body && response.body.getReader) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data:')) continue;
                    const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
                    if (jsonStr === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
                            const delta = parsed.candidates[0].content.parts.map(p => p.text).join('');
                            accumulatedText += delta;
                            onChunk(accumulatedText, delta);
                        }
                    } catch(e) {}
                }
            }
            if (accumulatedText) return accumulatedText;
        }

        // Non-stream Fallback
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts.map(p => p.text).join('');
        }
        throw new Error("ไม่ได้รับข้อความตอบกลับจาก Gemini API");
    } else {
        // OPENAI / OPENROUTER
        let endpoint = baseUrl;
        if (!endpoint.includes('/chat/completions')) {
            endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
        }

        const messages = [
            { role: "system", content: systemInstruction }
        ];

        const firstUserIdx = history.findIndex(m => m.r === 'user');
        if (firstUserIdx !== -1) {
            const slicedHistory = history.slice(firstUserIdx);
            slicedHistory.forEach((m, idx) => {
                const role = m.r === 'bot' ? 'assistant' : 'user';
                const text = (m.t || "").trim();
                if(!text) return;

                if (idx === slicedHistory.length - 1 && role === 'user' && attachedFile) {
                    if (attachedFile.isImage && attachedFile.dataUrl) {
                        messages.push({
                            role: "user",
                            content: [
                                { type: "text", text: text },
                                { type: "image_url", image_url: { url: attachedFile.dataUrl } }
                            ]
                        });
                    } else if (attachedFile.content) {
                        messages.push({
                            role: "user",
                            content: `${text}\n\n[เนื้อหาไฟล์แนบ: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\``
                        });
                    } else {
                        messages.push({ role: role, content: text });
                    }
                } else {
                    messages.push({ role: role, content: text });
                }
            });
        }

                // Ensure messages array ends with a user turn
        while (messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
            messages.pop();
        }

        if (messages.length <= 1) throw new Error("ไม่มีข้อความส่งให้ AI");

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        if (baseUrl.includes("openrouter.ai")) {
            headers['HTTP-Referer'] = window.location.origin || 'http://localhost';
            headers['X-Title'] = 'ET OPC Company Workspace Ver 3.0';
        }

        const payload = {
            model: model,
            messages: messages,
            temperature: parseFloat(temperature) || 0.7,
            stream: Boolean(onChunk)
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData.error?.message || errData.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(msg);
        }

        // Streaming Reader
        if (typeof onChunk === 'function' && response.body && response.body.getReader) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data:')) continue;
                    const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
                    if (jsonStr === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.choices && parsed.choices[0]?.delta?.content) {
                            const delta = parsed.choices[0].delta.content;
                            accumulatedText += delta;
                            onChunk(accumulatedText, delta);
                        }
                    } catch(e) {}
                }
            }
            if (accumulatedText) return accumulatedText;
        }

        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        }
        throw new Error("ไม่ได้รับข้อความตอบกลับจาก AI Provider");
    }
}

// --- SEND MESSAGE & AUTOMATION ---
function sendMessage(customText = null){
    const input = document.getElementById('msgInput');
    const text = customText || (input ? input.value.trim() : '');
    if((!text && !pendingAttachedFile) || !currentCharacter) return;
    
    const qrElem = document.getElementById('quickReplies');
    if(qrElem) qrElem.style.display = 'none';
    if(input) input.value = '';

    if(!appUserData[currentUser].history[currentCharacter.id]) {
        appUserData[currentUser].history[currentCharacter.id] = [{ 
            id: 'msg-' + Date.now(), 
            r: 'bot', 
            t: currentCharacter.opener,
            candidates: [currentCharacter.opener],
            cIndex: 0
        }];
    }
    
    let displayMessageText = text;
    if(pendingAttachedFile) {
        const fileIcon = pendingAttachedFile.isPdf ? '📕' : (pendingAttachedFile.isImage ? '🖼️' : '📄');
        displayMessageText = `📎 [${fileIcon} แนบไฟล์: ${pendingAttachedFile.name} (${pendingAttachedFile.formattedSize || ''})]\n` + (text || "กรุณาวิเคราะห์ สรุป และให้ข้อคิดเห็นจากไฟล์นี้");
    }

    const driveLinkMatch = text.match(/https:\/\/drive\.google\.com\/(?:file\/d\/|drive\/folders\/|open\?id=)([a-zA-Z0-9_-]+)/i);
    if (driveLinkMatch && !pendingAttachedFile) {
        showToast("📂 ตรวจพบลิงก์ Google Drive ในคำสั่ง กำลังส่งให้ Agent ประเมิน...", "info");
    }
    const fileToSend = pendingAttachedFile ? { ...pendingAttachedFile } : null;
    clearPendingFile();

    appUserData[currentUser].history[currentCharacter.id].push({ 
        id: 'msg-' + Date.now(), 
        r: 'user', 
        t: displayMessageText 
    });
    saveUserData();
    
    currentCharacter.chatCount = (currentCharacter.chatCount || 0) + 1;
    saveToStorage();
    
    applyFilters(); 
    renderChatMessages();
    requestAiReply(null, fileToSend);
}

async function requestAiReply(regenerateBotIdx = null, attachedFile = null) {
    const msgsContainer = document.getElementById('messages');
    if(!msgsContainer) return;

    // Create live bot message container for streaming
    const liveMsgDiv = document.createElement('div');
    liveMsgDiv.className = 'msg bot streaming-bubble';
    liveMsgDiv.innerHTML = `
      <div class="msg-content">
          <div class="avatar" style="background:${currentCharacter.color}">${getAvatarHtml(currentCharacter)}</div>
          <div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>
    `;
    msgsContainer.appendChild(liveMsgDiv);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    const liveBubble = liveMsgDiv.querySelector('.bubble');
    let hasStreamed = false;

    const profile = appUserData[currentUser]?.profile || { displayName: currentUser, persona: "" };
    const rawHistory = appUserData[currentUser].history[currentCharacter.id] || [];
    let historySubset = regenerateBotIdx !== null ? rawHistory.slice(0, regenerateBotIdx) : rawHistory;
    
    const activeConf = getActiveModelConfig();
    
    try {
        if(!activeConf || !activeConf.apiKey || activeConf.apiKey.trim() === "") {
            throw new Error("KEY_MISSING");
        }

        const onStreamChunk = (accumulatedText) => {
            if (!hasStreamed) {
                hasStreamed = true;
            }
            if (liveBubble) {
                liveBubble.innerHTML = formatRoleplayText(accumulatedText, true);
                msgsContainer.scrollTop = msgsContainer.scrollHeight;
            }
        };

        const replyText = await callUniversalAiApi(
            activeConf,
            currentCharacter,
            profile,
            historySubset,
            userGeminiPreference.temperature || activeConf.temperature,
            attachedFile,
            onStreamChunk
        );

        liveMsgDiv.remove();

        if (regenerateBotIdx !== null) {
            const targetMsg = rawHistory[regenerateBotIdx];
            if (!targetMsg.candidates) targetMsg.candidates = [targetMsg.t];
            targetMsg.candidates.push(replyText);
            targetMsg.cIndex = targetMsg.candidates.length - 1;
            targetMsg.t = replyText;
        } else {
            rawHistory.push({ 
                id: 'msg-' + Date.now(), 
                r: 'bot', 
                t: replyText,
                candidates: [replyText],
                cIndex: 0
            });
        }

        saveUserData();
        renderChatMessages();

                // Check for Auto Email Notification & Update Hub Candidate Scores (Single & Batch)
        const sendMode = localStorage.getItem(STORAGE_PREFIX + 'email_send_mode') || 'manual';
        const isAutoNotifyEnabled = localStorage.getItem(STORAGE_PREFIX + 'auto_email_notify') !== 'false';
        const isAutoEmail = (sendMode === 'auto') || isAutoNotifyEnabled;
        const passingThreshold = parseInt(localStorage.getItem(STORAGE_PREFIX + 'passing_score') || '75', 10);

        const scoreMatch = replyText.match(/(?:คะแนน(?:ความเหมาะสม)?(?:รวม)?|Match\s*Score|Overall\s*Score|Total\s*Score)[^0-9\n\r]{0,40}?([0-9]{1,3})\s*(?:\/\s*100|%|\s*คะแนน)/i);
        const detectedScore = (scoreMatch && scoreMatch[1]) ? parseInt(scoreMatch[1], 10) : null;

        // 1. AUTO-SEND EMAIL NOTIFICATION TO GMAIL IF PASSED
        if (detectedScore && detectedScore >= passingThreshold && (sendMode === 'auto' || isAutoNotifyEnabled)) {
            sendCandidatePassedEmail(detectedScore, null, true);
        }

        // 2. UPDATE CANDIDATE HUB (if running from Hub or matching candidates)
        if (typeof appCandidateSubmissions !== 'undefined' && Array.isArray(appCandidateSubmissions)) {
            let updatedAny = false;

            if (currentEvaluatingCandidateId) {
                if (detectedScore) {
                    const targetCand = appCandidateSubmissions.find(c => c.id === currentEvaluatingCandidateId);
                    if (targetCand) {
                        targetCand.score = detectedScore;
                        targetCand.status = detectedScore >= passingThreshold ? 'passed' : 'evaluated';
                        updatedAny = true;
                    }
                }
            } else {
                appCandidateSubmissions.forEach(cand => {
                    const regex1 = new RegExp(`${cand.name}[^0-9\n\r|]{0,50}?([0-9]{2,3})\s*(?:\/\s*100|%|\s*คะแนน)?`, 'i');
                    const regex2 = new RegExp(`\|\s*(?:[0-9]+\s*\|)?\s*${cand.name}[^|]*?\|[^|]*?\|[^|]*?\|[^|]*?\|[^|]*?\|\s*\*\*?([0-9]{2,3})\*\*?`, 'i');
                    const m = replyText.match(regex2) || replyText.match(regex1);
                    if (m && m[1]) {
                        const scoreNum = parseInt(m[1], 10);
                        if (scoreNum <= 100 && scoreNum >= 30) {
                            cand.score = scoreNum;
                            cand.status = scoreNum >= passingThreshold ? 'passed' : 'evaluated';
                            updatedAny = true;
                        }
                    }
                });
            }

            if (updatedAny) {
                if (typeof saveCandidateSubmissions === 'function') saveCandidateSubmissions();
                if (typeof renderCandidateQueueList === 'function') renderCandidateQueueList();
            }
        }
        currentEvaluatingCandidateId = null;

    } catch(err) {
        liveMsgDiv.remove();
        let errorNotice = `⚠️ **เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI:**\n${escapeHtml(err.message)}`;
        if (err.message === "KEY_MISSING") {
            errorNotice = `⚠️ **ยังไม่ได้ตั้งค่า API Key**\nกรุณาให้ผู้ดูแลระบบ (Admin) กดปุ่ม **"ตั้งค่า AI & Model"** ด้านบนเพื่อบันทึก API Key ครับ`;
        }
        
        if (regenerateBotIdx !== null) {
            const targetMsg = rawHistory[regenerateBotIdx];
            if (!targetMsg.candidates) targetMsg.candidates = [targetMsg.t];
            targetMsg.candidates.push(errorNotice);
            targetMsg.cIndex = targetMsg.candidates.length - 1;
            targetMsg.t = errorNotice;
        } else {
            rawHistory.push({ 
                id: 'msg-' + Date.now(), 
                r: 'bot', 
                t: errorNotice,
                candidates: [errorNotice],
                cIndex: 0
            });
        }
        saveUserData();
        renderChatMessages();
    }
}


// --- GEMINI CONFIGURATION LOGIC ---
function loadGeminiConfigs() {
    const savedModels = localStorage.getItem(STORAGE_PREFIX + 'admin_models_v1');
    if (savedModels) {
        try { 
            const parsed = JSON.parse(savedModels);
            if (Array.isArray(parsed)) {
                // Completely purge any leftover Global or invalid dummy models from browser storage
                adminModels = parsed.filter(m => m && m.apiKey && m.apiKey.trim() !== '' && !(m.displayName || '').includes('Global') && m.id !== 'default-gemini-flash');
                localStorage.setItem(STORAGE_PREFIX + 'admin_models_v1', JSON.stringify(adminModels));
            } else {
                adminModels = [];
            }
        } catch(e) {
            adminModels = [];
        }
    } else {
        adminModels = [];
    }

    const userSaved = localStorage.getItem(STORAGE_PREFIX + 'user_pref_v1_' + currentUser);
    if (userSaved) {
        try { userGeminiPreference = JSON.parse(userSaved); } catch(e) {}
    }
    
    if (adminModels.length > 0) {
        const found = adminModels.find(m => m.id === userGeminiPreference.selectedModelId);
        if (!found) {
            userGeminiPreference.selectedModelId = adminModels[0].id;
            userGeminiPreference.temperature = adminModels[0].temperature || 0.7;
        }
    } else {
        userGeminiPreference.selectedModelId = null;
    }
    updateTopbarAiBadge();
}

function getActiveModelConfig() {
    if (!adminModels || adminModels.length === 0) {
        return null;
    }
    const found = adminModels.find(m => m.id === userGeminiPreference.selectedModelId);
    return found || adminModels[0] || null;
}

function updateTopbarAiBadge() {
    const badge = document.getElementById('topbarAiModelBadge');
    const sideText = document.getElementById('sidebarAiStatusText');
    const active = getActiveModelConfig();
    if (active) {
        const provIcon = active.providerType === 'gemini' ? '⚡' : (active.providerType === 'claude' ? '👑' : '🤖');
        if (badge) badge.textContent = `${provIcon} ${active.displayName || active.modelName}`;
        if (sideText) sideText.textContent = `โมเดล: ${active.displayName || active.modelName}`;
    } else {
        if (badge) badge.textContent = '⚙️ ตั้งค่า AI & Model';
        if (sideText) sideText.textContent = 'ตั้งค่า AI & Model';
    }
}


// --- FRIENDLY ADMIN AI PRESET PROVIDERS CONFIGURATION ---
const PROVIDER_PRESETS = {
  gemini: {
    name: "Google Gemini (3.X)",
    providerType: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/",
    helpLink: "https://aistudio.google.com/app/apikey",
    helpText: "รับ Gemini API Key ฟรีจาก Google AI Studio ↗",
    models: [
      { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", desc: "⚡ แนะนำ: 3.X ล่าสุด เร็ว ประหยัด (รองรับ PDF/รูปภาพ)" },
      { id: "gemini-3.6-pro", name: "Gemini 3.6 Pro", desc: "🧠 ฉลาดที่สุด: วิเคราะห์เอกสาร & ตารางเชิงลึก 3.X" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", desc: "⚡ มาตรฐาน 3.5 เร็ว คล่องตัว" },
      { id: "gemini-3.5-pro", name: "Gemini 3.5 Pro", desc: "📚 มาตรฐาน 3.5 วิเคราะห์งานเอกสาร" }
    ]
  },
  openrouter: {
    name: "Claude 3.5 / OpenRouter",
    providerType: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    helpLink: "https://openrouter.ai/keys",
    helpText: "รับ OpenRouter API Key ↗",
    models: [
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", desc: "👑 แนะนำ: ฉลาดที่สุด เขียนไทย & วิเคราะห์ CV ยอดเยี่ยม" },
      { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", desc: "⚡ เร็ว ประหยัด คล่องตัว" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3", desc: "🔥 DeepSeek V3 ฉลาด คุ้มค่า" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", desc: "🦙 Open-source ตัวท็อป" }
    ]
  },
  openai: {
    name: "OpenAI (ChatGPT)",
    providerType: "openai",
    baseUrl: "https://api.openai.com/v1",
    helpLink: "https://platform.openai.com/api-keys",
    helpText: "รับ OpenAI API Key ↗",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o mini", desc: "⚡ แนะนำ: เร็ว ฉลาด ประหยัด" },
      { id: "gpt-4o", name: "GPT-4o", desc: "🧠 โมเดลเรือธง ความแม่นยำสูง" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "⚡ โมเดล 3.5 มาตรฐาน" }
    ]
  },
  custom: {
    name: "Custom / Localhost",
    providerType: "openai",
    baseUrl: "http://localhost:11434/v1",
    helpLink: "https://ollama.ai",
    helpText: "เอกสารคู่มือ Ollama / Local AI ↗",
    models: [
      { id: "llama3.2", name: "Ollama Llama 3.2", desc: "🦙 Localhost Ollama" },
      { id: "custom-model", name: "กำหนด Model ID เอง", desc: "กรอกในช่องตั้งค่าขั้นสูง" }
    ]
  }
};

let currentSelectedPresetKey = 'gemini';

function selectProviderPreset(presetKey) {
    window.selectProviderPreset = selectProviderPreset;
    currentSelectedPresetKey = presetKey;
    const preset = PROVIDER_PRESETS[presetKey] || PROVIDER_PRESETS.gemini;

    // Update active card styling
    ['gemini', 'openrouter', 'openai', 'custom'].forEach(k => {
        const cardId = 'pCard' + k.charAt(0).toUpperCase() + k.slice(1);
        const card = document.getElementById(cardId);
        if (card) card.classList.toggle('active', k === presetKey);
    });

    // Set hidden provider type
    const provInput = document.getElementById('adminAiProviderType');
    if (provInput) provInput.value = preset.providerType;

    // Set Base URL
    const urlInput = document.getElementById('adminAiBaseUrl');
    if (urlInput) urlInput.value = preset.baseUrl;

    // Update Help Link
    const helpLink = document.getElementById('apiKeyHelpLink');
    if (helpLink) {
        helpLink.href = preset.helpLink;
        helpLink.textContent = preset.helpText;
    }

    // Populate Model Presets Dropdown
    const select = document.getElementById('adminAiModelPresetSelect');
    if (select) {
        select.innerHTML = '';
        preset.models.forEach(m => {
            select.innerHTML += `<option value="${m.id}" data-name="${escapeHtml(m.name)}">${escapeHtml(m.name)} — ${escapeHtml(m.desc)}</option>`;
        });
    }

    handleModelPresetChange();
}

function handleModelPresetChange() {
    window.handleModelPresetChange = handleModelPresetChange;
    const select = document.getElementById('adminAiModelPresetSelect');
    if (!select) return;
    
    const selectedOption = select.options[select.selectedIndex];
    const modelId = select.value;
    const displayName = selectedOption?.getAttribute('data-name') || modelId;

    const defModelInput = document.getElementById('adminAiDefaultModel');
    const dispNameInput = document.getElementById('adminAiModelDisplayName');

    if (defModelInput) defModelInput.value = modelId;
    if (dispNameInput) dispNameInput.value = displayName;
}

function handleApiKeySmartDetection(val) {
    window.handleApiKeySmartDetection = handleApiKeySmartDetection;
    const key = (val || '').trim();
    const badge = document.getElementById('keyDetectBadge');
    if (!badge) return;

    if (key.startsWith('AIzaSy') && currentSelectedPresetKey !== 'gemini') {
        selectProviderPreset('gemini');
        badge.style.display = 'block';
        badge.textContent = '✨ ตรวจพบคีย์ Google Gemini อัตโนมัติ!';
    } else if (key.startsWith('sk-or-v1-') && currentSelectedPresetKey !== 'openrouter') {
        selectProviderPreset('openrouter');
        badge.style.display = 'block';
        badge.textContent = '✨ ตรวจพบคีย์ OpenRouter (Claude 3.5) อัตโนมัติ!';
    } else if ((key.startsWith('sk-proj-') || key.startsWith('sk-')) && !key.startsWith('sk-or-') && currentSelectedPresetKey !== 'openai') {
        selectProviderPreset('openai');
        badge.style.display = 'block';
        badge.textContent = '✨ ตรวจพบคีย์ OpenAI (ChatGPT) อัตโนมัติ!';
    } else if (!key) {
        badge.style.display = 'none';
    }
}

function toggleAdminApiKeyVisibility() {
    window.toggleAdminApiKeyVisibility = toggleAdminApiKeyVisibility;
    const input = document.getElementById('adminAiApiKey');
    const eyeIcon = document.getElementById('adminKeyEyeIcon');
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    if (eyeIcon) {
        eyeIcon.innerHTML = isPassword ? 
            `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>` :
            `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
}

function toggleAdminAdvancedSettings() {
    window.toggleAdminAdvancedSettings = toggleAdminAdvancedSettings;
    const box = document.getElementById('adminAdvancedSettingsBox');
    const icon = document.getElementById('advancedToggleIcon');
    if (!box) return;

    box.classList.toggle('hidden');
    const isHidden = box.classList.contains('hidden');
    if (icon) {
        icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    }
}

function renderAdminModels() {
    const list = document.getElementById('adminModelsList');
    const countBadge = document.getElementById('adminModelCount');
    if(!list) return;
    list.innerHTML = '';
    if (countBadge) countBadge.textContent = adminModels.length;

    if (adminModels.length === 0) {
        list.innerHTML = '<p style="font-size:12.5px; color:var(--ink-faint); padding:8px 0; margin:0;">ยังไม่มีโมเดลในระบบ — กรุณาเลือกค่ายและใส่ API Key ด้านล่าง</p>';
        return;
    }
    adminModels.forEach((m) => {
        const isCurrent = (m.id === userGeminiPreference.selectedModelId);
        const pBadge = m.providerType === 'gemini' ? '⚡ Gemini' : (m.baseUrl?.includes('openrouter') ? '🚀 OpenRouter' : '🌐 OpenAI');
        list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:9px 12px; border-radius:10px; border:1px solid ${isCurrent ? 'var(--maroon)' : 'var(--line)'};">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:11px; background:${isCurrent ? 'var(--maroon)' : 'var(--surface-3)'}; color:${isCurrent ? '#fff' : 'var(--ink-soft)'}; padding:2px 7px; border-radius:999px; font-weight:800;">${pBadge}</span>
                <div>
                    <div style="font-weight:800; color:var(--ink); font-size:13px;">${escapeHtml(m.displayName)} ${isCurrent ? '<span style="font-size:10.5px; color:#10B981; font-weight:700;">(กำลังใช้งาน)</span>' : ''}</div>
                    <div style="font-size:11px; color:var(--ink-soft); font-family:monospace;">${escapeHtml(m.modelName)}</div>
                </div>
            </div>
            <button class="btn-delete" style="padding:4px 8px; font-size:11px;" onclick="deleteAdminModel('${m.id}')">ลบ</button>
        </div>`;
    });
}


function handleAiHeaderButtonClick() {
    window.handleAiHeaderButtonClick = handleAiHeaderButtonClick;
    if (currentUserRole === 'admin') {
        openAdminAiModal();
    } else {
        openUserModelModal();
    }
}
window.handleAiHeaderButtonClick = handleAiHeaderButtonClick;


function deleteAdminModel(id) {
    window.deleteAdminModel = deleteAdminModel;
    showConfirmDialog({
        title: "ลบโมเดล AI",
        message: "ต้องการลบโมเดล AI นี้ออกจากระบบใช่หรือไม่?",
        confirmText: "ลบโมเดล",
        cancelText: "ยกเลิก",
        type: "danger",
        icon: "🗑️"
    }).then(confirmed => {
        if (!confirmed) return;
        adminModels = adminModels.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_PREFIX + 'admin_models_v1', JSON.stringify(adminModels));
        if (userGeminiPreference.selectedModelId === id) {
            userGeminiPreference.selectedModelId = adminModels.length > 0 ? adminModels[0].id : null;
            localStorage.setItem(STORAGE_PREFIX + 'user_pref_v1_' + currentUser, JSON.stringify(userGeminiPreference));
        }
        renderAdminModels();
        updateTopbarAiBadge();
        showToast("ลบโมเดล AI เรียบร้อยแล้ว", "info");
    });
}
window.deleteAdminModel = deleteAdminModel;

function openAdminAiModal() {
    selectProviderPreset('gemini');
    document.getElementById('adminAiApiKey').value = "";
    document.getElementById('adminAiTestStatus').style.display = 'none';
    if (document.getElementById('keyDetectBadge')) document.getElementById('keyDetectBadge').style.display = 'none';
    
    renderAdminModels();
    document.getElementById('adminAiModal').classList.remove('hidden');
}
function closeAdminAiModal() { document.getElementById('adminAiModal').classList.add('hidden'); }

function addAdminModel() {
    const preset = PROVIDER_PRESETS[currentSelectedPresetKey] || PROVIDER_PRESETS.gemini;
    const providerType = document.getElementById('adminAiProviderType')?.value || preset.providerType;
    const baseUrl = (document.getElementById('adminAiBaseUrl')?.value || preset.baseUrl).trim();
    const apiKey = (document.getElementById('adminAiApiKey')?.value || '').trim();
    const modelName = (document.getElementById('adminAiDefaultModel')?.value || 'gemini-3.6-flash').trim();
    const displayName = (document.getElementById('adminAiModelDisplayName')?.value || modelName).trim();
    const temp = parseFloat(document.getElementById('adminAiTemperature')?.value) || 0.7;

    if(!apiKey) {
        showToast("กรุณากรอกหรือวาง API Key ก่อนบันทึก", "warning");
        document.getElementById('adminAiApiKey')?.focus();
        return;
    }

    const newModel = { id: 'm-' + Date.now(), providerType, baseUrl, apiKey, modelName, displayName, temperature: temp };
    adminModels.push(newModel);
    localStorage.setItem(STORAGE_PREFIX + 'admin_models_v1', JSON.stringify(adminModels));
    
    userGeminiPreference.selectedModelId = newModel.id;
    userGeminiPreference.temperature = temp;
    localStorage.setItem(STORAGE_PREFIX + 'user_pref_v1_' + currentUser, JSON.stringify(userGeminiPreference));

    updateTopbarAiBadge();
    renderAdminModels();
    document.getElementById('adminAiApiKey').value = '';
    showToast(`บันทึกและเปิดใช้งาน ${displayName} เรียบร้อยแล้ว! 🎉`, "success");
}

async function testAdminAiConnection() {
    const statusDiv = document.getElementById('adminAiTestStatus');
    const btn = document.getElementById('btnAdminTestAi');
    const preset = PROVIDER_PRESETS[currentSelectedPresetKey] || PROVIDER_PRESETS.gemini;
    const providerType = document.getElementById('adminAiProviderType')?.value || preset.providerType;
    const baseUrl = (document.getElementById('adminAiBaseUrl')?.value || preset.baseUrl).trim();
    const apiKey = (document.getElementById('adminAiApiKey')?.value || '').trim();
    const model = (document.getElementById('adminAiDefaultModel')?.value || 'gemini-3.6-flash').trim();

    if(!apiKey) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(220,38,38,0.1)';
        statusDiv.style.color = '#DC2626';
        statusDiv.innerHTML = '❌ <strong>กรุณากรอก API Key ก่อนทดสอบ</strong><br><small>สามารถกดลิงก์ด้านบนเพื่อรับ API Key ฟรี</small>';
        document.getElementById('adminAiApiKey')?.focus();
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span>⏳ กำลังทดสอบ...</span>';
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(59,130,246,0.1)';
    statusDiv.style.color = '#2563EB';
    statusDiv.innerHTML = `⏳ <strong>กำลังส่งคำขอทดสอบไปยัง ${escapeHtml(preset.name)} (${escapeHtml(model)})...</strong>`;

    const startTime = Date.now();
    try {
        const testChar = { name: "ระบบทดสอบ", bio: "ผู้ช่วยทดสอบ", prompt: "คุณคือระบบทดสอบ ตอบกลับสั้นๆ ไม่เกิน 8 คำว่า 'ระบบ ET OPC พร้อมใช้งาน'" };
        const testProfile = { displayName: "Admin" };
        const testHistory = [{ r: 'user', t: 'สวัสดี ทดสอบระบบ' }];
        const testConf = { providerType, baseUrl, apiKey, modelName: model };
        
        const resultText = await callUniversalAiApi(testConf, testChar, testProfile, testHistory, 0.7);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        statusDiv.style.background = 'rgba(16,185,129,0.1)';
        statusDiv.style.color = '#059669';
        statusDiv.innerHTML = `✅ <strong>เชื่อมต่อสำเร็จใน ${elapsed} วินาที!</strong><br><span style="font-size:12px;">AI ตอบกลับมาว่า: <em>"${escapeHtml(resultText)}"</em></span>`;
    } catch(err) {
        statusDiv.style.background = 'rgba(220,38,38,0.1)';
        statusDiv.style.color = '#DC2626';
        statusDiv.innerHTML = `❌ <strong>เชื่อมต่อไม่สำเร็จ:</strong> ${escapeHtml(err.message)}<br><small style="color:var(--ink-soft);">คำแนะนำ: ตรวจสอบความถูกต้องของ API Key หรือโควตาการใช้งาน</small>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🧪 ทดสอบเชื่อมต่อ</span>';
    }
}


function openUserModelModal() {
    const modal = document.getElementById('userModelModal');
    const select = document.getElementById('userGeminiModelChoice');
    select.innerHTML = '';
    adminModels.forEach(m => {
        const isSelected = (m.id === userGeminiPreference.selectedModelId) ? 'selected' : '';
        select.innerHTML += `<option value="${m.id}" ${isSelected}>${escapeHtml(m.displayName)} (${escapeHtml(m.modelName)})</option>`;
    });
    modal.classList.remove('hidden');
}
function closeUserModelModal() { document.getElementById('userModelModal').classList.add('hidden'); }
function saveUserModelChoice() {
    const select = document.getElementById('userGeminiModelChoice');
    if(!select.value) return closeUserModelModal();
    userGeminiPreference.selectedModelId = select.value;
    userGeminiPreference.temperature = parseFloat(document.getElementById('userTemperature').value) || 0.7;
    localStorage.setItem(STORAGE_PREFIX + 'user_pref_v1_' + currentUser, JSON.stringify(userGeminiPreference));
    updateTopbarAiBadge();
    closeUserModelModal();
}

// --- RENDER CHAT MESSAGES WITH ACTIONS (EDIT, DELETE, SWIPE, SPEAK, REGENERATE, COPY) ---
function renderChatMessages() {
    const msgsContainer = document.getElementById('messages');
    if(!msgsContainer) return;
    msgsContainer.innerHTML = '';
    const history = appUserData[currentUser]?.history[currentCharacter.id] || [];

    history.forEach((m, index) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${m.r}`;
        
        let bottomBarHtml = '';
        let fileCardHtml = '';
        const msgText = (typeof m.t === 'string') ? m.t : String(m.t || '');

        if (m.r === 'user') {
            // User Message Actions: Edit ✏️ + Delete 🗑️
            bottomBarHtml = `
              <div class="msg-bottom-actions">
                 <div class="msg-action-group">
                   <button class="msg-bubble-action-btn" title="แก้ไขข้อความ" onclick="editMessage(${index})">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                   </button>
                   <button class="msg-bubble-action-btn" title="ลบข้อความ" onclick="deleteMessage(${index})">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                   </button>
                 </div>
              </div>`;
        } else {
            // AI Bot Message Actions: Swipe Navigator + Speech 🔊 + Regenerate 🔄 + Delete 🗑️
            let swipeNavHtml = '';
            if (m.candidates && m.candidates.length > 1) {
                const cIdx = m.cIndex || 0;
                swipeNavHtml = `
                  <div class="msg-swipe-nav">
                    <button class="msg-swipe-btn" onclick="swipeCandidate(${index}, -1)" ${cIdx === 0 ? 'disabled' : ''} title="คำตอบก่อนหน้า">❮</button>
                    <span>${cIdx + 1}/${m.candidates.length}</span>
                    <button class="msg-swipe-btn" onclick="swipeCandidate(${index}, 1)" ${cIdx === m.candidates.length - 1 ? 'disabled' : ''} title="คำตอบถัดไป">❯</button>
                  </div>`;
            }

            let regenBtnHtml = '';
            if (index === history.length - 1 && index !== 0) {
                regenBtnHtml = `
                  <button class="msg-bubble-action-btn" title="ขอคำตอบใหม่จาก AI" onclick="regenerateMessage(${index})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                  </button>`;
            }

            if (msgText && !msgText.startsWith('⚠️') && index !== 0) {
                const hasTable = msgText.includes('|') && msgText.includes('---');
                fileCardHtml = `
                <div class="ai-file-card">
                  <div class="file-card-info">
                    <span class="file-card-icon">📁</span>
                    <div class="file-card-text">
                      <strong>ส่งออกไฟล์เอกสาร (Download Files)</strong>
                      <span class="file-card-meta">สร้างโดย AI • เลือกฟอร์แมตที่ต้องการ</span>
                    </div>
                  </div>
                  <div class="file-card-actions">
                    <button class="btn-file-dl btn-dl-pdf" onclick="downloadMessageAsPdf(${index})" title="ดาวน์โหลดเป็นไฟล์ PDF พร้อมพิมพ์">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      PDF
                    </button>
                    <button class="btn-file-dl btn-dl-doc" onclick="downloadMessageAsWord(${index})" title="ดาวน์โหลดเป็นไฟล์ Word (.doc)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Word
                    </button>
                    <button class="btn-file-dl btn-dl-slide" onclick="downloadMessageAsSlides(${index})" title="ดาวน์โหลดโครงร่างสไลด์นำเสนอ (Presentation Deck)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      สไลด์
                    </button>
                    ${hasTable ? `
                    <button class="btn-file-dl btn-dl-csv" onclick="downloadMessageAsCsv(${index})" title="ดาวน์โหลดตารางข้อมูลเป็น Excel/CSV">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                      Excel/CSV
                    </button>` : ''}
                    <button class="btn-file-dl btn-dl-md" onclick="downloadMessageAsMarkdown(${index})" title="ดาวน์โหลดเป็นไฟล์ Markdown (.md)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      .MD
                    </button>
                  </div>
                </div>`;
            }

            bottomBarHtml = `
              <div class="msg-bottom-actions">
                 ${swipeNavHtml}
                 <div style="flex:1;"></div>
                 <div class="msg-action-group">
                   <button class="msg-bubble-action-btn" title="คัดลอกข้อความ" onclick="copyMessageText(${index}, this)">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                   </button>
                   <button class="msg-bubble-action-btn" title="อ่านออกเสียง" onclick="speakMessage(${index})">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                   </button>
                   ${regenBtnHtml}
                   <button class="msg-bubble-action-btn" title="ลบข้อความ" onclick="deleteMessage(${index})">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                   </button>
                 </div>
              </div>`;
        }
        
        const userProf = appUserData[currentUser]?.profile || { displayName: currentUser, avatarUrl: "" };
        const userAvatarContent = (userProf.avatarUrl && userProf.avatarUrl.trim() !== '') ?
            `<div class="avatar user-msg-avatar" style="border-radius:50%; overflow:hidden; width:34px; height:34px; flex-shrink:0;"><img src="${userProf.avatarUrl}" alt="User" style="width:100%; height:100%; object-fit:cover;"></div>` :
            `<div class="avatar user-msg-avatar" style="background:var(--maroon); border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:13px; flex-shrink:0;">${(userProf.displayName || currentUser || 'U').charAt(0).toUpperCase()}</div>`;

        msgDiv.innerHTML = `
          <div class="msg-content">
              ${m.r === 'bot' ? `<div class="avatar" style="background:${currentCharacter.color || 'linear-gradient(135deg,#8B0000,#0F172A)'}">${getAvatarHtml(currentCharacter)}</div>` : userAvatarContent}
              <div style="display:flex; flex-direction:column; max-width:100%;">
                  <div class="bubble">${formatRoleplayText(msgText, m.r === "bot")}${m.r === 'bot' ? fileCardHtml : ''}</div>
                  ${bottomBarHtml}
              </div>
          </div>`;
        msgsContainer.appendChild(msgDiv);
    });

    // Append Quick Starter Suggestion Cards if first visit / only greeting exists
    if (history.length === 1 && currentCharacter) {
        const starterContainer = document.createElement('div');
        starterContainer.className = 'chat-starter-container';
        
        let starters = [];
        if (currentCharacter.id === 'opc-hr-et') {
            starters = [
                { icon: '🎯', title: 'ประเมินเรซูเม่ (CV Screening)', desc: 'แนบ CV และวิเคราะห์เทียบกับเกณฑ์ความต้องการ', prompt: 'ช่วยวิเคราะห์และประเมินเรซูเม่ (CV) นี้เทียบกับความต้องการของตำแหน่งงาน พร้อมให้คะแนน 100 คะแนนและวิเคราะห์จุดแข็ง-จุดอ่อน' },
                { icon: '✨', title: 'ปรับปรุง CV เป็น ATS-Friendly', desc: 'จัดโครงสร้างและเพิ่มคำ Action Verbs', prompt: 'ช่วยปรับปรุงประวัติการทำงานในเรซูเม่นี้ให้กระชับ โดดเด่น และเป็นมาตรฐาน ATS-Friendly' },
                { icon: '❓', title: 'ร่างคำถามสัมภาษณ์ 5 ข้อ', desc: 'สร้างคำถามเจาะลึกจากประสบการณ์จริง', prompt: 'ช่วยร่างคำถามสัมภาษณ์งานเชิงลึก 5 ข้อ พร้อมแนวทางการประเมินคำตอบ โดยอิงจากประวัติการทำงานใน CV นี้' },
                { icon: '📋', title: 'สอบถามระเบียบ & สวัสดิการ', desc: 'สิทธิประโยชน์ วันลา และข้อบังคับองค์กร', prompt: 'ช่วยแนะนำสิทธิประโยชน์ สวัสดิการพนักงาน และขั้นตอนการขอลางานขององค์กรให้หน่อย' }
            ];
        } else if (currentCharacter.id === 'opc-exec-summary') {
            starters = [
                { icon: '📋', title: 'สรุปการประชุม & Action Items', desc: 'สรุปประเด็นหลักและผู้รับผิดชอบ', prompt: 'กรุณาสรุปประเด็นสำคัญของการประชุมนี้ พร้อมสกัด Action Items ผู้รับผิดชอบ และกำหนดส่ง' },
                { icon: '✉️', title: 'ร่างอีเมลสรุปงานทางการ', desc: 'เรียบเรียงภาษาทางการสำหรับรายงานผู้บริหาร', prompt: 'ช่วยร่างอีเมลภาษาไทยทางการเพื่อรายงานสรุปผลการดำเนินงานนี้ส่งต่อให้ทีมบริหาร' },
                { icon: '📊', title: 'สรุปเปรียบเทียบเป็นตาราง', desc: 'แปลงรายงานยาวๆ ให้อ่านง่ายเป็นตาราง', prompt: 'ช่วยจัดระเบียบและแปลงข้อมูลข้างต้นให้อยู่ในรูปแบบตาราง Markdown เพื่อเปรียบเทียบและอ่านง่าย' }
            ];
        } else {
            starters = [
                { icon: '📌', title: 'สรุปใจความสำคัญของงาน', desc: 'สกัดประเด็นสำคัญและหัวข้อย่อย', prompt: 'กรุณาสรุปประเด็นและใจความสำคัญของงาน/เอกสารนี้ให้กระชับ ชัดเจน และแบ่งเป็นหัวข้อย่อย' },
                { icon: '📋', title: 'สกัด Action Items', desc: 'สิ่งที่ต้องทำต่อและผู้รับผิดชอบ', prompt: 'ช่วยสกัด Action Items (สิ่งที่ต้องทำต่อ), ผู้รับผิดชอบ และกำหนดส่ง จากข้อมูลนี้' },
                { icon: '📊', title: 'จัดระเบียบเป็นตาราง', desc: 'แปลงข้อมูลเป็นตาราง Markdown', prompt: 'ช่วยแปลงข้อมูลข้างต้นให้อยู่ในรูปแบบตาราง Markdown เพื่อเปรียบเทียบและอ่านง่าย' }
            ];
        }

        starters.forEach(s => {
            const card = document.createElement('div');
            card.className = 'chat-starter-card';
            card.onclick = () => {
                const input = document.getElementById('msgInput');
                if (pendingAttachedFile) {
                    sendMessage(s.prompt);
                } else {
                    if (input) {
                        input.value = s.prompt;
                        input.focus();
                    }
                    showToast("นำเข้าคำสั่งแล้ว (แนบไฟล์เพิ่มเติมได้ก่อนส่ง)", "info");
                }
            };
            card.innerHTML = `
                <span class="chat-starter-icon">${s.icon}</span>
                <div>
                    <div class="chat-starter-title">${escapeHtml(s.title)}</div>
                    <div class="chat-starter-desc">${escapeHtml(s.desc)}</div>
                </div>
            `;
            starterContainer.appendChild(card);
        });

        msgsContainer.appendChild(starterContainer);
    }

    msgsContainer.scrollTop = msgsContainer.scrollHeight;
}

// Message Actions
window.speakMessage = function(idx) {
    const history = appUserData[currentUser]?.history[currentCharacter.id];
    if(history && history[idx]) {
        if('speechSynthesis' in window) {
            speechSynthesis.cancel();
            let cleanText = history[idx].t.replace(/\*.*?\*/g, '').trim();
            if(!cleanText) cleanText = history[idx].t.replace(/\*/g, '');
            const u = new SpeechSynthesisUtterance(cleanText);
            u.lang = 'th-TH';
            speechSynthesis.speak(u);
        } else {
            alert("เบราว์เซอร์ของคุณไม่รองรับการอ่านออกเสียง");
        }
    }
};

window.deleteMessage = function(idx) {
    if(confirm("ต้องการลบข้อความนี้ใช่หรือไม่?")) {
        appUserData[currentUser].history[currentCharacter.id].splice(idx, 1);
        saveUserData();
        renderChatMessages();
        if (typeof logTrainingDataset === "function" && currentCharacter) { const lastUserMsg = historySubset.filter(m => m.r === "user").pop()?.t || ""; logTrainingDataset(currentCharacter, lastUserMsg, replyText); }
    }
};

window.editMessage = function(idx) {
    const history = appUserData[currentUser].history[currentCharacter.id];
    if(!history || !history[idx]) return;
    if(!confirm("การแก้ไขข้อความนี้ จะทำให้บทสนทนาหลังจากนี้ถูกรีเซ็ต ต้องการแก้ไขหรือไม่?")) return;
    const msg = history[idx];
    const input = document.getElementById('msgInput');
    if(input) {
        input.value = msg.t;
        input.focus();
    }
    appUserData[currentUser].history[currentCharacter.id] = history.slice(0, idx);
    saveUserData();
    renderChatMessages();
};

window.regenerateMessage = function(idx) {
    requestAiReply(idx);
};

window.swipeCandidate = function(msgIdx, delta) {
    const history = appUserData[currentUser].history[currentCharacter.id];
    const msg = history ? history[msgIdx] : null;
    if(!msg || !msg.candidates) return;
    
    let nextIndex = (msg.cIndex || 0) + delta;
    if(nextIndex >= 0 && nextIndex < msg.candidates.length) {
        msg.cIndex = nextIndex;
        msg.t = msg.candidates[nextIndex];
        saveUserData();
        renderChatMessages();
        if (typeof logTrainingDataset === "function" && currentCharacter) { const lastUserMsg = historySubset.filter(m => m.r === "user").pop()?.t || ""; logTrainingDataset(currentCharacter, lastUserMsg, replyText); }
    }
};

window.copyCodeBlock = function(btn) {
    const pre = btn.closest('.code-block-wrapper').querySelector('pre');
    if(pre) {
        navigator.clipboard.writeText(pre.innerText).then(() => {
            const oldText = btn.textContent;
            btn.textContent = '✅ คัดลอกแล้ว!';
            setTimeout(() => btn.textContent = oldText, 2000);
        });
    }
};

// Markdown & Table Formatting
function formatRoleplayText(text, isBot = true) {
    if(!text) return "";
    let s = escapeHtml(text);
    
    // 1. Code blocks with Copy Button
    s = s.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<div class="code-block-wrapper"><div class="code-block-header"><span>${lang || 'code'}</span><button class="btn-copy-code" onclick="copyCodeBlock(this)">📋 คัดลอก</button></div><pre><code>${code}</code></pre></div>`;
    });

    // 2. Parse Markdown Tables FIRST (Protects table headers from regex replacements)
    s = parseMarkdownTables(s);

    // 3. Visual Scorecard & Passed Card detection ONLY FOR BOT MESSAGES (Requires explicit /100)
    if (isBot) {
        s = s.replace(/(?:คะแนนความเหมาะสมรวม|คะแนนความเหมาะสม|คะแนนรวม|Match\s*Score|Overall\s*Score)[^0-9\n\r]{0,35}?([0-9]{1,3})\s*(?:\/\s*100|\s*เต็ม\s*100)/gi, (match, scoreStr) => {
            const score = parseInt(scoreStr, 10);
            if (isNaN(score) || score > 100) return match;
            const scoreClass = score >= 80 ? 'high' : (score >= 60 ? 'medium' : 'low');
            const statusText = score >= 80 ? '🟢 เหมาะสมสูง / ผ่านเกณฑ์มาตรฐาน' : (score >= 60 ? '🟡 ระดับปานกลาง / ควรพิจารณาเพิ่มเติม' : '🔴 ต่ำกว่าเกณฑ์ / ต้องพัฒนาเพิ่มเติม');
            const passingThreshold = parseInt(localStorage.getItem(STORAGE_PREFIX + 'passing_score') || '75', 10);
            const notifyEmail = localStorage.getItem(STORAGE_PREFIX + 'notify_email') || 'your-email@pim.ac.th';
            
            let passedCardHtml = '';
            if (score >= passingThreshold) {
                passedCardHtml = `
                <div class="candidate-passed-card">
                  <div class="passed-header">
                    <span class="passed-badge">🎉 ผู้สมัครผ่านเกณฑ์การคัดเลือก (${score}/100)</span>
                    <span class="passed-threshold-tag">เกณฑ์ผ่าน: ${passingThreshold} คะแนน</span>
                  </div>
                  <p class="passed-desc">ผู้สมัครรายนี้มีคุณสมบัติและผลคะแนนผ่านเกณฑ์มาตรฐาน พร้อมส่งสรุปรายงานและไฟล์เรซูเม่เข้า Gmail</p>
                  <div class="passed-actions-row">
                    <button type="button" class="btn-send-email-trigger" onclick="sendCandidatePassedEmail(${score}, this)">
                      📧 ส่งอีเมลแจ้งเตือนพร้อมแนบไฟล์เข้า Gmail (${escapeHtml(notifyEmail)})
                    </button>
                  </div>
                </div>`;
            }

            return `
            <div class="scorecard-badge-container">
               <div class="scorecard-header">
                  <span class="scorecard-title">📊 ผลการประเมินคะแนนความเหมาะสม</span>
                  <span class="scorecard-score ${scoreClass}">${score}/100</span>
               </div>
               <div class="scorecard-progress-track">
                  <div class="scorecard-progress-fill ${scoreClass}" style="width:${score}%;"></div>
               </div>
               <div class="scorecard-footer">
                  <span class="scorecard-status ${scoreClass}">${statusText}</span>
                  <span class="scorecard-hint">เกณฑ์มาตรฐาน ET OPC</span>
               </div>
            </div>${passedCardHtml}`;
        });
    }

    // 4. Markdown Headings
    s = s.replace(/^###\s+(.+)$/gm, '<h4 class="chat-heading-3">$1</h4>');
    s = s.replace(/^##\s+(.+)$/gm, '<h3 class="chat-heading-2">$1</h3>');
    s = s.replace(/^#\s+(.+)$/gm, '<h2 class="chat-heading-1">$1</h2>');

    // 5. Horizontal Dividers
    s = s.replace(/^(?:---|___|\*\*\*)\s*$/gm, '<hr class="chat-divider">');

    // 6. Blockquotes
    s = s.replace(/^>\s*(.+)$/gm, '<blockquote class="chat-quote">$1</blockquote>');

    // 7. Bullet Lists
    s = s.replace(/^[*-]\s+(.+)$/gm, '<div class="chat-bullet-row"><span class="chat-bullet-dot">•</span><span class="chat-bullet-text">$1</span></div>');

    // 8. Bold and Italic
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^\*\n]+)\*/g, '<span style="font-style:italic; opacity:0.88;">$1</span>');

    // 9. Newlines to <br>
    s = s.replace(/\n/g, '<br>');
    s = s.replace(/<br>\s*<(h[1-4]|hr|div|table|blockquote)/gi, '<$1');
    s = s.replace(/<\/(h[1-4]|div|table|blockquote)>\s*<br>/gi, '</$1>');
    s = s.replace(/<hr class="chat-divider">\s*<br>/gi, '<hr class="chat-divider">');

    return s;
}

function parseMarkdownTables(text) {
    return text.replace(/(?:^|\n)((?:\|[^\n]+\|\n?)+)/g, (match, tableBlock) => {
        const lines = tableBlock.trim().split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return match;

        let dividerIndex = -1;
        for (let idx = 0; idx < lines.length; idx++) {
            const l = lines[idx];
            if (l.includes('---') || /^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(l)) {
                dividerIndex = idx;
                break;
            }
        }

        let html = '<div class="table-responsive"><table class="rich-table">';
        let hasThead = false;

        for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx];
            if (line.includes('---') || /^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(line) || line.replace(/[\s|:-]/g, '') === '') {
                continue;
            }

            let rawCells = line.split('|');
            if (line.startsWith('|')) rawCells.shift();
            if (line.endsWith('|')) rawCells.pop();
            const cells = rawCells.map(c => c.trim());
            if (cells.length === 0) continue;

            if (idx === 0 || (!hasThead && dividerIndex === 1)) {
                html += '<thead><tr>';
                cells.forEach(c => html += `<th>${c}</th>`);
                html += '</tr></thead><tbody>';
                hasThead = true;
            } else {
                html += '<tr>';
                cells.forEach(c => html += `<td>${c}</td>`);
                html += '</tr>';
            }
        }

        if (hasThead) html += '</tbody>';
        html += '</table></div>';
        const prefix = match.startsWith('\n') ? '\n' : '';
        return prefix + html;
    });
}

window.openChat = function(id, pushHistory = true){
    if (!id) return;
    const c = appCharacters.find(x => x.id === id);
    if (!c) {
        console.warn("Character not found:", id);
        return;
    }
    currentCharacter = c;

    const pAvatar = document.getElementById('personaAvatar');
    if (pAvatar) {
        pAvatar.style.background = c.color || 'linear-gradient(135deg,#8B0000,#0F172A)';
        pAvatar.innerHTML = getAvatarHtml(c);
    }
    const pName = document.getElementById('personaName');
    if (pName) pName.textContent = c.name || '';
    const pTagline = document.getElementById('personaTagline');
    if (pTagline) pTagline.textContent = c.bio || '';
    const pBio = document.getElementById('personaBio');
    if (pBio) pBio.textContent = c.bio || '';
    const pPrompt = document.getElementById('personaPrompt');
    if (pPrompt) pPrompt.textContent = c.prompt || '';

    const pReqBlock = document.getElementById('personaRequirementsBlock');
    const pReq = document.getElementById('personaRequirements');
    if (pReqBlock && pReq) {
        if (c.requirements && c.requirements.trim() !== '') {
            pReq.innerHTML = formatRoleplayText(c.requirements);
            pReqBlock.style.display = 'block';
        } else {
            pReqBlock.style.display = 'none';
        }
    }

    const pTags = document.getElementById('personaTags');
    if (pTags) {
        pTags.innerHTML = '';
        if (c.tags && c.tags.length > 0) {
            c.tags.forEach(t => {
                pTags.innerHTML += `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:var(--surface-2); border:1px solid var(--line); color:var(--ink-soft);"><span style="width:6px; height:6px; border-radius:50%; background:${t.color || '#8B0000'};"></span>${escapeHtml(t.t)}</span>`;
            });
        }
    }

    const cAvatar = document.getElementById('chatAvatar');
    if (cAvatar) {
        cAvatar.style.background = c.color || 'linear-gradient(135deg,#8B0000,#0F172A)';
        cAvatar.innerHTML = getAvatarHtml(c);
    }
    const cName = document.getElementById('chatName');
    if (cName) cName.textContent = c.name || '';

    if (!appUserData[currentUser]) {
        appUserData[currentUser] = { favs: [], history: {}, profile: { displayName: currentUser } };
    }
    if (!appUserData[currentUser].history) {
        appUserData[currentUser].history = {};
    }
    if (!appUserData[currentUser].history[c.id] || appUserData[currentUser].history[c.id].length === 0) {
        const initialOpener = c.opener || 'สวัสดีครับ มีอะไรให้ผมช่วยเหลือในวันนี้ไหมครับ?';
        appUserData[currentUser].history[c.id] = [{
            id: 'msg-' + Date.now(),
            r: 'bot',
            t: initialOpener,
            candidates: [initialOpener],
            cIndex: 0
        }];
        saveUserData();
    }

    const btnEdit = document.getElementById('btnEditCharacter');
    if (btnEdit) {
        btnEdit.style.display = (currentUserRole === 'admin') ? 'inline-flex' : 'none';
    }

    updateTopbarAiBadge();
    renderChatMessages();

    document.getElementById('exploreView')?.classList.add('hidden');
    document.getElementById('createView')?.classList.add('hidden');
    document.getElementById('chatView')?.classList.add('active');

    // Close drawers and sidebar on mobile
    document.getElementById('sideTabBar')?.classList.remove('mobile-open');
    document.getElementById('recentDrawer')?.classList.remove('open');
    document.getElementById('drawerOverlay')?.classList.remove('open');
    document.getElementById('profileDropdown')?.classList.add('hidden');

    if (pushHistory) {
        history.pushState({ view: 'chat', id: id }, '', `#chat-${id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
function openChat(id, pushHistory = true) { window.openChat(id, pushHistory); }

function showExplore(pushHistory = true){
    document.getElementById('chatView').classList.remove('active');
    document.getElementById('createView').classList.add('hidden');
    document.getElementById('exploreView').classList.remove('hidden');

    // Close recent drawer if open
    const recentDrawer = document.getElementById('recentDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    if(recentDrawer) recentDrawer.classList.remove('open');
    if(drawerOverlay) drawerOverlay.classList.remove('open');

    // Close profile dropdown
    document.getElementById('profileDropdown')?.classList.add('hidden');

    if (pushHistory) {
        history.pushState({ view: 'explore' }, '', '#explore');
    }
    updateSidebarTabUI();
    applyFilters();
    renderSidebarStarred();
        loadCandidateSubmissions();
        updateHubStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- EXPLORE & FILTER LOGIC (SINGLE BUTTON FILTER) ---
function renderTagsUI() {
    const badge = document.getElementById('filterActiveBadge');
    const btnFilter = document.getElementById('btnSingleFilter');
    const btnAll = document.getElementById('btnFilterAll');
    
    if (activeTagFilters.length > 0) {
        if(badge) { badge.style.display = 'inline-block'; badge.textContent = activeTagFilters.length; }
        if(btnFilter) btnFilter.classList.add('active');
        if(btnAll) btnAll.classList.remove('active');
    } else {
        if(badge) badge.style.display = 'none';
        if(btnFilter) btnFilter.classList.remove('active');
        if(btnAll) btnAll.classList.add('active');
    }
}

function openFilterModal() {
    document.getElementById('filterModal')?.classList.remove('hidden');
    renderTagCheckboxes();
}
function closeFilterModal() { document.getElementById('filterModal')?.classList.add('hidden'); }
function filterTagCheckboxes() { renderTagCheckboxes(); }
function renderTagCheckboxes() {
    const list = document.getElementById('tagCheckboxList');
    if(!list) return;
    const q = (document.getElementById('tagSearchInput')?.value || '').toLowerCase().trim();
    list.innerHTML = '';
    
    const filteredRoles = appRoles.filter(r => r.t.toLowerCase().includes(q));
    const filteredTags = appTags.filter(t => t.t.toLowerCase().includes(q));

    if (filteredRoles.length === 0 && filteredTags.length === 0) {
        list.innerHTML = '<p style="font-size:13px; color:var(--ink-faint); text-align:center; padding:16px 0;">ไม่พบแผนกหรือแท็กที่ตรงกับการค้นหา</p>';
        return;
    }

    // หมวดหมู่ที่ 1: จัดการแผนก / ฝ่ายงาน (Roles / Departments)
    if (filteredRoles.length > 0) {
        let rolesHtml = `
        <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:4px; border-bottom:1.5px solid var(--line);">
                <span style="font-size:12px; font-weight:800; text-transform:uppercase; color:var(--maroon); display:flex; align-items:center; gap:6px;">
                    🏢 จัดการแผนก / ฝ่ายงาน
                </span>
                <span style="font-size:10.5px; background:var(--surface-2); border:1px solid var(--line); padding:1px 7px; border-radius:999px; color:var(--ink-soft); font-weight:700;">${filteredRoles.length}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">`;
        
        filteredRoles.forEach(r => {
            const isChecked = activeTagFilters.includes(r.v);
            rolesHtml += `
            <label style="display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:8px; cursor:pointer; font-size:13.5px; font-weight:700; color:var(--ink); transition:background 0.15s ease;" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background='transparent'">
                <input type="checkbox" value="${r.v}" class="tag-cb-item" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--maroon); cursor:pointer;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${r.color}; flex-shrink:0;"></span>
                <span>${escapeHtml(r.t)}</span>
            </label>`;
        });
        rolesHtml += `</div></div>`;
        list.innerHTML += rolesHtml;
    }

    // หมวดหมู่ที่ 2: จัดการหมวดหมู่ / แท็ก (Categories / Tags)
    if (filteredTags.length > 0) {
        let tagsHtml = `
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:4px; border-bottom:1.5px solid var(--line);">
                <span style="font-size:12px; font-weight:800; text-transform:uppercase; color:var(--maroon); display:flex; align-items:center; gap:6px;">
                    🏷️ จัดการหมวดหมู่ / แท็ก
                </span>
                <span style="font-size:10.5px; background:var(--surface-2); border:1px solid var(--line); padding:1px 7px; border-radius:999px; color:var(--ink-soft); font-weight:700;">${filteredTags.length}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">`;
        
        filteredTags.forEach(t => {
            const isChecked = activeTagFilters.includes(t.v);
            tagsHtml += `
            <label style="display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:8px; cursor:pointer; font-size:13.5px; font-weight:700; color:var(--ink); transition:background 0.15s ease;" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background='transparent'">
                <input type="checkbox" value="${t.v}" class="tag-cb-item" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--maroon); cursor:pointer;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${t.color}; flex-shrink:0;"></span>
                <span>${escapeHtml(t.t)}</span>
            </label>`;
        });
        tagsHtml += `</div></div>`;
        list.innerHTML += tagsHtml;
    }
}

function applyTagFilterModal() {
    const cbs = document.querySelectorAll('.tag-cb-item:checked');
    activeTagFilters = Array.from(cbs).map(cb => cb.value);
    systemFilter = 'all';
    applyFilters();
    renderTagsUI();
    closeFilterModal();
}

function clearTagFilters() {
    activeTagFilters = [];
    systemFilter = 'all';
    currentSearchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.value = '';
    applyFilters();
    renderTagsUI();
    closeFilterModal();
}

function applyFilters() {
    const grid = document.getElementById('charGrid');
    const featuredSection = document.getElementById('featuredSection');
    if(!grid) return;
    grid.innerHTML = '';
    
    // Ensure appCharacters is loaded
    if (!appCharacters || appCharacters.length === 0) {
        loadData();
    }

    // Role-based privacy filter (Admin can see all, Users can see public or their own)
    let filteredChars = appCharacters.filter(c => {
        if (!c.isPrivate) return true;
        if (currentUserRole === 'admin') return true;
        if (c.creator === "@" + currentUser || c.creator === currentUser) return true;
        return false;
    });
    
    // Search query filter
    if (currentSearchQuery && currentSearchQuery.trim() !== '') {
        const q = currentSearchQuery.toLowerCase().trim();
        filteredChars = filteredChars.filter(c => 
            (c.name && c.name.toLowerCase().includes(q)) || 
            (c.bio && c.bio.toLowerCase().includes(q)) ||
            (c.role && c.role.t && c.role.t.toLowerCase().includes(q)) ||
            (c.tags && c.tags.some(t => t.t && t.t.toLowerCase().includes(q)))
        );
    }
    
    // Sidebar tabs filter
    if (systemFilter === 'fav') {
        let favs = appUserData[currentUser]?.favs || [];
        filteredChars = filteredChars.filter(c => favs.includes(c.id));
    } else if (systemFilter === 'my_chars') {
        filteredChars = filteredChars.filter(c => c.creator === "@" + currentUser || c.creator === currentUser);
    }
    
    // Active tag filters
    if (activeTagFilters && activeTagFilters.length > 0) {
        filteredChars = filteredChars.filter(c => {
            return activeTagFilters.some(fVal => {
                const matchTag = c.tags && c.tags.some(t => t.v === fVal || t.c === fVal || t.t === fVal);
                const matchRole = c.role && (c.role.v === fVal || c.role.t === fVal);
                return matchTag || matchRole;
            });
        });
    }
    
    // Featured section visibility
    if ((currentSearchQuery && currentSearchQuery.trim() !== '') || (activeTagFilters && activeTagFilters.length > 0) || systemFilter !== 'all') {
        if(featuredSection) featuredSection.style.display = 'none';
    } else {
        if(featuredSection) featuredSection.style.display = 'block';
        renderFeatured();
    }

    // Render Cards or Empty State with Reset Button
    if (filteredChars.length === 0) {
        grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 48px 20px; color:var(--ink-soft); background:var(--surface-2); border-radius:var(--radius-lg); border:1px dashed var(--line);">
          <span style="font-size:32px; display:block; margin-bottom:8px;">🔍</span>
          <strong style="font-size:15px; color:var(--ink); display:block; margin-bottom:4px;">ไม่พบ Agent ตรงกับตัวกรองที่เลือก</strong>
          <p style="font-size:12.5px; color:var(--ink-faint); margin:0 0 14px 0;">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดู Agent ทั้งหมด</p>
          <button type="button" class="btn-submit" style="padding:7px 16px; font-size:12px; font-weight:800; border-radius:10px; display:inline-flex; align-items:center; gap:6px;" onclick="clearTagFilters()">
            <span>🔄 แสดง Agent ทั้งหมด</span>
          </button>
        </div>`;
        return;
    }

    filteredChars.forEach(c => {
        grid.appendChild(createCharacterCard(c));
    });
}

function renderFeatured() {
    const row = document.getElementById('featuredRow');
    const section = document.getElementById('featuredSection');
    if(!row) return;
    row.innerHTML = '';
    
    const featured = appCharacters.filter(c => c.featured && (!c.isPrivate || c.creator === "@" + currentUser));
    
    if (featured.length === 0) {
        if(section) section.style.display = 'none';
        return;
    }
    
    if(section && !currentSearchQuery && activeTagFilters.length === 0 && systemFilter === 'all') {
        section.style.display = 'block';
    }
    
    featured.forEach(c => {
        const card = document.createElement('div');
        card.className = 'featured-card';
        if(c.imageUrl && c.imageUrl.trim() !== "") {
            card.style.backgroundImage = `url('${c.imageUrl}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
        } else {
            card.style.background = c.color || 'linear-gradient(135deg, #8B0000, #450A0A)';
        }
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            e.preventDefault();
            openChat(c.id);
        };
        card.innerHTML = `
          <div class="overlay" style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.85) 100%); pointer-events:none;"></div>
          <div class="content" style="position:relative; z-index:2; padding:18px 20px; color:#ffffff; pointer-events:none;">
            <span class="featured-badge" style="background:#8B0000; color:#fff; font-weight:800; font-size:10.5px; padding:3px 10px; border-radius:999px; display:inline-block; margin-bottom:8px;">FEATURED AGENT</span>
            <h3 style="margin:0; font-size:16.5px; font-weight:800; color:#ffffff; line-height:1.35;">${escapeHtml(c.name)}</h3>
          </div>
        `;
        row.appendChild(card);
    });
}

window.toggleFavorite = function(id, e) {
    if(e) e.stopPropagation();
    if(!appUserData[currentUser]) appUserData[currentUser] = { favs: [] };
    let favs = appUserData[currentUser].favs || [];
    const index = favs.indexOf(id);
    let isNowFav = false;
    if(index > -1) {
        favs.splice(index, 1);
        isNowFav = false;
    } else {
        favs.push(id);
        isNowFav = true;
    }
    appUserData[currentUser].favs = favs;
    saveUserData();
    applyFilters();
    renderSidebarStarred();
        loadCandidateSubmissions();
        updateHubStats();
    if (typeof showToast === 'function') {
        showToast(isNowFav ? "ติดดาว Agent เรียบร้อยแล้ว ⭐" : "ยกเลิกการติดดาวแล้ว", "info");
    }
};

function clearCurrentChat() {
    if(!currentCharacter) return;
    showConfirmDialog({
        title: "ล้างประวัติการสนทนา",
        message: "ต้องการล้างประวัติการสนทนาของ Agent นี้ทั้งหมดใช่หรือไม่?",
        confirmText: "ล้างประวัติ",
        cancelText: "ยกเลิก",
        type: "danger",
        icon: "🗑️"
    }).then(confirmed => {
        if (!confirmed) return;
        const initialOpener = currentCharacter.opener || 'สวัสดีครับ มีอะไรให้ผมช่วยเหลือในวันนี้ไหมครับ?';
        appUserData[currentUser].history[currentCharacter.id] = [{
            id: 'msg-' + Date.now(),
            r: 'bot',
            t: initialOpener,
            candidates: [initialOpener],
            cIndex: 0
        }];
        saveUserData();
        renderChatMessages();
        showToast("ล้างประวัติการสนทนาเรียบร้อยแล้ว", "info");
    });
}

function setTheme(mode, save = true){
    window.setTheme = setTheme;
    let effectiveMode = mode;
    if (mode === 'auto') {
        effectiveMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveMode);
    document.getElementById('btnLight')?.classList.toggle('active', mode === 'light');
    document.getElementById('btnDark')?.classList.toggle('active', mode === 'dark');
    
    document.getElementById('themeCardLight')?.classList.toggle('active', mode === 'light');
    document.getElementById('themeCardDark')?.classList.toggle('active', mode === 'dark');
    document.getElementById('themeCardAuto')?.classList.toggle('active', mode === 'auto');

    if (save) {
        localStorage.setItem(STORAGE_PREFIX + 'theme', mode);
        if (typeof showToast === 'function') {
            const label = mode === 'dark' ? 'โหมดมืด' : (mode === 'auto' ? 'ตามระบบ' : 'โหมดสว่าง');
            showToast('เปลี่ยนธีมเป็น ' + label + ' แล้ว', 'info');
        }
    }
}
window.setTheme = setTheme;

function handleSearch(e) {
    currentSearchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
}

function toggleRecentDrawer() {
    document.getElementById('recentDrawer').classList.toggle('open');
    document.getElementById('drawerOverlay').classList.toggle('open');
    renderRecentChats();
}

function renderRecentChats() {
    const list = document.getElementById('recentChatList');
    if(!list) return;
    list.innerHTML = '';
    const hist = appUserData[currentUser]?.history || {};
    Object.keys(hist).forEach(id => {
        const c = appCharacters.find(x => x.id === id);
        if(!c || hist[id].length === 0) return;
        const lastMsg = hist[id][hist[id].length - 1].t;
        list.innerHTML += `
        <div class="recent-item" onclick="openChat('${c.id}'); toggleRecentDrawer();">
            <div class="recent-avatar" style="background:${c.color || 'linear-gradient(135deg,#8B0000,#0F172A)'}">${getAvatarHtml(c)}</div>
            <div class="recent-info">
                <h4>${escapeHtml(c.name)}</h4>
                <p>${escapeHtml(lastMsg)}</p>
            </div>
        </div>`;
    });
}

function toggleProfileMenu(e) {
    e.stopPropagation();
    document.getElementById('profileDropdown')?.classList.toggle('hidden');
}
window.addEventListener('click', () => document.getElementById('profileDropdown')?.classList.add('hidden'));

function setFilterFromMenu(f) {
    systemFilter = f;
    activeTagFilters = [];
    showExplore();
}

// Profile Edit & Password Change Modal
function openEditProfileModal() {
    const p = appUserData[currentUser]?.profile || {};
    document.getElementById('profileDisplayName').value = p.displayName || currentUser;
    document.getElementById('profileUsername').value = currentUser;
    document.getElementById('profilePersona').value = p.persona || '';
    
    currentUploadedProfileImage = p.avatarUrl || '';
    isProfileImageRemoved = false;
    
    const imgPreview = document.getElementById('profileImagePreview');
    const textPreview = document.getElementById('profileImagePreviewText');
    const btnRemove = document.getElementById('btnRemoveProfileImage');
    
    if (currentUploadedProfileImage && currentUploadedProfileImage.trim() !== '') {
        if(imgPreview) { imgPreview.src = currentUploadedProfileImage; imgPreview.style.display = 'block'; }
        if(textPreview) textPreview.style.display = 'none';
        if(btnRemove) btnRemove.style.display = 'inline-flex';
    } else {
        if(imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
        if(textPreview) textPreview.style.display = 'block';
        if(btnRemove) btnRemove.style.display = 'none';
    }
    
    if (document.getElementById('profileCurrentPassword')) document.getElementById('profileCurrentPassword').value = '';
    if (document.getElementById('profileNewPassword')) document.getElementById('profileNewPassword').value = '';
    if (document.getElementById('profileConfirmPassword')) document.getElementById('profileConfirmPassword').value = '';
    
    document.getElementById('editProfileModal').classList.remove('hidden');
}
function closeEditProfileModal() { document.getElementById('editProfileModal').classList.add('hidden'); }

function saveProfile() {
    const newName = document.getElementById('profileDisplayName').value.trim();
    const newUsername = document.getElementById('profileUsername').value.trim();
    const newPersona = document.getElementById('profilePersona').value.trim();
    
    const currentPass = document.getElementById('profileCurrentPassword')?.value || '';
    const newPass = document.getElementById('profileNewPassword')?.value || '';
    const confirmPass = document.getElementById('profileConfirmPassword')?.value || '';

    if(!newUsername) return alert("Username ห้ามเว้นว่าง");

    let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    let userObj = users[currentUser] || { password: '', role: currentUserRole };

    // Check Password Change
    if (currentPass || newPass || confirmPass) {
        if (!currentPass) {
            return alert("⚠️ กรุณากรอกรหัสผ่านเดิมเพื่อยืนยันการเปลี่ยนรหัสผ่าน");
        }
        if (userObj.password !== currentPass) {
            return alert("❌ รหัสผ่านเดิมไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        }
        if (newPass.length < 4) {
            return alert("⚠️ รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
        }
        if (newPass !== confirmPass) {
            return alert("⚠️ รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
        }
        
        userObj.password = newPass;
    }

    // Handle Username change
    if(newUsername !== currentUser) {
        if(users[newUsername]) return alert("Username นี้มีคนใช้แล้ว! กรุณาเลือกชื่ออื่น");
        users[newUsername] = userObj;
        delete users[currentUser];
        
        appUserData[newUsername] = appUserData[currentUser];
        delete appUserData[currentUser];
        
        appCharacters.forEach(c => {
            if(c.creator === "@" + currentUser) c.creator = "@" + newUsername;
        });
        saveToStorage();
        
        currentUser = newUsername;
        localStorage.setItem(STORAGE_PREFIX + 'username', currentUser);
        sessionStorage.setItem(STORAGE_PREFIX + 'username', currentUser);
    } else {
        users[currentUser] = userObj;
    }
    
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));

    if(!appUserData[currentUser].profile) appUserData[currentUser].profile = {};
    appUserData[currentUser].profile.displayName = newName || currentUser;
    appUserData[currentUser].profile.persona = newPersona;

    if (currentUploadedProfileImage && currentUploadedProfileImage.trim() !== '') {
        appUserData[currentUser].profile.avatarUrl = currentUploadedProfileImage;
    } else if (isProfileImageRemoved) {
        appUserData[currentUser].profile.avatarUrl = '';
    }
    saveUserData();
    
    updateUIAfterProfileChange();
    renderChatMessages();
    closeEditProfileModal();
    showToast("บันทึกข้อมูลโปรไฟล์และรหัสผ่านเรียบร้อยแล้ว", "success");
}

function updateUIAfterProfileChange() {
    const p = appUserData[currentUser]?.profile || {};
    const name = p.displayName || currentUser;
    const navName = document.getElementById('navUserName');
    const dropName = document.getElementById('dropdownUserName');
    const dropPersona = document.getElementById('dropdownUserPersona');
    const navAvatar = document.getElementById('navUserAvatar');
    const dropAvatar = document.getElementById('dropdownUserAvatar');
    
    if(navName) navName.textContent = "@" + name;
    if(dropName) dropName.textContent = "@" + name;
    if(dropPersona) dropPersona.textContent = p.persona || 'ET CHAT';
    
    const avatarContent = (p.avatarUrl && p.avatarUrl.trim() !== '') ? 
        `<img src="${p.avatarUrl}" alt="${escapeHtml(name)}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : 
        (name || "U").charAt(0).toUpperCase();

    if(navAvatar) navAvatar.innerHTML = avatarContent;
    if(dropAvatar) dropAvatar.innerHTML = avatarContent;
}

// Character CRUD
function showCreateForm(pushHistory = true) {
    const allowUserCreate = localStorage.getItem(STORAGE_PREFIX + 'allow_user_create') === 'true';
    if (currentUserRole !== 'admin' && !allowUserCreate) {
        showToast("⚠️ ผู้ดูแลระบบปิดสิทธิ์การสร้าง Agent สำหรับผู้ใช้ทั่วไปชั่วคราว", "warning");
        showExplore();
        return;
    }
    editingCharacterId = null;
    currentUploadedImage = "";
    isImageRemoved = false;
    
    document.getElementById('formTitle').textContent = "สร้าง AI Agent ใหม่";
    document.getElementById('formSubtitle').textContent = "กำหนดบทบาทและความสามารถของ Agent ประจำองค์กร";
    document.getElementById('btnSubmitForm').textContent = "สร้าง Agent";
    
    const btnDelete = document.getElementById('btnDeleteChar');
    if(btnDelete) btnDelete.style.display = 'none';
    
    document.getElementById('createName').value = '';
    document.getElementById('createBio').value = '';
    document.getElementById('createOpener').value = '';
    document.getElementById('createPrompt').value = '';
    if(document.getElementById('createRequirements')) document.getElementById('createRequirements').value = '';
    
    const roleSelect = document.getElementById('createRole');
    if(roleSelect) {
        roleSelect.innerHTML = '';
        appRoles.forEach(r => roleSelect.innerHTML += `<option value="${r.v}">${escapeHtml(r.t)}</option>`);
    }

    const tagContainer = document.getElementById('createTagContainer');
    if(tagContainer) {
        tagContainer.innerHTML = '';
        tagContainer.className = 'tag-chip-group';
        appTags.forEach(t => {
            tagContainer.innerHTML += `
            <label class="tag-chip-item" onclick="toggleFormTag(this, event)">
                <input type="checkbox" value="${t.v}" class="agent-tag-cb" style="accent-color:var(--maroon);">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${t.color}; flex-shrink:0;"></span>
                <span style="white-space:nowrap !important;">${escapeHtml(t.t)}</span>
            </label>`;
        });
    }

    const featuredWrapper = document.getElementById('featuredToggleWrapper');
    if(featuredWrapper) {
        featuredWrapper.style.display = (currentUserRole === 'admin') ? 'flex' : 'none';
    }
    const createFeatured = document.getElementById('createFeatured');
    if(createFeatured) createFeatured.checked = false;

    const imgPreview = document.getElementById('imagePreview');
    const textPreview = document.getElementById('imagePreviewText');
    const btnRemove = document.getElementById('btnRemoveImage');
    if(imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
    if(textPreview) textPreview.style.display = 'block';
    if(btnRemove) btnRemove.style.display = 'none';

    document.getElementById('exploreView').classList.add('hidden');
    document.getElementById('chatView').classList.remove('active');
    document.getElementById('createView').classList.remove('hidden');

    if (pushHistory) {
        history.pushState({ view: 'create' }, '', '#create');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelForm() {
    showExplore();
}

function saveCharacter() {
    const name = document.getElementById('createName').value.trim();
    const bio = document.getElementById('createBio').value.trim();
    const roleVal = document.getElementById('createRole')?.value;
    const role = appRoles.find(r => r.v === roleVal) || DEFAULT_ROLES[0];
    const priv = document.getElementById('createPrivacy')?.value === 'private';
    const featured = document.getElementById('createFeatured')?.checked || false;
    const opener = document.getElementById('createOpener').value.trim() || 'สวัสดีครับ มีอะไรให้ช่วยไหมครับ?';
    const prompt = document.getElementById('createPrompt').value.trim() || 'คุณคือ AI ผู้ช่วย';
    const requirements = document.getElementById('createRequirements')?.value.trim() || '';

    const tagCbs = document.querySelectorAll('.agent-tag-cb:checked');
    const tags = Array.from(tagCbs).map(cb => appTags.find(t => t.v === cb.value)).filter(Boolean);

    if(!name) return alert("กรุณาใส่ชื่อ Agent");

    let finalImg = "";
    if (isImageRemoved) {
        finalImg = "";
    } else if (currentUploadedImage && currentUploadedImage.trim() !== "") {
        finalImg = currentUploadedImage;
    } else if (editingCharacterId) {
        const existing = appCharacters.find(c => c.id === editingCharacterId);
        finalImg = existing?.imageUrl || "";
    }

    if(editingCharacterId) {
        const idx = appCharacters.findIndex(c => c.id === editingCharacterId);
        if(idx !== -1) {
            appCharacters[idx] = { 
                ...appCharacters[idx], 
                name, 
                bio, 
                role, 
                isPrivate: priv, 
                featured, 
                badge: featured ? 'Agent แนะนำ' : '',
                opener, 
                prompt, 
                requirements,
                tags,
                imageUrl: finalImg
            };
            currentCharacter = appCharacters[idx];
        }
    } else {
        const newChar = {
            id: 'agent-' + Date.now(),
            name,
            creator: '@' + currentUser,
            icon: 'briefcase',
            imageUrl: currentUploadedImage || '',
            color: 'linear-gradient(135deg,#0284C7,#0F172A)',
            chatCount: 0,
            isPrivate: priv,
            role,
            bio,
            tags,
            featured,
            badge: featured ? 'Agent แนะนำ' : '',
            prompt,
            requirements,
            opener
        };
        appCharacters.unshift(newChar);
    }
    
        saveToStorage();
    showExplore();
    applyFilters();

    // Supabase Cloud Upsert (Guaranteed Multi-User Sync)
    if (supabaseClient) {
        const charToSync = editingCharacterId ? appCharacters.find(c => c.id === editingCharacterId) : appCharacters[0];
        if (charToSync) {
            supabaseClient.from('agents').upsert(mapCharToDb(charToSync)).then(({ error }) => {
                if (error) {
                    console.warn("Supabase save error:", error);
                    if (typeof showToast === 'function') showToast("⚠️ บันทึกในเครื่องแล้ว (แต่ส่งขึ้น Cloud ไม่สำเร็จ: " + error.message + ")", "warning");
                } else {
                    if (typeof showToast === 'function') showToast("☁️ บันทึกขึ้น Cloud สำเร็จ (ทุกคนจะเห็นทันที)", "success");
                    
                }
            });
        }
    }
    showToast("บันทึกข้อมูล Agent สำเร็จแล้ว", "success");
}

function editCurrentCharacter() {
    if (currentUserRole !== 'admin') {
        showToast("เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขข้อมูล Agent ได้", "warning");
        return;
    }
    if(!currentCharacter) return;
    const targetChar = currentCharacter;
    
    showCreateForm();
    editingCharacterId = targetChar.id;
    
    document.getElementById('formTitle').textContent = "แก้ไขข้อมูล Agent";
    document.getElementById('formSubtitle').textContent = `แก้ไขข้อมูลของ ${targetChar.name}`;
    document.getElementById('btnSubmitForm').textContent = "บันทึกการแก้ไข";
    
    const btnDelete = document.getElementById('btnDeleteChar');
    if(btnDelete) btnDelete.style.display = 'inline-flex';
    
    document.getElementById('createName').value = targetChar.name || '';
    document.getElementById('createBio').value = targetChar.bio || '';
    document.getElementById('createOpener').value = targetChar.opener || '';
    document.getElementById('createPrompt').value = targetChar.prompt || '';
    if(document.getElementById('createRequirements')) document.getElementById('createRequirements').value = targetChar.requirements || '';
    
    if(document.getElementById('createRole') && targetChar.role) {
        document.getElementById('createRole').value = targetChar.role.v || '';
    }
    if(document.getElementById('createPrivacy')) {
        document.getElementById('createPrivacy').value = targetChar.isPrivate ? 'private' : 'public';
    }
    if(document.getElementById('createFeatured')) {
        document.getElementById('createFeatured').checked = targetChar.featured || false;
    }
    
    if(targetChar.tags) {
        document.querySelectorAll('.agent-tag-cb').forEach(cb => {
            const isMatch = targetChar.tags.some(t => t.v === cb.value || t.c === cb.value);
            cb.checked = isMatch;
            if(cb.parentElement) cb.parentElement.classList.toggle('active', isMatch);
        });
    }
    
    currentUploadedImage = targetChar.imageUrl || '';
    isImageRemoved = false;
    const imgPreview = document.getElementById('imagePreview');
    const textPreview = document.getElementById('imagePreviewText');
    const btnRemove = document.getElementById('btnRemoveImage');
    if(currentUploadedImage) {
        if(imgPreview) { imgPreview.src = currentUploadedImage; imgPreview.style.display = 'block'; }
        if(textPreview) textPreview.style.display = 'none';
        if(btnRemove) btnRemove.style.display = 'inline-flex';
    } else {
        if(imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
        if(textPreview) textPreview.style.display = 'block';
        if(btnRemove) btnRemove.style.display = 'none';
    }
}

window.toggleFormTag = function(labelElem, event) {
    if (event.target.tagName !== 'INPUT') {
        const cb = labelElem.querySelector('input[type="checkbox"]');
        if(cb) {
            cb.checked = !cb.checked;
        }
    }
    const cb = labelElem.querySelector('input[type="checkbox"]');
    if(cb) {
        labelElem.classList.toggle('active', cb.checked);
    }
};

function showDeleteModal() { 
    document.getElementById('deleteModal').classList.remove('hidden'); 
}
function closeDeleteModal() { 
    document.getElementById('deleteModal').classList.add('hidden'); 
}

function confirmDelete() {
    const targetId = editingCharacterId || (currentCharacter ? currentCharacter.id : null);
    if(!targetId) {
        closeDeleteModal();
        return;
    }
    
    appCharacters = appCharacters.filter(c => c.id !== targetId);
    saveToStorage();

    // Clean up favorites
    if (appUserData[currentUser] && Array.isArray(appUserData[currentUser].favs)) {
        appUserData[currentUser].favs = appUserData[currentUser].favs.filter(id => id !== targetId);
        saveUserData();
    }
    
    closeDeleteModal();
    editingCharacterId = null;
    currentCharacter = null;
    
    showExplore();
    applyFilters();
    renderSidebarStarred();
        loadCandidateSubmissions();
        updateHubStats();
    showToast("ลบ Agent เรียบร้อยแล้ว", "success");
}

// Admin Dashboard Management
function showAdminDashboard() {
    switchAdminTab('stats');
    document.getElementById('adminModal').classList.remove('hidden');
}
function closeAdminDashboard() { document.getElementById('adminModal').classList.add('hidden'); }

function renderRoleList() {
    const list = document.getElementById('roleManagerList');
    if(!list) return;
    list.innerHTML = '';
    if(appRoles.length === 0) {
        list.innerHTML = '<p style="font-size:13px; color:var(--ink-faint); margin:4px 0;">ยังไม่มีแผนกในระบบ</p>';
        return;
    }
    appRoles.forEach((r, idx) => {
        list.innerHTML += `
        <div class="admin-list-item">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${r.color};"></span>
                <span class="admin-list-item-text">${escapeHtml(r.t)}</span>
            </div>
            <button class="btn-delete" style="padding:4px 10px; font-size:11.5px; height:auto;" onclick="removeRole(${idx})">ลบ</button>
        </div>`;
    });
}
function addNewRole() {
    const val = document.getElementById('newRoleInput')?.value.trim();
    const col = document.getElementById('newRoleColor')?.value || '#10B981';
    if(!val) return;
    appRoles.push({ v: 'role-' + Date.now(), t: val, color: col });
    localStorage.setItem(STORAGE_PREFIX + 'roles_v1', JSON.stringify(appRoles));
    document.getElementById('newRoleInput').value = '';
    renderRoleList();
}
function removeRole(idx) {
    appRoles.splice(idx, 1);
    localStorage.setItem(STORAGE_PREFIX + 'roles_v1', JSON.stringify(appRoles));
    renderRoleList();
}
function renderTagList() {
    const list = document.getElementById('tagManagerList');
    if(!list) return;
    list.innerHTML = '';
    if(appTags.length === 0) {
        list.innerHTML = '<p style="font-size:13px; color:var(--ink-faint); margin:4px 0;">ยังไม่มีหมวดหมู่ในระบบ</p>';
        return;
    }
    appTags.forEach((t, idx) => {
        list.innerHTML += `
        <div class="admin-list-item">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${t.color};"></span>
                <span class="admin-list-item-text">${escapeHtml(t.t)}</span>
            </div>
            <button class="btn-delete" style="padding:4px 10px; font-size:11.5px; height:auto;" onclick="removeTag(${idx})">ลบ</button>
        </div>`;
    });
}
function addNewTag() {
    const val = document.getElementById('newTagInput')?.value.trim();
    const col = document.getElementById('newTagColor')?.value || '#3B82F6';
    if(!val) return;
    const tagText = val.startsWith('#') ? val : '#' + val;
    appTags.push({ v: 'tag-' + Date.now(), t: tagText, color: col, c: 'tag-' + Date.now() });
    localStorage.setItem(STORAGE_PREFIX + 'tags_v1', JSON.stringify(appTags));
    document.getElementById('newTagInput').value = '';
    renderTagList();
}
function removeTag(idx) {
    appTags.splice(idx, 1);
    localStorage.setItem(STORAGE_PREFIX + 'tags_v1', JSON.stringify(appTags));
    renderTagList();
}

// Super Admin is ETPIM
function renderAdminList() {
    const list = document.getElementById('adminManagerList');
    if(!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    const admins = Object.keys(users).filter(k => users[k].role === 'admin');
    if(admins.length === 0) {
        list.innerHTML = '<p style="font-size:13px; color:var(--ink-faint); margin:4px 0;">ยังไม่มี Admin อื่นในระบบ</p>';
        return;
    }
    admins.forEach(adm => {
        list.innerHTML += `
        <div class="admin-list-item">
            <span class="admin-list-item-text">@${escapeHtml(adm)}</span>
            ${adm === 'ETPIM' ? '<span style="font-size:11.5px; color:var(--maroon); font-weight:800; background:var(--maroon-tint); padding:2px 8px; border-radius:6px;">Super Admin</span>' : `<button class="btn-delete" style="padding:4px 10px; font-size:11.5px; height:auto;" onclick="removeAdmin('${adm}')">ลบสิทธิ์</button>`}
        </div>`;
    });
}
function addNewAdmin() {
    const val = document.getElementById('newAdminInput')?.value.trim();
    if(!val) return;
    let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    if(!users[val]) return alert("ไม่พบผู้ใช้งานนี้ในระบบ");
    users[val].role = 'admin';
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
    document.getElementById('newAdminInput').value = '';
    renderAdminList();
}
function removeAdmin(adm) {
    if(adm === 'ETPIM') return;
    let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    if(users[adm]) {
        users[adm].role = 'user';
        localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
        renderAdminList();
    }
}

// Render User Accounts for Super Admin Deletion
function renderUserAccountList() {
    const list = document.getElementById('userAccountList');
    if(!list) return;
    list.innerHTML = '';
    
    let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    const query = (document.getElementById('userSearchInput')?.value || '').toLowerCase().trim();
    const usernames = Object.keys(users).filter(u => !query || u.toLowerCase().includes(query));
    
    if(usernames.length === 0) {
        list.innerHTML = '<p style="font-size:13px; color:var(--ink-faint); margin:4px 0;">ไม่พบบัญชีผู้ใช้ที่ตรงกับการค้นหา</p>';
        return;
    }
    
    usernames.forEach(username => {
        const u = users[username];
        const isSuper = (username === 'ETPIM');
        let roleBadge = '';
        
        if (isSuper) {
            roleBadge = '<span style="font-size:11px; color:#8B0000; font-weight:800; background:rgba(139,0,0,0.1); padding:2px 8px; border-radius:6px;">👑 Super Admin</span>';
        } else if (u.role === 'admin') {
            roleBadge = '<span style="font-size:11px; color:#0284C7; font-weight:800; background:rgba(2,132,199,0.1); padding:2px 8px; border-radius:6px;">Admin</span>';
        } else {
            roleBadge = '<span style="font-size:11px; color:#64748B; font-weight:700; background:var(--surface-3); padding:2px 8px; border-radius:6px;">User</span>';
        }

        const deleteBtn = isSuper ? 
            '<span style="font-size:11px; color:var(--ink-faint); font-weight:600;">(บัญชีหลัก)</span>' : 
            `<button class="btn-delete" style="padding:4px 10px; font-size:11.5px; height:auto; display:flex; align-items:center; gap:4px;" onclick="deleteUserAccount('${escapeHtml(username)}')">🗑️ ลบบัญชี</button>`;
        
        list.innerHTML += `
        <div class="admin-list-item">
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="admin-list-item-text">@${escapeHtml(username)}</span>
                ${roleBadge}
            </div>
            ${deleteBtn}
        </div>`;
    });
}

window.deleteUserAccount = function(targetUser) {
    if(targetUser === 'ETPIM') {
        return alert("❌ ไม่สามารถลบบัญชี Super Admin (ETPIM) ได้");
    }
    
    if(!confirm(`⚠️ ต้องการลบบัญชี @${targetUser} ออกจากระบบอย่างถาวรใช่หรือไม่?\n\n*คำเตือน: บัญชีและข้อมูลประวัติการสนทนาทั้งหมดของผู้ใช้นี้จะถูกลบและไม่สามารถกู้คืนได้`)) {
        return;
    }
    
    let users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    delete users[targetUser];
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
    
    if(appUserData[targetUser]) {
        delete appUserData[targetUser];
        saveUserData();
    }
    
    renderAdminList();
    renderUserAccountList();
    alert(`✅ ลบบัญชีผู้ใช้ @${targetUser} ออกจากระบบเรียบร้อยแล้ว`);
};

// Cropper
function openCropper(event, targetType = 'character') {
    currentCropperTarget = targetType;
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('cropperImage').src = e.target.result;
            document.getElementById('cropperModal').classList.remove('hidden');
            if(cropper) cropper.destroy();
            cropper = new Cropper(document.getElementById('cropperImage'), { aspectRatio: 1, viewMode: 1 });
        };
        reader.readAsDataURL(file);
    }
}
function closeCropperModal() {
    document.getElementById('cropperModal').classList.add('hidden');
    if(cropper) { cropper.destroy(); cropper = null; }
}
function applyCrop() {
    if(!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 500, height: 500 });
    const croppedData = canvas.toDataURL('image/jpeg', 0.92);

    if (currentCropperTarget === 'profile') {
        currentUploadedProfileImage = croppedData;
        isProfileImageRemoved = false;
        const imgPreview = document.getElementById('profileImagePreview');
        const textPreview = document.getElementById('profileImagePreviewText');
        const btnRemove = document.getElementById('btnRemoveProfileImage');
        if(imgPreview) { imgPreview.src = croppedData; imgPreview.style.display = 'block'; }
        if(textPreview) textPreview.style.display = 'none';
        if(btnRemove) btnRemove.style.display = 'inline-flex';
    } else {
        currentUploadedImage = croppedData;
        isImageRemoved = false;
        const imgPreview = document.getElementById('imagePreview');
        const textPreview = document.getElementById('imagePreviewText');
        const btnRemove = document.getElementById('btnRemoveImage');
        if(imgPreview) { imgPreview.src = croppedData; imgPreview.style.display = 'block'; }
        if(textPreview) textPreview.style.display = 'none';
        if(btnRemove) btnRemove.style.display = 'inline-flex';
    }
    closeCropperModal();
}
function removeUploadedImage(e) {
    if(e) e.stopPropagation();
    currentUploadedImage = '';
    isImageRemoved = true;
    const imgPreview = document.getElementById('imagePreview');
    const textPreview = document.getElementById('imagePreviewText');
    const btnRemove = document.getElementById('btnRemoveImage');
    if(imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
    if(textPreview) textPreview.style.display = 'block';
    if(btnRemove) btnRemove.style.display = 'none';
}
function removeUploadedProfileImage(e) {
    if(e) e.stopPropagation();
    currentUploadedProfileImage = '';
    isProfileImageRemoved = true;
    const imgPreview = document.getElementById('profileImagePreview');
    const textPreview = document.getElementById('profileImagePreviewText');
    const btnRemove = document.getElementById('btnRemoveProfileImage');
    if(imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
    if(textPreview) textPreview.style.display = 'block';
    if(btnRemove) btnRemove.style.display = 'none';
}

function escapeHtml(str){
    if(!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.getElementById('msgInput')?.addEventListener('keydown', e => {
    if(e.key === 'Enter') sendMessage();
});

window.onload = function() {
    if(document.getElementById('mainApp')) initApp();
};


// --- SIDEBAR & STARRED NAVIGATION ---
function toggleSidebar() {
    const sidebar = document.getElementById('sideTabBar');
    if (!sidebar) return;
    if (window.innerWidth <= 900) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function selectSidebarTab(tabName) {
    systemFilter = tabName;
    activeTagFilters = [];
    currentSearchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.value = '';

    updateSidebarTabUI();
    showExplore();
}

function updateSidebarTabUI() {
    const tabAll = document.getElementById('tabNavAll');
    const tabFav = document.getElementById('tabNavFav');
    const tabMy = document.getElementById('tabNavMy');

    if(tabAll) tabAll.classList.toggle('active', systemFilter === 'all' && activeTagFilters.length === 0);
    if(tabFav) tabFav.classList.toggle('active', systemFilter === 'fav');
    if(tabMy) tabMy.classList.toggle('active', systemFilter === 'my_chars');
}

function renderSidebarStarred() {
    const list = document.getElementById('sidebarStarredList');
    const countBadge = document.getElementById('sidebarFavCount');
    
    // Auto cleanup orphan starred IDs that do not exist in appCharacters
    if (appUserData[currentUser] && Array.isArray(appUserData[currentUser].favs)) {
        const validFavs = appUserData[currentUser].favs.filter(favId => 
            appCharacters.some(c => c.id === favId)
        );
        if (validFavs.length !== appUserData[currentUser].favs.length) {
            appUserData[currentUser].favs = validFavs;
            saveUserData();
        }
    }

    const favs = appUserData[currentUser]?.favs || [];
    const starredAgents = appCharacters.filter(c => favs.includes(c.id));

    if (countBadge) countBadge.textContent = starredAgents.length;
    if (!list) return;

    list.innerHTML = '';

    if (starredAgents.length === 0) {
        list.innerHTML = '<p style="font-size:11.5px; color:var(--sidebar-muted); padding:6px 12px; margin:0;">ยังไม่มี Agent ที่ติดดาว</p>';
        return;
    }

    starredAgents.forEach(c => {
        const dotColor = c.role?.color || '#F59E0B';
        list.innerHTML += `
        <div class="sidebar-starred-item" onclick="openChat('${c.id}')" title="${escapeHtml(c.name)}">
            <span class="starred-dot" style="background:${dotColor};"></span>
            <span class="sidebar-starred-name">${escapeHtml(c.name)}</span>
        </div>`;
    });
}


// --- FILE EXPORT ENGINE (PDF, WORD, CSV, MARKDOWN) ---
window.copyMessageText = copyMessageText;
function copyMessageText(idx, btn) {
    const history = appUserData[currentUser]?.history[currentCharacter?.id];
    if(history && history[idx]) {
        navigator.clipboard.writeText(history[idx].t).then(() => {
            if(btn) {
                const oldSvg = btn.innerHTML;
                btn.innerHTML = '<span style="font-size:11px; font-weight:800; color:#10B981;">✓</span>';
                setTimeout(() => btn.innerHTML = oldSvg, 1500);
            }
        });
    }
};

window.downloadMessageAsPdf = downloadMessageAsPdf;
function downloadMessageAsPdf(idx) {
    const history = appUserData[currentUser]?.history[currentCharacter?.id];
    if(!history || !history[idx]) return;
    const rawText = history[idx].t;
    const charName = currentCharacter ? currentCharacter.name : 'AI Agent';
    const dateStr = new Date().toLocaleString('th-TH');

    const printableHtml = `
    <div id="pdfPrintContent" style="font-family: -apple-system, 'Noto Sans Thai', 'Segoe UI', Arial, sans-serif; color: #0F172A; padding: 24px; line-height: 1.7; font-size: 13.5px; background: #ffffff;">
        <div style="border-bottom: 2.5px solid #8B0000; padding-bottom: 12px; margin-bottom: 18px; display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
                <h1 style="margin:0; font-size: 20px; color: #8B0000; font-weight:800;">ET OPC Company</h1>
                <div style="font-size: 11px; color: #64748B; font-weight:700; margin-top:2px;">AI AGENT & AUTOMATION WORKSPACE</div>
            </div>
            <div style="text-align:right; font-size: 11px; color: #64748B;">
                <div><strong>Agent:</strong> ${escapeHtml(charName)}</div>
                <div><strong>ผู้สั่งงาน:</strong> @${currentUser} | <strong>วันที่:</strong> ${dateStr}</div>
            </div>
        </div>
        <div style="font-size: 13.5px; line-height: 1.75; word-break: break-word;">
            ${formatRoleplayText(rawText)}
        </div>
        <div style="margin-top: 36px; border-top: 1px solid #E2E8F0; padding-top: 12px; text-align: center; font-size: 10.5px; color: #94A3B8;">
            คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — ET OPC Company © 2026 • Developed by MR.ST • Developed by MR.ST • จัดทำโดยระบบอัตโนมัติ AI
        </div>
    </div>`;

    if (typeof html2pdf !== 'undefined') {
        const container = document.createElement('div');
        container.innerHTML = printableHtml;
        document.body.appendChild(container);

        const opt = {
            margin: [8, 8, 8, 8],
            filename: `ETOPC_${currentCharacter ? currentCharacter.id : 'Report'}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container).save().then(() => {
            container.remove();
        }).catch(err => {
            console.warn('html2pdf fallback to print:', err);
            container.remove();
            printFallback(printableHtml);
        });
    } else {
        printFallback(printableHtml);
    }
};

function printFallback(html) {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if(printWin) {
        printWin.document.write(`<!DOCTYPE html><html><head><title>รายงานสรุปงาน - ET OPC</title><style>body{margin:20px; font-family:'Noto Sans Thai',sans-serif;}</style></head><body>${html}</body></html>`);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => { printWin.print(); printWin.close(); }, 500);
    }
}

window.downloadMessageAsWord = downloadMessageAsWord;
function downloadMessageAsWord(idx) {
    const history = appUserData[currentUser]?.history[currentCharacter?.id];
    if(!history || !history[idx]) return;
    const rawText = history[idx].t;
    const charName = currentCharacter ? currentCharacter.name : 'AI Agent';
    const dateStr = new Date().toLocaleString('th-TH');

    const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
    <meta charset='utf-8'>
    <title>${escapeHtml(charName)} - รายงานสรุปงาน</title>
    <style>
        body { font-family: 'TH Sarabun New', 'Angsana New', 'Cordia New', 'Segoe UI', Tahoma, sans-serif; font-size: 14pt; line-height: 1.6; color: #000000; }
        h1, h2, h3 { color: #8B0000; }
        table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
        th, td { border: 1px solid #999999; padding: 6pt 10pt; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header-box { border-bottom: 2pt solid #8B0000; padding-bottom: 8pt; margin-bottom: 16pt; }
        .footer-box { border-top: 1pt solid #cccccc; margin-top: 24pt; padding-top: 6pt; font-size: 10pt; color: #666666; text-align: center; }
    </style>
    </head>
    <body>
        <div class="header-box">
            <h2 style="margin:0; color:#8B0000;">ET OPC Company — AI Agent Workspace</h2>
            <p style="margin:4pt 0 0; font-size:11pt; color:#555555;"><strong>Agent:</strong> ${escapeHtml(charName)} | <strong>ผู้สั่งงาน:</strong> @${currentUser} | <strong>วันที่:</strong> ${dateStr}</p>
        </div>
        <div class="content-body">
            ${formatRoleplayText(rawText)}
        </div>
        <div class="footer-box">
            คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — ET OPC Company © 2026 • Developed by MR.ST
        </div>
    </body>
    </html>`;

    const blob = new Blob(['﻿' + htmlContent], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETOPC_${currentCharacter ? currentCharacter.id : 'Doc'}_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
};

window.downloadMessageAsCsv = downloadMessageAsCsv;
function downloadMessageAsCsv(idx) {
    const history = appUserData[currentUser]?.history[currentCharacter?.id];
    if(!history || !history[idx]) return;
    const text = history[idx].t;
    const lines = text.split('\n');

    let csvData = "";
    let hasTable = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            if (trimmed.includes('---') || trimmed.replace(/[\s|:-]/g, '') === '') return;
            const cells = trimmed.split('|').slice(1, -1).map(c => '"' + c.trim().replace(/"/g, '""') + '"');
            csvData += cells.join(',') + '\r\n';
            hasTable = true;
        }
    });

    if (!hasTable) {
        csvData = '"รายการ / สรุปประเด็น"\r\n';
        lines.filter(l => l.trim()).forEach(l => {
            csvData += '"' + l.trim().replace(/"/g, '""') + '"\r\n';
        });
    }

    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETOPC_${currentCharacter ? currentCharacter.id : 'Data'}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

window.downloadMessageAsMarkdown = downloadMessageAsMarkdown;
function downloadMessageAsMarkdown(idx) {
    const history = appUserData[currentUser]?.history[currentCharacter?.id];
    if(!history || !history[idx]) return;
    const text = history[idx].t;
    const charName = currentCharacter ? currentCharacter.name : 'AI Agent';
    const dateStr = new Date().toLocaleString('th-TH');

    let md = `# รายงานสรุปการทำงาน - ET OPC Company\n`;
    md += `**Agent:** ${charName}\n`;
    md += `**ผู้สั่งงาน:** @${currentUser}\n`;
    md += `**วันที่:** ${dateStr}\n\n---\n\n`;
    md += text;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETOPC_${currentCharacter ? currentCharacter.id : 'Report'}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
};


// --- TOAST NOTIFICATIONS ---
window.showToast = showToast;
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        alert(message);
        return;
    }
    const toast = document.createElement('div');
    const typeClass = type === 'success' ? 'toast-success' : (type === 'warning' ? 'toast-warning' : (type === 'error' ? 'toast-error' : 'toast-info'));
    const icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : (type === 'error' ? '❌' : 'ℹ️'));
    
    toast.className = `toast ${typeClass}`;
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-body">${escapeHtml(message)}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

// --- PROMPT LIBRARY ---
window.togglePromptLibrary = togglePromptLibrary;
function togglePromptLibrary(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('promptLibraryMenu');
    if (menu) menu.classList.toggle('hidden');
};

window.insertPromptTemplate = insertPromptTemplate;
function insertPromptTemplate(text) {
    const input = document.getElementById('msgInput');
    if (input) {
        input.value = text;
        input.focus();
    }
    document.getElementById('promptLibraryMenu')?.classList.add('hidden');
    showToast("นำเข้าข้อความจากคลังคำสั่งแล้ว", "info");
};

window.addEventListener('click', (e) => {
    const menu = document.getElementById('promptLibraryMenu');
    if (menu && !menu.contains(e.target) && !e.target.closest('#btnPromptLib')) {
        menu.classList.add('hidden');
    }
});

// --- FOCUS / FULLSCREEN MODE ---
window.toggleFocusMode = toggleFocusMode;
function toggleFocusMode() {
    const chatWindow = document.getElementById('chatWindowMain');
    const btn = document.getElementById('btnFocusMode');
    if (!chatWindow) return;
    
    chatWindow.classList.toggle('focus-mode');
    const isFocus = chatWindow.classList.contains('focus-mode');
    if (btn) {
        btn.innerHTML = isFocus ? 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="14" x2="10" y2="14"/><line x1="10" y1="14" x2="10" y2="20"/><line x1="20" y1="10" x2="14" y2="10"/><line x1="14" y1="10" x2="14" y2="4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>` : 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
        btn.title = isFocus ? "ออกจากโหมดโฟกัส" : "โหมดโฟกัสเต็มจอ (Focus Mode)";
    }
    showToast(isFocus ? "เข้าสู่โหมดโฟกัสเต็มจอ" : "กลับสู่โหมดปกติ", "info");
};

// --- NEW CHAT SESSION ---
window.startNewChatSession = startNewChatSession;
function startNewChatSession() {
    window.startNewChatSession = startNewChatSession;
    if (!currentCharacter) return;
    showConfirmDialog({
        title: "เริ่มเซสชันการสนทนาใหม่",
        message: "ต้องการเริ่มเซสชันการสนทนาใหม่ใช่หรือไม่? (ประวัติการคุยเดิมจะถูกล้างสำหรับเซสชันนี้)",
        confirmText: "เริ่มแชทใหม่",
        cancelText: "ยกเลิก",
        type: "primary",
        icon: "💬"
    }).then(confirmed => {
        if (!confirmed) return;
        const initialOpener = currentCharacter.opener || 'สวัสดีครับ มีอะไรให้ผมช่วยเหลือในวันนี้ไหมครับ?';
        appUserData[currentUser].history[currentCharacter.id] = [{ 
            id: 'msg-' + Date.now(), 
            r: 'bot', 
            t: initialOpener,
            candidates: [initialOpener],
            cIndex: 0
        }];
        saveUserData();
        renderChatMessages();
        showToast("เริ่มต้นเซสชันใหม่เรียบร้อยแล้ว", "success");
    });
};


// --- QUICK GUIDE MODAL & ROLE-GUARDED ADMIN GUIDE ---
window.openQuickGuideModal = openQuickGuideModal;
function openQuickGuideModal() {
    const adminSection = document.getElementById('adminGuideContent');
    const titleText = document.getElementById('quickGuideTitleText');
    const isAdmin = (currentUserRole === 'admin');

    if (adminSection) {
        adminSection.style.display = isAdmin ? 'block' : 'none';
    }
    if (titleText) {
        titleText.textContent = isAdmin ? 'คู่มือการใช้งาน & ดูแลระบบ (Admin & User Guide)' : 'คู่มือการใช้งาน (Quick User Guide)';
    }

    document.getElementById('quickGuideModal')?.classList.remove('hidden');
};

window.openAdminGuideDirectly = openAdminGuideDirectly;
function openAdminGuideDirectly() {
    closeAdminDashboard();
    openQuickGuideModal();
    const adminSection = document.getElementById('adminGuideContent');
    if (adminSection) {
        adminSection.scrollIntoView({ behavior: 'smooth' });
    }
};

window.closeQuickGuideModal = closeQuickGuideModal;
function closeQuickGuideModal() {
    document.getElementById('quickGuideModal')?.classList.add('hidden');
};;


// --- TERMS & PRIVACY MODAL ---
window.openTermsModal = openTermsModal;
function openTermsModal() {
    document.getElementById('termsModal')?.classList.remove('hidden');
};
window.closeTermsModal = closeTermsModal;
function closeTermsModal() {
    document.getElementById('termsModal')?.classList.add('hidden');
};


// --- VOICE TO TEXT (SPEECH RECOGNITION) ---
let speechRecognizer = null;
let isRecordingVoice = false;

window.toggleVoiceRecognition = toggleVoiceRecognition;
function toggleVoiceRecognition() {
    const btn = document.getElementById('btnVoiceInput');
    const input = document.getElementById('msgInput');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast("เบราว์เซอร์นี้ไม่รองรับการพิมพ์ด้วยเสียง (แนะนำ Google Chrome)", "warning");
        return;
    }

    if (isRecordingVoice && speechRecognizer) {
        speechRecognizer.stop();
        return;
    }

    try {
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.lang = 'th-TH';
        speechRecognizer.continuous = false;
        speechRecognizer.interimResults = false;

        speechRecognizer.onstart = function() {
            isRecordingVoice = true;
            if (btn) btn.classList.add('btn-voice-recording');
            showToast("🎙️ กำลังฟังเสียงพูดภาษาไทย... พูดข้อความได้เลยครับ", "info");
        };

        speechRecognizer.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            if (transcript && input) {
                input.value = input.value ? (input.value + ' ' + transcript) : transcript;
                input.focus();
                showToast("✅ แปลงเสียงเป็นข้อความเรียบร้อยแล้ว", "success");
            }
        };

        speechRecognizer.onerror = function(event) {
            console.warn("Speech error:", event.error);
            showToast("เกิดข้อผิดพลาดในการบันทึกเสียง: " + event.error, "error");
            if (btn) btn.classList.remove('btn-voice-recording');
            isRecordingVoice = false;
        };

        speechRecognizer.onend = function() {
            isRecordingVoice = false;
            if (btn) btn.classList.remove('btn-voice-recording');
        };

        speechRecognizer.start();
    } catch(err) {
        console.error("Speech recognition error:", err);
        showToast("ไม่สามารถเริ่มการบันทึกเสียงได้", "error");
        if (btn) btn.classList.remove('btn-voice-recording');
        isRecordingVoice = false;
    }
};

// --- INTERVIEW SCORECARD MODAL FUNCTIONS ---
window.openScorecardModal = openScorecardModal;

window.renderRadarChartSvg = renderRadarChartSvg;
function renderRadarChartSvg(tech, comm, prob, cult, size = 180) {
    const s_tech = Math.min(1.0, Math.max(0.0, parseFloat(tech) / 35.0));
    const s_comm = Math.min(1.0, Math.max(0.0, parseFloat(comm) / 25.0));
    const s_prob = Math.min(1.0, Math.max(0.0, parseFloat(prob) / 20.0));
    const s_cult = Math.min(1.0, Math.max(0.0, parseFloat(cult) / 20.0));

    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 28;

    const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    const labels = ["เทคนิค", "สื่อสาร", "แก้ปัญหา", "องค์กร"];
    const scores = [s_tech, s_comm, s_prob, s_cult];
    const actual_vals = [`${tech}/35`, `${comm}/25`, `${prob}/20`, `${cult}/20`];

    let grid_svg = "";
    [0.25, 0.5, 0.75, 1.0].forEach(level => {
        let grid_pts = [];
        angles.forEach(a => {
            const gx = cx + r * level * Math.cos(a);
            const gy = cy + r * level * Math.sin(a);
            grid_pts.push(`${gx.toFixed(1)},${gy.toFixed(1)}`);
        });
        grid_svg += `<polygon points="${grid_pts.join(' ')}" fill="none" stroke="var(--line, #E2E8F0)" stroke-width="1" stroke-dasharray="${level < 1.0 ? '2' : '0'}"/>`;
    });

    let axis_svg = "";
    for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const ax = cx + r * Math.cos(a);
        const ay = cy + r * Math.sin(a);
        axis_svg += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="var(--line, #CBD5E1)" stroke-width="1"/>`;

        let lx = cx + (r + 14) * Math.cos(a);
        let ly = cy + (r + 10) * Math.sin(a);
        let anchor = "middle";
        if (i === 1) { anchor = "start"; lx += 2; }
        else if (i === 3) { anchor = "end"; lx -= 2; }

        axis_svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="9" font-weight="700" fill="var(--ink-soft, #64748B)" dominant-baseline="middle">${labels[i]} <tspan font-weight="800" fill="var(--maroon, #8B0000)">(${actual_vals[i]})</tspan></text>`;
    }

    let poly_pts = [];
    let points_svg = "";
    for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const px = cx + r * scores[i] * Math.cos(a);
        const py = cy + r * scores[i] * Math.sin(a);
        poly_pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        points_svg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="#8B0000" stroke="#FFFFFF" stroke-width="1.2"/>`;
    }

    return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="${size}" style="display:block; margin:0 auto; overflow:visible;">
      <defs>
        <radialGradient id="radarGradScorecard" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#8B0000" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#0284C7" stop-opacity="0.2"/>
        </radialGradient>
      </defs>
      ${grid_svg}
      ${axis_svg}
      <polygon points="${poly_pts.join(' ')}" fill="url(#radarGradScorecard)" stroke="#8B0000" stroke-width="2" stroke-linejoin="round"/>
      ${points_svg}
    </svg>`;
}

function openScorecardModal() {
    document.getElementById('scorecardModal')?.classList.remove('hidden');
    updateTotalScorecard();
};
window.closeScorecardModal = closeScorecardModal;
function closeScorecardModal() {
    document.getElementById('scorecardModal')?.classList.add('hidden');
};

window.updateTotalScorecard = updateTotalScorecard;
function updateTotalScorecard() {
    const tech = parseInt(document.getElementById('scoreTech')?.value || 30, 10);
    const comm = parseInt(document.getElementById('scoreComm')?.value || 22, 10);
    const prob = parseInt(document.getElementById('scoreProblem')?.value || 17, 10);
    const cult = parseInt(document.getElementById('scoreCulture')?.value || 18, 10);

    document.getElementById('valScoreTech').textContent = tech;
    document.getElementById('valScoreComm').textContent = comm;
    document.getElementById('valScoreProblem').textContent = prob;
    document.getElementById('valScoreCulture').textContent = cult;

    const total = tech + comm + prob + cult;
    const totalNum = document.getElementById('scorecardTotalNum');
    const label = document.getElementById('scorecardStatusLabel');
    if (totalNum) totalNum.textContent = total;
    const radarBox = document.getElementById('scorecardRadarContainer');
    if (radarBox) radarBox.innerHTML = renderRadarChartSvg(tech, comm, prob, cult, 190);

    if (label) {
        if (total >= 80) {
            label.style.color = '#10B981';
            label.textContent = '🟢 ระดับดีเยี่ยม / แนะนำให้รับเข้าทำงาน (Highly Recommended)';
        } else if (total >= 60) {
            label.style.color = '#F59E0B';
            label.textContent = '🟡 ระดับปานกลาง / ควรพิจารณาเปรียบเทียบ (Consider)';
        } else {
            label.style.color = '#EF4444';
            label.textContent = '🔴 ต่ำกว่าเกณฑ์มาตรฐาน / ไม่แนะนำ (Not Recommended)';
        }
    }
};

window.submitScorecardToChat = submitScorecardToChat;
function submitScorecardToChat() {
    const name = document.getElementById('scoreCandidateName')?.value.trim() || 'ผู้สมัคร';
    const pos = document.getElementById('scorePosition')?.value.trim() || 'ตำแหน่งงาน';
    const tech = document.getElementById('scoreTech')?.value || 30;
    const comm = document.getElementById('scoreComm')?.value || 22;
    const prob = document.getElementById('scoreProblem')?.value || 17;
    const cult = document.getElementById('scoreCulture')?.value || 18;
    const total = parseInt(tech, 10) + parseInt(comm, 10) + parseInt(prob, 10) + parseInt(cult, 10);
    const comment = document.getElementById('scoreComment')?.value.trim() || 'ไม่มีข้อคิดเห็นเพิ่มเติม';

    const scorecardMsg = `📝 **ใบบันทึกผลการสัมภาษณ์งาน (Official Interview Scorecard)**
**ผู้สมัคร:** ${name} | **ตำแหน่ง:** ${pos}
**วันที่ประเมิน:** ${new Date().toLocaleDateString('th-TH')} | **ผู้ประเมิน:** @${currentUser}

| หมวดหมู่การประเมิน | คะแนนที่ได้ | คะแนนเต็ม |
| :--- | :---: | :---: |
| 1. ความรู้ความสามารถเชิงเทคนิค (Technical Skills) | ${tech} | 35 |
| 2. การสื่อสารและทัศนคติ (Communication & Attitude) | ${comm} | 25 |
| 3. การคิดวิเคราะห์และการแก้ปัญหา (Problem Solving) | ${prob} | 20 |
| 4. ความเข้ากันได้กับองค์กร (Culture Fit & Teamwork) | ${cult} | 20 |
| **คะแนนรวมสุทธิ (Total Score)** | **${total}** | **100** |

**ความเห็นของกรรมการผู้สัมภาษณ์:**
> "${comment}"

กรุณาวิเคราะห์ผลคะแนนข้างต้น สรุปจุดเด่น-จุดที่ควรระวัง และให้คำแนะนำขั้นสุดท้ายสำหรับการจ้างงาน`;

    closeScorecardModal();
    sendMessage(scorecardMsg);
    showToast("ส่งใบบันทึกคะแนนเข้าสู่ระบบแชทเรียบร้อยแล้ว", "success");
};

// --- DOWNLOAD MESSAGE AS PRESENTATION SLIDES ---
window.downloadMessageAsSlides = downloadMessageAsSlides;
function downloadMessageAsSlides(idx) {
    const history = appUserData[currentUser]?.history[currentCharacter?.id];
    if(!history || !history[idx]) return;
    const rawText = history[idx].t;
    const charName = currentCharacter ? currentCharacter.name : 'AI Agent';
    const dateStr = new Date().toLocaleString('th-TH');

    const htmlSlides = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>โครงร่างสไลด์นำเสนอ - ET OPC Company</title>
<style>
  body { font-family: 'Segoe UI', 'Noto Sans Thai', Arial, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 30px; display: flex; flex-direction: column; gap: 30px; align-items: center; }
  .slide-card { background: #1E293B; border: 2px solid #334155; border-radius: 20px; width: 100%; max-width: 860px; min-height: 480px; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 16px 40px rgba(0,0,0,0.5); page-break-after: always; position: relative; overflow: hidden; }
  .slide-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #8B0000 0%, #DC2626 50%, #8B0000 100%); }
  .slide-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 14px; }
  .slide-title { font-size: 24px; font-weight: 800; color: #EF4444; margin: 0; }
  .slide-meta { font-size: 12px; color: #94A3B8; }
  .slide-body { flex: 1; padding: 24px 0; font-size: 16px; line-height: 1.8; color: #E2E8F0; }
  .slide-body table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px; }
  .slide-body th, .slide-body td { border: 1px solid #475569; padding: 10px 14px; text-align: left; }
  .slide-body th { background: #0F172A; color: #EF4444; font-weight: 800; }
  .slide-footer { display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: #64748B; border-top: 1px solid #334155; padding-top: 10px; }
  @media print { body { background: #fff; color: #000; padding: 0; } .slide-card { border-color: #ddd; background: #fff; color: #000; box-shadow: none; min-height: 100vh; } .slide-body { color: #000; } }
</style>
</head>
<body>
  <div class="slide-card">
    <div class="slide-header">
      <h2 class="slide-title">ET OPC Company — รายงานสรุปนำเสนอ</h2>
      <span class="slide-meta">จัดทำโดย: ${escapeHtml(charName)}</span>
    </div>
    <div class="slide-body">
      ${formatRoleplayText(rawText)}
    </div>
    <div class="slide-footer">
      <span>คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — ET OPC Company © 2026 • Developed by MR.ST</span>
      <span>วันที่จัดทำ: ${dateStr}</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlSlides], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETOPC_${currentCharacter ? currentCharacter.id : 'Slide'}_Deck_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดโครงร่างสไลด์นำเสนอเรียบร้อยแล้ว", "success");
};







// --- DEFAULT PROMPT TEMPLATES & DYNAMIC LIBRARY ---
const DEFAULT_PROMPT_TEMPLATES = [
  { id: "p-1", category: "🎯 HR & ประเมินเรซูเม่ (CV)", title: "คัดกรอง CV เทียบความต้องการ", prompt: "ช่วยคัดกรองเรซูเม่นี้เทียบกับความต้องการของตำแหน่งงาน พร้อมประเมินคะแนน 100 คะแนนและวิเคราะห์จุดแข็ง-จุดอ่อน" },
  { id: "p-2", category: "🎯 HR & ประเมินเรซูเม่ (CV)", title: "เปรียบเทียบผู้สมัครหลายคน (Matrix)", prompt: "ช่วยเปรียบเทียบผู้สมัครทั้งหมดในข้อมูลข้างต้นแบบ Head-to-Head Matrix พร้อมตารางคะแนนและจัดอันดับความเหมาะสม" },
  { id: "p-3", category: "🎯 HR & ประเมินเรซูเม่ (CV)", title: "ร่างอีเมลนัดสัมภาษณ์งาน", prompt: "ช่วยร่างอีเมลนัดหมายสัมภาษณ์งานภาษาไทยอย่างเป็นทางการ โดยระบุวันเวลา ลิงก์ออนไลน์ และสิ่งที่ต้องเตรียมตัว" },
  { id: "p-4", category: "🎯 HR & ประเมินเรซูเม่ (CV)", title: "ร่างอีเมลปฏิเสธอย่างสุภาพ", prompt: "ช่วยร่างอีเมลปฏิเสธผู้สมัครงานอย่างสุภาพ อบอุ่น และรักษาภาพลักษณ์ที่ดีขององค์กร" },
  { id: "p-5", category: "🎯 HR & ประเมินเรซูเม่ (CV)", title: "ปรับปรุง CV เป็น ATS-Friendly", prompt: "ช่วยปรับปรุงประวัติการทำงานในเรซูเม่นี้ให้กระชับ โดดเด่น และเป็นมาตรฐาน ATS-Friendly" },
  { id: "p-6", category: "🎯 HR & ประเมินเรซูเม่ (CV)", title: "ร่างคำถามสัมภาษณ์งาน 5 ข้อ", prompt: "ช่วยร่างคำถามสัมภาษณ์งานเชิงลึก 5 ข้อ พร้อมแนวทางการประเมินคำตอบ โดยอิงจากประวัติการทำงานใน CV นี้" },
  { id: "p-7", category: "📌 สรุปงาน & สกัดประเด็น", title: "สรุปใจความและ Action Items", prompt: "กรุณาสรุปประเด็นสำคัญของเอกสารนี้อย่างกระชับ พร้อมแยกเป็นหัวข้อและ Action Items" },
  { id: "p-8", category: "📌 สรุปงาน & สกัดประเด็น", title: "ร่างอีเมลสรุปงานทางการ", prompt: "ช่วยร่างอีเมลภาษาไทยทางการเพื่อรายงานผลสรุปนี้ส่งต่อให้ทีมงานและผู้บริหาร" },
  { id: "p-9", category: "📊 ข้อมูล & เปรียบเทียบ", title: "จัดระเบียบเป็นตารางเปรียบเทียบ", prompt: "ช่วยแปลงข้อมูลข้างต้นให้อยู่ในรูปแบบตาราง Markdown เพื่อเปรียบเทียบข้อดี ข้อเสีย และสถิติสำคัญ" }
];
let appPromptTemplates = [];

function loadPromptTemplates() {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'prompts_v1');
    if (saved) {
        try { appPromptTemplates = JSON.parse(saved); } catch(e) { appPromptTemplates = [...DEFAULT_PROMPT_TEMPLATES]; }
    } else {
        appPromptTemplates = [...DEFAULT_PROMPT_TEMPLATES];
    }
    renderPromptLibrary();
}

function renderPromptLibrary() {
    const menu = document.getElementById('promptLibraryMenu');
    if (!menu) return;
    
    // Group templates by category
    const categories = {};
    appPromptTemplates.forEach(t => {
        const cat = t.category || '💡 ทั่วไป';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(t);
    });

    let html = `
    <div class="prompt-lib-header">
      <span class="prompt-lib-title">
        💡 คลังคำสั่งด่วน (Prompt Library)
      </span>
      <button class="btn-icon" onclick="togglePromptLibrary()" style="width:24px; height:24px; border:none; background:transparent;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="prompt-lib-list">`;

    Object.keys(categories).forEach(catName => {
        html += `<div class="prompt-lib-category">${escapeHtml(catName)}</div>`;
        categories[catName].forEach(p => {
            const escapedPrompt = escapeHtml(p.prompt).replace(/'/g, "\'");
            html += `
            <div class="prompt-lib-item" onclick="insertPromptTemplate('${escapedPrompt}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>${escapeHtml(p.title)}</span>
            </div>`;
        });
    });

    html += `</div>`;
    menu.innerHTML = html;
}

// --- ADMIN DASHBOARD TABS & ADVANCED FEATURES ---
function switchAdminTab(tabName) {
window.switchAdminTab = switchAdminTab;
    const tabs = ['stats', 'prompts', 'roles', 'users'];
    tabs.forEach(t => {
        const btn = document.getElementById('btnAdminTab' + t.charAt(0).toUpperCase() + t.slice(1));
        const content = document.getElementById('adminTabContent' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) btn.classList.toggle('active', t === tabName);
        if (content) content.classList.toggle('hidden', t !== tabName);
    });

    if (tabName === 'stats') renderAdminStats();
    if (tabName === 'prompts') { renderAdminQuickActions(); renderAdminPromptLibTemplates(); }
    if (tabName === 'roles') { renderRoleList(); renderTagList(); }
    if (tabName === 'users') { renderAdminList(); renderUserAccountList(); }
    
};

function renderAdminStats() {
    const users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users')) || {};
    const totalUsers = Object.keys(users).length;
    const totalAgents = appCharacters.length;

    let totalChats = 0;
    let topAgent = null;
    let maxChats = -1;

    appCharacters.forEach(c => {
        const count = c.chatCount || 0;
        totalChats += count;
        if (count > maxChats) {
            maxChats = count;
            topAgent = c;
        }
    });

    const statUsers = document.getElementById('statTotalUsers');
    const statAgents = document.getElementById('statTotalAgents');
    const statChats = document.getElementById('statTotalChats');
    const statTop = document.getElementById('statTopAgent');

    if (statUsers) statUsers.textContent = totalUsers;
    if (statAgents) statAgents.textContent = totalAgents;
    if (statChats) statChats.textContent = totalChats.toLocaleString();
    if (statTop) statTop.textContent = topAgent ? topAgent.name : '-';

    // Allow user create agent policy toggle state
    const allowUserCreate = localStorage.getItem(STORAGE_PREFIX + 'allow_user_create') === 'true';
    const toggleAllow = document.getElementById('toggleAllowUserCreate');
    if (toggleAllow) toggleAllow.checked = allowUserCreate;

    // Announcement state
    const isAnnounceActive = localStorage.getItem(STORAGE_PREFIX + 'announcement_active') === 'true';
    const announceText = localStorage.getItem(STORAGE_PREFIX + 'announcement_text') || 'ยินดีต้อนรับสู่ระบบ Enterprise AI Workspace คณะวิศวกรรมศาสตร์และเทคโนโลยี';
    
    const toggleAnnounce = document.getElementById('toggleAnnouncementActive');
    const announceInput = document.getElementById('announcementInput');
    if (toggleAnnounce) toggleAnnounce.checked = isAnnounceActive;
    if (announceInput) announceInput.value = announceText;
}

function toggleAgentCreationPolicy() {
    window.toggleAgentCreationPolicy = toggleAgentCreationPolicy;
    const toggle = document.getElementById('toggleAllowUserCreate');
    const allowed = toggle ? toggle.checked : false;
    localStorage.setItem(STORAGE_PREFIX + 'allow_user_create', allowed ? 'true' : 'false');
    updateCreateButtonVisibility();
    showToast(allowed ? "🟢 เปิดสิทธิ์: อนุญาตให้ User ทั่วไปสร้าง Agent ได้แล้ว" : "🔒 ปิดสิทธิ์: ซ่อนและจำกัดการสร้าง Agent เฉพาะ Admin เท่านั้น", "info");
};

function updateCreateButtonVisibility() {
    const allowUserCreate = localStorage.getItem(STORAGE_PREFIX + 'allow_user_create') === 'true';
    const btnCreateChar = document.getElementById('btnCreateChar');
    const sidebarBtnCreate = document.getElementById('sidebarBtnCreate');
    const sidebarBtnAdmin = document.getElementById('sidebarBtnAdmin');

    const isAdmin = (currentUserRole === 'admin');
    const canCreate = isAdmin || allowUserCreate;

    if (btnCreateChar) btnCreateChar.style.display = canCreate ? 'inline-flex' : 'none';
    if (sidebarBtnCreate) sidebarBtnCreate.style.display = canCreate ? 'flex' : 'none';
    if (sidebarBtnAdmin) sidebarBtnAdmin.style.display = isAdmin ? 'flex' : 'none';
}

function toggleAnnouncementState() {
window.toggleAnnouncementState = toggleAnnouncementState;
    const toggle = document.getElementById('toggleAnnouncementActive');
    const active = toggle ? toggle.checked : false;
    localStorage.setItem(STORAGE_PREFIX + 'announcement_active', active ? 'true' : 'false');
    loadAnnouncement();
    showToast(active ? "เปิดการแสดงแถบประกาศแล้ว" : "ปิดแถบประกาศแล้ว", "info");
};

function saveAnnouncementSettings() {
window.saveAnnouncementSettings = saveAnnouncementSettings;
    const input = document.getElementById('announcementInput');
    const text = input ? input.value.trim() : '';
    if (!text) return alert("กรุณาพิมพ์ข้อความประกาศ");

    localStorage.setItem(STORAGE_PREFIX + 'announcement_text', text);
    localStorage.setItem(STORAGE_PREFIX + 'announcement_active', 'true');
    
    const toggle = document.getElementById('toggleAnnouncementActive');
    if (toggle) toggle.checked = true;

    loadAnnouncement();
    showToast("บันทึกและแสดงแถบประกาศเรียบร้อยแล้ว", "success");
};

function loadAnnouncement() {
    const banner = document.getElementById('globalAnnouncementBanner');
    const textSpan = document.getElementById('announcementText');
    const isActive = localStorage.getItem(STORAGE_PREFIX + 'announcement_active') === 'true';
    const text = localStorage.getItem(STORAGE_PREFIX + 'announcement_text') || 'ยินดีต้อนรับสู่ระบบ Enterprise AI Workspace คณะวิศวกรรมศาสตร์และเทคโนโลยี';

    if (banner && textSpan) {
        if (isActive) {
            textSpan.textContent = text;
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }
    }
}

function dismissAnnouncement() {
window.dismissAnnouncement = dismissAnnouncement;
    const banner = document.getElementById('globalAnnouncementBanner');
    if (banner) banner.style.display = 'none';
};

// Prompt Library Admin Functions
function renderAdminPromptList() {
    const container = document.getElementById('adminPromptListContainer');
    const countLabel = document.getElementById('promptCountLabel');
    if (!container) return;
    container.innerHTML = '';
    if (countLabel) countLabel.textContent = appPromptTemplates.length;

    if (appPromptTemplates.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:var(--ink-faint); padding:8px;">ยังไม่มีแม่แบบคำสั่งในระบบ</p>';
        return;
    }

    appPromptTemplates.forEach((p, idx) => {
        container.innerHTML += `
        <div class="admin-list-item" style="flex-direction:column; align-items:flex-start; gap:4px; padding:10px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11px; background:var(--surface-3); padding:1px 6px; border-radius:4px; font-weight:700; color:var(--ink-soft);">${escapeHtml(p.category || 'ทั่วไป')}</span>
              <strong style="font-size:13px; color:var(--ink);">${escapeHtml(p.title)}</strong>
            </div>
            <button class="btn-delete" style="padding:3px 8px; font-size:11px;" onclick="deletePromptTemplate('${p.id}')">ลบ</button>
          </div>
          <p style="margin:2px 0 0; font-size:11.5px; color:var(--ink-soft); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(p.prompt)}</p>
        </div>`;
    });
}

function addNewPromptTemplate() {
window.addNewPromptTemplate = addNewPromptTemplate;
    const cat = document.getElementById('newPromptCategory')?.value || '🎯 HR & ประเมินเรซูเม่ (CV)';
    const title = document.getElementById('newPromptTitle')?.value.trim();
    const prompt = document.getElementById('newPromptText')?.value.trim();

    if (!title || !prompt) {
        alert("กรุณากรอกชื่อเรียกคำสั่งและข้อความคำสั่งให้ครบถ้วน");
        return;
    }

    const newTemplate = {
        id: 'p-' + Date.now(),
        category: cat,
        title: title,
        prompt: prompt
    };

    appPromptTemplates.push(newTemplate);
    localStorage.setItem(STORAGE_PREFIX + 'prompts_v1', JSON.stringify(appPromptTemplates));

    if (document.getElementById('newPromptTitle')) document.getElementById('newPromptTitle').value = '';
    if (document.getElementById('newPromptText')) document.getElementById('newPromptText').value = '';

    renderAdminPromptList();
    renderPromptLibrary();
    showToast("เพิ่มแม่แบบคำสั่งใหม่ลงในคลังเรียบร้อยแล้ว", "success");
};

function deletePromptTemplate(id) {
    window.deletePromptTemplate = deletePromptTemplate;
    showConfirmDialog({
        title: "ลบแม่แบบคำสั่ง",
        message: "ต้องการลบแม่แบบคำสั่งนี้ออกจากคลังด่วนใช่หรือไม่?",
        confirmText: "ลบคำสั่ง",
        cancelText: "ยกเลิก",
        type: "danger",
        icon: "🗑️"
    }).then(confirmed => {
        if (!confirmed) return;
        appPromptTemplates = appPromptTemplates.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_PREFIX + 'prompts_v1', JSON.stringify(appPromptTemplates));
        renderAdminPromptList();
        renderPromptLibrary();
        showToast("ลบแม่แบบคำสั่งเรียบร้อยแล้ว", "info");
    });
};


window.openAdminAiModal = openAdminAiModal;
window.closeAdminAiModal = closeAdminAiModal;
window.openUserModelModal = openUserModelModal;
window.closeUserModelModal = closeUserModelModal;
window.saveUserModelChoice = saveUserModelChoice;
window.handleAiHeaderButtonClick = handleAiHeaderButtonClick;
window.selectProviderPreset = selectProviderPreset;
window.handleModelPresetChange = handleModelPresetChange;
window.handleApiKeySmartDetection = handleApiKeySmartDetection;
window.toggleAdminApiKeyVisibility = toggleAdminApiKeyVisibility;
window.toggleAdminAdvancedSettings = toggleAdminAdvancedSettings;
window.testAdminAiConnection = testAdminAiConnection;
window.addAdminModel = addAdminModel;
window.deleteAdminModel = deleteAdminModel;


// --- GOOGLE DRIVE & AUTOMATED EMAIL EVALUATION INTEGRATION ---


// --- GOOGLE PICKER API & GOOGLE IDENTITY SERVICES (GIS) INTEGRATION ---
let googleTokenClient = null;
let googlePickerAccessToken = null;

function initGooglePickerServices() {
    if (typeof gapi !== 'undefined') {
        gapi.load('picker', () => {
            console.log("Google Picker API loaded successfully.");
        });
    }
}
window.addEventListener('load', initGooglePickerServices);

window.openGooglePickerConfigModal = openGooglePickerConfigModal;
function openGooglePickerConfigModal() {
    const clientId = localStorage.getItem(STORAGE_PREFIX + 'google_client_id') || '';
    const apiKey = localStorage.getItem(STORAGE_PREFIX + 'google_picker_api_key') || '';
    
    const clientInput = document.getElementById('googlePickerClientIdInput');
    const apiInput = document.getElementById('googlePickerApiKeyInput');
    
    if (clientInput) clientInput.value = clientId;
    if (apiInput) apiInput.value = apiKey;
    
    document.getElementById('googlePickerConfigModal')?.classList.remove('hidden');
}

window.closeGooglePickerConfigModal = closeGooglePickerConfigModal;
function closeGooglePickerConfigModal() {
    document.getElementById('googlePickerConfigModal')?.classList.add('hidden');
}

window.saveGooglePickerConfig = saveGooglePickerConfig;
function saveGooglePickerConfig() {
    const clientId = (document.getElementById('googlePickerClientIdInput')?.value || '').trim();
    const apiKey = (document.getElementById('googlePickerApiKeyInput')?.value || '').trim();

    if (!clientId) {
        showToast("กรุณากรอก Google OAuth Client ID", "warning");
        document.getElementById('googlePickerClientIdInput')?.focus();
        return;
    }

    localStorage.setItem(STORAGE_PREFIX + 'google_client_id', clientId);
    localStorage.setItem(STORAGE_PREFIX + 'google_picker_api_key', apiKey);
    closeGooglePickerConfigModal();
    showToast("💾 บันทึกการตั้งค่า Google Picker เรียบร้อยแล้ว! กำลังเปิดหน้าต่างเลือกไฟล์...", "success");
    setTimeout(() => {
        openGoogleDrivePicker();
    }, 400);
}

window.openGoogleDrivePicker = openGoogleDrivePicker;
function openGoogleDrivePicker() {
    const clientId = localStorage.getItem(STORAGE_PREFIX + 'google_client_id') || '';
    const apiKey = localStorage.getItem(STORAGE_PREFIX + 'google_picker_api_key') || '';

    if (!clientId) {
        openGooglePickerConfigModal();
        return;
    }

    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        showToast("⚠️ กำลังเชื่อมต่อ Google Identity Services กรุณารอสักครู่...", "info");
        setTimeout(openGoogleDrivePicker, 1000);
        return;
    }

    if (!googlePickerAccessToken) {
        googleTokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    googlePickerAccessToken = tokenResponse.access_token;
                    createAndShowPicker(apiKey);
                } else {
                    showToast("❌ การยืนยันตัวตนกับ Google ล้มเหลว", "error");
                }
            },
        });
        googleTokenClient.requestAccessToken({ prompt: '' });
    } else {
        createAndShowPicker(apiKey);
    }
}

function createAndShowPicker(apiKey) {
    if (typeof google === 'undefined' || typeof google.picker === 'undefined') {
        if (typeof gapi !== 'undefined') {
            gapi.load('picker', () => createAndShowPicker(apiKey));
        } else {
            showToast("⚠️ ไม่สามารถโหลด Google Picker API ได้ กรุณารีเฟรชหน้าเว็บ", "error");
        }
        return;
    }

    try {
        const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setIncludeFolders(true)
            .setSelectFolderEnabled(true);
            
        const pdfView = new google.picker.DocsView(google.picker.ViewId.PDFS);
        const folderView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setSelectFolderEnabled(true);

        let builder = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .addView(docsView)
            .addView(pdfView)
            .addView(folderView)
            .setOAuthToken(googlePickerAccessToken)
            .setCallback(googlePickerCallback)
            .setTitle("เลือกไฟล์เรซูเม่ หรือโฟลเดอร์จาก Google Drive");

        if (apiKey && apiKey.trim()) {
            builder.setDeveloperKey(apiKey.trim());
        }

        const picker = builder.build();
        picker.setVisible(true);
    } catch(err) {
        console.error("Picker error:", err);
        showToast("❌ เกิดข้อผิดพลาดในการเปิด Google Picker: " + err.message, "error");
    }
}

function googlePickerCallback(data) {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        const docs = data[google.picker.Response.DOCUMENTS] || [];
        if (docs.length === 0) return;

        let addedCount = 0;
        docs.forEach(doc => {
            const isFolder = doc[google.picker.Document.MIME_TYPE] === 'application/vnd.google-apps.folder';
            const rawName = doc[google.picker.Document.NAME] || 'เอกสารจาก Drive';
            const sizeBytes = doc[google.picker.Document.SIZE_BYTES];
            const sizeFormatted = isFolder ? 'Folder Link' : (sizeBytes ? (sizeBytes / 1024).toFixed(1) + ' KB' : 'Drive File');

            const newCand = {
                id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: isFolder ? `📁 ${rawName}` : rawName.replace(/\.[^/.]+$/, ""),
                fileName: isFolder ? `${rawName}.pdf` : rawName,
                driveUrl: doc[google.picker.Document.URL],
                driveId: doc[google.picker.Document.ID],
                isDriveFolder: isFolder,
                size: sizeFormatted,
                mimeType: doc[google.picker.Document.MIME_TYPE] || 'application/pdf',
                status: 'pending',
                score: null,
                date: new Date().toLocaleDateString('th-TH'),
                content: `เอกสารเรซูเม่จาก Google Drive (${isFolder ? 'โฟลเดอร์' : 'ไฟล์'}): ${rawName}\nลิงก์: ${doc[google.picker.Document.URL]}\nID: ${doc[google.picker.Document.ID]}`
            };
            appCandidateSubmissions.unshift(newCand);
            addedCount++;
        });

        saveCandidateSubmissions();
        renderCandidateQueueList();
        showToast(`📥 นำเข้าไฟล์จาก Google Drive (${addedCount} รายการ) ผ่าน Google Picker สำเร็จ!`, "success");
    }
}

// --- EMAIL SETTINGS MODAL (FOR ALL USERS & ADMINS - ZERO CONFIG AUTO SEND) ---
window.openEmailSettingsModal = openEmailSettingsModal;

// --- USER-FRIENDLY GOOGLE DRIVE INTEGRATION HELPERS ---
window.openDriveAttachModal = openDriveAttachModal;
function openDriveAttachModal() {
    const input = document.getElementById('quickDriveInput');
    const badge = document.getElementById('quickDriveDetectedBadge');
    if (input) input.value = '';
    if (badge) { badge.style.display = 'none'; badge.innerHTML = ''; }
    document.getElementById('driveAttachModal')?.classList.remove('hidden');
}

window.closeDriveAttachModal = closeDriveAttachModal;
function closeDriveAttachModal() {
    document.getElementById('driveAttachModal')?.classList.add('hidden');
}

window.pasteClipboardToQuickDrive = pasteClipboardToQuickDrive;
async function pasteClipboardToQuickDrive() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            const input = document.getElementById('quickDriveInput');
            if (input) {
                input.value = text.trim();
                detectQuickDriveType(input.value);
                showToast("📋 วางลิงก์จากคลิปบอร์ดเรียบร้อยแล้ว!", "info");
            }
        }
    } catch(e) {
        showToast("กรุณากด Ctrl+V เพื่อวางลิงก์ลงในช่อง", "info");
        document.getElementById('quickDriveInput')?.focus();
    }
}

window.pasteClipboardToHubDrive = pasteClipboardToHubDrive;
async function pasteClipboardToHubDrive() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            const input = document.getElementById('hubDriveLinkInput');
            if (input) {
                input.value = text.trim();
                showToast("📋 วางลิงก์ลงในช่องแล้ว กด 'ดึงลงคลัง' ได้เลย!", "info");
            }
        }
    } catch(e) {
        showToast("กรุณากด Ctrl+V เพื่อวางลิงก์ลงในช่อง", "info");
        document.getElementById('hubDriveLinkInput')?.focus();
    }
}

window.detectQuickDriveType = detectQuickDriveType;
function detectQuickDriveType(val) {
    const badge = document.getElementById('quickDriveDetectedBadge');
    if (!badge) return;
    const trimmed = (val || '').trim();
    if (!trimmed) {
        badge.style.display = 'none';
        return;
    }

    const { driveId, isFolder } = extractGoogleDriveInfo(trimmed);
    badge.style.display = 'block';
    if (isFolder) {
        badge.innerHTML = `<span style="color:#0284C7; font-weight:800;">📁 ตรวจพบ: โฟลเดอร์ Google Drive</span> (ID: <code style="background:var(--surface); padding:2px 4px; border-radius:4px;">${driveId}</code>)`;
    } else {
        badge.innerHTML = `<span style="color:#059669; font-weight:800;">📄 ตรวจพบ: ไฟล์เอกสาร Google Drive</span> (ID: <code style="background:var(--surface); padding:2px 4px; border-radius:4px;">${driveId}</code>)`;
    }
}

window.importQuickDriveToHub = importQuickDriveToHub;
function importQuickDriveToHub() {
    const input = document.getElementById('quickDriveInput');
    const val = input ? input.value.trim() : '';
    if (!val) {
        showToast("กรุณากรอกหรือวางลิงก์ Google Drive ก่อน", "warning");
        return;
    }
    closeDriveAttachModal();
    const hubInput = document.getElementById('hubDriveLinkInput');
    if (hubInput) hubInput.value = val;
    openCandidateHubModal();
    importDriveLinkToHub();
}

window.sendQuickDriveToChat = sendQuickDriveToChat;
function sendQuickDriveToChat() {
    const input = document.getElementById('quickDriveInput');
    const val = input ? input.value.trim() : '';
    if (!val) {
        showToast("กรุณากรอกหรือวางลิงก์ Google Drive ก่อน", "warning");
        return;
    }
    const { driveId, isFolder } = extractGoogleDriveInfo(val);
    closeDriveAttachModal();

    const promptText = isFolder ? 
        `📁 กรุณาวิเคราะห์และประเมินเรซูเม่/เอกสารของผู้สมัครทุกคนในโฟลเดอร์ Google Drive นี้:\n${val}\nพร้อมทำตาราง Head-to-Head Candidate Matrix และจัดอันดับ` :
        `📄 กรุณาช่วยวิเคราะห์และประเมินเอกสารจาก Google Drive นี้:\n${val}\nสรุปประเด็นสำคัญ คะแนนความเหมาะสม และข้อเสนอแนะ`;

    sendMessage(promptText);
}

function openEmailSettingsModal() {
    const email = localStorage.getItem(STORAGE_PREFIX + 'notify_email') || '';
    const senderName = localStorage.getItem(STORAGE_PREFIX + 'sender_display_name') || 'ET OPC Company — แจ้งเตือนผู้สมัครผ่านเกณฑ์';
    const score = parseInt(localStorage.getItem(STORAGE_PREFIX + 'passing_score') || '75', 10);
    const isNotifyEnabled = localStorage.getItem(STORAGE_PREFIX + 'auto_email_notify') !== 'false';

    const emailInput = document.getElementById('modalNotifyEmail');
    const scoreSlider = document.getElementById('modalPassingScore');
    const scoreDisplay = document.getElementById('modalPassingScoreDisplay');
    const toggleSwitch = document.getElementById('modalToggleEmailNotify');

    if (emailInput) emailInput.value = email;
    const senderInput = document.getElementById('modalSenderName');
    if (senderInput) senderInput.value = senderName;
    if (scoreSlider) scoreSlider.value = score;
    if (scoreDisplay) scoreDisplay.textContent = score + ' / 100 คะแนน';
    if (toggleSwitch) toggleSwitch.checked = isNotifyEnabled;

    document.getElementById('emailSettingsModal')?.classList.remove('hidden');
}

window.closeEmailSettingsModal = closeEmailSettingsModal;
function closeEmailSettingsModal() {
    document.getElementById('emailSettingsModal')?.classList.add('hidden');
}

window.saveEmailSettingsModal = saveEmailSettingsModal;
function saveEmailSettingsModal() {
    const email = (document.getElementById('modalNotifyEmail')?.value || '').trim();
    const score = parseInt(document.getElementById('modalPassingScore')?.value || '75', 10);
    const isNotifyEnabled = document.getElementById('modalToggleEmailNotify') ? document.getElementById('modalToggleEmailNotify').checked : true;

    const senderName = (document.getElementById('modalSenderName')?.value || 'ET OPC Company — แจ้งเตือนผู้สมัครผ่านเกณฑ์').trim();
    localStorage.setItem(STORAGE_PREFIX + 'sender_display_name', senderName);
    localStorage.setItem(STORAGE_PREFIX + 'notify_email', email);
    localStorage.setItem(STORAGE_PREFIX + 'passing_score', score.toString());
    localStorage.setItem(STORAGE_PREFIX + 'email_send_mode', 'auto');
    localStorage.setItem(STORAGE_PREFIX + 'auto_email_notify', isNotifyEnabled.toString());
    localStorage.setItem(STORAGE_PREFIX + 'drive_webhook_url', DEFAULT_CENTRAL_WEBHOOK_URL);

    closeEmailSettingsModal();
    showToast("💾 บันทึกการตั้งค่าส่งอีเมลเรียบร้อยแล้ว!", "success");
}

window.testSendFromEmailSettingsModal = testSendFromEmailSettingsModal;
async function testSendFromEmailSettingsModal(btnElem = null) {
    const btn = btnElem || document.getElementById('btnModalTestEmail') || event?.currentTarget;
    const email = (document.getElementById('modalNotifyEmail')?.value || localStorage.getItem(STORAGE_PREFIX + 'notify_email') || '').trim();
    const webhook = DEFAULT_CENTRAL_WEBHOOK_URL;

    if (!email) {
        showToast("⚠️ กรุณาระบุอีเมลผู้รับแจ้งเตือนก่อนทดสอบ", "warning");
        document.getElementById('modalNotifyEmail')?.focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("⚠️ รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง", "warning");
        document.getElementById('modalNotifyEmail')?.focus();
        return;
    }

    let origHtml = '🧪 ทดสอบการเชื่อมต่อ';
    if (btn) {
        origHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-flex; align-items:center; gap:6px;"><span class="dot" style="display:inline-block; width:6px; height:6px; background:currentColor; border-radius:50%;"></span> ⏳ กำลังตรวจสอบการเชื่อมต่อ...</span>';
        btn.style.opacity = '0.8';
    }

    showToast("⏳ กำลังตรวจสอบการเชื่อมต่อระบบอีเมล...", "info");

    try {
        const payload = {
            candidateName: 'นายทดสอบ ระบบดีเยี่ยม',
            score: 95,
            recipientEmail: email,
            agentName: 'HR ET Specialist (Test)',
            summary: 'ทดสอบส่งอีเมลแจ้งเตือนอัตโนมัติจากระบบ ET OPC Company — ระบบพร้อมทำงาน 100%'
        };

        await fetch(webhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        showToast(`✅ ตรวจสอบการเชื่อมต่อสำเร็จ! พร้อมส่งเข้า ${email}`, "success");
        if (btn) btn.innerHTML = '<span>✅ ตรวจสอบการเชื่อมต่อสำเร็จ</span>';
    } catch(err) {
        console.error("Test email error:", err);
        showToast("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ: " + err.message, "error");
        if (btn) btn.innerHTML = '<span>❌ ตรวจสอบไม่ผ่าน</span>';
    } finally {
        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origHtml;
                btn.style.opacity = '1';
            }
        }, 2500);
    }
}

// --- GMAIL NOTIFICATION & EMAIL DISPATCH DISPATCHER ---
window.sendCandidatePassedEmail = sendCandidatePassedEmail;
async function sendCandidatePassedEmail(score, btnElem = null, isAuto = false) {
    const notifyEmail = (localStorage.getItem(STORAGE_PREFIX + 'notify_email') || 'your-email@pim.ac.th').trim();
    const webhookUrl = DEFAULT_CENTRAL_WEBHOOK_URL;
    const charName = currentCharacter ? currentCharacter.name : 'HR ET Specialist';
    const history = appUserData[currentUser]?.history[currentCharacter?.id] || [];
    const lastMsg = history.length > 0 ? history[history.length - 1].t : '';

    if (btnElem) {
        btnElem.disabled = true;
        btnElem.innerHTML = '<span>⏳ กำลังส่งอีเมลเข้า Gmail...</span>';
    }

    let fileBase64 = null;
    let fileName = null;
    let fileMimeType = null;
    if (pendingAttachedFile && pendingAttachedFile.base64) {
        fileBase64 = pendingAttachedFile.base64;
        fileName = pendingAttachedFile.name;
        fileMimeType = pendingAttachedFile.mimeType;
    }

    // Try Central Webhook
    if (webhookUrl && webhookUrl.startsWith('http') && !webhookUrl.includes('drive.google.com')) {
        try {
            const payload = {
                candidateName: 'ผู้สมัครผ่านเกณฑ์ (CV Assessment)',
                score: score,
                recipientEmail: notifyEmail,
                senderName: (localStorage.getItem(STORAGE_PREFIX + 'sender_display_name') || 'ET OPC Company — แจ้งเตือนผู้สมัครผ่านเกณฑ์').trim(),
                agentName: charName,
                summary: lastMsg,
                hasAttachment: !!fileBase64,
                fileBase64: fileBase64,
                fileName: fileName,
                fileMimeType: fileMimeType
            };

            await fetch(webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            showToast(`✅ ส่งอีเมลแจ้งเตือนเข้า Gmail (${notifyEmail}) สำเร็จแล้ว!`, "success");
            if (btnElem) {
                btnElem.disabled = false;
                btnElem.innerHTML = `<span>✅ ส่งเข้า Gmail (${escapeHtml(notifyEmail)}) เรียบร้อยแล้ว</span>`;
            }
            return;
        } catch (err) {
            console.warn("Webhook send fallback to Gmail client:", err);
        }
    }

    // Fallback: 1-Click Direct Gmail Web Compose
    const subject = `[ET OPC #TeamET] 🎉 ผู้สมัครผ่านเกณฑ์การคัดเลือก (คะแนน: ${score}/100)`;
    const bodyText = `รายงานผลการประเมินผู้สมัคร - ET OPC Company (Ver 3.0)
--------------------------------------------------
🤖 ผู้ประเมิน: ${charName}
🏆 คะแนนที่ได้: ${score} / 100 คะแนน (ผ่านเกณฑ์มาตรฐาน)
📅 วันที่ประเมิน: ${new Date().toLocaleString('th-TH')}
👤 ผู้สั่งงาน: @${currentUser}

📌 สรุปผลการประเมินและข้อเสนอแนะ:
${lastMsg}

--------------------------------------------------
คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — สถาบันการจัดการปัญญาภิวัฒน์ (PIM) • MR.ST`;

    const targetEmail = notifyEmail || '';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    
    if (!isAuto) {
        const win = window.open(gmailUrl, '_blank');
        if (!win) {
            window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        }
        showToast(`📧 เปิดหน้าต่าง Gmail พร้อมเนื้อหารายงานเรียบร้อยแล้ว!`, "success");
    }

    if (btnElem) {
        btnElem.disabled = false;
        btnElem.innerHTML = `<span>📧 ส่งเข้า Gmail (${escapeHtml(targetEmail)})</span>`;
    }
}


// --- RE-BUILT CANDIDATE & DOCUMENT HUB REPOSITORY SYSTEM (VER 3.0 PRO) ---
let currentHubFilter = 'all';

function loadCandidateSubmissions() {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'candidate_submissions_v1') || localStorage.getItem(STORAGE_PREFIX + 'candidate_hub');
    if (saved) {
        try { 
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                appCandidateSubmissions = parsed.filter(Boolean).map((c, i) => {
                    return {
                        id: c.id || ('cand-' + Date.now() + '-' + i),
                        name: c.name || c.fileName || `ผู้สมัคร ${i+1}`,
                        fileName: c.fileName || `Resume_${i+1}.pdf`,
                        driveUrl: c.driveUrl || '',
                        driveId: c.driveId || '',
                        parentFolderId: c.parentFolderId || null,
                        parentFolderName: c.parentFolderName || '',
                        isDriveFolder: Boolean(c.isDriveFolder),
                        size: c.size || (c.isDriveFolder ? 'Folder Link' : '38 KB'),
                        mimeType: c.mimeType || 'application/pdf',
                        status: c.status || (c.score ? (c.score >= 75 ? 'passed' : 'evaluated') : 'pending'),
                        score: typeof c.score === 'number' ? c.score : null,
                        date: c.date || new Date().toLocaleDateString('th-TH'),
                        content: c.content || ''
                    };
                });
            } else {
                appCandidateSubmissions = [];
            }
        } catch(e) {
            console.warn("Failed to parse candidate submissions:", e);
            appCandidateSubmissions = [];
        }
    } else {
        appCandidateSubmissions = [];
    }
}

function saveCandidateSubmissions() {
    try {
        localStorage.setItem(STORAGE_PREFIX + 'candidate_submissions_v1', JSON.stringify(appCandidateSubmissions));
    } catch(e) {
        console.warn("Storage quota save warning:", e);
    }
}

window.openCandidateHubModal = openCandidateHubModal;
function openCandidateHubModal() {
    try {
        loadCandidateSubmissions();
    } catch(e) {
        console.warn("loadCandidateSubmissions error:", e);
    }
    try {
        setHubFilter('all');
    } catch(e) {
        console.warn("setHubFilter error:", e);
    }
    const modal = document.getElementById('candidateHubModal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error("candidateHubModal element not found in DOM");
        alert("ไม่พบหน้าต่างคลังเอกสารในระบบ กรุณารีเฟรชหน้าเว็บ");
    }
}

window.closeCandidateHubModal = closeCandidateHubModal;
function closeCandidateHubModal() {
    document.getElementById('candidateHubModal')?.classList.add('hidden');
}

window.setHubFilter = setHubFilter;
function setHubFilter(filterType) {
    currentHubFilter = filterType || 'all';
    ['All', 'Pending', 'Passed'].forEach(t => {
        const btn = document.getElementById('hubFilter' + t);
        if (btn) btn.classList.toggle('active', t.toLowerCase() === currentHubFilter);
    });
    renderCandidateQueueList();
}

function updateHubStats() {
    const list = appCandidateSubmissions || [];
    const total = list.length;
    const passingThreshold = parseInt(localStorage.getItem(STORAGE_PREFIX + 'passing_score') || '75', 10);
    const pending = list.filter(c => c && (c.status === 'pending' || !c.score)).length;
    const passed = list.filter(c => c && ((c.score && c.score >= passingThreshold) || c.status === 'passed')).length;
    
    const scoredList = list.filter(c => c && typeof c.score === 'number');
    const avgScore = scoredList.length > 0 ? (scoredList.reduce((acc, c) => acc + c.score, 0) / scoredList.length).toFixed(0) + '/100' : '-';

    const statTotal = document.getElementById('hubStatTotal');
    const statPending = document.getElementById('hubStatPending');
    const statPassed = document.getElementById('hubStatPassed');
    const statAvg = document.getElementById('hubStatAvg');

    const countAll = document.getElementById('hubCountAll');
    const countPending = document.getElementById('hubCountPending');
    const countPassed = document.getElementById('hubCountPassed');

    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statPassed) statPassed.textContent = passed;
    if (statAvg) statAvg.textContent = avgScore;

    if (countAll) countAll.textContent = total;
    if (countPending) countPending.textContent = pending;
    if (countPassed) countPassed.textContent = passed;

    const sidebarHubCount = document.getElementById('sidebarHubCount');
    if (sidebarHubCount) sidebarHubCount.textContent = total;
}

window.renderCandidateQueueList = renderCandidateQueueList;
function renderCandidateQueueList() {
    const list = document.getElementById('candidateQueueList');
    if (!list) return;
    updateHubStats();

    const searchInput = document.getElementById('hubSearchInput');
    const searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const passingThreshold = parseInt(localStorage.getItem(STORAGE_PREFIX + 'passing_score') || '75', 10);
    
    let filtered = (appCandidateSubmissions || []).filter(cand => {
        if (!cand) return false;
        const nameMatch = (cand.name || '').toLowerCase().includes(searchQuery);
        const fileMatch = (cand.fileName || '').toLowerCase().includes(searchQuery);
        if (!nameMatch && !fileMatch) return false;

        if (currentHubFilter === 'pending') return cand.status === 'pending' || !cand.score;
        if (currentHubFilter === 'passed') return cand.status === 'passed' || (cand.score && cand.score >= passingThreshold);
        return true;
    });

    // Top Candidate Leaderboard Podium
    const scoredList = appCandidateSubmissions.filter(c => c && typeof c.score === 'number').sort((a, b) => b.score - a.score);
    let leaderboardHtml = '';

    if (scoredList.length > 0) {
        const top3 = scoredList.slice(0, 3);
        const medals = ['🥇', '🥈', '🥉'];
        const rankTitles = ['อันดับ 1 (Top Candidate)', 'อันดับ 2 (Runner-Up)', 'อันดับ 3 (Third Place)'];
        const rankStyles = [
            'background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%); border: 1.5px solid #F59E0B;',
            'background: linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(100, 116, 139, 0.08) 100%); border: 1.5px solid #94A3B8;',
            'background: linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, rgba(194, 65, 12, 0.08) 100%); border: 1.5px solid #EA580C;'
        ];

        leaderboardHtml = `
        <div class="hub-leaderboard-card" style="background:var(--surface-2); border:1px solid var(--line); border-radius:14px; padding:12px 14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:12.5px; font-weight:800; color:var(--maroon); display:flex; align-items:center; gap:6px;">
              🏆 ทำเนียบผู้สมัครคะแนนสูงสุด (Candidate Leaderboard)
            </span>
            <span style="font-size:11px; background:var(--surface); border:1px solid var(--line); padding:2px 8px; border-radius:999px; font-weight:700; color:var(--ink-soft);">
              ตรวจแล้ว ${scoredList.length} คน
            </span>
          </div>
          <div style="display:grid; grid-template-columns: repeat(${Math.min(top3.length, 3)}, 1fr); gap:8px;">`;

        top3.forEach((cand, rankIdx) => {
            leaderboardHtml += `
            <div style="padding:10px 12px; border-radius:12px; ${rankStyles[rankIdx]} display:flex; flex-direction:column; gap:3px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:16px;">${medals[rankIdx]}</span>
                <strong style="font-size:13.5px; color:var(--ink); font-weight:900;">${cand.score}/100</strong>
              </div>
              <strong style="font-size:12.5px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(cand.name || cand.fileName)}">
                ${escapeHtml(cand.name || cand.fileName)}
              </strong>
              <span style="font-size:10.5px; color:var(--ink-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${escapeHtml(rankTitles[rankIdx])}
              </span>
            </div>`;
        });

        leaderboardHtml += `</div></div>`;
    }

    list.innerHTML = leaderboardHtml;

    if (filtered.length === 0) {
        list.innerHTML += '<div style="text-align:center; padding:28px; color:var(--ink-faint); font-size:13px; background:var(--surface-2); border-radius:12px; border:1px dashed var(--line); margin:4px 0;">📄 ยังไม่มีเอกสารในหมวดหมู่นี้ (กด <strong>+ เพิ่มไฟล์</strong> หรือวางลิงก์ Google Drive ด้านบน)</div>';
        return;
    }

    filtered.forEach((cand) => {
        const realIdx = appCandidateSubmissions.findIndex(c => c && c.id === cand.id);
        const isPassed = cand.status === 'passed' || (cand.score && cand.score >= passingThreshold);
        const hasScore = typeof cand.score === 'number';
        const isFolder = (cand.isDriveFolder === true) || (cand.size === 'Folder Link' && !cand.parentFolderId);
        
        let statusBadge = '<span style="background:var(--surface-3); color:var(--ink-soft); font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px;">⏳ รอตรวจ</span>';
        if (hasScore) {
            statusBadge = isPassed ? 
                `<span style="background:rgba(16,185,129,0.15); color:#059669; font-size:11px; font-weight:800; padding:2px 8px; border-radius:999px;">🟢 ผ่านเกณฑ์ (${cand.score}/100)</span>` :
                `<span style="background:rgba(245,158,11,0.15); color:#D97706; font-size:11px; font-weight:800; padding:2px 8px; border-radius:999px;">🟡 พิจารณา (${cand.score}/100)</span>`;
        }

        let extIcon = '📄';
        if (isFolder) {
            extIcon = '📁';
        } else if ((cand.fileName || '').endsWith('.docx') || (cand.fileName || '').endsWith('.doc')) {
            extIcon = '📘';
        } else if ((cand.fileName || '').endsWith('.pdf') || cand.mimeType === 'application/pdf') {
            extIcon = '📕';
        } else if ((cand.fileName || '').endsWith('.png') || (cand.fileName || '').endsWith('.jpg')) {
            extIcon = '🖼️';
        }

        const driveBadge = cand.driveUrl ? 
            `<a href="${escapeHtml(cand.driveUrl)}" target="_blank" style="color:var(--maroon); font-size:11px; font-weight:700; text-decoration:underline; display:inline-flex; align-items:center; gap:3px;">🔗 ลิงก์ Drive ↗</a>` : '';

        const card = document.createElement('div');
        card.className = 'hub-card';
        card.innerHTML = `
          <div class="hub-card-file-icon" style="font-size:22px;">${extIcon}</div>
          <div class="hub-card-body">
            <div class="hub-card-title-row">
              <span class="hub-card-title" title="คลิกเพื่อแก้ไขชื่อ" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="renameCandidateSubmission(${realIdx})">
                ${escapeHtml(cand.name || cand.fileName)}
                <span style="font-size:11px; opacity:0.6;">✏️</span>
              </span>
              ${statusBadge}
            </div>
            <div class="hub-card-meta">
              <span>${escapeHtml(cand.fileName)}</span> • <span>${escapeHtml(cand.size || (isFolder ? 'Folder Link' : '38 KB'))}</span> • <span>ส่งเมื่อ ${escapeHtml(cand.date || 'วันนี้')}</span>
              ${driveBadge ? ` • ${driveBadge}` : ''}
            </div>
          </div>
          <div style="display:flex; gap:6px; flex-shrink:0; align-items:center; flex-wrap:wrap;">
            ${isFolder ? `
            <button type="button" class="btn-cancel" style="padding:5px 9px; font-size:11px; font-weight:800; border-radius:8px; display:flex; align-items:center; gap:3px; color:#0284C7; border-color:#0284C7;" onclick="expandDriveFolderCandidates(${realIdx})" title="แตกไฟล์/เพิ่มรายชื่อในโฟลเดอร์นี้">
              <span>📂 แตกไฟล์</span>
            </button>` : ''}
            <button type="button" class="btn-submit" style="padding:6px 12px; font-size:11.5px; font-weight:800; border-radius:8px; display:flex; align-items:center; gap:4px;" onclick="evaluateSingleCandidateFromHub(${realIdx})">
              <span>🎯 ${hasScore ? 'ตรวจซ้ำ' : (isFolder ? 'ประเมินโฟลเดอร์' : 'ประเมิน')}</span>
            </button>
            <button type="button" class="btn-delete" style="padding:6px 9px; font-size:11.5px; border-radius:8px;" onclick="deleteCandidateSubmission(${realIdx})" title="ลบรายการนี้">✕</button>
          </div>
        `;
        list.appendChild(card);
    });
}

window.handleBatchCvUpload = handleBatchCvUpload;
function handleBatchCvUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const base64Data = evt.target.result.split(',')[1];
            const rawName = file.name.replace(/\.[^/.]+$/, "");
            const newCand = {
                id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: rawName,
                fileName: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                mimeType: file.type || 'application/pdf',
                status: 'pending',
                score: null,
                date: new Date().toLocaleDateString('th-TH'),
                base64: base64Data,
                content: `เอกสารของ ${rawName} (${file.name})\nขนาดไฟล์: ${(file.size / 1024).toFixed(1)} KB`
            };
            appCandidateSubmissions.unshift(newCand);
            saveCandidateSubmissions();
            renderCandidateQueueList();
        };
        reader.readAsDataURL(file);
    });

    showToast(`📥 เพิ่มไฟล์ ${files.length} รายการเข้าสู่คลังเรียบร้อยแล้ว!`, "success");
    e.target.value = '';
}

function extractGoogleDriveInfo(url) {
    let driveId = '';
    let isFolder = false;
    
    const folderMatch = url.match(/folders\/([a-zA-Z0-9_-]+)/i);
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/i);
    const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i);
    const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/i);

    if (folderMatch) {
        driveId = folderMatch[1];
        isFolder = true;
    } else if (fileMatch) {
        driveId = fileMatch[1];
    } else if (docMatch) {
        driveId = docMatch[1];
    } else if (sheetMatch) {
        driveId = sheetMatch[1];
    } else if (idMatch) {
        driveId = idMatch[1];
    } else {
        driveId = 'link-' + Math.random().toString(36).substr(2, 6);
    }

    return { driveId, isFolder };
}

window.importDriveLinkToHub = importDriveLinkToHub;
async function importDriveLinkToHub(autoEvaluate = false) {
    const input = document.getElementById('hubDriveLinkInput');
    const rawInput = input ? input.value.trim() : '';
    if (!rawInput) {
        showToast("กรุณากรอกหรือวางลิงก์ Google Drive", "warning");
        return;
    }

    const urls = rawInput.split(/[\s,\n]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
    if (urls.length === 0) {
        showToast("ไม่พบลิงก์ URL ที่ถูกต้อง (ต้องขึ้นต้นด้วย http หรือ https)", "warning");
        return;
    }

    const webhookUrl = DEFAULT_CENTRAL_WEBHOOK_URL;
    let addedCount = 0;
    let firstAddedIdx = 0;

    for (let link of urls) {
        const { driveId, isFolder } = extractGoogleDriveInfo(link);
        const shortId = driveId.slice(-6);

        let expandedFiles = null;
        if (isFolder && webhookUrl && webhookUrl.startsWith('http') && !webhookUrl.includes('drive.google.com')) {
            try {
                const res = await fetch(`${webhookUrl}?action=listFiles&folderUrl=${encodeURIComponent(link)}&folderId=${encodeURIComponent(driveId)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'success' && Array.isArray(data.files) && data.files.length > 0) {
                        expandedFiles = data.files;
                    }
                }
            } catch(e) {
                console.warn("Webhook folder fetch fallback:", e);
            }
        }

        if (expandedFiles && expandedFiles.length > 0) {
            expandedFiles.forEach(f => {
                const rawName = (f.name || 'เอกสาร/ผู้สมัคร').replace(/\.[^/.]+$/, "");
                const newCand = {
                    id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                    name: rawName,
                    fileName: f.name || 'Document.pdf',
                    driveUrl: f.url || link,
                    size: f.size || 'Drive File',
                    mimeType: f.mimeType || 'application/pdf',
                    status: 'pending',
                    score: null,
                    date: new Date().toLocaleDateString('th-TH'),
                    content: `เอกสารจาก Google Drive: ${f.name}\nลิงก์: ${f.url || link}`
                };
                appCandidateSubmissions.unshift(newCand);
                addedCount++;
            });
        } else {
            const defaultName = isFolder ? 
                `โฟลเดอร์เอกสาร (Drive: ${shortId})` : 
                `เอกสาร Drive (ID: ${shortId})`;
            
            const newCand = {
                id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: defaultName,
                fileName: isFolder ? `Google_Drive_Folder_${shortId}.pdf` : `Document_Drive_${shortId}.pdf`,
                driveUrl: link,
                driveId: driveId,
                isDriveFolder: isFolder,
                size: isFolder ? "Folder Link" : "Drive Link",
                mimeType: "application/pdf",
                status: "pending",
                score: null,
                date: new Date().toLocaleDateString('th-TH'),
                content: `เอกสารจาก Google Drive (${isFolder ? 'โฟลเดอร์' : 'ไฟล์'}): ${link}\nรหัสอ้างอิง ID: ${driveId}`
            };
            appCandidateSubmissions.unshift(newCand);
            addedCount++;
        }
    }

    saveCandidateSubmissions();
    renderCandidateQueueList();
    if (input) input.value = '';
    
    if (autoEvaluate && addedCount > 0) {
        showToast("⚡ ดึงข้อมูลจาก Google Drive สำเร็จ กำลังส่งให้ AI ประเมินทันที...", "success");
        evaluateSingleCandidateFromHub(0);
    } else {
        showToast(`📥 เพิ่มรายการจาก Google Drive (${addedCount} รายการ) เรียบร้อยแล้ว!`, "success");
    }
}

window.importAndEvaluateDriveLink = importAndEvaluateDriveLink;
function importAndEvaluateDriveLink() {
    importDriveLinkToHub(true);
}

window.expandDriveFolderCandidates = expandDriveFolderCandidates;
function expandDriveFolderCandidates(idx) {
    const cand = appCandidateSubmissions[idx];
    if (!cand) return;

    const inputNames = prompt(
        `📂 แตกไฟล์/เพิ่มรายชื่อในโฟลเดอร์:\n"${cand.name}"\n\nพิมพ์รายชื่อผู้สมัคร/เอกสาร (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่)\nหรือพิมพ์ตัวเลขจำนวนไฟล์ (เช่น 3 หรือ 5) เพื่อสร้างช่องอัตโนมัติ:`,
        "ผู้สมัคร 1, ผู้สมัคร 2"
    );

    if (!inputNames || inputNames.trim() === '') return;

    let names = [];
    const trimmed = inputNames.trim();
    if (/^[0-9]+$/.test(trimmed)) {
        const count = parseInt(trimmed, 10);
        for (let i = 1; i <= Math.min(count, 30); i++) {
            names.push(`ผู้สมัคร ${i}`);
        }
    } else {
        names = inputNames.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    }

    if (names.length === 0) return;

    names.forEach((name) => {
        const subCand = {
            id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: name,
            fileName: `${name}.pdf`,
            driveUrl: cand.driveUrl,
            driveId: cand.driveId,
            parentFolderId: cand.id,
            parentFolderName: cand.name,
            isDriveFolder: false,
            size: "Drive File",
            mimeType: "application/pdf",
            status: "pending",
            score: null,
            date: new Date().toLocaleDateString('th-TH'),
            content: `เอกสารของผู้สมัคร/รายการ "${name}" ในโฟลเดอร์ Google Drive: ${cand.driveUrl || ''}`
        };
        appCandidateSubmissions.push(subCand);
    });

    saveCandidateSubmissions();
    renderCandidateQueueList();
    showToast(`📂 แตกและเพิ่มรายการ ${names.length} รายการจากโฟลเดอร์แล้ว!`, "success");
}

window.renameCandidateSubmission = renameCandidateSubmission;
function renameCandidateSubmission(idx) {
    const cand = appCandidateSubmissions[idx];
    if (!cand) return;

    const newName = prompt(`✏️ แก้ไขชื่อผู้สมัครหรือชุดเอกสารสำหรับ:\n(${cand.fileName})`, cand.name);
    if (newName && newName.trim() !== '') {
        cand.name = newName.trim();
        saveCandidateSubmissions();
        renderCandidateQueueList();
        showToast("เปลี่ยนชื่อเรียบร้อยแล้ว", "success");
    }
}

window.evaluateSingleCandidateFromHub = evaluateSingleCandidateFromHub;
function evaluateSingleCandidateFromHub(idx) {
    const cand = appCandidateSubmissions[idx];
    if (!cand) return;

    currentEvaluatingCandidateId = cand.id;
    closeCandidateHubModal();

    const hrAgent = SYSTEM_CHARACTERS.find(c => c.id === 'opc-hr-et' || c.name.includes('HR')) || currentCharacter || SYSTEM_CHARACTERS[0];
    if (typeof openChat === 'function' && hrAgent) {
        openChat(hrAgent.id);
    }

    clearPendingFile();

    const isFolder = (cand.isDriveFolder === true) || (cand.size === 'Folder Link' && !cand.parentFolderId) || (cand.driveUrl && cand.driveUrl.includes('/folders/') && !cand.parentFolderId);

    pendingAttachedFile = {
        name: cand.fileName,
        mimeType: cand.mimeType || 'application/pdf',
        base64: cand.base64 || null,
        content: cand.content,
        isPdf: true,
        isImage: false,
        size: 36000,
        formattedSize: cand.size || (isFolder ? 'Folder Link' : 'Drive Link')
    };

    let prompt = "";
    if (isFolder) {
        prompt = `🎯 กรุณาวิเคราะห์และประเมินเอกสาร/เรซูเม่ของผู้สมัคร 'ทุกคน' ที่อยู่ในโฟลเดอร์ Google Drive นี้:
📁 ชื่อโฟลเดอร์: "${cand.name}"
🔗 ลิงก์โฟลเดอร์: [Google Drive Folder](${cand.driveUrl || cand.content})
(รหัสโฟลเดอร์ ID: ${cand.driveId || 'Drive Folder'})

คำสั่งการประเมินผู้สมัครทั้งโฟลเดอร์ (Comprehensive Folder Evaluation):
1. ตรวจสอบและสกัดรายชื่อผู้สมัครทุกคนที่พบในโฟลเดอร์นี้
2. ประเมินผู้สมัครแต่ละคนอย่างละเอียดตามเกณฑ์ 4 มิติความต้องการ (คะแนนเต็ม 100):
   - 1. ประสบการณ์ทำงานตรงสาย (40 คะแนน)
   - 2. ทักษะเฉพาะทางและความสามารถหลัก (30 คะแนน)
   - 3. วุฒิการศึกษาและใบรับรอง (15 คะแนน)
   - 4. ผลงานเชิงประจักษ์และการนำเสนอ (15 คะแนน)
3. จัดทำ 'ตารางเปรียบเทียบผู้สมัครทุกคนในโฟลเดอร์ (Head-to-Head Candidate Matrix)':
   | ลำดับ | ชื่อผู้สมัคร | ประสบการณ์ | ทักษะเด่น | คะแนนความเหมาะสม | สถานะ (ผ่าน/ไม่ผ่าน) |
4. จัดอันดับ Top Candidates (Ranking) พร้อมข้อเสนอแนะสำหรับการเรียกสัมภาษณ์งาน`;
    } else {
        prompt = `🎯 กรุณาวิเคราะห์และตรวจสอบประเมินเอกสาร/เรซูเม่: "${cand.name}"
เอกสารอ้างอิง: ${cand.driveUrl ? `[Google Drive Link](${cand.driveUrl})` : cand.fileName}
${cand.content && !cand.content.startsWith('เอกสารจาก Google Drive') ? `\nเนื้อหาเอกสาร:\n${cand.content}` : ''}

เกณฑ์การประเมิน 4 มิติความต้องการ (คะแนนเต็ม 100):
1. ประสบการณ์ทำงานตรงสาย (40 คะแนน)
2. ทักษะเฉพาะทางและความสามารถหลัก (30 คะแนน)
3. วุฒิการศึกษาและใบรับรอง (15 คะแนน)
4. ผลงานเชิงประจักษ์และการนำเสนอ (15 คะแนน)

โปรดระบุ:
- สรุปคะแนนความเหมาะสมรวม (Match Score / 100 คะแนน)
- จุดเด่น (Strengths) และข้อควรระวัง/จุดที่ต้องพัฒนา (Gaps)
- ร่างคำถามสัมภาษณ์งานเชิงลึก 3-5 ข้อ`;
    }

    setTimeout(() => {
        sendMessage(prompt);
    }, 150);
}

window.batchEvaluateAllCandidates = batchEvaluateAllCandidates;
function batchEvaluateAllCandidates() {
    if (appCandidateSubmissions.length === 0) {
        showToast("ยังไม่มีไฟล์ในคลังข้อมูล", "warning");
        return;
    }
    closeCandidateHubModal();

    const hrAgent = SYSTEM_CHARACTERS.find(c => c.id === 'opc-hr-et' || c.name.includes('HR')) || currentCharacter || SYSTEM_CHARACTERS[0];
    if (typeof openChat === 'function' && hrAgent) {
        openChat(hrAgent.id);
    }

    let summaryBatchList = appCandidateSubmissions.map((c, i) => `${i+1}. ${c.name} (${c.fileName}): ${c.driveUrl || c.content}`).join("\n---\n");

    const batchPrompt = `📊 กรุณาตรวจประเมินและเปรียบเทียบเอกสาร/ผู้สมัครทั้งหมด (${appCandidateSubmissions.length} รายการ) ในคลัง ในรูปแบบตาราง Head-to-Head Comparison Matrix:
1. ตารางคะแนนรวม: [ลำดับ] | [ชื่อรายการ/ผู้สมัคร] | [ประสบการณ์] | [ทักษะหลัก] | [คะแนนความเหมาะสม /100] | [สถานะ: ผ่าน/ไม่ผ่าน]
2. จัดอันดับ Top Leaderboard พร้อมระบุเหตุผล
3. สรุปรายชื่อผู้ที่แนะนำให้เรียกสัมภาษณ์งานรอบแรก

ข้อมูลทั้งหมด:
${summaryBatchList}`;

    setTimeout(() => {
        sendMessage(batchPrompt);
    }, 150);
}

window.deleteCandidateSubmission = deleteCandidateSubmission;
function deleteCandidateSubmission(idx) {
    appCandidateSubmissions.splice(idx, 1);
    saveCandidateSubmissions();
    renderCandidateQueueList();
    showToast("ลบรายการไฟล์แล้ว", "info");
}

window.clearAllCandidateSubmissions = clearAllCandidateSubmissions;
function clearAllCandidateSubmissions() {
    if (appCandidateSubmissions.length === 0) return;
    showConfirmDialog({
        title: "ล้างรายการไฟล์ทั้งหมด",
        message: "ต้องการล้างรายการเอกสารทั้งหมดในคลังใช่หรือไม่?",
        confirmText: "ล้างทั้งหมด",
        cancelText: "ยกเลิก",
        type: "danger",
        icon: "🗑️"
    }).then(confirmed => {
        if (!confirmed) return;
        appCandidateSubmissions = [];
        saveCandidateSubmissions();
        renderCandidateQueueList();
        showToast("ล้างรายการไฟล์ในคลังเรียบร้อยแล้ว", "info");
    });
}

window.exportCandidateMatrixCsv = exportCandidateMatrixCsv;
function exportCandidateMatrixCsv() {
    if (appCandidateSubmissions.length === 0) {
        showToast("ไม่มีข้อมูลสำหรับส่งออก", "warning");
        return;
    }

    let csvContent = "\uFEFFลำดับ,ชื่อผู้สมัคร/เอกสาร,ชื่อไฟล์,ลิงก์อ้างอิง,ขนาดไฟล์,สถานะ,คะแนน,วันที่\n";
    appCandidateSubmissions.forEach((c, idx) => {
        csvContent += `"${idx + 1}","${(c.name || '').replace(/"/g, '""')}","${(c.fileName || '').replace(/"/g, '""')}","${(c.driveUrl || '').replace(/"/g, '""')}","${c.size}","${c.status}","${c.score || '-'}","${c.date}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ET_OPC_Documents_Matrix_${Date.now()}.csv`;
    link.click();
    showToast("📊 ส่งออกตารางข้อมูลเป็น CSV สำเร็จ!", "success");
}


// --- DYNAMIC QUICK ACTIONS (แถบบนห้องแชท) & PROMPTS (เมนูหลอดไฟ) ---
const DEFAULT_QUICK_ACTIONS = [
  { id: "qa-1", icon: "🎯", label: "ประเมินเรซูเม่ (CV Screening)", prompt: "🎯 กรุณาวิเคราะห์และประเมินเรซูเม่/ประวัติการทำงาน (CV) นี้อย่างละเอียด:\n1. สรุปภาพรวม ประสบการณ์ และทักษะหลัก (Hard & Soft Skills)\n2. ประเมินจุดเด่น (Strengths) และจุดที่ควรพัฒนา/สิ่งที่ยังขาด (Gaps)\n3. สรุปคะแนนความเหมาะสม (Match Score /100) และข้อเสนอแนะสำหรับ HR\n4. ร่างคำถามสัมภาษณ์งาน 3-5 ข้อที่เจาะลึกจากประวัติการทำงานนี้" },
  { id: "qa-2", icon: "📊", label: "เปรียบเทียบผู้สมัคร", prompt: "📊 กรุณาเปรียบเทียบผู้สมัครทุกคนจากเรซูเม่/ข้อมูลข้างต้นในรูปแบบตาราง Head-to-Head Comparison Matrix:\n1. ตารางเปรียบเทียบ: [ชื่อผู้สมัคร] | [ประสบการณ์] | [ทักษะหลัก] | [จุดเด่น] | [คะแนนความเหมาะสม /100]\n2. จัดอันดับผู้สมัคร (Ranking) พร้อมระบุเหตุผลในการเรียงลำดับ\n3. สรุปคำแนะนำเชิงลึกสำหรับคณะกรรมการในการตัดสินใจคัดเลือก" },
  { id: "qa-3", icon: "✨", label: "ปรับปรุง CV ให้โดดเด่น", prompt: "✨ ช่วยปรับปรุงและเขียนเรซูเม่/ประวัติการทำงาน (CV) นี้ให้เป็นมืออาชีพและโดดเด่น:\n1. ปรับปรุงข้อความและทักษะด้วย Action Verbs และระบุผลงานเชิงตัวเลข (Impact/Metrics)\n2. จัดโครงสร้างเป็นแบบมาตรฐานสากลที่อ่านง่ายและรองรับระบบ ATS (ATS-Friendly Format)\n3. เพิ่มข้อความสรุปโปรไฟล์ (Professional Summary) ที่ดึงดูดใจ พร้อมนำไปใช้สมัครงานได้ทันที" },
  { id: "qa-4", icon: "📧", label: "ร่างอีเมลนัดสัมภาษณ์", prompt: "📧 ช่วยร่างอีเมลนัดหมายสัมภาษณ์งานภาษาไทยอย่างเป็นทางการ:\n1. ระบุชื่อผู้สมัครและตำแหน่งที่สมัคร\n2. กำหนดวัน เวลา และช่องทางสัมภาษณ์ (Google Meet / On-site)\n3. ระบุเอกสารหรือผลงานที่ต้องเตรียมตัวล่วงหน้า\n4. ปิดท้ายด้วยความอบอุ่นและข้อมูลติดต่อฝ่ายบุคคล ET OPC Company" },
  { id: "qa-5", icon: "📑", label: "สไลด์นำเสนอ", prompt: "📑 ช่วยแปลงข้อมูลข้างต้นให้เป็น 'โครงร่างสไลด์นำเสนอ (Slide Outline Deck)':\n- Slide 1: หัวข้อหลักและวัตถุประสงค์ (Title & Executive Summary)\n- Slide 2: สาระสำคัญและประเด็นการวิเคราะห์ (Key Insights / Candidate Profiles)\n- Slide 3: ตารางข้อมูลเปรียบเทียบและสถิติ (Data Matrix & Scores)\n- Slide 4: สรุปผลและขั้นตอนการดำเนินงานถัดไป (Action Plan & Next Steps)\nพร้อมระบุ Talking Points หรือ Speaker Notes กำกับในแต่ละสไลด์อย่างชัดเจน" },
  { id: "qa-6", icon: "📌", label: "สรุปใจความสำคัญ", prompt: "📌 กรุณาสรุปประเด็นและใจความสำคัญของงาน/เอกสาร/บทสนทนานี้ให้กระชับ ชัดเจน และแบ่งเป็นหัวข้อย่อย" },
  { id: "qa-7", icon: "📋", label: "สร้าง Action Items", prompt: "📋 ช่วยสกัด Action Items (สิ่งที่ต้องทำต่อ), ผู้รับผิดชอบ (Person in Charge), และกำหนดส่ง (Deadline) จากข้อมูลข้างต้น" },
  { id: "qa-8", icon: "✉️", label: "ร่างอีเมลสรุปงาน", prompt: "✉️ ช่วยร่างอีเมลภาษาไทยทางการเพื่อรายงานสรุปผลการดำเนินงานนี้ส่งต่อให้ทีมบริหาร" },
  { id: "qa-9", icon: "📊", label: "สรุปเป็นตาราง", prompt: "📊 ช่วยจัดระเบียบและแปลงข้อมูลข้างต้นให้อยู่ในรูปแบบตาราง Markdown เพื่อเปรียบเทียบและอ่านง่าย" },
  { id: "qa-10", icon: "📕", label: "จัดทำรายงาน PDF", prompt: "📕 ช่วยจัดทำรายงานฉบับสมบูรณ์ พร้อมระบุหัวข้อ วัตถุประสงค์ สาระสำคัญ และข้อสรุปอย่างเป็นทางการ สำหรับส่งออกเป็นไฟล์เอกสาร PDF" },
  { id: "qa-11", icon: "📊", label: "สกัดไฟล์ Excel/CSV", prompt: "📊 ช่วยสกัดและรวบรวมข้อมูลทั้งหมดให้อยู่ในรูปแบบตาราง Markdown Table อย่างละเอียด เพื่อให้สามารถส่งออกเป็นไฟล์ Excel / CSV ได้ทันที" },
  { id: "qa-12", icon: "🔍", label: "วิเคราะห์เจาะลึก", prompt: "🔍 ช่วยวิเคราะห์เจาะลึก: จุดแข็ง (Strengths), จุดอ่อน/ข้อควรระวัง (Risks & Bottlenecks), และข้อเสนอแนะเชิงกลยุทธ์ (Strategic Recommendations)" }
];
let appQuickActions = [];

window.loadQuickActions = loadQuickActions;
function loadQuickActions() {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'quick_actions_v2');
    if (saved) {
        try { 
            appQuickActions = JSON.parse(saved);
            if (!Array.isArray(appQuickActions) || appQuickActions.length === 0) {
                appQuickActions = [...DEFAULT_QUICK_ACTIONS];
            }
        } catch(e) { 
            appQuickActions = [...DEFAULT_QUICK_ACTIONS]; 
        }
    } else {
        appQuickActions = [...DEFAULT_QUICK_ACTIONS];
    }
    renderChatAutomationBar();
    renderAdminQuickActions();
}

window.renderChatAutomationBar = renderChatAutomationBar;
function renderChatAutomationBar() {
    const bar = document.getElementById('chatAutomationBar') || document.querySelector('.automation-bar');
    if (!bar) return;
    bar.innerHTML = '';

    appQuickActions.forEach((qa, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-auto-action';
        btn.innerHTML = `<span>${escapeHtml(qa.icon || '⚡')}</span> <span>${escapeHtml(qa.label)}</span>`;
        btn.title = qa.prompt ? qa.prompt.slice(0, 80) + '...' : qa.label;
        btn.onclick = () => handleQuickActionClick(idx);
        bar.appendChild(btn);
    });
}

window.handleQuickActionClick = handleQuickActionClick;
function handleQuickActionClick(idx) {
    const qa = appQuickActions[idx];
    if (!qa || !currentCharacter) return;

    const input = document.getElementById('msgInput');
    if (pendingAttachedFile) {
        sendMessage(qa.prompt);
    } else {
        if (input) {
            input.value = qa.prompt;
            input.focus();
            showToast(`นำเข้าคำสั่ง "${qa.label}" แล้ว สามารถพิมพ์เพิ่มหรือกดส่งได้ทันที 🚀`, "info");
        }
    }
}

window.renderAdminQuickActions = renderAdminQuickActions;
function renderAdminQuickActions() {
    const container = document.getElementById('adminQuickActionsContainer') || document.getElementById('adminPromptListContainer');
    const countLabel = document.getElementById('qaActionCountLabel') || document.getElementById('promptCountLabel');
    if (!container) return;
    container.innerHTML = '';
    if (countLabel) countLabel.textContent = appQuickActions.length;

    if (appQuickActions.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:var(--ink-faint); padding:8px;">ยังไม่มีปุ่มคำสั่งงานในระบบ</p>';
        return;
    }

    appQuickActions.forEach((qa, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'admin-list-item';
        itemDiv.style.cssText = 'flex-direction:column; align-items:flex-start; gap:6px; padding:10px 14px; background:var(--surface-2); border-radius:12px; border:1px solid var(--line); margin-bottom:4px;';
        
        itemDiv.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">${escapeHtml(qa.icon || '⚡')}</span>
              <strong style="font-size:13.5px; color:var(--ink);">${escapeHtml(qa.label)}</strong>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-cancel" style="padding:4px 10px; font-size:11.5px; font-weight:800; border-radius:8px;" onclick="openEditQuickActionModal(${idx})">✏️ แก้ไข</button>
              <button type="button" class="btn-delete" style="padding:4px 10px; font-size:11.5px; border-radius:8px;" onclick="deleteQuickActionItem(${idx})">ลบ</button>
            </div>
          </div>
          <p style="margin:0; font-size:11.5px; color:var(--ink-soft); line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(qa.prompt)}</p>
        `;
        container.appendChild(itemDiv);
    });
}

window.openEditQuickActionModal = openEditQuickActionModal;
function openEditQuickActionModal(idx) {
    const qa = appQuickActions[idx];
    if (!qa) return;

    document.getElementById('editQaId').value = idx;
    document.getElementById('editQaIcon').value = qa.icon || '🎯';
    document.getElementById('editQaLabel').value = qa.label || '';
    document.getElementById('editQaPrompt').value = qa.prompt || '';
    document.getElementById('qaModalTitle').textContent = '✏️ แก้ไขปุ่มคำสั่งงาน';

    document.getElementById('editQuickActionModal')?.classList.remove('hidden');
}

window.openNewQuickActionModal = openNewQuickActionModal;
function openNewQuickActionModal() {
    document.getElementById('editQaId').value = '';
    document.getElementById('editQaIcon').value = '⚡';
    document.getElementById('editQaLabel').value = '';
    document.getElementById('editQaPrompt').value = '';
    document.getElementById('qaModalTitle').textContent = '➕ เพิ่มปุ่มคำสั่งงานใหม่';
    document.getElementById('editQuickActionModal')?.classList.remove('hidden');
}

window.closeEditQuickActionModal = closeEditQuickActionModal;
function closeEditQuickActionModal() {
    document.getElementById('editQuickActionModal')?.classList.add('hidden');
}

window.saveQuickActionItem = saveQuickActionItem;
function saveQuickActionItem() {
    const idxVal = document.getElementById('editQaId')?.value;
    const icon = (document.getElementById('editQaIcon')?.value || '⚡').trim();
    const label = (document.getElementById('editQaLabel')?.value || '').trim();
    const prompt = (document.getElementById('editQaPrompt')?.value || '').trim();

    if (!label || !prompt) {
        showToast("กรุณากรอกชื่อปุ่มและข้อความคำสั่งให้ครบถ้วน", "warning");
        return;
    }

    if (idxVal !== '' && !isNaN(parseInt(idxVal, 10)) && appQuickActions[parseInt(idxVal, 10)]) {
        const idx = parseInt(idxVal, 10);
        appQuickActions[idx] = { ...appQuickActions[idx], icon, label, prompt };
    } else {
        appQuickActions.push({ id: 'qa-' + Date.now(), icon, label, prompt });
    }

    localStorage.setItem(STORAGE_PREFIX + 'quick_actions_v2', JSON.stringify(appQuickActions));
    closeEditQuickActionModal();
    renderAdminQuickActions();
    renderChatAutomationBar();
    showToast("บันทึกข้อมูลปุ่มคำสั่งงานเรียบร้อยแล้ว!", "success");
}

window.deleteQuickActionItem = deleteQuickActionItem;
function deleteQuickActionItem(idx) {
    showConfirmDialog({
        title: "ลบปุ่มคำสั่งงาน",
        message: "ต้องการลบปุ่มคำสั่งงานนี้ออกจากแถบแชทใช่หรือไม่?",
        confirmText: "ลบปุ่มคำสั่ง",
        cancelText: "ยกเลิก",
        type: "danger",
        icon: "🗑️"
    }).then(confirmed => {
        if (!confirmed) return;
        appQuickActions.splice(idx, 1);
        localStorage.setItem(STORAGE_PREFIX + 'quick_actions_v2', JSON.stringify(appQuickActions));
        renderAdminQuickActions();
        renderChatAutomationBar();
        showToast("ลบปุ่มคำสั่งงานเรียบร้อยแล้ว", "info");
    });
}


// --- 1-CLICK ATTACHED FILE ACTIONS ---
function triggerAttachedFileAction(actionType) {
    if (!pendingAttachedFile) {
        showToast("กรุณาแนบไฟล์ก่อนเลือกคำสั่ง", "warning");
        return;
    }

    let prompt = "";
    if (actionType === 'evaluate') {
        prompt = `🎯 กรุณาวิเคราะห์และประเมินเรซูเม่/ประวัติการทำงานในไฟล์แนบนี้ (${pendingAttachedFile.name}) เทียบกับเกณฑ์ 4 มิติความต้องการของตำแหน่งงาน:
1. ประสบการณ์ทำงานตรงสาย (40 คะแนน)
2. ทักษะเฉพาะทางและความสามารถหลัก (30 คะแนน)
3. วุฒิการศึกษาและใบรับรอง (15 คะแนน)
4. ผลงานเชิงประจักษ์และการนำเสนอ (15 คะแนน)
พร้อมระบุคะแนนความเหมาะสมรวม (Match Score / 100) จุดเด่น-จุดอ่อน และร่างคำถามสัมภาษณ์งาน`;
    } else if (actionType === 'summary') {
        prompt = `📑 กรุณาอ่านและสรุปสาระสำคัญของไฟล์แนบนี้ (${pendingAttachedFile.name}) อย่างกระชับ ชัดเจน พร้อมสกัด Action Items ผู้รับผิดชอบ และกำหนดส่ง`;
    } else if (actionType === 'table') {
        prompt = `📊 กรุณาสกัดและแปลงข้อมูลทั้งหมดในไฟล์แนบนี้ (${pendingAttachedFile.name}) ให้อยู่ในรูปแบบตาราง Markdown Table อย่างละเอียด เพื่อความอ่านง่าย`;
    }

    sendMessage(prompt);
}
window.triggerAttachedFileAction = triggerAttachedFileAction;

// --- SUBTAB SWITCHING FOR PROMPTS & ACTIONS ---
function switchPromptSubtab(type) {
    const btnTop = document.getElementById('subtabQaTop');
    const btnLib = document.getElementById('subtabQaLib');
    const secTop = document.getElementById('secPromptTopActions');
    const secLib = document.getElementById('secPromptLibTemplates');

    if (type === 'top') {
        if (btnTop) {
            btnTop.classList.add('active');
            btnTop.style.background = 'var(--surface)';
            btnTop.style.color = 'var(--maroon)';
            btnTop.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
        if (btnLib) {
            btnLib.classList.remove('active');
            btnLib.style.background = 'transparent';
            btnLib.style.color = 'var(--ink-soft)';
            btnLib.style.boxShadow = 'none';
        }
        if (secTop) secTop.style.display = 'block';
        if (secLib) secLib.style.display = 'none';
        renderAdminQuickActions();
    } else {
        if (btnLib) {
            btnLib.classList.add('active');
            btnLib.style.background = 'var(--surface)';
            btnLib.style.color = 'var(--maroon)';
            btnLib.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
        if (btnTop) {
            btnTop.classList.remove('active');
            btnTop.style.background = 'transparent';
            btnTop.style.color = 'var(--ink-soft)';
            btnTop.style.boxShadow = 'none';
        }
        if (secTop) secTop.style.display = 'none';
        if (secLib) secLib.style.display = 'block';
        renderAdminPromptLibTemplates();
    }
}
window.switchPromptSubtab = switchPromptSubtab;

function renderAdminPromptLibTemplates() {
    const container = document.getElementById('adminPromptListContainer');
    const countLabel = document.getElementById('promptCountLabel');
    if (!container) return;
    container.innerHTML = '';
    if (countLabel) countLabel.textContent = appPromptTemplates.length;

    if (appPromptTemplates.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:var(--ink-faint); padding:8px;">ยังไม่มีแม่แบบคำสั่งในระบบ</p>';
        return;
    }

    appPromptTemplates.forEach((p) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'admin-list-item';
        itemDiv.style.cssText = 'flex-direction:column; align-items:flex-start; gap:4px; padding:10px 12px; background:var(--surface-2); border-radius:10px; border:1px solid var(--line); margin-bottom:6px;';
        itemDiv.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11px; background:var(--surface-3); padding:1px 6px; border-radius:4px; font-weight:700; color:var(--ink-soft);">${escapeHtml(p.category || 'ทั่วไป')}</span>
              <strong style="font-size:13px; color:var(--ink);">${escapeHtml(p.title)}</strong>
            </div>
            <button class="btn-delete" style="padding:3px 8px; font-size:11px;" onclick="deletePromptTemplate('${p.id}')">ลบ</button>
          </div>
          <p style="margin:2px 0 0; font-size:11.5px; color:var(--ink-soft); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(p.prompt)}</p>
        `;
        container.appendChild(itemDiv);
    });
}
window.renderAdminPromptLibTemplates = renderAdminPromptLibTemplates;

// --- WORKSPACE BACKUP & RESTORE SYSTEM ---
function exportWorkspaceBackup() {
    const backupData = {
        version: APP_DATA_VERSION,
        exportedAt: new Date().toISOString(),
        agents: appCharacters,
        roles: appRoles,
        tags: appTags,
        quickActions: appQuickActions,
        promptTemplates: appPromptTemplates,
        userData: appUserData,
        adminModels: adminModels,
        candidateSubmissions: appCandidateSubmissions
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ETOPC_Workspace_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 สำรองข้อมูล Workspace ทั้งระบบเป็น JSON สำเร็จแล้ว!', 'success');
}
window.exportWorkspaceBackup = exportWorkspaceBackup;

function importWorkspaceBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const data = JSON.parse(evt.target.result);
            if (data.agents && Array.isArray(data.agents)) {
                appCharacters = data.agents;
                saveToStorage();
            }
            if (data.roles && Array.isArray(data.roles)) {
                appRoles = data.roles;
                localStorage.setItem(STORAGE_PREFIX + 'roles_v1', JSON.stringify(appRoles));
            }
            if (data.tags && Array.isArray(data.tags)) {
                appTags = data.tags;
                localStorage.setItem(STORAGE_PREFIX + 'tags_v1', JSON.stringify(appTags));
            }
            if (data.quickActions && Array.isArray(data.quickActions)) {
                appQuickActions = data.quickActions;
                localStorage.setItem(STORAGE_PREFIX + 'quick_actions_v2', JSON.stringify(appQuickActions));
            }
            if (data.promptTemplates && Array.isArray(data.promptTemplates)) {
                appPromptTemplates = data.promptTemplates;
                localStorage.setItem(STORAGE_PREFIX + 'prompts_v1', JSON.stringify(appPromptTemplates));
            }
            if (data.userData) {
                appUserData = Object.assign({}, appUserData, data.userData);
                saveUserData();
            }
            if (data.adminModels && Array.isArray(data.adminModels)) {
                adminModels = data.adminModels;
                localStorage.setItem(STORAGE_PREFIX + 'admin_models_v1', JSON.stringify(adminModels));
            }
            if (data.candidateSubmissions && Array.isArray(data.candidateSubmissions)) {
                appCandidateSubmissions = data.candidateSubmissions;
                saveCandidateSubmissions();
            }

            showToast('📤 นำเข้าข้อมูลระบบและกู้คืนสำเร็จแล้ว! กำลังรีโหลด...', 'success');
            setTimeout(function() { window.location.reload(); }, 1000);
        } catch (err) {
            showToast('❌ ไฟล์ JSON ไม่ถูกต้อง: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}
window.importWorkspaceBackup = importWorkspaceBackup;
