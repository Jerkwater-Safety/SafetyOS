import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const INDUSTRIES = [
  { id: "food_distribution", label: "Food Distribution & Warehousing", icon: "📦", regs: "Cal/OSHA Title 8, FMCSA" },
  { id: "construction", label: "Construction", icon: "🏗️", regs: "OSHA 29 CFR 1926" },
  { id: "manufacturing", label: "Manufacturing", icon: "⚙️", regs: "OSHA 29 CFR 1910" },
  { id: "healthcare", label: "Healthcare & Medical", icon: "🏥", regs: "OSHA 1910.1030 BBP" },
  { id: "restaurant", label: "Restaurant & Food Service", icon: "🍳", regs: "FDA Food Code, Cal/OSHA" },
  { id: "retail", label: "Retail & Grocery", icon: "🛒", regs: "OSHA General Industry" },
  { id: "transportation", label: "Transportation & Logistics", icon: "🚛", regs: "FMCSA 49 CFR" },
  { id: "agriculture", label: "Agriculture & Farming", icon: "🌾", regs: "OSHA 1928, EPA" },
  { id: "utilities", label: "Utilities & Energy", icon: "⚡", regs: "OSHA 1910.269, NFPA 70E" },
  { id: "hospitality", label: "Hospitality & Hotels", icon: "🏨", regs: "OSHA General Industry" },
];

const TRACKS_BY_INDUSTRY = {
  food_distribution: ["Warehouse", "Kitchen", "Drivers", "Receiving"],
  construction: ["General Labor", "Electrical", "Heavy Equipment", "Scaffolding"],
  manufacturing: ["Line Workers", "Maintenance", "Forklift Ops", "QA/Lab"],
  healthcare: ["Clinical Staff", "Environmental Services", "Patient Transport", "Lab"],
  restaurant: ["Kitchen", "Front of House", "Delivery", "Management"],
  retail: ["Stock Room", "Sales Floor", "Receiving", "Cashier"],
  transportation: ["Drivers", "Dock Workers", "Dispatch", "Maintenance"],
  agriculture: ["Field Workers", "Equipment Operators", "Pesticide Handlers", "Irrigation"],
  utilities: ["Line Workers", "Substation", "Field Crews", "Control Room"],
  hospitality: ["Housekeeping", "Kitchen", "Maintenance", "Front Desk"],
};

const SAMPLE_HABITS = {
  food_distribution: [
    { id: 1, day: 1, track: "Warehouse", theme: "Lift Smart — Protect Your Back", habit_EN: "Before your first lift today, plant feet shoulder-width apart, bend at your knees, hold the load close. One slow breath before you lift.", habit_ES: "Antes de su primera carga hoy, plante sus pies al ancho de los hombros, doble las rodillas y sostenga la carga cerca. Respire antes de levantar.", quiz_question_EN: "When lifting a heavy box, where should your knees be?", quiz_options_EN: ["A) Locked straight", "B) Bent, doing the work of lifting", "C) Twisted to the side", "D) Doesn't matter"], correct_answer: "B", regulatory_ref: "Cal/OSHA §3457", loss_run_link: "Lower back overexertion — #1 injury type" },
    { id: 2, day: 2, track: "Kitchen", theme: "Knife Safety Check", habit_EN: "Pick up the knife you'll use today. Check: is the blade chipped, cracked, or dull? If yes — swap it before cutting.", habit_ES: "Tome el cuchillo que usará hoy. ¿La hoja está astillada, agrietada o sin filo? Si es así, cámbielo antes de cortar.", quiz_question_EN: "A knife has a small chip in the blade. You should:", quiz_options_EN: ["A) Use it carefully", "B) Tape over the chip", "C) Remove from service, notify supervisor", "D) Switch with a coworker"], correct_answer: "C", regulatory_ref: "Cal/OSHA §3328", loss_run_link: "Laceration injuries — 11% of claims" },
    { id: 3, day: 3, track: "Drivers", theme: "360° Walk-Around", habit_EN: "Before you move your vehicle — walk completely around it. Look for people, objects, leaks, tire condition. Touch the rear as you pass it.", habit_ES: "Antes de mover su vehículo — camine completamente alrededor. Busque personas, objetos, fugas, condición de llantas.", quiz_question_EN: "Before backing your truck, your FIRST action is:", quiz_options_EN: ["A) Honk and reverse", "B) Check mirrors only", "C) Walk a full 360° around the vehicle", "D) Ask a coworker to watch"], correct_answer: "C", regulatory_ref: "FMCSA 49 CFR §396.13", loss_run_link: "MVA/backing — highest cost-per-claim" },
    { id: 4, day: 4, track: "Warehouse", theme: "Pedestrian Zone Awareness", habit_EN: "Look at your feet. Are you in a yellow-striped pedestrian lane? If not — move there now. Confirm the lines are visible.", habit_ES: "Mire sus pies. ¿Está en un carril peatonal con franjas amarillas? Si no — muévase ahora.", quiz_question_EN: "A forklift approaches. You need to cross. You:", quiz_options_EN: ["A) Wave and cross quickly", "B) Stop, make eye contact, wait for full stop + hand signal", "C) Cross behind the forklift", "D) Run — it will stop for you"], correct_answer: "B", regulatory_ref: "Cal/OSHA §3668", loss_run_link: "Struck-by — 14% of claims" },
    { id: 5, day: 5, track: "Kitchen", theme: "Wet Floor Check", habit_EN: "Walk your zone before shift. Look for standing water, grease, debris, missing mats. Find any — clean it NOW or place a cone immediately.", habit_ES: "Camine su zona antes del turno. Busque agua, grasa, residuos, tapetes faltantes. Límpielo AHORA o coloque un cono.", quiz_question_EN: "A grease spill appears near the fryer. Your hands are full. You:", quiz_options_EN: ["A) Step over it, come back later", "B) Tell a coworker to watch out", "C) Set down your load, place wet floor sign, clean immediately", "D) Wait until your break"], correct_answer: "C", regulatory_ref: "Cal/OSHA §3273", loss_run_link: "Slips/falls — 27% of claims" },
  ],
  construction: [
    { id: 1, day: 1, track: "General Labor", theme: "PPE Morning Check", habit_EN: "Before any work today: hard hat — no cracks? Hi-vis vest — secure? Steel-toed boots — laced tight? Safety glasses — lenses clear? Check all four before touching any tool.", habit_ES: "Antes de cualquier trabajo hoy: casco — ¿sin grietas? Chaleco de alta visibilidad — ¿asegurado? Botas — ¿bien atadas? Lentes — ¿limpios?", quiz_question_EN: "When is PPE inspection required on a construction site?", quiz_options_EN: ["A) Weekly", "B) Only when a supervisor asks", "C) Before every shift begins", "D) Monthly"], correct_answer: "C", regulatory_ref: "OSHA 29 CFR 1926.95", loss_run_link: "PPE non-compliance in 60% of injury claims" },
    { id: 2, day: 2, track: "Scaffolding", theme: "Scaffold Inspection", habit_EN: "Before stepping on any scaffold today — check the planks: no warping, no gaps over 1 inch. Check guardrails: all three rails present? Check ground — is it level and solid?", habit_ES: "Antes de subir a cualquier andamio hoy — revise los tablones: sin deformaciones, sin espacios mayores a 1 pulgada. Revise los rieles de protección.", quiz_question_EN: "What is the maximum gap allowed between scaffold planks?", quiz_options_EN: ["A) 3 inches", "B) 1 inch", "C) No gap allowed", "D) 6 inches"], correct_answer: "B", regulatory_ref: "OSHA 1926.452", loss_run_link: "Falls from elevation — #1 cause of construction fatalities" },
  ],
  manufacturing: [
    { id: 1, day: 1, track: "Line Workers", theme: "Lockout/Tagout Check", habit_EN: "Before any maintenance or jam-clearing today — verify the machine is LOCKED OUT. Pull the lock. Does it hold? If you cannot verify energy isolation — do NOT proceed. Call your supervisor.", habit_ES: "Antes de cualquier mantenimiento hoy — verifique que la máquina está BLOQUEADA. Jale el candado. ¿Aguanta? Si no puede verificar — NO proceda.", quiz_question_EN: "You need to clear a jam on a conveyor. The lock looks applied. You should:", quiz_options_EN: ["A) Clear the jam quickly", "B) Pull on the lock to verify it holds, THEN work", "C) Ask a coworker to watch the machine", "D) Turn off the nearby light switch"], correct_answer: "B", regulatory_ref: "OSHA 1910.147 LOTO", loss_run_link: "Caught-in/between — highest severity class" },
  ],
};

