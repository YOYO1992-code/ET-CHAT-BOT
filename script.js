
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

const APP_DATA_VERSION = 'v3.5';

const DEFAULT_ROLES = [
    {v:"role-hr", t:"HR & People Operations", color:"#EC4899"},
    {v:"role-opc", t:"Operations & Workflow", color:"#0284C7"},
    {v:"role-summary", t:"Executive Assistant", color:"#7C3AED"},
    {v:"role-data", t:"Data & Document Analysis", color:"#10B981"},
    {v:"role-tech", t:"Tech & System Support", color:"#F59E0B"}
];
let appRoles = [];

const DEFAULT_TAGS = [
  {v:"tag-hr", t:"#HR_ET", color: "#EC4899", c:"tag-hr"},
  {v:"tag-resume", t:"#Resume_CV", color: "#F43F5E", c:"tag-resume"},
  {v:"tag-summary", t:"#สรุปรายงาน", color: "#7C3AED", c:"tag-summary"},
  {v:"tag-ops", t:"#Operations", color: "#0284C7", c:"tag-ops"},
  {v:"tag-meeting", t:"#การประชุม", color: "#10B981", c:"tag-meeting"},
  {v:"tag-analysis", t:"#วิเคราะห์เอกสาร", color: "#F59E0B", c:"tag-analysis"},
  {v:"tag-automation", t:"#Automation", color: "#EF4444", c:"tag-automation"}
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
const SYSTEM_CHARACTERS = [
  { 
    id:"opc-secretary", 
    name:"เลขาส่วนตัว (Administration & Secretary)", 
    creator:"@ETPIM", 
    icon:"briefcase", 
    imageUrl: "",
    color:"linear-gradient(135deg,#EC4899,#831843)", 
    chatCount: 1540, 
    isPrivate: false,
    role: {v:"role-summary", t:"Executive Assistant", color:"#7C3AED"},
    bio:"ผู้ช่วยเลขาประจำตัว คอยดูแลจัดการตารางงาน สรุปการประชุม วิเคราะห์เอกสาร จัดการข้อมูลต่างๆ และช่วยอำนวยความสะดวกในการทำงานอย่างมืออาชีพ",
    requirements: "1. ความถูกต้อง แม่นยำ และเป็นระบบในการจัดเก็บเอกสาร\n2. ความรวดเร็วในการประสานงานและการจัดลำดับความสำคัญ\n3. การสื่อสารที่สุภาพ เป็นมืออาชีพ และรักษาความลับองค์กร",
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
    imageUrl: "",
    color:"linear-gradient(135deg,#8B0000,#450A0A)", 
    chatCount: 2450, 
    isPrivate: false,
    role: {v:"role-hr", t:"HR & People Operations", color:"#EC4899"},
    bio:"ผู้เชี่ยวชาญด้านทรัพยากรบุคคล คัดกรองและประเมินเรซูเม่เทียบกับความต้องการของตำแหน่งงาน (CV Screening & Score) พร้อมช่วยปรับปรุงประวัติการทำงาน",
    requirements: "1. ประสบการณ์ตรงสายงานอย่างน้อย 1-3 ปี\n2. ทักษะเฉพาะทาง (Hard & Soft Skills) ที่สอดคล้องกับตำแหน่ง\n3. วุฒิการศึกษาและใบรับรองทางวิชาชีพที่เกี่ยวข้อง\n4. ผลงานเชิงประจักษ์ (Metrics/Impact) และความกระตือรือร้น",
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
    imageUrl: "",
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
    imageUrl: "",
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
    imageUrl: "",
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
            if(btnAdminDash) btnAdminDash.style.display = 'inline-flex';
            if(btnCreateChar) btnCreateChar.style.display = 'inline-flex';
            if(sidebarBtnAdmin) sidebarBtnAdmin.style.display = 'flex';
            if(sidebarBtnCreate) sidebarBtnCreate.style.display = 'flex';
        }
        
        loadGeminiConfigs();
        loadPromptTemplates();
        loadAnnouncement();
        updateCreateButtonVisibility();
        loadUserData(); 
        updateUIAfterProfileChange(); 
        loadData();     
        renderRecentChats(); 
        renderSidebarStarred(); 
         
         
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

        // Ensure all system characters exist
        SYSTEM_CHARACTERS.forEach(sysChar => {
            const existingIdx = loaded.findIndex(c => c.id === sysChar.id);
            if (existingIdx === -1) {
                loaded.push(JSON.parse(JSON.stringify(sysChar)));
            } else if (loaded[existingIdx].creator === '@ETPIM') {
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
    
    sendMessage(prompt);
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
async function callUniversalAiApi(config, character, profile, history, temperature, attachedFile = null) {
    if(!config || !config.apiKey || config.apiKey.trim() === "") {
        throw new Error("ยังไม่ได้ระบุ API Key ในระบบ");
    }

    const apiKey = config.apiKey.trim();
    let baseUrl = (config.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models/").trim();
    const model = (config.modelName || "gemini-2.5-flash").trim();
    const providerType = config.providerType || (baseUrl.includes("generativelanguage.googleapis.com") ? "gemini" : "openai");

    const systemInstruction = `You are the specialized enterprise AI Agent "${character.name}" at ET OPC Company.
Role: ${character.role?.t || 'Operations'}
Bio: ${character.bio || ''}
System Instructions:
${character.prompt || 'Help summarize, automate tasks, and analyze documents professionally.'}${character.requirements && character.requirements.trim() !== '' ? `

Specific Requirements & Criteria (ความต้องการ / เกณฑ์คุณสมบัติ):
${character.requirements}` : ''}

User: @${profile.displayName || currentUser} (${profile.persona || 'Staff'})

Guidelines:
1. จัดรูปแบบข้อความให้อ่านง่าย สบายตา สวยงามระดับมืออาชีพ
2. ใช้ **ตัวหนา** สำหรับเน้นหัวข้อหรือข้อความสำคัญ
3. สำหรับข้อมูลเปรียบเทียบ คะแนน จุดเด่น-จุดอ่อน หรือตาราง Action Items ให้จัดเป็นตาราง Markdown Table เสมอ (เช่น | หัวข้อ | รายละเอียด | ผลประเมิน |) เพื่อความสวยงามและอ่านง่าย
4. หลีกเลี่ยงการใช้เครื่องหมาย raw markdown header ซ้ำซ้อน เช่น ### หรือเครื่องหมายขีดคั่นที่ไม่จำเป็น ให้เน้นแบ่งหัวข้อด้วยตัวหนาและตาราง`;

    if (providerType === 'gemini') {
        // --- 1. GOOGLE GEMINI API FORMAT ---
        let base = baseUrl;
        if (!base.endsWith('/')) base += '/';
        const cleanModel = model.replace(/^models\//, '');
        const endpoint = `${base}${cleanModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

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

        if (contents.length === 0) throw new Error("ไม่มีข้อความส่งให้ AI");

        const payload = {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: contents,
            generationConfig: {
                temperature: parseFloat(temperature) || 0.7,
                maxOutputTokens: 3072
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts.map(p => p.text).join('');
        }
        throw new Error("ไม่ได้รับข้อความตอบกลับจาก Gemini API");

    } else {
        // --- 2. OPENAI-COMPATIBLE API FORMAT ---
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

        if (messages.length <= 1) throw new Error("ไม่มีข้อความส่งให้ AI");

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        if (baseUrl.includes("openrouter.ai")) {
            headers['HTTP-Referer'] = window.location.origin || 'http://localhost';
            headers['X-Title'] = 'ET OPC Company Workspace';
        }

        const payload = {
            model: model,
            messages: messages,
            temperature: parseFloat(temperature) || 0.7
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

    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg bot typing-indicator';
    typingDiv.innerHTML = `
      <div class="msg-content">
          <div class="avatar" style="background:${currentCharacter.color}">${getAvatarHtml(currentCharacter)}</div>
          <div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>
    `;
    msgsContainer.appendChild(typingDiv);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    const profile = appUserData[currentUser]?.profile || { displayName: currentUser, persona: "" };
    const rawHistory = appUserData[currentUser].history[currentCharacter.id] || [];
    let historySubset = regenerateBotIdx !== null ? rawHistory.slice(0, regenerateBotIdx) : rawHistory;
    
    const activeConf = getActiveModelConfig();
    
    try {
        if(!activeConf || !activeConf.apiKey || activeConf.apiKey.trim() === "") {
            throw new Error("KEY_MISSING");
        }

        const replyText = await callUniversalAiApi(
            activeConf,
            currentCharacter,
            profile,
            historySubset,
            userGeminiPreference.temperature || activeConf.temperature,
            attachedFile
        );

        typingDiv.remove();

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
        if (typeof logTrainingDataset === "function" && currentCharacter) { const lastUserMsg = historySubset.filter(m => m.r === "user").pop()?.t || ""; logTrainingDataset(currentCharacter, lastUserMsg, replyText); }

    } catch(err) {
        typingDiv.remove();
        let errorNotice = `⚠️ **เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI:**\n${escapeHtml(err.message)}`;
        if (err.message === "KEY_MISSING") {
            errorNotice = `⚠️ **ยังไม่ได้ตั้งค่า API Key**\nกรุณาให้ผู้ดูแลระบบ (Admin) กดปุ่ม **"ตั้งค่า API & Model"** ด้านบนเพื่อบันทึก API Key ครับ`;
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
        if (typeof logTrainingDataset === "function" && currentCharacter) { const lastUserMsg = historySubset.filter(m => m.r === "user").pop()?.t || ""; logTrainingDataset(currentCharacter, lastUserMsg, replyText); }
    }
}

// --- GEMINI CONFIGURATION LOGIC ---
function loadGeminiConfigs() {
    const savedModels = localStorage.getItem(STORAGE_PREFIX + 'admin_models_v1');
    if (savedModels) {
        adminModels = JSON.parse(savedModels);
    }

    const userSaved = localStorage.getItem(STORAGE_PREFIX + 'user_pref_v1_' + currentUser);
    if (userSaved) {
        try { userGeminiPreference = JSON.parse(userSaved); } catch(e) {}
    }
    
    if (adminModels.length > 0) {
        const found = adminModels.find(m => m.id === userGeminiPreference.selectedModelId);
        if (!found) {
            userGeminiPreference.selectedModelId = adminModels[0].id;
            userGeminiPreference.temperature = adminModels[0].temperature;
        }
    }
    updateTopbarAiBadge();
}

function getActiveModelConfig() {
    if (adminModels.length === 0) return null;
    const found = adminModels.find(m => m.id === userGeminiPreference.selectedModelId);
    return found || adminModels[0];
}

function updateTopbarAiBadge() {
    const statusText = document.getElementById('topbarAiStatusText');
    const sidebarAiText = document.getElementById('sidebarAiStatusText');
    const chatStatus = document.getElementById('chatAiEngineStatus');
    const activeConf = getActiveModelConfig();
    
    const label = activeConf ? `โมเดล: ${escapeHtml(activeConf.displayName)}` : "ตั้งค่า AI & Model";
    if(statusText) statusText.textContent = label;
    if(sidebarAiText) sidebarAiText.textContent = label;

    if(chatStatus) {
        if(activeConf) {
            chatStatus.innerHTML = `<span style="font-size:11.5px; color:#10B981; font-weight:700;">🟢 พร้อมทำงาน: ${escapeHtml(activeConf.displayName)}</span>`;
        } else {
            chatStatus.innerHTML = `<span style="font-size:11.5px; color:#F59E0B; font-weight:700;">🔴 ยังไม่มีโมเดลในระบบ</span>`;
        }
    }
}

function handleAiHeaderButtonClick() {
    if (currentUserRole === 'admin') openAdminAiModal();
    else openUserModelModal();
}

function handleProviderChange() {
    const select = document.getElementById('adminAiProviderType');
    const baseInput = document.getElementById('adminAiBaseUrl');
    const modelInput = document.getElementById('adminAiDefaultModel');
    const helpLink = document.getElementById('apiKeyHelpLink');
    
    if (select.value === 'gemini') {
        baseInput.value = "https://generativelanguage.googleapis.com/v1beta/models/";
        modelInput.value = "gemini-2.5-flash";
        if(helpLink) {
            helpLink.href = "https://aistudio.google.com/app/apikey";
            helpLink.textContent = "รับ Gemini API Key ฟรี ↗";
        }
    } else {
        baseInput.value = "https://api.openai.com/v1";
        modelInput.value = "gpt-4o-mini";
        if(helpLink) {
            helpLink.href = "https://platform.openai.com/api-keys";
            helpLink.textContent = "รับ OpenAI/Custom Key ↗";
        }
    }
}

function renderAdminModels() {
    const list = document.getElementById('adminModelsList');
    if(!list) return;
    list.innerHTML = '';
    if (adminModels.length === 0) {
        list.innerHTML = '<p style="font-size:13px; color:var(--ink-faint); padding:8px;">ยังไม่มีโมเดลในระบบ</p>';
        return;
    }
    adminModels.forEach((m) => {
        const pType = m.providerType === 'openai' ? '🌐 OpenAI Format' : '⚡ Gemini Format';
        list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:8px 12px; border-radius:8px; border:1px solid var(--line);">
            <div>
                <div style="font-weight:700; color:var(--ink); font-size:13.5px;">${escapeHtml(m.displayName)} <span style="font-size:10px; color:var(--ink-faint); font-weight:normal;">(${pType})</span></div>
                <div style="font-size:11px; color:var(--ink-soft);">${escapeHtml(m.modelName)}</div>
            </div>
            <button class="btn-delete" style="padding:4px 8px; font-size:11px;" onclick="deleteAdminModel('${m.id}')">ลบ</button>
        </div>`;
    });
}

function deleteAdminModel(id) {
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
        renderAdminModels();
        updateTopbarAiBadge();
        showToast("ลบโมเดล AI เรียบร้อยแล้ว", "info");
    });
}

function openAdminAiModal() {
    document.getElementById('adminAiProviderType').value = "gemini";
    document.getElementById('adminAiBaseUrl').value = "https://generativelanguage.googleapis.com/v1beta/models/";
    document.getElementById('adminAiApiKey').value = "";
    document.getElementById('adminAiDefaultModel').value = "gemini-2.5-flash";
    document.getElementById('adminAiModelDisplayName').value = "";
    renderAdminModels();
    document.getElementById('adminAiModal').classList.remove('hidden');
}
function closeAdminAiModal() { document.getElementById('adminAiModal').classList.add('hidden'); }

function addAdminModel() {
    const providerType = document.getElementById('adminAiProviderType')?.value || "gemini";
    const baseUrl = document.getElementById('adminAiBaseUrl').value.trim() || (providerType === 'gemini' ? "https://generativelanguage.googleapis.com/v1beta/models/" : "https://api.openai.com/v1");
    const apiKey = document.getElementById('adminAiApiKey').value.trim();
    const modelName = document.getElementById('adminAiDefaultModel').value.trim() || (providerType === 'gemini' ? "gemini-2.5-flash" : "gpt-4o-mini");
    const displayName = document.getElementById('adminAiModelDisplayName').value.trim() || modelName;
    const temp = parseFloat(document.getElementById('adminAiTemperature').value) || 0.7;

    if(!apiKey) return alert("กรุณาใส่ API Key");

    const newModel = { id: 'm-' + Date.now(), providerType, baseUrl, apiKey, modelName, displayName, temperature: temp };
    adminModels.push(newModel);
    localStorage.setItem(STORAGE_PREFIX + 'admin_models_v1', JSON.stringify(adminModels));
    
    if (!userGeminiPreference.selectedModelId) {
        userGeminiPreference.selectedModelId = newModel.id;
        localStorage.setItem(STORAGE_PREFIX + 'user_pref_v1_' + currentUser, JSON.stringify(userGeminiPreference));
    }

    updateTopbarAiBadge();
    renderAdminModels();
    showToast("บันทึกโมเดล AI เรียบร้อยแล้ว", "success");
}

async function testAdminAiConnection() {
    const statusDiv = document.getElementById('adminAiTestStatus');
    const btn = document.getElementById('btnAdminTestAi');
    const providerType = document.getElementById('adminAiProviderType')?.value || "gemini";
    const baseUrl = document.getElementById('adminAiBaseUrl').value.trim() || (providerType === 'gemini' ? "https://generativelanguage.googleapis.com/v1beta/models/" : "https://api.openai.com/v1");
    const apiKey = document.getElementById('adminAiApiKey').value.trim();
    const model = document.getElementById('adminAiDefaultModel').value.trim() || (providerType === 'gemini' ? "gemini-2.5-flash" : "gpt-4o-mini");

    if(!apiKey) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(220,38,38,0.1)';
        statusDiv.style.color = '#DC2626';
        statusDiv.textContent = '❌ กรุณากรอก API Key ก่อนทดสอบ';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'กำลังทดสอบเชื่อมต่อ...';
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(59,130,246,0.1)';
    statusDiv.style.color = '#3B82F6';
    statusDiv.textContent = '⏳ กำลังส่งคำขอทดสอบไปยัง API...';

    try {
        const testChar = { name: "ระบบทดสอบ", bio: "ผู้ช่วยทดสอบ", prompt: "คุณคือระบบทดสอบ ตอบกลับสั้นๆ ไม่เกิน 10 คำ" };
        const testProfile = { displayName: "Admin" };
        const testHistory = [{ r: 'user', t: 'สวัสดี ทดสอบระบบ' }];
        const testConf = { providerType, baseUrl, apiKey, modelName: model };
        
        const resultText = await callUniversalAiApi(testConf, testChar, testProfile, testHistory, 0.7);

        statusDiv.style.background = 'rgba(16,185,129,0.1)';
        statusDiv.style.color = '#10B981';
        statusDiv.innerHTML = `✅ เชื่อมต่อสำเร็จ! AI ตอบกลับมาว่า:<br><em>"${escapeHtml(resultText)}"</em>`;
    } catch(err) {
        statusDiv.style.background = 'rgba(220,38,38,0.1)';
        statusDiv.style.color = '#DC2626';
        statusDiv.innerHTML = `❌ เชื่อมต่อไม่สำเร็จ: ${escapeHtml(err.message)}<br><small>กรุณาตรวจสอบ URL, API Key และชื่อโมเดล</small>`;
    } finally {
        btn.disabled = false;
        btn.textContent = '🧪 ทดสอบเชื่อมต่อ';
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
                  <div class="bubble">${formatRoleplayText(msgText)}${m.r === 'bot' ? fileCardHtml : ''}</div>
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
function formatRoleplayText(text) {
    if(!text) return "";
    let s = escapeHtml(text);
    
    // 1. Visual Scorecard detection (e.g. คะแนนรวม: 88/100, Match Score: 85/100)
    s = s.replace(/(?:คะแนนรวม|คะแนนความเหมาะสม|Match Score|Overall Score)[\s:*]+([0-9]{1,3})\s*(?:\/\s*100|%|คะแนน)/gi, (match, scoreStr) => {
        const score = parseInt(scoreStr, 10);
        if (isNaN(score) || score > 100) return match;
        const scoreClass = score >= 80 ? 'high' : (score >= 60 ? 'medium' : 'low');
        const statusText = score >= 80 ? '🟢 เหมาะสมสูง / ผ่านเกณฑ์มาตรฐาน' : (score >= 60 ? '🟡 ระดับปานกลาง / ควรพิจารณาเพิ่มเติม' : '🔴 ต่ำกว่าเกณฑ์ / ต้องพัฒนาเพิ่มเติม');
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
        </div>`;
    });

    // 2. Code blocks with Copy Button
    s = s.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<div class="code-block-wrapper"><div class="code-block-header"><span>${lang || 'code'}</span><button class="btn-copy-code" onclick="copyCodeBlock(this)">📋 คัดลอก</button></div><pre><code>${code}</code></pre></div>`;
    });

    // 3. Robust Markdown Tables Parsing
    s = parseMarkdownTables(s);

    // 4. Markdown Headings (Convert ###, ##, # to clean styled headers without raw #)
    s = s.replace(/^###\s+(.+)$/gm, '<h4 class="chat-heading-3">$1</h4>');
    s = s.replace(/^##\s+(.+)$/gm, '<h3 class="chat-heading-2">$1</h3>');
    s = s.replace(/^#\s+(.+)$/gm, '<h2 class="chat-heading-1">$1</h2>');

    // 5. Horizontal Dividers (---, ___, ***)
    s = s.replace(/^(?:---|___|\*\*\*)\s*$/gm, '<hr class="chat-divider">');

    // 6. Blockquotes (> text)
    s = s.replace(/^>\s*(.+)$/gm, '<blockquote class="chat-quote">$1</blockquote>');

    // 7. Bullet Lists (* item or - item)
    s = s.replace(/^[*-]\s+(.+)$/gm, '<div class="chat-bullet-row"><span class="chat-bullet-dot">•</span><span class="chat-bullet-text">$1</span></div>');

    // 8. Bold and Italic text
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^\*\n]+)\*/g, '<span style="font-style:italic; opacity:0.88;">$1</span>');

    // 9. Newlines to <br> with cleanup around block elements
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
    
    let filteredChars = appCharacters.filter(c => !c.isPrivate || c.isPrivate === false || c.creator === "@" + currentUser);
    
    if(currentSearchQuery) {
        filteredChars = filteredChars.filter(c => c.name.toLowerCase().includes(currentSearchQuery) || (c.bio && c.bio.toLowerCase().includes(currentSearchQuery)));
    }
    
    if (systemFilter === 'fav') {
        let favs = appUserData[currentUser]?.favs || [];
        filteredChars = filteredChars.filter(c => favs.includes(c.id));
    } else if (systemFilter === 'my_chars') {
        filteredChars = filteredChars.filter(c => c.creator === "@" + currentUser);
    }
    
    if (activeTagFilters.length > 0) {
        filteredChars = filteredChars.filter(c => {
            return activeTagFilters.some(fVal => {
                const matchTag = c.tags && c.tags.some(t => t.v === fVal || t.c === fVal);
                const matchRole = c.role && (c.role.v === fVal);
                return matchTag || matchRole;
            });
        });
    }
    
    if (currentSearchQuery || activeTagFilters.length > 0 || systemFilter !== 'all') {
        if(featuredSection) featuredSection.style.display = 'none';
    } else {
        if(featuredSection) featuredSection.style.display = 'block';
        renderFeatured();
    }

    if (filteredChars.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--ink-faint); font-weight: 700; font-size: 14.5px;">ไม่พบ Agent ที่ตรงกับตัวกรองที่เลือก</p>';
        return;
    }

    let favs = appUserData[currentUser]?.favs || [];

    filteredChars.forEach(c => {
        let isFav = favs.includes(c.id);
        const card = document.createElement('div');
        card.className = 'char-card';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            if(!e.target.closest('.btn-star')) {
                openChat(c.id);
            }
        };
        
        let tagsHtml = c.tags && c.tags.length > 0 ? c.tags.map(t => {
            return `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:var(--surface-2); border:1px solid var(--line); color:var(--ink-soft);"><span style="width:6px; height:6px; border-radius:50%; background:${t.color || '#8B0000'};"></span>${escapeHtml(t.t)}</span>`;
        }).join('') : '';

        card.innerHTML = `
          <div class="avatar-row">
            <div style="display:flex; gap:12px; align-items:center; flex:1;">
              <div class="avatar" style="background:${c.color || 'linear-gradient(135deg,#8B0000,#0F172A)'}">${getAvatarHtml(c)}</div>
              <div>
                <p class="char-name">${escapeHtml(c.name)}</p>
                <p class="char-creator">${c.role?.t || 'Agent'}</p>
              </div>
            </div>
            <button class="btn-star ${isFav ? 'active' : ''}" onclick="toggleFavorite('${c.id}', event)" title="${isFav ? 'เลิกติดดาว' : 'ติดดาว Agent'}" style="background:transparent; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; position:relative; z-index:5;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? '#F59E0B' : 'none'}" stroke="${isFav ? '#F59E0B' : 'var(--ink-faint)'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
          <p class="char-bio">${escapeHtml(c.bio)}</p>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">${tagsHtml}</div>
          <button class="btn-enter" onclick="openChat('${c.id}'); event.stopPropagation();">เปิดหน้าต่างสั่งงาน</button>
        `;
        grid.appendChild(card);
    });
    renderTagsUI();
    renderSidebarStarred();
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

function setTheme(mode){
    document.documentElement.setAttribute('data-theme', mode);
    document.getElementById('btnLight')?.classList.toggle('active', mode === 'light');
    document.getElementById('btnDark')?.classList.toggle('active', mode === 'dark');
}

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
        list.innerHTML = '<p style="font-size:12px; color:var(--ink-faint); padding:6px 12px; margin:0;">ยังไม่มี Agent ที่ติดดาว</p>';
        return;
    }

    starredAgents.forEach(c => {
        list.innerHTML += `
        <div class="sidebar-starred-item" onclick="openChat('${c.id}')" title="${escapeHtml(c.name)}">
            <div class="sidebar-starred-avatar" style="background:${c.color || 'linear-gradient(135deg,#8B0000,#0F172A)'}">
                ${getAvatarHtml(c)}
            </div>
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
            คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — ET OPC Company © 2026 • จัดทำโดยระบบอัตโนมัติ AI
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
            คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — ET OPC Company © 2026
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


// --- QUICK GUIDE MODAL ---
window.openQuickGuideModal = openQuickGuideModal;
function openQuickGuideModal() {
    document.getElementById('quickGuideModal')?.classList.remove('hidden');
};
window.closeQuickGuideModal = closeQuickGuideModal;
function closeQuickGuideModal() {
    document.getElementById('quickGuideModal')?.classList.add('hidden');
};


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
      <span>คณะวิศวกรรมศาสตร์และเทคโนโลยี (ET) — ET OPC Company © 2026</span>
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
    if (tabName === 'prompts') renderAdminPromptList();
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
    const allowUserCreate = localStorage.getItem(STORAGE_PREFIX + 'allow_user_create') !== 'false';
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
    const allowed = toggle ? toggle.checked : true;
    localStorage.setItem(STORAGE_PREFIX + 'allow_user_create', allowed ? 'true' : 'false');
    updateCreateButtonVisibility();
    showToast(allowed ? "อนุญาตให้ผู้ใช้ทุกคนสร้าง Agent ได้" : "จำกัดสิทธิ์ให้เฉพาะ Admin เท่านั้นที่สร้าง Agent ได้", "info");
};

function updateCreateButtonVisibility() {
    const allowUserCreate = localStorage.getItem(STORAGE_PREFIX + 'allow_user_create') !== 'false';
    const btnCreateChar = document.getElementById('btnCreateChar');
    const sidebarBtnCreate = document.getElementById('sidebarBtnCreate');

    const shouldShow = (currentUserRole === 'admin') || allowUserCreate;
    if (btnCreateChar) btnCreateChar.style.display = shouldShow ? 'inline-flex' : 'none';
    if (sidebarBtnCreate) sidebarBtnCreate.style.display = shouldShow ? 'flex' : 'none';
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