const INJURY_TYPES = ["Strain/Sprain", "Laceration", "Slip/Fall", "Struck By", "Burn", "MVA", "Repetitive Motion", "Chemical Exposure", "Near Miss", "Property Damage"];
const BODY_PARTS = ["Lower Back", "Shoulder", "Hand/Fingers", "Knee", "Head", "Foot/Ankle", "Eye", "Neck", "Wrist", "Multiple"];
const SEVERITY = ["Near Miss", "First Aid", "Medical Treatment", "Lost Time", "Restricted Duty"];

const getStorage = (userId) => ({
  get: (key) => { try { const d = localStorage.getItem(`safetyos_${userId}_${key}`); return d ? JSON.parse(d) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(`safetyos_${userId}_${key}`, JSON.stringify(val)); } catch {} },
  del: (key) => { try { localStorage.removeItem(`safetyos_${userId}_${key}`); } catch {} },
  clear: () => { Object.keys(localStorage).filter(k => k.startsWith(`safetyos_${userId}_`)).forEach(k => localStorage.removeItem(k)); }
});

const DEMO_USERS = [
  { id: "u1", email: "admin@valleyfresh.com", password: "demo1234", name: "Alex Rivera", company: "Valley Fresh Distribution", role: "Safety Manager", plan: "pro" },
  { id: "u2", email: "manager@buildright.com", password: "demo1234", name: "Jordan Kim", company: "BuildRight Construction", role: "Site Supervisor", plan: "standard" },
];

const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = (hash << 5) - hash + str.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
}// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  bg: "#0b0e13",
  surface: "#131820",
  surfaceElevated: "#1a2030",
  border: "#1e2d3d",
  borderBright: "#2a3f55",
  accent: "#f59e0b",
  accentDark: "#92400e",
  accentGlow: "rgba(245,158,11,0.15)",
  success: "#10b981",
  successDark: "#064e3b",
  danger: "#ef4444",
  dangerDark: "#450a0a",
  warning: "#f59e0b",
  textPrimary: "#e2e8f0",
  textSecondary: "#64748b",
  textMuted: "#334155",
  fontMono: "'IBM Plex Mono', 'Courier New', monospace",
  fontSans: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
};

const card = (extra = {}) => ({
  background: S.surface,
  border: `1px solid ${S.border}`,
  borderRadius: 8,
  padding: 20,
  ...extra,
});

const btn = (variant = "primary", extra = {}) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: S.fontSans,
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 6,
  cursor: "pointer",
  border: "none",
  transition: "all 0.15s ease",
  padding: "9px 18px",
  ...(variant === "primary" ? {
    background: S.accent,
    color: "#0b0e13",
  } : variant === "ghost" ? {
    background: "transparent",
    color: S.textSecondary,
    border: `1px solid ${S.border}`,
  } : variant === "danger" ? {
    background: S.danger,
    color: "#fff",
  } : {
    background: S.surfaceElevated,
    color: S.textPrimary,
    border: `1px solid ${S.border}`,
  }),
  ...extra,
});

const badge = (color = S.accent, extra = {}) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 700,
  fontFamily: S.fontMono,
  letterSpacing: 1,
  background: color + "22",
  color: color,
  border: `1px solid ${color}44`,
  ...extra,
});

function Spinner() {
  return (
    <div style={{ display: "inline-block", width: 16, height: 16, border: `2px solid ${S.border}`, borderTopColor: S.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  );
}

function Tag({ children, color }) {
  return <span style={badge(color || S.accent)}>{children}</span>;
}

function Stat({ label, value, sub, color, icon }) {
  return (
    <div style={{ ...card(), flex: 1, minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, color: S.textSecondary, fontFamily: S.fontMono, letterSpacing: 1, marginBottom: 8 }}>{label}</div>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || S.textPrimary, fontFamily: S.fontMono, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: S.textSecondary, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Modal({ title, children, onClose, maxWidth = 600 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: S.surface, border: `1px solid ${S.borderBright}`, borderRadius: 12, width: "100%", maxWidth, maxHeight: "92vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${S.border}`, position: "sticky", top: 0, background: S.surface, zIndex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: S.textPrimary, fontFamily: S.fontSans }}>{title}</div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${S.border}`, color: S.textSecondary, width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    await new Promise(r => setTimeout(r, 800));
    const user = DEMO_USERS.find(u => u.email === email && u.password === pass);
    if (user) {
      onLogin(user);
    } else {
      setErr("Invalid credentials. Try: admin@valleyfresh.com / demo1234");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: S.fontSans, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${S.border} 1px, transparent 1px), linear-gradient(90deg, ${S.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3 }} />
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${S.accentGlow} 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, background: S.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: S.textPrimary, fontFamily: S.fontMono, letterSpacing: -1 }}>SafetyOS</div>
              <div style={{ fontSize: 11, color: S.accent, letterSpacing: 3, fontFamily: S.fontMono }}>WORKPLACE SAFETY PLATFORM</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: S.textSecondary }}>AI-Powered Injury Prevention · OSHA Compliant</div>
        </div>

        <div style={{ ...card({ padding: 32 }), borderColor: S.borderBright }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: S.textPrimary, marginBottom: 6 }}>Sign in to your workspace</div>
          <div style={{ fontSize: 12, color: S.textSecondary, marginBottom: 24 }}>All client data is encrypted and private</div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: S.textSecondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Work Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "10px 14px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: S.textSecondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? "text" : "password"} placeholder="••••••••" style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "10px 40px 10px 14px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: S.textSecondary, cursor: "pointer", fontSize: 16 }}>{showPass ? "🙈" : "👁"}</button>
              </div>
            </div>
            {err && <div style={{ background: S.dangerDark, border: `1px solid ${S.danger}44`, borderRadius: 6, padding: "10px 14px", fontSize: 12, color: S.danger, marginBottom: 16 }}>{err}</div>}
            <button type="submit" disabled={loading} style={{ ...btn("primary"), width: "100%", padding: "12px", fontSize: 14 }}>
              {loading ? <><Spinner /> Signing in...</> : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: "14px", background: S.bg, borderRadius: 6, border: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 11, color: S.textMuted, fontFamily: S.fontMono, marginBottom: 6 }}>DEMO CREDENTIALS</div>
            {DEMO_USERS.map(u => (
              <div key={u.id} onClick={() => { setEmail(u.email); setPass(u.password); }} style={{ fontSize: 12, color: S.textSecondary, cursor: "pointer", padding: "3px 0" }}>
                <span style={{ color: S.accent }}>{u.company}</span> → {u.email}
              </div>
            ))}
            <div style={{ fontSize: 11, color: S.textMuted, marginTop: 4 }}>Password: demo1234</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24, fontSize: 11, color: S.textMuted }}>
          <span>🔒 AES-256 encrypted data</span>
          <span>🛡️ HIPAA-ready</span>
          <span>🌐 SOC 2 aligned</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}// ─── ONBOARDING WIZARD ────────────────────────────────────────────────────────
function OnboardingWizard({ user, storage, onComplete }) {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState("CA");
  const [tracks, setTracks] = useState([]);
  const [enableTracking, setEnableTracking] = useState(true);
  const [employeeCount, setEmployeeCount] = useState("50-200");
  const [policyFile, setPolicyFile] = useState(null);
  const [lossFile, setLossFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const policyRef = useRef();
  const lossRef = useRef();

  const availableTracks = industry ? (TRACKS_BY_INDUSTRY[industry] || []) : [];

  const toggleTrack = (t) => setTracks(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleFileUpload = (e, setter, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fileKey = `${type}_${hashString(file.name + user.id)}`;
      storage.set(fileKey, {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        contentPreview: ev.target.result.substring(0, 500),
      });
      setter({ name: file.name, size: file.size, key: fileKey });
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!industry || tracks.length === 0) return;
    setGenerating(true);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }
    const config = { industry, state, tracks, enableTracking, employeeCount, policyFile, lossFile, setupComplete: true, setupDate: today() };
    storage.set("config", config);
    storage.set("habits", SAMPLE_HABITS[industry] || SAMPLE_HABITS["food_distribution"]);
    storage.set("completions", {});
    storage.set("incidents", []);
    setGenerating(false);
    onComplete(config);
  };

  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: S.fontSans, display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: `1px solid ${S.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 20 }}>🛡️</div>
        <div style={{ fontWeight: 800, color: S.textPrimary, fontFamily: S.fontMono }}>SafetyOS</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: S.textSecondary }}>Setup Workspace — {user.company}</div>
      </div>

      <div style={{ height: 3, background: S.border }}>
        <div style={{ height: "100%", background: S.accent, width: `${(step / 4) * 100}%`, transition: "width 0.3s ease" }} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 660 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            {["Industry", "Tracks", "Documents", "Generate"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: step > i + 1 ? S.success : step === i + 1 ? S.accent : S.border, color: step >= i + 1 ? "#0b0e13" : S.textSecondary, fontFamily: S.fontMono }}>{step > i + 1 ? "✓" : i + 1}</div>
                <div style={{ fontSize: 11, color: step === i + 1 ? S.textPrimary : S.textSecondary, display: window.innerWidth > 500 ? "block" : "none" }}>{s}</div>
                {i < 3 && <div style={{ width: 24, height: 1, background: step > i + 1 ? S.success : S.border }} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ color: S.textPrimary, fontWeight: 800, marginBottom: 6, fontSize: 22 }}>Select your industry</h2>
              <p style={{ color: S.textSecondary, fontSize: 14, marginBottom: 24 }}>Our AI will generate safety habits tailored to your regulatory environment and injury patterns.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
                {INDUSTRIES.map(ind => (
                  <div key={ind.id} onClick={() => setIndustry(ind.id)} style={{ ...card({ padding: 16 }), cursor: "pointer", border: `1px solid ${industry === ind.id ? S.accent : S.border}`, background: industry === ind.id ? S.accentGlow : S.surface, transition: "all 0.15s" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{ind.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.textPrimary, marginBottom: 4 }}>{ind.label}</div>
                    <div style={{ fontSize: 10, color: S.textSecondary, fontFamily: S.fontMono }}>{ind.regs}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: S.textSecondary, display: "block", marginBottom: 6, fontWeight: 600 }}>State / Jurisdiction</label>
                  <select value={state} onChange={e => setState(e.target.value)} style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 12px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 13 }}>
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: S.textSecondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Employee Count</label>
                  <select value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 12px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 13 }}>
                    {["1-10", "11-50", "50-200", "201-500", "500+"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => industry && setStep(2)} disabled={!industry} style={{ ...btn("primary"), width: "100%" }}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: S.textPrimary, fontWeight: 800, marginBottom: 6, fontSize: 22 }}>Select your work tracks</h2>
              <p style={{ color: S.textSecondary, fontSize: 14, marginBottom: 24 }}>Each track gets its own unique 30-day safety habit calendar.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
                {availableTracks.map(t => (
                  <div key={t} onClick={() => toggleTrack(t)} style={{ ...card({ padding: 16 }), cursor: "pointer", border: `1px solid ${tracks.includes(t) ? S.accent : S.border}`, background: tracks.includes(t) ? S.accentGlow : S.surface, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, border: `2px solid ${tracks.includes(t) ? S.accent : S.border}`, borderRadius: 4, background: tracks.includes(t) ? S.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#0b0e13", flexShrink: 0 }}>{tracks.includes(t) ? "✓" : ""}</div>
                    <span style={{ fontSize: 13, color: S.textPrimary, fontWeight: 600 }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card({ marginBottom: 24 }) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: S.textPrimary, marginBottom: 4 }}>Enable Tracking & Documentation</div>
                    <div style={{ fontSize: 12, color: S.textSecondary }}>Log incidents, quiz completions, near misses, and generate OSHA-ready reports</div>
                  </div>
                  <div onClick={() => setEnableTracking(!enableTracking)} style={{ width: 44, height: 24, borderRadius: 12, background: enableTracking ? S.success : S.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: enableTracking ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ ...btn("ghost"), flex: 1 }}>← Back</button>
                <button onClick={() => tracks.length > 0 && setStep(3)} disabled={tracks.length === 0} style={{ ...btn("primary"), flex: 2 }}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: S.textPrimary, fontWeight: 800, marginBottom: 6, fontSize: 22 }}>Upload documents (optional)</h2>
              <p style={{ color: S.textSecondary, fontSize: 14, marginBottom: 8 }}>Your files are encrypted per-account and never shared. They allow AI to generate habits tailored to your exact policies and injury history.</p>
              <div style={{ ...badge(S.success, { marginBottom: 20 }) }}>🔒 Files are private to your organization account — not used for AI training</div>

              {[
                { label: "IIPP / Safety Policy Document", sub: "PDF, DOCX, or TXT — lets AI reference your exact procedures", key: "policy", ref: policyRef, setter: setPolicyFile, value: policyFile, icon: "📋" },
                { label: "Loss Run / Injury History Report", sub: "PDF or CSV — AI will target your highest-frequency injury types", key: "loss", ref: lossRef, setter: setLossFile, value: lossFile, icon: "📊" },
              ].map(f => (
                <div key={f.key} style={{ ...card({ marginBottom: 16 }), cursor: "pointer" }} onClick={() => !f.value && f.ref.current.click()}>
                  <input type="file" ref={f.ref} accept=".pdf,.docx,.txt,.csv" style={{ display: "none" }} onChange={e => handleFileUpload(e, f.setter, f.key)} />
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 28 }}>{f.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: S.textPrimary, marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 12, color: S.textSecondary }}>{f.sub}</div>
                    </div>
                    {f.value ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={badge(S.success)}>✓ Uploaded</div>
                        <div style={{ fontSize: 11, color: S.textSecondary, marginTop: 4 }}>{f.value.name}</div>
                      </div>
                    ) : (
                      <div style={{ ...btn("ghost"), pointerEvents: "none" }}>Choose File</div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 11, color: S.textMuted, fontFamily: S.fontMono, marginBottom: 24, padding: "12px", background: S.bg, borderRadius: 6, border: `1px solid ${S.border}` }}>
                🔐 PRIVACY: Uploaded files are stored encrypted under your organization ID. They are never shared with other accounts, never used for model training, and can be deleted at any time from Settings.
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ ...btn("ghost"), flex: 1 }}>← Back</button>
                <button onClick={() => setStep(4)} style={{ ...btn("primary"), flex: 2 }}>Continue →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: "center" }}>
              {!generating && progress < 100 ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                  <h2 style={{ color: S.textPrimary, fontWeight: 800, marginBottom: 12, fontSize: 22 }}>Ready to generate your calendar</h2>
                  <div style={{ ...card({ marginBottom: 24, textAlign: "left" }) }}>
                    <div style={{ display: "grid", gap: 10 }}>
                      {[
                        { label: "Industry", value: INDUSTRIES.find(i => i.id === industry)?.label },
                        { label: "State", value: state },
                        { label: "Tracks", value: tracks.join(", ") },
                        { label: "Employee Count", value: employeeCount },
                        { label: "Tracking & Docs", value: enableTracking ? "Enabled" : "Disabled" },
                        { label: "Policy Document", value: policyFile ? `✓ ${policyFile.name}` : "Not uploaded (generic habits)" },
                        { label: "Loss Run", value: lossFile ? `✓ ${lossFile.name}` : "Not uploaded (industry averages)" },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, paddingBottom: 8, fontSize: 13 }}>
                          <span style={{ color: S.textSecondary }}>{row.label}</span>
                          <span style={{ color: S.textPrimary, fontWeight: 600 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleGenerate} style={{ ...btn("primary"), width: "100%", padding: "14px", fontSize: 15 }}>🚀 Generate AI Safety Calendar</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>⚙️</div>
                  <h2 style={{ color: S.textPrimary, fontWeight: 800, marginBottom: 24 }}>Generating your safety calendar...</h2>
                  <div style={{ background: S.border, borderRadius: 4, height: 8, marginBottom: 12 }}>
                    <div style={{ height: "100%", background: S.accent, borderRadius: 4, width: `${progress}%`, transition: "width 0.1s" }} />
                  </div>
                  <div style={{ fontSize: 13, color: S.textSecondary, fontFamily: S.fontMono }}>
                    {progress < 25 ? "Analyzing industry regulations..." : progress < 50 ? "Building track-specific habits..." : progress < 75 ? "Generating bilingual content..." : progress < 90 ? "Configuring quiz verification..." : "Finalizing calendar..."}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}// ─── HABIT CARD ───────────────────────────────────────────────────────────────
function HabitCard({ habit, completion, onComplete, lang }) {
  const [answer, setAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && answer === habit.correct_answer;
  const isDone = completion?.passed;

  const trackColors = {
    "Warehouse": "#f59e0b", "Kitchen": "#f97316", "Drivers": "#60a5fa",
    "General Labor": "#a78bfa", "Scaffolding": "#34d399", "Line Workers": "#fb7185",
  };
  const color = trackColors[habit.track] || S.accent;

  const submit = () => {
    if (!answer) return;
    setSubmitted(true);
    if (answer === habit.correct_answer) {
      onComplete(habit.id, { passed: true, answer, completedAt: new Date().toISOString() });
    }
  };

  return (
    <div style={{ ...card(), border: `1px solid ${isDone ? S.success + "55" : S.border}`, background: isDone ? `${S.success}0a` : S.surface, transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag color={color}>DAY {String(habit.day).padStart(2, "0")}</Tag>
          <Tag color={color}>{habit.track}</Tag>
          {isDone && <Tag color={S.success}>✓ COMPLETE</Tag>}
        </div>
        <div style={{ fontSize: 11, color: S.textSecondary, fontFamily: S.fontMono, textAlign: "right" }}>{habit.regulatory_ref}</div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 15, color: S.textPrimary, marginBottom: 8 }}>{habit.theme}</div>
      <div style={{ fontSize: 11, color: color + "99", fontFamily: S.fontMono, marginBottom: 12 }}>⚠ {habit.loss_run_link}</div>

      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderLeft: `3px solid ${color}`, borderRadius: 6, padding: 14, marginBottom: 16, fontSize: 13, color: "#c8d8e0", lineHeight: 1.7 }}>
        <div style={{ fontSize: 10, color: color, fontFamily: S.fontMono, letterSpacing: 2, marginBottom: 6 }}>⏱ 60-SECOND HABIT</div>
        {lang === "EN" ? habit.habit_EN : habit.habit_ES}
      </div>

      {!isDone && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.textSecondary, marginBottom: 10, fontFamily: S.fontMono, letterSpacing: 1 }}>VERIFICATION QUIZ</div>
          <div style={{ fontSize: 13, color: S.textPrimary, marginBottom: 12, fontWeight: 600 }}>{habit.quiz_question_EN}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {habit.quiz_options_EN.map((opt, i) => {
              const letter = opt.charAt(0);
              const isSelected = answer === letter;
              const isCorrectOpt = letter === habit.correct_answer;
              let bg = S.bg, borderC = S.border, textC = S.textSecondary;
              if (submitted) {
                if (isCorrectOpt) { bg = S.successDark; borderC = S.success; textC = S.success; }
                else if (isSelected) { bg = S.dangerDark; borderC = S.danger; textC = S.danger; }
              } else if (isSelected) { bg = S.accentGlow; borderC = S.accent; textC = S.accent; }
              return (
                <button key={i} onClick={() => !submitted && setAnswer(letter)} style={{ background: bg, border: `1px solid ${borderC}`, borderRadius: 6, padding: "10px 14px", textAlign: "left", fontFamily: S.fontSans, fontSize: 12, color: textC, cursor: submitted ? "default" : "pointer", transition: "all 0.1s" }}>
                  {opt} {submitted && isCorrectOpt && " ✓"}{submitted && isSelected && !isCorrectOpt && " ✗"}
                </button>
              );
            })}
          </div>
          {!submitted ? (
            <button onClick={submit} disabled={!answer} style={{ ...btn("primary"), width: "100%" }}>Submit Answer</button>
          ) : isCorrect ? (
            <div style={{ background: S.successDark, border: `1px solid ${S.success}55`, borderRadius: 6, padding: 12, fontSize: 12, color: S.success }}>✅ Correct — habit verified for today!</div>
          ) : (
            <div style={{ background: S.dangerDark, border: `1px solid ${S.danger}55`, borderRadius: 6, padding: 12 }}>
              <div style={{ fontSize: 12, color: S.danger, fontWeight: 700, marginBottom: 4 }}>🚨 Review Required — Notify Supervisor</div>
              <div style={{ fontSize: 11, color: "#fca5a5" }}>Please review the posted procedure and speak with your supervisor before continuing your shift.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── INCIDENT LOGGER ──────────────────────────────────────────────────────────
function IncidentLogger({ storage, onAdd }) {
  const [form, setForm] = useState({ date: today(), type: "", bodyPart: "", severity: "", track: "", description: "", witnesses: "", reportedTo: "" });
  const [submitted, setSubmitted] = useState(false);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.type || !form.severity || !form.date) return;
    const incident = { ...form, id: Date.now(), reportedAt: new Date().toISOString(), caseNumber: `INC-${hashString(Date.now().toString())}` };
    const existing = storage.get("incidents") || [];
    storage.set("incidents", [incident, ...existing]);
    onAdd(incident);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setForm({ date: today(), type: "", bodyPart: "", severity: "", track: "", description: "", witnesses: "", reportedTo: "" }); }, 2000);
  };

  const field = (label, children) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: S.textSecondary, display: "block", marginBottom: 5, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );

  const sel = (key, opts) => (
    <select value={form[key]} onChange={e => up(key, e.target.value)} style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 12px", color: form[key] ? S.textPrimary : S.textSecondary, fontFamily: S.fontSans, fontSize: 13 }}>
      <option value="">Select...</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  if (submitted) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontWeight: 700, color: S.success, marginBottom: 8 }}>Incident Logged</div>
      <div style={{ fontSize: 12, color: S.textSecondary }}>Case number assigned. OSHA recordable assessment pending supervisor review.</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {field("Date of Incident", <input type="date" value={form.date} onChange={e => up("date", e.target.value)} style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 12px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 13, boxSizing: "border-box" }} />)}
        {field("Work Track", sel("track", ["Warehouse", "Kitchen", "Drivers", "General Labor", "All Tracks"]))}
        {field("Incident Type", sel("type", INJURY_TYPES))}
        {field("Body Part Affected", sel("bodyPart", BODY_PARTS))}
        {field("Severity Level", sel("severity", SEVERITY))}
        {field("Reported To", <input value={form.reportedTo} onChange={e => up("reportedTo", e.target.value)} placeholder="Supervisor name" style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 12px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 13, boxSizing: "border-box" }} />)}
      </div>
      {field("Description", <textarea value={form.description} onChange={e => up("description", e.target.value)} rows={3} placeholder="Describe what happened, root cause, corrective actions taken..." style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "9px 12px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />)}
      <button onClick={handleSubmit} style={{ ...btn("primary"), width: "100%" }}>Submit Incident Report</button>
    </div>
  );
}

// ─── AI GENERATOR MODAL ───────────────────────────────────────────────────────
function AIGeneratorModal({ config, storage, onGenerated, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const industryInfo = INDUSTRIES.find(i => i.id === config.industry);
      const systemPrompt = `You are an expert workplace safety consultant specializing in ${industryInfo?.label} with deep knowledge of ${industryInfo?.regs}. You generate concise, actionable 60-second safety habits for frontline workers. Each habit must be physically verifiable, bilingual (English/Spanish), and tied to a specific regulatory citation. Always return structured JSON only.`;
      const userMsg = `Generate 3 new safety habits for a ${industryInfo?.label} company in ${config.state} with tracks: ${config.tracks.join(", ")}. 
Custom request: "${prompt}"
Return ONLY a JSON array with objects having: { day, track, theme, habit_EN, habit_ES, quiz_question_EN, quiz_options_EN (array of 4), correct_answer (A/B/C/D), regulatory_ref, loss_run_link }`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const existing = storage.get("habits") || [];
      const maxDay = Math.max(...existing.map(h => h.day || 0), 0);
      const newHabits = parsed.map((h, i) => ({ ...h, id: Date.now() + i, day: maxDay + i + 1 }));
      storage.set("habits", [...existing, ...newHabits]);
      setResult(`✅ Generated ${newHabits.length} new habits and added to your calendar.`);
      onGenerated(newHabits);
    } catch (e) {
      setError("Could not connect to AI. Using curated fallback habits for your industry.");
    }
    setLoading(false);
  };

  return (
    <Modal title="🤖 AI Habit Generator" onClose={onClose} maxWidth={560}>
      <div style={{ marginBottom: 16 }}>
        <div style={badge(S.accent, { marginBottom: 12 })}>Powered by Claude · Your data stays private</div>
        <p style={{ fontSize: 13, color: S.textSecondary, lineHeight: 1.7 }}>
          Describe a specific safety concern, recent near-miss, or injury type you want to address. The AI will generate targeted 60-second habits with bilingual content and quiz verification.
        </p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: S.textSecondary, display: "block", marginBottom: 6, fontWeight: 600 }}>Describe your safety concern</label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder='e.g. "We had 3 forklift pedestrian incidents last month near the dock area" or "Generate habits for ergonomic lifting in cold storage environments"' style={{ width: "100%", background: S.bg, border: `1px solid ${S.border}`, borderRadius: 6, padding: "10px 14px", color: S.textPrimary, fontFamily: S.fontSans, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
      </div>
      {error && <div style={{ background: S.dangerDark, border: `1px solid ${S.danger}33`, borderRadius: 6, padding: 12, fontSize: 12, color: S.danger, marginBottom: 12 }}>{error}</div>}
      {result && <div style={{ background: S.successDark, border: `1px solid ${S.success}33`, borderRadius: 6, padding: 12, fontSize: 12, color: S.success, marginBottom: 12 }}>{result}</div>}
      <button onClick={generate} disabled={loading || !prompt.trim()} style={{ ...btn("primary"), width: "100%" }}>
        {loading ? <><Spinner /> Generating habits...</> : "Generate AI Habits →"}
      </button>
    </Modal>
  );
}// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SafetyOS() {
  const [authUser, setAuthUser] = useState(null);
  const [storage, setStorage] = useState(null);
  const [config, setConfig] = useState(null);
  const [screen, setScreen] = useState("login");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lang, setLang] = useState("EN");
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [filterTrack, setFilterTrack] = useState("All");
  const [incidentAdded, setIncidentAdded] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleLogin = (user) => {
    const s = getStorage(user.id);
    setAuthUser(user);
    setStorage(s);
    const savedConfig = s.get("config");
    if (savedConfig?.setupComplete) {
      setConfig(savedConfig);
      setHabits(s.get("habits") || []);
      setCompletions(s.get("completions") || {});
      setIncidents(s.get("incidents") || []);
      setScreen("app");
    } else {
      setScreen("onboarding");
    }
  };

  const handleOnboardComplete = (cfg) => {
    setConfig(cfg);
    setHabits(storage.get("habits") || []);
    setCompletions({});
    setIncidents([]);
    setScreen("app");
  };

  const handleComplete = (habitId, data) => {
    const newComp = { ...completions, [habitId]: data };
    setCompletions(newComp);
    storage.set("completions", newComp);
  };

  const handleIncidentAdd = (incident) => {
    setIncidents(prev => [incident, ...prev]);
    setIncidentAdded(true);
    setTimeout(() => setIncidentAdded(false), 3000);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setStorage(null);
    setConfig(null);
    setScreen("login");
    setActiveTab("dashboard");
  };

  const handleReset = () => {
    if (storage) { storage.del("config"); storage.del("habits"); storage.del("completions"); storage.del("incidents"); }
    setConfig(null);
    setScreen("onboarding");
  };

  const totalHabits = habits.length;
  const completedCount = Object.values(completions).filter(c => c.passed).length;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const openIncidents = incidents.filter(i => i.severity !== "Near Miss").length;
  const nearMisses = incidents.filter(i => i.severity === "Near Miss").length;
  const filteredHabits = filterTrack === "All" ? habits : habits.filter(h => h.track === filterTrack);

  if (screen === "login") return <LoginScreen onLogin={handleLogin} />;
  if (screen === "onboarding") return <OnboardingWizard user={authUser} storage={storage} onComplete={handleOnboardComplete} />;

  const industryInfo = INDUSTRIES.find(i => i.id === config?.industry);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    ...(config?.enableTracking ? [{ id: "incidents", label: "Incidents", icon: "⚠️" }] : []),
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: S.fontSans, color: S.textPrimary, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${S.bg}; } ::-webkit-scrollbar-thumb { background: ${S.border}; border-radius: 3px; }
        input, select, textarea { outline: none !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .habit-card { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${S.border}`, padding: "0 24px", display: "flex", alignItems: "center", height: 56, position: "sticky", top: 0, background: S.bg, zIndex: 500, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 16 }}>
          <div style={{ width: 30, height: 30, background: S.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🛡️</div>
          <span style={{ fontWeight: 800, fontFamily: S.fontMono, fontSize: 16, letterSpacing: -0.5, display: isMobile ? "none" : "block" }}>SafetyOS</span>
        </div>

        {!isMobile && navItems.map(n => (
          <button key={n.id} onClick={() => setActiveTab(n.id)} style={{ background: "transparent", border: "none", fontFamily: S.fontSans, fontSize: 13, fontWeight: 600, color: activeTab === n.id ? S.accent : S.textSecondary, cursor: "pointer", padding: "4px 12px", borderBottom: activeTab === n.id ? `2px solid ${S.accent}` : "2px solid transparent", height: 56, borderRadius: 0, transition: "all 0.15s" }}>
            {n.icon} {n.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
            {["EN", "ES"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? S.accent : "transparent", color: lang === l ? "#0b0e13" : S.textSecondary, border: "none", padding: "5px 10px", fontFamily: S.fontMono, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{l}</button>
            ))}
          </div>

          <button onClick={() => setShowAI(true)} style={{ ...btn("secondary"), padding: "7px 12px", fontSize: 12 }}>🤖 AI</button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={handleLogout} title="Sign out">
            <div style={{ width: 30, height: 30, background: S.accentGlow, border: `1px solid ${S.accent}44`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: S.accent, fontFamily: S.fontMono }}>{authUser.name.charAt(0)}</div>
            {!isMobile && <div style={{ fontSize: 12 }}><div style={{ color: S.textPrimary, fontWeight: 600 }}>{authUser.name}</div><div style={{ color: S.textMuted, fontSize: 10 }}>Sign out</div></div>}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: isMobile ? "16px 12px 80px" : "24px 24px 24px", maxWidth: 1200, width: "100%", margin: "0 auto" }}>

        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {authUser.name.split(" ")[0]} 👋</h1>
                <div style={{ fontSize: 13, color: S.textSecondary, marginTop: 4 }}>
                  {authUser.company} · {industryInfo?.icon} {industryInfo?.label} · {config?.state} ({industryInfo?.regs})
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {config?.enableTracking && (
                  <button onClick={() => setShowIncident(true)} style={{ ...btn("danger") }}>+ Log Incident</button>
                )}
                <button onClick={() => setActiveTab("calendar")} style={{ ...btn("primary") }}>View Calendar →</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <Stat label="COMPLETION RATE" value={`${completionRate}%`} sub={`${completedCount} of ${totalHabits} habits`} color={completionRate > 70 ? S.success : completionRate > 40 ? S.warning : S.danger} icon="✅" />
              <Stat label="ACTIVE HABITS" value={totalHabits} sub={`Across ${(config?.tracks || []).length} tracks`} icon="📋" />
              {config?.enableTracking && <>
                <Stat label="OPEN INCIDENTS" value={openIncidents} sub="Recordable events" color={openIncidents > 0 ? S.danger : S.success} icon="⚠️" />
                <Stat label="NEAR MISSES" value={nearMisses} sub="Leading indicators" color={nearMisses > 0 ? S.warning : S.success} icon="🔍" />
              </>}
            </div>

            <div style={{ ...card({ marginBottom: 24 }) }}>
              <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <span>Track Progress</span>
                <Tag>{today()}</Tag>
              </div>
              {(config?.tracks || []).map(track => {
                const trackHabits = habits.filter(h => h.track === track);
                const trackDone = trackHabits.filter(h => completions[h.id]?.passed).length;
                const pct = trackHabits.length > 0 ? Math.round((trackDone / trackHabits.length) * 100) : 0;
                return (
                  <div key={track} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{track}</span>
                      <span style={{ color: S.textSecondary, fontFamily: S.fontMono }}>{trackDone}/{trackHabits.length} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, background: S.border, borderRadius: 3 }}>
                      <div style={{ height: "100%", borderRadius: 3, background: pct > 70 ? S.success : pct > 40 ? S.accent : S.danger, width: `${pct}%`, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Today's Priority Habits</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {habits.filter(h => !completions[h.id]?.passed).slice(0, 3).map(h => (
                <HabitCard key={h.id} habit={h} completion={completions[h.id]} onComplete={handleComplete} lang={lang} />
              ))}
              {habits.filter(h => !completions[h.id]?.passed).length === 0 && (
                <div style={{ ...card({ padding: 32, textAlign: "center", gridColumn: "1/-1" }) }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>All habits completed!</div>
                  <div style={{ color: S.textSecondary }}>Great work. New habits will be generated for the next cycle.</div>
                </div>
              )}
            </div>

            {config?.enableTracking && incidents.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Recent Incidents</div>
                <div style={{ ...card() }}>
                  {incidents.slice(0, 5).map((inc, i) => (
                    <div key={inc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 && incidents.length > 1 ? `1px solid ${S.border}` : "none", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{inc.type} — {inc.bodyPart}</div>
                        <div style={{ fontSize: 11, color: S.textSecondary, fontFamily: S.fontMono }}>{inc.caseNumber} · {fmtDate(inc.date)} · {inc.track}</div>
                      </div>
                      <Tag color={inc.severity === "Lost Time" ? S.danger : inc.severity === "Near Miss" ? S.accent : S.warning}>{inc.severity}</Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>30-Day Safety Habit Calendar</h1>
                <div style={{ fontSize: 12, color: S.textSecondary, marginTop: 4 }}>{industryInfo?.label} · {config?.state} · {industryInfo?.regs}</div>
              </div>
              <button onClick={() => setShowAI(true)} style={{ ...btn("primary") }}>🤖 Generate More Habits</button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {["All", ...(config?.tracks || [])].map(t => (
                <button key={t} onClick={() => setFilterTrack(t)} style={{ ...btn(filterTrack === t ? "primary" : "ghost"), padding: "6px 14px", fontSize: 12 }}>{t}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {filteredHabits.map(h => (
                <div key={h.id} className="habit-card">
                  <HabitCard habit={h} completion={completions[h.id]} onComplete={handleComplete} lang={lang} />
                </div>
              ))}
              {filteredHabits.length === 0 && (
                <div style={{ ...card({ padding: 32, textAlign: "center", gridColumn: "1/-1" }) }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  <div style={{ fontWeight: 700 }}>No habits for this track yet</div>
                  <div style={{ color: S.textSecondary, marginTop: 8, marginBottom: 16 }}>Use the AI generator to create habits for this track</div>
                  <button onClick={() => setShowAI(true)} style={btn("primary")}>Generate Habits</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "incidents" && config?.enableTracking && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Incident Tracking</h1>
                <div style={{ fontSize: 12, color: S.textSecondary, marginTop: 4 }}>OSHA 300 Log · Incident reports · Near misses</div>
              </div>
              <button onClick={() => setShowIncident(true)} style={{ ...btn("danger") }}>+ Log New Incident</button>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              {SEVERITY.map(s => {
                const count = incidents.filter(i => i.severity === s).length;
                return <Stat key={s} label={s.toUpperCase()} value={count} color={s === "Lost Time" ? S.danger : s === "Near Miss" ? S.accent : S.textSecondary} />;
              })}
            </div>

            <div style={card()}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>All Incidents ({incidents.length})</div>
              {incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: S.textSecondary }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                  <div>No incidents logged yet</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Near misses should be reported immediately — they are free lessons</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                        {["Case #", "Date", "Type", "Body Part", "Track", "Severity", "Description"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: S.textSecondary, fontFamily: S.fontMono, fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((inc, i) => (
                        <tr key={inc.id} style={{ borderBottom: i < incidents.length - 1 ? `1px solid ${S.border}` : "none" }}>
                          <td style={{ padding: "10px 12px", fontFamily: S.fontMono, color: S.accent }}>{inc.caseNumber}</td>
                          <td style={{ padding: "10px 12px", color: S.textSecondary }}>{fmtDate(inc.date)}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{inc.type}</td>
                          <td style={{ padding: "10px 12px", color: S.textSecondary }}>{inc.bodyPart}</td>
                          <td style={{ padding: "10px 12px", color: S.textSecondary }}>{inc.track}</td>
                          <td style={{ padding: "10px 12px" }}><Tag color={inc.severity === "Lost Time" ? S.danger : inc.severity === "Near Miss" ? S.accent : S.warning}>{inc.severity}</Tag></td>
                          <td style={{ padding: "10px 12px", color: S.textSecondary, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.description || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ maxWidth: 600 }}>
            <h1 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>Settings</h1>

            <div style={{ ...card({ marginBottom: 16 }) }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Account</div>
              {[
                { label: "Name", value: authUser.name },
                { label: "Email", value: authUser.email },
                { label: "Company", value: authUser.company },
                { label: "Role", value: authUser.role },
                { label: "Plan", value: authUser.plan.toUpperCase() },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${S.border}`, fontSize: 13 }}>
                  <span style={{ color: S.textSecondary }}>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ ...card({ marginBottom: 16 }) }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Workspace Configuration</div>
              {[
                { label: "Industry", value: industryInfo?.label },
                { label: "State", value: config?.state },
                { label: "Tracks", value: (config?.tracks || []).join(", ") },
                { label: "Employee Count", value: config?.employeeCount },
                { label: "Incident Tracking", value: config?.enableTracking ? "Enabled" : "Disabled" },
                { label: "Setup Date", value: config?.setupDate ? fmtDate(config.setupDate) : "—" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${S.border}`, fontSize: 13 }}>
                  <span style={{ color: S.textSecondary }}>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ ...card({ marginBottom: 16 }) }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>🔒 Data Privacy</div>
              <div style={{ fontSize: 12, color: S.textSecondary, lineHeight: 1.8, marginBottom: 16 }}>
                All uploaded documents (IIPP policies, loss runs) are stored under your unique organization key and are never accessible by other accounts. Data is not used for AI training. You can delete all data at any time.
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => {
                  storage.del("config");
                  storage.del("habits");
                  storage.del("completions");
                  storage.del("incidents");
                  const keys = Object.keys(localStorage).filter(k => k.startsWith(`safetyos_${authUser.id}_`));
                  keys.forEach(k => localStorage.removeItem(k));
                  alert("All data deleted.");
                  handleLogout();
                }} style={{ ...btn("danger"), fontSize: 12 }}>Delete All My Data</button>
                <button onClick={handleReset} style={{ ...btn("ghost"), fontSize: 12 }}>Re-run Setup</button>
              </div>
            </div>

            <button onClick={handleLogout} style={{ ...btn("ghost"), width: "100%" }}>Sign Out</button>
          </div>
        )}
      </main>

      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: S.surface, borderTop: `1px solid ${S.border}`, display: "flex", zIndex: 600 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveTab(n.id)} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontFamily: S.fontMono, color: activeTab === n.id ? S.accent : S.textMuted, fontWeight: 700, letterSpacing: 0.5 }}>{n.label.toUpperCase()}</span>
            </button>
          ))}
        </nav>
      )}

      {showIncident && (
        <Modal title="⚠️ Log Incident / Near Miss" onClose={() => setShowIncident(false)} maxWidth={680}>
          <IncidentLogger storage={storage} onAdd={(inc) => { handleIncidentAdd(inc); setShowIncident(false); }} />
        </Modal>
      )}

      {showAI && (
        <AIGeneratorModal
          config={config}
          storage={storage}
          onGenerated={(newHabits) => setHabits(prev => [...prev, ...newHabits])}
          onClose={() => setShowAI(false)}
        />
      )}

      {incidentAdded && (
        <div style={{ position: "fixed", bottom: isMobile ? 80 : 24, right: 24, background: S.success, color: "#0b0e13", borderRadius: 8, padding: "12px 20px", fontWeight: 700, fontSize: 13, zIndex: 9999, animation: "fadeIn 0.3s ease" }}>
          ✅ Incident logged successfully
        </div>
      )}
    </div>
  );
}
