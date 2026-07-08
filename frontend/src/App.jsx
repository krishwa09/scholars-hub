import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home, BookOpen, FileText, LayoutDashboard, Settings, Users, CreditCard,
  BarChart3, LogOut, Menu, X, Plus, Trash2, Pencil, Lock, Unlock, Download,
  Eye, Check, ShieldCheck, GraduationCap, Phone, Mail, MapPin, Star, Upload,
  Search, Wallet, IndianRupee, TrendingUp, UserCheck, Ban, KeyRound, ChevronRight,
  Award, CircleCheck, CircleX, Quote, Image as ImageIcon, FolderOpen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid
} from "recharts";
import { api as DB } from "./api";

/* ------------------------------------------------------------------ */
/*  Brand tokens (inline styles, since no Tailwind compiler)          */
/* ------------------------------------------------------------------ */
const T = {
  ink: "#1f2440",
  indigo: "#4338ca",
  indigoDark: "#312e81",
  gold: "#d9a02b",
  goldDark: "#b45309",
  paper: "#fbfaf6",
  line: "rgba(49,46,129,0.08)",
};
const GRID = {
  backgroundColor: T.paper,
  backgroundImage:
    `linear-gradient(${T.line} 1px, transparent 1px), linear-gradient(90deg, ${T.line} 1px, transparent 1px)`,
  backgroundSize: "26px 26px",
};
const DISPLAY = { fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif" };
const BODY = { fontFamily: "'Inter', system-ui, sans-serif" };
const MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
const rupee = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

/* ------------------------------------------------------------------ */
/*  Persistence is provided by the backend API (see ./api.js).         */
/*  DB.get(key) / DB.set(key, value) read & write each collection.     */
/* ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */
const SEED_SETTINGS = {
  tuitionName: "Lakshya Commerce & Maths Academy",
  tagline: "Conceptual learning for Commerce & Mathematics — built for board exam confidence.",
  hero: {
    title: "Notes that actually make the concept click.",
    subtitle:
      "Chapter-wise notes, solved examples and exam-ready summaries for Class 9 Maths and Class 11–12 Commerce. Free previews, paid depth.",
    image: "",
  },
  teacher: {
    name: "Anand Verma",
    title: "Founder & Mentor",
    qualifications: "M.Com, B.Ed · 12+ years teaching Commerce & Maths",
    bio: "I teach Economics, Business Studies and Mathematics the way I wish someone had taught me — starting from why a concept exists, then drilling into exam technique. Every note here is written and reviewed by me.",
    photo: "",
  },
  about:
    "Lakshya is a small-batch tuition focused on Commerce and Maths. We keep groups small, notes sharp, and doubts welcome.",
  contact: {
    phone: "+91 98xxx xxxxx",
    email: "hello@lakshyaacademy.in",
    whatsapp: "+91 98xxx xxxxx",
    address: "2nd Floor, Vidya Bhawan, Karol Bagh, New Delhi",
  },
  payment: {
    upiId: "lakshyaacademy@okhdfcbank",
    upiName: "Lakshya Commerce & Maths Academy",
    bankName: "HDFC Bank",
    accountName: "Lakshya Academy",
    accountNumber: "50100XXXXXXXXX",
    ifsc: "HDFC0001234",
    qr: "",
    instructions: "Pay the exact amount to the UPI ID or bank account above, then enter your UPI reference / UTR number below. We verify and unlock your note, usually within a few hours.",
  },
  testimonials: [
    { id: uid(), name: "Riya S.", role: "Class 12 · Commerce", text: "The Economics summaries saved me before boards. Went from 60s to 88." },
    { id: uid(), name: "Aman K.", role: "Class 11 · Business Studies", text: "Sir explains every line. The paid notes are genuinely worth it." },
    { id: uid(), name: "Parent of Class 9 student", role: "Maths", text: "My son finally stopped fearing maths. Clear, patient teaching." },
  ],
};

const SEED_SUBJECTS = [
  { id: "s_m9", name: "Mathematics", className: "Class 9", description: "Foundations: number systems, algebra, geometry and coordinate geometry.", chapters: [
    { id: "c1", title: "Number Systems" }, { id: "c2", title: "Polynomials" },
    { id: "c3", title: "Coordinate Geometry" }, { id: "c4", title: "Linear Equations in Two Variables" },
  ]},
  { id: "s_bs11", name: "Business Studies", className: "Class 11", description: "Nature of business, forms of organisation, services and enterprise.", chapters: [
    { id: "c1", title: "Nature & Purpose of Business" }, { id: "c2", title: "Forms of Business Organisation" },
    { id: "c3", title: "Private, Public & Global Enterprises" },
  ]},
  { id: "s_bs12", name: "Business Studies", className: "Class 12", description: "Management principles, functions, finance and marketing.", chapters: [
    { id: "c1", title: "Nature & Significance of Management" }, { id: "c2", title: "Principles of Management" },
    { id: "c3", title: "Financial Management" }, { id: "c4", title: "Marketing Management" },
  ]},
  { id: "s_ec11", name: "Economics", className: "Class 11", description: "Statistics for economics and introductory microeconomics.", chapters: [
    { id: "c1", title: "Introduction to Statistics" }, { id: "c2", title: "Collection & Organisation of Data" },
    { id: "c3", title: "Measures of Central Tendency" },
  ]},
  { id: "s_ec12", name: "Economics", className: "Class 12", description: "Macroeconomics: national income, money, banking and budget.", chapters: [
    { id: "c1", title: "National Income & Accounting" }, { id: "c2", title: "Money & Banking" },
    { id: "c3", title: "Government Budget & the Economy" },
  ]},
];

const SEED_PDFS = [
  { id: uid(), title: "Number Systems — Full Notes", subjectId: "s_m9", chapterId: "c1", isFree: true, price: 0, thumbnail: "", createdAt: now(), downloads: 142 },
  { id: uid(), title: "Polynomials — Solved Examples", subjectId: "s_m9", chapterId: "c2", isFree: false, price: 49, thumbnail: "", createdAt: now(), downloads: 88 },
  { id: uid(), title: "Forms of Business Organisation — Summary", subjectId: "s_bs11", chapterId: "c2", isFree: true, price: 0, thumbnail: "", createdAt: now(), downloads: 203 },
  { id: uid(), title: "Principles of Management — Exam Notes", subjectId: "s_bs12", chapterId: "c2", isFree: false, price: 79, thumbnail: "", createdAt: now(), downloads: 167 },
  { id: uid(), title: "Financial Management — Quick Revision", subjectId: "s_bs12", chapterId: "c3", isFree: false, price: 59, thumbnail: "", createdAt: now(), downloads: 121 },
  { id: uid(), title: "Measures of Central Tendency — Worked Problems", subjectId: "s_ec11", chapterId: "c3", isFree: false, price: 69, thumbnail: "", createdAt: now(), downloads: 94 },
  { id: uid(), title: "National Income — Complete Notes", subjectId: "s_ec12", chapterId: "c1", isFree: false, price: 89, thumbnail: "", createdAt: now(), downloads: 211 },
  { id: uid(), title: "Money & Banking — One-shot", subjectId: "s_ec12", chapterId: "c2", isFree: true, price: 0, thumbnail: "", createdAt: now(), downloads: 176 },
];

const SEED_USERS = [
  { id: "u_admin", name: "Anand Verma", email: "admin@academy.in", password: "admin123", role: "ADMIN", createdAt: now(), lastLogin: now(), blocked: false, purchases: [], payments: [] },
  { id: "u_demo", name: "Demo Student", email: "student@demo.in", password: "demo123", role: "STUDENT", createdAt: now(), lastLogin: now(), blocked: false, purchases: [], payments: [] },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function fileToResizedDataURL(file, maxDim) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function monthKey(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { month: "short" });
}

/* ------------------------------------------------------------------ */
/*  Small UI primitives                                                */
/* ------------------------------------------------------------------ */
function Btn({ children, onClick, kind = "primary", className = "", style = {}, type, disabled, size = "md" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const sz = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm";
  const styles = {
    primary: { background: T.indigo, color: "#fff" },
    gold: { background: T.gold, color: "#1c1300" },
    ghost: { background: "transparent", color: T.ink, border: "1px solid rgba(31,36,64,0.15)" },
    danger: { background: "#e11d48", color: "#fff" },
    soft: { background: "rgba(67,56,202,0.08)", color: T.indigo },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`${base} ${sz} ${className}`} style={{ ...styles[kind], ...style }}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, textarea, rows = 3 }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium mb-1.5" style={{ color: T.ink }}>{label}</span>}
      {textarea ? (
        <textarea rows={rows} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
          style={{ border: "1px solid rgba(31,36,64,0.15)", background: "#fff", color: T.ink }} />
      ) : (
        <input type={type} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
          style={{ border: "1px solid rgba(31,36,64,0.15)", background: "#fff", color: T.ink }} />
      )}
    </label>
  );
}

function PaymentStatusBadge({ status }) {
  if (status === "SUCCESS") return <Badge tone="green">Verified</Badge>;
  if (status === "PENDING") return <Badge tone="gold">Pending</Badge>;
  return <Badge tone="rose">Rejected</Badge>;
}

function Badge({ children, tone = "indigo" }) {
  const tones = {
    indigo: { background: "rgba(67,56,202,0.1)", color: T.indigo },
    gold: { background: "rgba(217,160,43,0.16)", color: T.goldDark },
    green: { background: "rgba(16,185,129,0.14)", color: "#047857" },
    rose: { background: "rgba(225,29,72,0.12)", color: "#be123c" },
    slate: { background: "rgba(31,36,64,0.08)", color: "#475569" },
  };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={tones[tone]}>{children}</span>
  );
}

function Modal({ open, onClose, children, title, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,18,40,0.55)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ maxWidth: wide ? 640 : 460, maxHeight: "90vh" }}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.line}` }}>
            <h3 className="font-bold text-lg" style={{ ...DISPLAY, color: T.ink }}>{title}</h3>
            <button onClick={onClose}><X size={20} style={{ color: "#94a3b8" }} /></button>
          </div>
        )}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 64px)" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg"
      style={{ background: T.ink, color: "#fff" }}>{msg}</div>
  );
}

function Logo({ name, size = 20 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid place-items-center rounded-lg" style={{ width: size + 16, height: size + 16, background: T.indigoDark }}>
        <GraduationCap size={size} color={T.gold} />
      </div>
      <span className="font-bold leading-tight" style={{ ...DISPLAY, color: T.ink, fontSize: 16 }}>{name}</span>
    </div>
  );
}

/* ================================================================== */
/*  MAIN APP                                                           */
/* ================================================================== */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(SEED_SETTINGS);
  const [subjects, setSubjects] = useState(SEED_SUBJECTS);
  const [pdfs, setPdfs] = useState(SEED_PDFS);
  const [users, setUsers] = useState(SEED_USERS);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [session, setSession] = useState(null); // email of logged-in user
  const [view, setView] = useState({ name: "home" });
  const [toast, setToast] = useState("");

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(""), 2200); }, []);

  // load
  useEffect(() => {
    (async () => {
      const s = await DB.get("settings"); if (s) setSettings(s); else DB.set("settings", SEED_SETTINGS);
      const sub = await DB.get("subjects"); if (sub) setSubjects(sub); else DB.set("subjects", SEED_SUBJECTS);
      const p = await DB.get("pdfs"); if (p) setPdfs(p); else DB.set("pdfs", SEED_PDFS);
      const u = await DB.get("users"); if (u) setUsers(u); else DB.set("users", SEED_USERS);
      const pay = await DB.get("payments"); if (pay) setPayments(pay); else DB.set("payments", []);
      const rev = await DB.get("reviews"); if (rev) setReviews(rev); else DB.set("reviews", []);
      const cur = await DB.get("session"); if (cur) setSession(cur);
      setLoaded(true);
    })();
  }, []);

  // persisters
  const saveSettings = (s) => { setSettings(s); DB.set("settings", s); };
  const saveSubjects = (s) => { setSubjects(s); DB.set("subjects", s); };
  const savePdfs = (p) => { setPdfs(p); DB.set("pdfs", p); };
  const saveUsers = (u) => { setUsers(u); DB.set("users", u); };
  const savePayments = (p) => { setPayments(p); DB.set("payments", p); };
  const saveReviews = (r) => { setReviews(r); DB.set("reviews", r); };
  const saveSession = (email) => { setSession(email); DB.set("session", email); };

  const currentUser = useMemo(() => users.find((u) => u.email === session) || null, [users, session]);

  const go = (name, params = {}) => { setView({ name, ...params }); window.scrollTo(0, 0); };

  // auth actions
  const login = (email, password) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
    if (!u) return { ok: false, msg: "No account with that email." };
    if (u.password !== password) return { ok: false, msg: "Incorrect password." };
    if (u.blocked) return { ok: false, msg: "This account is blocked. Contact the academy." };
    const updated = users.map((x) => x.id === u.id ? { ...x, lastLogin: now() } : x);
    saveUsers(updated);
    saveSession(u.email);
    return { ok: true, role: u.role };
  };
  const register = ({ name, email, password }) => {
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase().trim()))
      return { ok: false, msg: "Email already registered." };
    const u = { id: uid(), name, email: email.trim(), password, role: "STUDENT", createdAt: now(), lastLogin: now(), blocked: false, purchases: [], payments: [] };
    saveUsers([...users, u]);
    saveSession(u.email);
    return { ok: true };
  };
  const logout = () => { saveSession(null); go("home"); };

  // Manual payment: the student pays the academy directly (UPI / bank) and submits
  // their reference. A PENDING record is created; access is granted only after an
  // admin verifies the payment from the admin portal.
  const submitPurchase = (pdf, reference, payerName) => {
    const pay = {
      id: uid(), userId: currentUser.id, userEmail: currentUser.email,
      pdfId: pdf.id, pdfTitle: pdf.title, amount: pdf.price, status: "PENDING",
      method: "Manual (UPI / bank transfer)", transactionId: reference || "—",
      payerName: payerName || currentUser.name, createdAt: now(),
    };
    savePayments([pay, ...payments]);
    saveUsers(users.map((u) => u.id === currentUser.id
      ? { ...u, payments: [...(u.payments || []), pay.id] } : u));
    notify("Payment submitted — we'll verify and unlock your note soon.");
  };

  // A student submits a review; it stays PENDING until an admin approves it.
  const submitReview = (text, role) => {
    const review = {
      id: uid(), userId: currentUser.id, userEmail: currentUser.email,
      name: currentUser.name, role: role || "Student",
      text, status: "PENDING", createdAt: now(),
    };
    saveReviews([review, ...reviews]);
    notify("Thanks! Your review was submitted for approval.");
  };

  const hasAccess = (pdf) => pdf.isFree || (currentUser && currentUser.purchases.includes(pdf.id));

  if (!loaded) {
    return <div className="min-h-screen grid place-items-center" style={{ ...GRID, ...BODY }}>
      <div className="text-sm" style={{ color: T.indigo }}>Loading academy…</div>
    </div>;
  }

  // ADMIN portal
  if (view.name === "admin") {
    if (!currentUser || currentUser.role !== "ADMIN") {
      return <AdminGate onLogin={login} go={go} notify={notify} settings={settings} />;
    }
    return <AdminPortal
      settings={settings} saveSettings={saveSettings}
      subjects={subjects} saveSubjects={saveSubjects}
      pdfs={pdfs} savePdfs={savePdfs}
      users={users} saveUsers={saveUsers}
      payments={payments} savePayments={savePayments}
      reviews={reviews} saveReviews={saveReviews}
      go={go} logout={logout} notify={notify} admin={currentUser} />;
  }

  // PUBLIC site
  return (
    <div style={{ ...BODY, color: T.ink, minHeight: "100vh", background: T.paper }}>
      <FontLoader />
      <PublicNav settings={settings} view={view} go={go} currentUser={currentUser} logout={logout} />
      {view.name === "home" && <HomePage settings={settings} subjects={subjects} reviews={reviews} go={go} />}
      {view.name === "subjects" && <SubjectsPage subjects={subjects} pdfs={pdfs} go={go} />}
      {view.name === "subject" && <SubjectDetail subjectId={view.id} subjects={subjects} pdfs={pdfs} go={go}
        settings={settings} currentUser={currentUser} hasAccess={hasAccess}
        submitPurchase={submitPurchase} notify={notify} />}
      {view.name === "notes" && <FreeNotesPage pdfs={pdfs} subjects={subjects} currentUser={currentUser}
        settings={settings} hasAccess={hasAccess} go={go} submitPurchase={submitPurchase} notify={notify} />}
      {view.name === "login" && <AuthPage mode="login" settings={settings} login={login} register={register} go={go} notify={notify} />}
      {view.name === "register" && <AuthPage mode="register" settings={settings} login={login} register={register} go={go} notify={notify} />}
      {view.name === "forgot" && <AuthPage mode="forgot" settings={settings} login={login} register={register} go={go} notify={notify} />}
      {view.name === "dashboard" && <StudentDashboard currentUser={currentUser} pdfs={pdfs} subjects={subjects}
        payments={payments} reviews={reviews} submitReview={submitReview} go={go} hasAccess={hasAccess} notify={notify} />}
      <PublicFooter settings={settings} go={go} />
      <Toast msg={toast} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Font loader                                                        */
/* ------------------------------------------------------------------ */
function FontLoader() {
  useEffect(() => {
    if (document.getElementById("lk-fonts")) return;
    const l = document.createElement("link");
    l.id = "lk-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
}

/* ================================================================== */
/*  PUBLIC: navigation                                                 */
/* ================================================================== */
function PublicNav({ settings, view, go, currentUser, logout }) {
  const [open, setOpen] = useState(false);
  const links = [
    { name: "home", label: "Home" },
    { name: "subjects", label: "Subjects" },
    { name: "notes", label: "Free Notes" },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur" style={{ background: "rgba(251,250,246,0.85)", borderBottom: `1px solid ${T.line}` }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <button onClick={() => go("home")}><Logo name={settings.tuitionName} /></button>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button key={l.name} onClick={() => go(l.name)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: view.name === l.name ? T.indigo : "#475569", background: view.name === l.name ? "rgba(67,56,202,0.08)" : "transparent" }}>
              {l.label}
            </button>
          ))}
          {currentUser ? (
            <div className="ml-2 flex items-center gap-2">
              <Btn kind="soft" size="sm" onClick={() => go("dashboard")}><LayoutDashboard size={16} />Dashboard</Btn>
              <Btn kind="ghost" size="sm" onClick={logout}><LogOut size={16} /></Btn>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Btn kind="ghost" size="sm" onClick={() => go("login")}>Log in</Btn>
              <Btn kind="primary" size="sm" onClick={() => go("register")}>Register</Btn>
            </div>
          )}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-4" style={{ borderTop: `1px solid ${T.line}` }}>
          {links.map((l) => (
            <button key={l.name} onClick={() => { go(l.name); setOpen(false); }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium" style={{ color: "#475569" }}>{l.label}</button>
          ))}
          {currentUser ? (
            <>
              <button onClick={() => { go("dashboard"); setOpen(false); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium" style={{ color: T.indigo }}>Dashboard</button>
              <button onClick={() => { logout(); setOpen(false); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium" style={{ color: "#be123c" }}>Log out</button>
            </>
          ) : (
            <div className="mt-2 flex gap-2">
              <Btn kind="ghost" size="sm" onClick={() => { go("login"); setOpen(false); }}>Log in</Btn>
              <Btn kind="primary" size="sm" onClick={() => { go("register"); setOpen(false); }}>Register</Btn>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

/* ================================================================== */
/*  PUBLIC: home                                                       */
/* ================================================================== */
function HomePage({ settings, subjects, reviews = [], go }) {
  const courses = subjects.map((s) => ({ ...s, label: `${s.className} ${s.name}` }));
  const [c, setC] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  // Admin-curated testimonials + approved student reviews.
  const testimonials = [...(settings.testimonials || []), ...reviews.filter((r) => r.status === "APPROVED")];
  return (
    <main>
      {/* hero */}
      <section style={GRID}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Badge tone="gold"><Award size={13} /> Board-exam focused</Badge>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] md:text-5xl" style={{ ...DISPLAY, color: T.ink }}>
              {settings.hero.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: "#475569" }}>{settings.hero.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn kind="primary" size="lg" onClick={() => go("subjects")}>Browse subjects <ChevronRight size={18} /></Btn>
              <Btn kind="ghost" size="lg" onClick={() => go("notes")}>Free notes</Btn>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-xl" style={{ border: `1px solid ${T.line}`, aspectRatio: "4/3", background: "#fff" }}>
              {settings.hero.image ? (
                <img src={settings.hero.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center" style={{ background: "rgba(67,56,202,0.05)" }}>
                  <div className="text-center">
                    <ImageIcon size={40} style={{ color: "#cbd5e1", margin: "0 auto" }} />
                    <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>Hero image set from admin portal</p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white px-4 py-3 shadow-lg md:block" style={{ border: `1px solid ${T.line}` }}>
              <p className="text-2xl font-bold" style={{ ...MONO, color: T.indigo }}>12+ yrs</p>
              <p className="text-xs" style={{ color: "#64748b" }}>teaching experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* courses */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHead eyebrow="What we teach" title="Courses offered" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((s) => (
            <button key={s.id} onClick={() => go("subject", { id: s.id })}
              className="group rounded-2xl bg-white p-5 text-left transition hover:shadow-md"
              style={{ border: `1px solid ${T.line}` }}>
              <div className="flex items-center justify-between">
                <Badge tone="indigo">{s.className}</Badge>
                <BookOpen size={18} style={{ color: T.indigo }} />
              </div>
              <h3 className="mt-3 text-lg font-bold" style={{ ...DISPLAY, color: T.ink }}>{s.name}</h3>
              <p className="mt-1 text-sm" style={{ color: "#64748b" }}>{s.chapters.length} chapters · notes & solved examples</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: T.indigo }}>
                View notes <ChevronRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* teacher */}
      <section style={{ background: "#fff", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-3xl" style={{ border: `1px solid ${T.line}`, aspectRatio: "1", background: "rgba(67,56,202,0.05)" }}>
            {settings.teacher.photo ? (
              <img src={settings.teacher.photo} alt={settings.teacher.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center"><Users size={44} style={{ color: "#cbd5e1" }} /></div>
            )}
          </div>
          <div>
            <SectionHead eyebrow="Meet your mentor" title={settings.teacher.name} />
            <p className="mt-2 font-semibold" style={{ color: T.gold }}>{settings.teacher.title}</p>
            <p className="mt-1 text-sm font-medium" style={{ color: "#64748b" }}>{settings.teacher.qualifications}</p>
            <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: "#475569" }}>{settings.teacher.bio}</p>
          </div>
        </div>
      </section>

      {/* testimonials */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <SectionHead eyebrow="From students" title="What learners say" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${T.line}` }}>
                <Quote size={22} style={{ color: T.gold }} />
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#334155" }}>{t.text}</p>
                <div className="mt-4 flex items-center gap-1" style={{ color: T.gold }}>
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="mt-3 text-sm font-bold" style={{ color: T.ink }}>{t.name}</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{t.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* contact */}
      <section style={{ background: T.indigoDark }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold" style={{ ...DISPLAY, color: "#fff" }}>Get in touch</h2>
            <p className="mt-3 max-w-md" style={{ color: "rgba(255,255,255,0.7)" }}>{settings.about}</p>
            <div className="mt-6 space-y-3" style={{ color: "rgba(255,255,255,0.85)" }}>
              <p className="flex items-center gap-2 text-sm"><Phone size={16} style={{ color: T.gold }} />{settings.contact.phone}</p>
              <p className="flex items-center gap-2 text-sm"><Mail size={16} style={{ color: T.gold }} />{settings.contact.email}</p>
              <p className="flex items-center gap-2 text-sm"><MapPin size={16} style={{ color: T.gold }} />{settings.contact.address}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5">
            {sent ? (
              <div className="grid h-full place-items-center py-8 text-center">
                <div>
                  <CircleCheck size={40} style={{ color: "#10b981", margin: "0 auto" }} />
                  <p className="mt-3 font-bold" style={{ color: T.ink }}>Message sent!</p>
                  <p className="mt-1 text-sm" style={{ color: "#64748b" }}>The academy will reach out to {c.email || "you"} soon.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Your name" value={c.name} onChange={(v) => setC({ ...c, name: v })} placeholder="Full name" />
                <Field label="Email" type="email" value={c.email} onChange={(v) => setC({ ...c, email: v })} placeholder="you@email.com" />
                <Field label="Message" textarea value={c.message} onChange={(v) => setC({ ...c, message: v })} placeholder="Which class & subject are you interested in?" />
                <Btn kind="gold" className="w-full" onClick={() => { if (c.name && c.email) setSent(true); }}>Send message</Btn>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.gold }}>{eyebrow}</p>
      <h2 className="mt-1 text-3xl font-bold" style={{ ...DISPLAY, color: T.ink }}>{title}</h2>
    </div>
  );
}

/* ================================================================== */
/*  PUBLIC: subjects list                                              */
/* ================================================================== */
function SubjectsPage({ subjects, pdfs, go }) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <SectionHead eyebrow="All courses" title="Subjects & chapter-wise notes" />
      <div className="mt-8 space-y-4">
        {subjects.map((s) => {
          const count = pdfs.filter((p) => p.subjectId === s.id).length;
          const free = pdfs.filter((p) => p.subjectId === s.id && p.isFree).length;
          return (
            <button key={s.id} onClick={() => go("subject", { id: s.id })}
              className="flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left transition hover:shadow-md"
              style={{ border: `1px solid ${T.line}` }}>
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: "rgba(67,56,202,0.08)" }}>
                  <BookOpen size={22} style={{ color: T.indigo }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold" style={{ ...DISPLAY, color: T.ink }}>{s.className} · {s.name}</h3>
                  </div>
                  <p className="mt-0.5 text-sm" style={{ color: "#64748b" }}>{s.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge tone="slate">{s.chapters.length} chapters</Badge>
                    <Badge tone="indigo">{count} notes</Badge>
                    {free > 0 && <Badge tone="green">{free} free</Badge>}
                  </div>
                </div>
              </div>
              <ChevronRight style={{ color: T.indigo }} />
            </button>
          );
        })}
      </div>
    </main>
  );
}

/* ================================================================== */
/*  PUBLIC: subject detail + purchase                                  */
/* ================================================================== */
function SubjectDetail({ subjectId, subjects, pdfs, go, settings, currentUser, hasAccess, submitPurchase, notify }) {
  const subject = subjects.find((s) => s.id === subjectId);
  const [viewer, setViewer] = useState(null);
  const [buying, setBuying] = useState(null);
  if (!subject) return <main className="mx-auto max-w-6xl px-5 py-12">Subject not found.</main>;
  const list = pdfs.filter((p) => p.subjectId === subjectId);

  const startBuy = (pdf) => {
    if (!currentUser) { notify("Please log in to purchase."); go("login"); return; }
    setBuying(pdf);
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <button onClick={() => go("subjects")} className="mb-4 text-sm font-medium" style={{ color: T.indigo }}>← All subjects</button>
      <Badge tone="indigo">{subject.className}</Badge>
      <h1 className="mt-2 text-3xl font-bold" style={{ ...DISPLAY, color: T.ink }}>{subject.name}</h1>
      <p className="mt-2 max-w-2xl" style={{ color: "#475569" }}>{subject.description}</p>

      <div className="mt-8 space-y-6">
        {subject.chapters.map((ch) => {
          const chPdfs = list.filter((p) => p.chapterId === ch.id);
          return (
            <div key={ch.id}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>
                <FolderOpen size={15} style={{ color: T.gold }} /> {ch.title}
              </h3>
              {chPdfs.length === 0 ? (
                <p className="rounded-xl bg-white px-4 py-3 text-sm" style={{ border: `1px solid ${T.line}`, color: "#94a3b8" }}>Notes coming soon.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {chPdfs.map((p) => (
                    <PdfCard key={p.id} pdf={p} access={hasAccess(p)} onView={() => setViewer(p)} onBuy={() => startBuy(p)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PdfViewer pdf={viewer} onClose={() => setViewer(null)} />
      <PurchaseModal pdf={buying} payment={settings.payment} onClose={() => setBuying(null)}
        onSubmit={(ref, name) => { submitPurchase(buying, ref, name); setBuying(null); }} />
    </main>
  );
}

function PdfCard({ pdf, access, onView, onBuy }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white" style={{ border: `1px solid ${T.line}` }}>
      <div className="relative grid h-32 place-items-center" style={{ background: "rgba(67,56,202,0.04)" }}>
        {pdf.thumbnail ? (
          <img src={pdf.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <FileText size={34} style={{ color: "#c7d2fe" }} />
        )}
        <div className="absolute right-2 top-2">
          {pdf.isFree ? <Badge tone="green">Free</Badge> : <Badge tone="gold"><Lock size={11} /> {rupee(pdf.price)}</Badge>}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold leading-snug" style={{ color: T.ink }}>{pdf.title}</h4>
        <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>{pdf.downloads || 0} downloads</p>
        <div className="mt-3">
          {access ? (
            <Btn kind="primary" size="sm" className="w-full" onClick={onView}><Eye size={15} /> View / Download</Btn>
          ) : (
            <Btn kind="gold" size="sm" className="w-full" onClick={onBuy}><Wallet size={15} /> Unlock {rupee(pdf.price)}</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function PdfViewer({ pdf, onClose }) {
  if (!pdf) return null;
  const download = () => {
    const blob = new Blob([`${pdf.title}\n\n(Secure note delivered to verified students.)\n\nIn the production Spring Boot backend this file streams from cloud storage through a short-lived signed URL after a purchase check.`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = pdf.title.replace(/\s+/g, "_") + ".txt"; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Modal open={!!pdf} onClose={onClose} title="Secure note viewer" wide>
      <div className="p-5">
        <div className="rounded-xl p-5" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#047857" }}>
            <ShieldCheck size={16} /> Access verified
          </div>
          <p className="mt-1 text-sm" style={{ color: "#475569" }}>You have access to this note. The backend confirms your purchase before serving the file — the storage URL is never exposed.</p>
        </div>
        <div className="mt-4 rounded-xl bg-white p-6" style={{ border: `1px solid ${T.line}` }}>
          <FileText size={32} style={{ color: T.indigo }} />
          <h3 className="mt-3 text-lg font-bold" style={{ ...DISPLAY, color: T.ink }}>{pdf.title}</h3>
          <p className="mt-2 text-sm" style={{ color: "#64748b" }}>This is the demo viewer. Swap in a real PDF preview (e.g. an iframe of the signed URL) when wired to your backend.</p>
        </div>
        <Btn kind="primary" className="mt-4 w-full" onClick={download}><Download size={16} /> Download note</Btn>
      </div>
    </Modal>
  );
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = () => {
    try { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {}
  };
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs" style={{ color: "#64748b" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ ...MONO, color: T.ink }}>{value}</span>
        <button onClick={copy} className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: "rgba(67,56,202,0.08)", color: T.indigo }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function PurchaseModal({ pdf, payment, onClose, onSubmit }) {
  const [ref, setRef] = useState("");
  const [payer, setPayer] = useState("");
  const [err, setErr] = useState("");
  const p = payment || {};
  if (!pdf) return null;
  const submit = () => {
    if (!ref.trim()) { setErr("Enter the UPI reference / UTR number from your payment."); return; }
    setErr("");
    onSubmit(ref.trim(), payer.trim());
    setRef(""); setPayer("");
  };
  return (
    <Modal open={!!pdf} onClose={onClose} title="Unlock this note" wide>
      <div className="p-5">
        <div className="flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(67,56,202,0.05)" }}>
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: T.indigo }} />
            <span className="text-sm font-medium" style={{ color: T.ink }}>{pdf.title}</span>
          </div>
          <span className="font-bold" style={{ ...MONO, color: T.ink }}>{rupee(pdf.price)}</span>
        </div>

        {/* academy payment details */}
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          {p.qr ? (
            <div className="mx-auto overflow-hidden rounded-xl" style={{ border: `1px solid ${T.line}`, width: 150, height: 150 }}>
              <img src={p.qr} alt="Payment QR" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="rounded-xl p-3" style={{ border: `1px solid ${T.line}` }}>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold" style={{ color: T.ink }}>
              <Wallet size={15} style={{ color: T.gold }} /> Pay the academy directly
            </p>
            <CopyRow label="UPI ID" value={p.upiId} />
            {p.upiName && <p className="text-xs" style={{ color: "#94a3b8" }}>{p.upiName}</p>}
            {(p.accountNumber || p.bankName) && (
              <div className="mt-2 border-t pt-2" style={{ borderColor: T.line }}>
                <CopyRow label="Account" value={p.accountNumber} />
                <CopyRow label="IFSC" value={p.ifsc} />
                {p.bankName && <p className="text-xs" style={{ color: "#94a3b8" }}>{p.bankName}{p.accountName ? ` · ${p.accountName}` : ""}</p>}
              </div>
            )}
          </div>
        </div>

        {p.instructions && (
          <p className="mt-3 rounded-xl px-3 py-2.5 text-xs leading-relaxed" style={{ background: "rgba(217,160,43,0.1)", color: T.goldDark }}>
            {p.instructions}
          </p>
        )}

        <div className="mt-4 space-y-3">
          <Field label="UPI reference / UTR number" value={ref} onChange={setRef} placeholder="e.g. 4093xxxxxx21" />
          <Field label="Name you paid with (optional)" value={payer} onChange={setPayer} placeholder="As it appears in your UPI app" />
          {err && <p className="text-sm font-medium" style={{ color: "#e11d48" }}>{err}</p>}
        </div>

        <Btn kind="gold" className="mt-4 w-full" onClick={submit}>
          <ShieldCheck size={16} /> I've paid {rupee(pdf.price)} — submit for verification
        </Btn>
        <p className="mt-2 text-center text-xs" style={{ color: "#94a3b8" }}>
          Access unlocks once the academy verifies your payment.
        </p>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/*  PUBLIC: free notes                                                 */
/* ================================================================== */
function FreeNotesPage({ pdfs, subjects, currentUser, settings, hasAccess, go, submitPurchase, notify }) {
  const [viewer, setViewer] = useState(null);
  const [buying, setBuying] = useState(null);
  const free = pdfs.filter((p) => p.isFree);
  const paid = pdfs.filter((p) => !p.isFree);
  const subName = (id) => { const s = subjects.find((x) => x.id === id); return s ? `${s.className} ${s.name}` : ""; };
  const startBuy = (p) => { if (!currentUser) { notify("Please log in to purchase."); go("login"); return; } setBuying(p); };
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <SectionHead eyebrow="Open access" title="Free notes" />
      <p className="mt-2" style={{ color: "#475569" }}>Download these without an account. Paid notes show a preview below.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {free.map((p) => (
          <div key={p.id}>
            <p className="mb-1.5 text-xs font-semibold" style={{ color: T.gold }}>{subName(p.subjectId)}</p>
            <PdfCard pdf={p} access onView={() => setViewer(p)} onBuy={() => {}} />
          </div>
        ))}
      </div>

      <div className="mt-12">
        <SectionHead eyebrow="Premium" title="Paid notes — preview" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paid.map((p) => (
            <div key={p.id}>
              <p className="mb-1.5 text-xs font-semibold" style={{ color: T.gold }}>{subName(p.subjectId)}</p>
              <PdfCard pdf={p} access={hasAccess(p)} onView={() => setViewer(p)} onBuy={() => startBuy(p)} />
            </div>
          ))}
        </div>
      </div>

      <PdfViewer pdf={viewer} onClose={() => setViewer(null)} />
      <PurchaseModal pdf={buying} payment={settings.payment} onClose={() => setBuying(null)}
        onSubmit={(ref, name) => { submitPurchase(buying, ref, name); setBuying(null); }} />
    </main>
  );
}

/* ================================================================== */
/*  PUBLIC: auth                                                       */
/* ================================================================== */
function AuthPage({ mode, settings, login, register, go, notify }) {
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    setErr("");
    if (mode === "login") {
      const r = login(f.email, f.password);
      if (!r.ok) return setErr(r.msg);
      notify("Welcome back!");
      go(r.role === "ADMIN" ? "admin" : "dashboard");
    } else if (mode === "register") {
      if (!f.name || !f.email || !f.password) return setErr("Please fill all fields.");
      const r = register(f);
      if (!r.ok) return setErr(r.msg);
      notify("Account created!");
      go("dashboard");
    } else {
      if (!f.email) return setErr("Enter your email.");
      setDone(true);
    }
  };

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-12" style={GRID}>
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm" style={{ border: `1px solid ${T.line}` }}>
        <Logo name={settings.tuitionName} />
        <h1 className="mt-5 text-2xl font-bold" style={{ ...DISPLAY, color: T.ink }}>
          {mode === "login" ? "Log in" : mode === "register" ? "Create your account" : "Reset password"}
        </h1>
        {mode === "login" && <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>Student demo: student@demo.in / demo123 · Admin: admin@academy.in / admin123</p>}

        {done ? (
          <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: "rgba(16,185,129,0.08)", color: "#047857" }}>
            If an account exists for {f.email}, a reset link has been sent. (Demo — wire to your email service.)
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {mode === "register" && <Field label="Full name" value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="Your name" />}
            <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} placeholder="you@email.com" />
            {mode !== "forgot" && <Field label="Password" type="password" value={f.password} onChange={(v) => setF({ ...f, password: v })} placeholder="••••••••" />}
            {err && <p className="text-sm font-medium" style={{ color: "#e11d48" }}>{err}</p>}
            <Btn kind="primary" className="w-full" onClick={submit}>
              {mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Send reset link"}
            </Btn>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-sm">
          {mode === "login" ? (
            <>
              <button onClick={() => go("forgot")} style={{ color: "#64748b" }}>Forgot password?</button>
              <button onClick={() => go("register")} style={{ color: T.indigo, fontWeight: 600 }}>Register</button>
            </>
          ) : (
            <button onClick={() => go("login")} style={{ color: T.indigo, fontWeight: 600 }}>← Back to log in</button>
          )}
        </div>
      </div>
    </main>
  );
}

/* ================================================================== */
/*  PUBLIC: student dashboard                                          */
/* ================================================================== */
function StudentDashboard({ currentUser, pdfs, subjects, payments, reviews = [], submitReview, go, hasAccess, notify }) {
  const [viewer, setViewer] = useState(null);
  if (!currentUser) { go("login"); return null; }
  const myPdfs = pdfs.filter((p) => currentUser.purchases.includes(p.id));
  const mySubjects = [...new Set(myPdfs.map((p) => p.subjectId))].map((id) => subjects.find((s) => s.id === id)).filter(Boolean);
  const myPayments = payments.filter((p) => p.userId === currentUser.id);
  const myReviews = reviews.filter((r) => r.userId === currentUser.id);
  const subName = (id) => { const s = subjects.find((x) => x.id === id); return s ? `${s.className} ${s.name}` : ""; };

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl text-xl font-bold" style={{ background: T.indigoDark, color: T.gold, ...DISPLAY }}>
          {currentUser.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ ...DISPLAY, color: T.ink }}>Hi, {currentUser.name.split(" ")[0]}</h1>
          <p className="text-sm" style={{ color: "#64748b" }}>{currentUser.email}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Stat label="Purchased notes" value={myPdfs.length} icon={<FileText size={18} />} />
        <Stat label="Subjects" value={mySubjects.length} icon={<BookOpen size={18} />} />
        <Stat label="Total spent" value={rupee(myPayments.filter((p) => p.status === "SUCCESS").reduce((a, b) => a + b.amount, 0))} icon={<Wallet size={18} />} mono />
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold" style={{ ...DISPLAY, color: T.ink }}>Your notes</h2>
      {myPdfs.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center" style={{ border: `1px solid ${T.line}` }}>
          <FileText size={32} style={{ color: "#cbd5e1", margin: "0 auto" }} />
          <p className="mt-3 text-sm" style={{ color: "#64748b" }}>No purchases yet.</p>
          <Btn kind="primary" size="sm" className="mt-4" onClick={() => go("subjects")}>Browse subjects</Btn>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myPdfs.map((p) => (
            <div key={p.id}>
              <p className="mb-1.5 text-xs font-semibold" style={{ color: T.gold }}>{subName(p.subjectId)}</p>
              <PdfCard pdf={p} access onView={() => setViewer(p)} onBuy={() => {}} />
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-3 text-lg font-bold" style={{ ...DISPLAY, color: T.ink }}>Payment history</h2>
      <div className="overflow-hidden rounded-2xl bg-white" style={{ border: `1px solid ${T.line}` }}>
        {myPayments.length === 0 ? (
          <p className="p-5 text-sm" style={{ color: "#94a3b8" }}>No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr style={{ background: "rgba(67,56,202,0.04)", color: "#64748b" }}>
              <th className="px-4 py-2.5 text-left font-semibold">Note</th>
              <th className="px-4 py-2.5 text-left font-semibold">Amount</th>
              <th className="px-4 py-2.5 text-left font-semibold">Status</th>
              <th className="px-4 py-2.5 text-left font-semibold">Date</th>
            </tr></thead>
            <tbody>
              {myPayments.map((p) => (
                <tr key={p.id} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td className="px-4 py-2.5" style={{ color: T.ink }}>{p.pdfTitle}</td>
                  <td className="px-4 py-2.5" style={{ ...MONO, color: T.ink }}>{rupee(p.amount)}</td>
                  <td className="px-4 py-2.5"><PaymentStatusBadge status={p.status} /></td>
                  <td className="px-4 py-2.5" style={{ color: "#94a3b8" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-bold" style={{ ...DISPLAY, color: T.ink }}>Your reviews</h2>
      <ReviewForm onSubmit={submitReview} myReviews={myReviews} />

      <PdfViewer pdf={viewer} onClose={() => setViewer(null)} />
    </main>
  );
}

function ReviewForm({ onSubmit, myReviews }) {
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), role.trim());
    setText(""); setRole("");
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${T.line}` }}>
        <h3 className="flex items-center gap-2 font-bold" style={{ ...DISPLAY, color: T.ink }}>
          <Quote size={18} style={{ color: T.gold }} /> Write a review
        </h3>
        <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>Your review appears on the home page once the academy approves it.</p>
        <div className="mt-3 space-y-3">
          <Field label="Your review" textarea rows={3} value={text} onChange={setText} placeholder="What did you find helpful?" />
          <Field label="Class / subject (optional)" value={role} onChange={setRole} placeholder="e.g. Class 12 · Commerce" />
          <Btn kind="gold" className="w-full" onClick={submit}><Check size={16} /> Submit for approval</Btn>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${T.line}` }}>
        <h3 className="font-bold" style={{ ...DISPLAY, color: T.ink }}>Submitted reviews</h3>
        {myReviews.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "#94a3b8" }}>You haven't written a review yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {myReviews.map((r) => (
              <div key={r.id} className="rounded-xl p-3" style={{ border: `1px solid ${T.line}` }}>
                <div className="mb-1.5 flex items-center justify-between">
                  {r.status === "APPROVED" ? <Badge tone="green">Published</Badge> : <Badge tone="gold">Awaiting approval</Badge>}
                  <span className="text-xs" style={{ color: "#94a3b8" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <p className="text-sm" style={{ color: "#334155" }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon, mono }) {
  return (
    <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${T.line}` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "#64748b" }}>{label}</span>
        <span style={{ color: T.indigo }}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold" style={{ ...(mono ? MONO : DISPLAY), color: T.ink }}>{value}</p>
    </div>
  );
}

/* ================================================================== */
/*  PUBLIC: footer                                                     */
/* ================================================================== */
function PublicFooter({ settings, go }) {
  return (
    <footer style={{ background: "#fff", borderTop: `1px solid ${T.line}` }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <Logo name={settings.tuitionName} />
        <div className="flex items-center gap-4 text-sm" style={{ color: "#64748b" }}>
          <button onClick={() => go("subjects")}>Subjects</button>
          <button onClick={() => go("notes")}>Free notes</button>
          <button onClick={() => go("admin")} className="font-medium" style={{ color: T.indigo }}>Admin</button>
        </div>
      </div>
      <p className="pb-6 text-center text-xs" style={{ color: "#94a3b8" }}>© {new Date().getFullYear()} {settings.tuitionName}. Demo build.</p>
    </footer>
  );
}

/* ================================================================== */
/*  ADMIN: gate (login)                                                */
/* ================================================================== */
function AdminGate({ onLogin, go, notify, settings }) {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = () => {
    const r = onLogin(f.email, f.password);
    if (!r.ok) return setErr(r.msg);
    if (r.role !== "ADMIN") return setErr("This area is for admins only.");
    notify("Welcome, admin.");
    go("admin");
  };
  return (
    <div className="grid min-h-screen place-items-center px-5" style={{ ...GRID, ...BODY }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm" style={{ border: `1px solid ${T.line}` }}>
        <div className="flex items-center gap-2">
          <div className="grid place-items-center rounded-lg" style={{ width: 34, height: 34, background: T.indigoDark }}><ShieldCheck size={18} color={T.gold} /></div>
          <span className="font-bold" style={{ ...DISPLAY, color: T.ink }}>Admin portal</span>
        </div>
        <h1 className="mt-5 text-xl font-bold" style={{ ...DISPLAY, color: T.ink }}>Sign in to manage {settings.tuitionName}</h1>
        <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>admin@academy.in / admin123</p>
        <div className="mt-5 space-y-3">
          <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} placeholder="admin@academy.in" />
          <Field label="Password" type="password" value={f.password} onChange={(v) => setF({ ...f, password: v })} placeholder="••••••••" />
          {err && <p className="text-sm font-medium" style={{ color: "#e11d48" }}>{err}</p>}
          <Btn kind="primary" className="w-full" onClick={submit}>Sign in</Btn>
          <button onClick={() => go("home")} className="w-full text-center text-sm" style={{ color: "#64748b" }}>← Back to website</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ADMIN: portal shell                                                */
/* ================================================================== */
function AdminPortal({ settings, saveSettings, subjects, saveSubjects, pdfs, savePdfs, users, saveUsers, payments, savePayments, reviews, saveReviews, go, logout, notify, admin }) {
  const [tab, setTab] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "pdfs", label: "PDF notes", icon: FileText },
    { id: "users", label: "Students", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Site settings", icon: Settings },
  ];
  return (
    <div className="flex min-h-screen" style={{ ...BODY, background: "#f4f5fb" }}>
      <FontLoader />
      {/* sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform p-4 transition md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: T.indigoDark }}>
        <div className="flex items-center gap-2 px-2 py-2">
          <GraduationCap size={22} color={T.gold} />
          <span className="font-bold text-white" style={DISPLAY}>{settings.tuitionName.split(" ")[0]} Admin</span>
        </div>
        <nav className="mt-6 space-y-1">
          {nav.map((n) => {
            const Ic = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => { setTab(n.id); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
                style={{ background: active ? "rgba(255,255,255,0.12)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)" }}>
                <Ic size={18} /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          <button onClick={() => go("home")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}><Home size={18} /> View website</button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}><LogOut size={18} /> Log out</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      {/* main */}
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpen(true)}><Menu /></button>
            <h1 className="text-lg font-bold capitalize" style={{ ...DISPLAY, color: T.ink }}>{nav.find((n) => n.id === tab).label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold" style={{ background: T.indigoDark, color: T.gold }}>{admin.name.charAt(0)}</div>
          </div>
        </header>
        <div className="p-5 md:p-7">
          {tab === "dashboard" && <AdminDashboard users={users} payments={payments} pdfs={pdfs} subjects={subjects} />}
          {tab === "subjects" && <AdminSubjects subjects={subjects} saveSubjects={saveSubjects} pdfs={pdfs} notify={notify} />}
          {tab === "pdfs" && <AdminPdfs pdfs={pdfs} savePdfs={savePdfs} subjects={subjects} notify={notify} />}
          {tab === "users" && <AdminUsers users={users} saveUsers={saveUsers} pdfs={pdfs} notify={notify} />}
          {tab === "payments" && <AdminPayments payments={payments} savePayments={savePayments}
            users={users} saveUsers={saveUsers} pdfs={pdfs} savePdfs={savePdfs} notify={notify} />}
          {tab === "reviews" && <AdminReviews reviews={reviews} saveReviews={saveReviews} notify={notify} />}
          {tab === "analytics" && <AdminAnalytics pdfs={pdfs} payments={payments} subjects={subjects} />}
          {tab === "settings" && <AdminSettings settings={settings} saveSettings={saveSettings} notify={notify} />}
        </div>
      </div>
    </div>
  );
}

/* ADMIN: dashboard */
function AdminDashboard({ users, payments, pdfs, subjects }) {
  const students = users.filter((u) => u.role === "STUDENT");
  const success = payments.filter((p) => p.status === "SUCCESS");
  const revenue = success.reduce((a, b) => a + b.amount, 0);
  const recent = [...students].sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin)).slice(0, 5);
  const cards = [
    { label: "Total students", value: students.length, icon: Users, tone: T.indigo },
    { label: "Total purchases", value: success.length, icon: CreditCard, tone: "#10b981" },
    { label: "Revenue", value: rupee(revenue), icon: IndianRupee, tone: T.gold, mono: true },
    { label: "Published notes", value: pdfs.length, icon: FileText, tone: "#6366f1" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Ic = c.icon;
          return (
            <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "#64748b" }}>{c.label}</span>
                <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: c.tone + "1a" }}><Ic size={18} style={{ color: c.tone }} /></div>
              </div>
              <p className="mt-3 text-2xl font-bold" style={{ ...(c.mono ? MONO : DISPLAY), color: T.ink }}>{c.value}</p>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-bold" style={{ ...DISPLAY, color: T.ink }}><UserCheck size={18} style={{ color: T.indigo }} /> Recent logins</h3>
        {recent.length === 0 ? <p className="text-sm" style={{ color: "#94a3b8" }}>No students yet.</p> : (
          <div className="divide-y" style={{ borderColor: T.line }}>
            {recent.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold" style={{ background: "rgba(67,56,202,0.1)", color: T.indigo }}>{u.name.charAt(0)}</div>
                  <div><p className="text-sm font-semibold" style={{ color: T.ink }}>{u.name}</p><p className="text-xs" style={{ color: "#94a3b8" }}>{u.email}</p></div>
                </div>
                <span className="text-xs" style={{ color: "#94a3b8" }}>{new Date(u.lastLogin).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ADMIN: subjects */
function AdminSubjects({ subjects, saveSubjects, pdfs, notify }) {
  const [edit, setEdit] = useState(null); // subject object or "new"
  const blank = { id: "", name: "", className: "Class 9", description: "", chapters: [] };
  const [form, setForm] = useState(blank);

  const openNew = () => { setForm({ ...blank, id: "new" }); setEdit("new"); };
  const openEdit = (s) => { setForm(JSON.parse(JSON.stringify(s))); setEdit(s.id); };
  const save = () => {
    if (!form.name.trim()) return notify("Subject name required.");
    if (edit === "new") {
      saveSubjects([...subjects, { ...form, id: "s_" + uid() }]);
      notify("Subject added.");
    } else {
      saveSubjects(subjects.map((s) => s.id === edit ? form : s));
      notify("Subject updated.");
    }
    setEdit(null);
  };
  const del = (id) => {
    if (pdfs.some((p) => p.subjectId === id)) return notify("Remove its notes first.");
    saveSubjects(subjects.filter((s) => s.id !== id));
    notify("Subject deleted.");
  };
  const addChapter = () => setForm({ ...form, chapters: [...form.chapters, { id: "c" + uid(), title: "" }] });
  const setChapter = (i, v) => setForm({ ...form, chapters: form.chapters.map((c, idx) => idx === i ? { ...c, title: v } : c) });
  const delChapter = (i) => setForm({ ...form, chapters: form.chapters.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="mb-4 flex justify-end"><Btn kind="primary" onClick={openNew}><Plus size={16} /> Add subject</Btn></div>
      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <Badge tone="indigo">{s.className}</Badge>
                <h3 className="mt-2 font-bold" style={{ ...DISPLAY, color: T.ink }}>{s.name}</h3>
                <p className="mt-1 text-sm" style={{ color: "#64748b" }}>{s.description}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="rounded-lg p-2" style={{ background: "rgba(67,56,202,0.08)" }}><Pencil size={15} style={{ color: T.indigo }} /></button>
                <button onClick={() => del(s.id)} className="rounded-lg p-2" style={{ background: "rgba(225,29,72,0.08)" }}><Trash2 size={15} style={{ color: "#e11d48" }} /></button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.chapters.map((c) => <Badge key={c.id} tone="slate">{c.title}</Badge>)}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === "new" ? "Add subject" : "Edit subject"} wide>
        <div className="space-y-4 p-5">
          <Field label="Subject name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Economics" />
          <label className="block">
            <span className="block text-sm font-medium mb-1.5" style={{ color: T.ink }}>Class</span>
            <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm" style={{ border: "1px solid rgba(31,36,64,0.15)", background: "#fff", color: T.ink }}>
              {["Class 9", "Class 10", "Class 11", "Class 12"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <Field label="Description" textarea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: T.ink }}>Chapters / units</span>
              <Btn kind="soft" size="sm" onClick={addChapter}><Plus size={14} /> Add</Btn>
            </div>
            <div className="space-y-2">
              {form.chapters.map((c, i) => (
                <div key={c.id} className="flex gap-2">
                  <input value={c.title} onChange={(e) => setChapter(i, e.target.value)} placeholder={`Chapter ${i + 1}`}
                    className="flex-1 rounded-xl px-3 py-2 text-sm" style={{ border: "1px solid rgba(31,36,64,0.15)" }} />
                  <button onClick={() => delChapter(i)} className="rounded-lg p-2" style={{ background: "rgba(225,29,72,0.08)" }}><Trash2 size={14} style={{ color: "#e11d48" }} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn kind="ghost" onClick={() => setEdit(null)}>Cancel</Btn>
            <Btn kind="primary" onClick={save}><Check size={16} /> Save subject</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ADMIN: pdfs */
function AdminPdfs({ pdfs, savePdfs, subjects, notify }) {
  const [edit, setEdit] = useState(null);
  const blank = { id: "", title: "", subjectId: subjects[0]?.id || "", chapterId: "", isFree: true, price: 0, thumbnail: "", downloads: 0 };
  const [form, setForm] = useState(blank);
  const subj = subjects.find((s) => s.id === form.subjectId);

  const openNew = () => { const b = { ...blank, id: "new", subjectId: subjects[0]?.id || "", chapterId: subjects[0]?.chapters[0]?.id || "" }; setForm(b); setEdit("new"); };
  const openEdit = (p) => { setForm({ ...p }); setEdit(p.id); };
  const save = () => {
    if (!form.title.trim()) return notify("Title required.");
    const clean = { ...form, price: form.isFree ? 0 : Number(form.price) || 0 };
    if (edit === "new") { savePdfs([{ ...clean, id: uid(), createdAt: now(), downloads: 0 }, ...pdfs]); notify("Note uploaded."); }
    else { savePdfs(pdfs.map((p) => p.id === edit ? clean : p)); notify("Note updated."); }
    setEdit(null);
  };
  const del = (id) => { savePdfs(pdfs.filter((p) => p.id !== id)); notify("Note deleted."); };
  const onThumb = async (file) => { if (!file) return; const d = await fileToResizedDataURL(file, 500); setForm({ ...form, thumbnail: d }); };

  const subName = (id) => { const s = subjects.find((x) => x.id === id); return s ? `${s.className} ${s.name}` : "—"; };

  return (
    <div>
      <div className="mb-4 flex justify-end"><Btn kind="primary" onClick={openNew}><Upload size={16} /> Upload note</Btn></div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(67,56,202,0.04)", color: "#64748b" }}>
            <th className="px-4 py-3 text-left font-semibold">Title</th>
            <th className="px-4 py-3 text-left font-semibold">Subject</th>
            <th className="px-4 py-3 text-left font-semibold">Access</th>
            <th className="px-4 py-3 text-left font-semibold">Downloads</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr></thead>
          <tbody>
            {pdfs.map((p) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="px-4 py-3 font-medium" style={{ color: T.ink }}>{p.title}</td>
                <td className="px-4 py-3" style={{ color: "#64748b" }}>{subName(p.subjectId)}</td>
                <td className="px-4 py-3">{p.isFree ? <Badge tone="green">Free</Badge> : <Badge tone="gold">{rupee(p.price)}</Badge>}</td>
                <td className="px-4 py-3" style={{ ...MONO, color: T.ink }}>{p.downloads || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-lg p-2" style={{ background: "rgba(67,56,202,0.08)" }}><Pencil size={14} style={{ color: T.indigo }} /></button>
                    <button onClick={() => del(p.id)} className="rounded-lg p-2" style={{ background: "rgba(225,29,72,0.08)" }}><Trash2 size={14} style={{ color: "#e11d48" }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === "new" ? "Upload note" : "Edit note"} wide>
        <div className="space-y-4 p-5">
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. National Income — Full Notes" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium mb-1.5" style={{ color: T.ink }}>Subject</span>
              <select value={form.subjectId} onChange={(e) => { const s = subjects.find((x) => x.id === e.target.value); setForm({ ...form, subjectId: e.target.value, chapterId: s?.chapters[0]?.id || "" }); }}
                className="w-full rounded-xl px-3 py-2.5 text-sm" style={{ border: "1px solid rgba(31,36,64,0.15)" }}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.className} {s.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5" style={{ color: T.ink }}>Chapter</span>
              <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}
                className="w-full rounded-xl px-3 py-2.5 text-sm" style={{ border: "1px solid rgba(31,36,64,0.15)" }}>
                {(subj?.chapters || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(67,56,202,0.04)" }}>
            <div className="flex items-center gap-4">
              <button onClick={() => setForm({ ...form, isFree: true })} className="flex items-center gap-2 text-sm font-semibold" style={{ color: form.isFree ? "#047857" : "#94a3b8" }}>
                {form.isFree ? <CircleCheck size={16} /> : <Unlock size={16} />} Free
              </button>
              <button onClick={() => setForm({ ...form, isFree: false })} className="flex items-center gap-2 text-sm font-semibold" style={{ color: !form.isFree ? T.goldDark : "#94a3b8" }}>
                {!form.isFree ? <CircleCheck size={16} /> : <Lock size={16} />} Paid
              </button>
            </div>
            {!form.isFree && (
              <div className="mt-3">
                <Field label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="79" />
              </div>
            )}
          </div>
          <div>
            <span className="block text-sm font-medium mb-1.5" style={{ color: T.ink }}>Thumbnail</span>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl" style={{ background: "rgba(67,56,202,0.06)", border: `1px solid ${T.line}` }}>
                {form.thumbnail ? <img src={form.thumbnail} className="h-full w-full object-cover" alt="" /> : <ImageIcon size={20} style={{ color: "#cbd5e1" }} />}
              </div>
              <label className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: "rgba(67,56,202,0.08)", color: T.indigo }}>
                Choose image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onThumb(e.target.files[0])} />
              </label>
            </div>
            <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>The actual PDF file would be uploaded to cloud storage in production; here we store its metadata.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn kind="ghost" onClick={() => setEdit(null)}>Cancel</Btn>
            <Btn kind="primary" onClick={save}><Check size={16} /> Save note</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ADMIN: users */
function AdminUsers({ users, saveUsers, pdfs, notify }) {
  const [q, setQ] = useState("");
  const [grant, setGrant] = useState(null);
  const students = users.filter((u) => u.role === "STUDENT" && (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())));
  const block = (id) => { saveUsers(users.map((u) => u.id === id ? { ...u, blocked: !u.blocked } : u)); notify("Updated."); };
  const reset = (id) => { saveUsers(users.map((u) => u.id === id ? { ...u, password: "reset123" } : u)); notify("Password reset to reset123."); };
  const grantAccess = (userId, pdfId) => {
    saveUsers(users.map((u) => u.id === userId ? { ...u, purchases: u.purchases.includes(pdfId) ? u.purchases : [...u.purchases, pdfId] } : u));
    notify("Access granted.");
  };
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm" style={{ maxWidth: 320 }}>
        <Search size={16} style={{ color: "#94a3b8" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students" className="w-full text-sm outline-none" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(67,56,202,0.04)", color: "#64748b" }}>
            <th className="px-4 py-3 text-left font-semibold">Student</th>
            <th className="px-4 py-3 text-left font-semibold">Last login</th>
            <th className="px-4 py-3 text-left font-semibold">Notes owned</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr></thead>
          <tbody>
            {students.map((u) => (
              <tr key={u.id} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="px-4 py-3"><p className="font-semibold" style={{ color: T.ink }}>{u.name}</p><p className="text-xs" style={{ color: "#94a3b8" }}>{u.email}</p></td>
                <td className="px-4 py-3" style={{ color: "#64748b" }}>{new Date(u.lastLogin).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3" style={{ ...MONO, color: T.ink }}>{u.purchases.length}</td>
                <td className="px-4 py-3">{u.blocked ? <Badge tone="rose">Blocked</Badge> : <Badge tone="green">Active</Badge>}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button title="Grant access" onClick={() => setGrant(u)} className="rounded-lg p-2" style={{ background: "rgba(217,160,43,0.12)" }}><Unlock size={14} style={{ color: T.goldDark }} /></button>
                    <button title="Reset password" onClick={() => reset(u.id)} className="rounded-lg p-2" style={{ background: "rgba(67,56,202,0.08)" }}><KeyRound size={14} style={{ color: T.indigo }} /></button>
                    <button title={u.blocked ? "Unblock" : "Block"} onClick={() => block(u.id)} className="rounded-lg p-2" style={{ background: "rgba(225,29,72,0.08)" }}><Ban size={14} style={{ color: "#e11d48" }} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#94a3b8" }}>No students found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!grant} onClose={() => setGrant(null)} title={`Grant access · ${grant?.name || ""}`}>
        <div className="space-y-2 p-5">
          <p className="text-sm" style={{ color: "#64748b" }}>Manually unlock a paid note for this student (e.g. offline payment).</p>
          {pdfs.filter((p) => !p.isFree).map((p) => {
            const owned = grant?.purchases.includes(p.id);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ border: `1px solid ${T.line}` }}>
                <span className="text-sm" style={{ color: T.ink }}>{p.title}</span>
                {owned ? <Badge tone="green"><Check size={12} /> Owned</Badge> :
                  <Btn kind="soft" size="sm" onClick={() => { grantAccess(grant.id, p.id); setGrant({ ...grant, purchases: [...grant.purchases, p.id] }); }}>Grant</Btn>}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

/* ADMIN: payments */
function AdminPayments({ payments, savePayments, users, saveUsers, pdfs, savePdfs, notify }) {
  const [filter, setFilter] = useState("ALL");
  const list = payments.filter((p) => filter === "ALL" || p.status === filter);
  const total = payments.filter((p) => p.status === "SUCCESS").reduce((a, b) => a + b.amount, 0);
  const pending = payments.filter((p) => p.status === "PENDING").length;

  // Verify a pending payment: mark it SUCCESS, unlock the note for the student,
  // and bump the note's download counter.
  const verify = (pay) => {
    savePayments(payments.map((p) => p.id === pay.id ? { ...p, status: "SUCCESS" } : p));
    saveUsers(users.map((u) => u.id === pay.userId
      ? { ...u, purchases: u.purchases.includes(pay.pdfId) ? u.purchases : [...u.purchases, pay.pdfId] }
      : u));
    savePdfs(pdfs.map((p) => p.id === pay.pdfId ? { ...p, downloads: (p.downloads || 0) + 1 } : p));
    notify("Payment verified — note unlocked for the student.");
  };
  const reject = (pay) => {
    savePayments(payments.map((p) => p.id === pay.id ? { ...p, status: "FAILED" } : p));
    notify("Payment rejected.");
  };

  return (
    <div>
      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        <Stat label="Pending review" value={pending} icon={<KeyRound size={18} />} />
        <Stat label="Verified" value={payments.filter((p) => p.status === "SUCCESS").length} icon={<CircleCheck size={18} />} />
        <Stat label="Rejected" value={payments.filter((p) => p.status === "FAILED").length} icon={<CircleX size={18} />} />
        <Stat label="Collected" value={rupee(total)} icon={<IndianRupee size={18} />} mono />
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {["ALL", "PENDING", "SUCCESS", "FAILED"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={{ background: filter === f ? T.indigo : "#fff", color: filter === f ? "#fff" : "#64748b", border: `1px solid ${T.line}` }}>{f.charAt(0) + f.slice(1).toLowerCase()}</button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr style={{ background: "rgba(67,56,202,0.04)", color: "#64748b" }}>
            <th className="px-4 py-3 text-left font-semibold">UPI ref / UTR</th>
            <th className="px-4 py-3 text-left font-semibold">Student</th>
            <th className="px-4 py-3 text-left font-semibold">Note</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Paid as</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="px-4 py-3" style={{ ...MONO, color: "#64748b", fontSize: 12 }}>{p.transactionId}</td>
                <td className="px-4 py-3" style={{ color: T.ink }}>{p.userEmail}</td>
                <td className="px-4 py-3" style={{ color: "#64748b" }}>{p.pdfTitle}</td>
                <td className="px-4 py-3" style={{ ...MONO, color: T.ink }}>{rupee(p.amount)}</td>
                <td className="px-4 py-3" style={{ color: "#64748b" }}>{p.payerName || "—"}</td>
                <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  {p.status === "PENDING" ? (
                    <div className="flex justify-end gap-1">
                      <Btn kind="primary" size="sm" onClick={() => verify(p)}><Check size={14} /> Verify</Btn>
                      <Btn kind="ghost" size="sm" onClick={() => reject(p)}>Reject</Btn>
                    </div>
                  ) : (
                    <span className="block text-right text-xs" style={{ color: "#cbd5e1" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: "#94a3b8" }}>No payments here yet. Submit one as a student to see it.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ADMIN: reviews moderation */
function AdminReviews({ reviews, saveReviews, notify }) {
  const pending = reviews.filter((r) => r.status === "PENDING");
  const approved = reviews.filter((r) => r.status === "APPROVED");
  const approve = (r) => { saveReviews(reviews.map((x) => x.id === r.id ? { ...x, status: "APPROVED" } : x)); notify("Review approved — now live on the home page."); };
  const remove = (r) => { saveReviews(reviews.filter((x) => x.id !== r.id)); notify("Review removed."); };

  const Card = ({ r, live }) => (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        {live ? <Badge tone="green">Published</Badge> : <Badge tone="gold">Pending</Badge>}
        <span className="text-xs" style={{ color: "#94a3b8" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
      </div>
      <Quote size={18} style={{ color: T.gold }} />
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "#334155" }}>{r.text}</p>
      <p className="mt-3 text-sm font-bold" style={{ color: T.ink }}>{r.name}</p>
      <p className="text-xs" style={{ color: "#94a3b8" }}>{r.role} · {r.userEmail}</p>
      <div className="mt-3 flex gap-2">
        {!live && <Btn kind="primary" size="sm" onClick={() => approve(r)}><Check size={14} /> Approve</Btn>}
        <Btn kind="ghost" size="sm" onClick={() => remove(r)}><Trash2 size={14} /> {live ? "Remove" : "Reject"}</Btn>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-bold" style={{ ...DISPLAY, color: T.ink }}>
          <KeyRound size={18} style={{ color: T.indigo }} /> Awaiting approval
          {pending.length > 0 && <Badge tone="gold">{pending.length}</Badge>}
        </h3>
        {pending.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm shadow-sm" style={{ color: "#94a3b8" }}>No reviews waiting. New student reviews show up here.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{pending.map((r) => <Card key={r.id} r={r} />)}</div>
        )}
      </div>
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-bold" style={{ ...DISPLAY, color: T.ink }}>
          <CircleCheck size={18} style={{ color: "#10b981" }} /> Published reviews
        </h3>
        {approved.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm shadow-sm" style={{ color: "#94a3b8" }}>No published student reviews yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{approved.map((r) => <Card key={r.id} r={r} live />)}</div>
        )}
      </div>
    </div>
  );
}

/* ADMIN: analytics */
function AdminAnalytics({ pdfs, payments, subjects }) {
  const topNotes = [...pdfs].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 6).map((p) => ({ name: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title, downloads: p.downloads || 0 }));
  const bySubject = subjects.map((s) => {
    const ids = pdfs.filter((p) => p.subjectId === s.id).map((p) => p.id);
    const count = payments.filter((p) => p.status === "SUCCESS" && ids.includes(p.pdfId)).length;
    return { name: `${s.className.replace("Class ", "C")} ${s.name.slice(0, 8)}`, purchases: count };
  });
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revByMonth = months.map((m) => ({ name: m, revenue: 0 }));
  payments.filter((p) => p.status === "SUCCESS").forEach((p) => { const m = monthKey(p.createdAt); const row = revByMonth.find((r) => r.name === m); if (row) row.revenue += p.amount; });
  const thisYear = revByMonth.filter((r, i) => i >= new Date().getMonth() - 5 && i <= new Date().getMonth());

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Most downloaded notes" icon={<Download size={16} />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topNotes} layout="vertical" margin={{ left: 10, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="downloads" fill={T.indigo} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Most purchased subjects" icon={<TrendingUp size={16} />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bySubject} margin={{ left: -10, right: 10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip />
              <Bar dataKey="purchases" fill={T.gold} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title="Monthly revenue" icon={<IndianRupee size={16} />}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={thisYear} margin={{ left: -10, right: 10 }}>
            <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.indigo} stopOpacity={0.35} /><stop offset="100%" stopColor={T.indigo} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip formatter={(v) => rupee(v)} />
            <Area type="monotone" dataKey="revenue" stroke={T.indigo} strokeWidth={2} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold" style={{ ...DISPLAY, color: T.ink }}><span style={{ color: T.indigo }}>{icon}</span> {title}</h3>
      {children}
    </div>
  );
}

/* ADMIN: settings (controls tuition name, teacher, images) */
function AdminSettings({ settings, saveSettings, notify }) {
  const [s, setS] = useState(JSON.parse(JSON.stringify(settings)));
  const setHero = (k, v) => setS({ ...s, hero: { ...s.hero, [k]: v } });
  const setTeacher = (k, v) => setS({ ...s, teacher: { ...s.teacher, [k]: v } });
  const setContact = (k, v) => setS({ ...s, contact: { ...s.contact, [k]: v } });
  const pay = s.payment || {};
  const setPay = (k, v) => setS({ ...s, payment: { ...pay, [k]: v } });

  const upload = async (file, apply, dim) => { if (!file) return; const d = await fileToResizedDataURL(file, dim); apply(d); };

  const addTesti = () => setS({ ...s, testimonials: [...s.testimonials, { id: uid(), name: "", role: "", text: "" }] });
  const setTesti = (i, k, v) => setS({ ...s, testimonials: s.testimonials.map((t, idx) => idx === i ? { ...t, [k]: v } : t) });
  const delTesti = (i) => setS({ ...s, testimonials: s.testimonials.filter((_, idx) => idx !== i) });

  const save = () => { saveSettings(s); notify("Site settings saved — the public site updated."); };

  return (
    <div className="max-w-3xl space-y-5">
      <Panel title="Identity">
        <Field label="Tuition / academy name" value={s.tuitionName} onChange={(v) => setS({ ...s, tuitionName: v })} />
        <Field label="Tagline" value={s.tagline} onChange={(v) => setS({ ...s, tagline: v })} />
        <Field label="About text" textarea value={s.about} onChange={(v) => setS({ ...s, about: v })} />
      </Panel>

      <Panel title="Hero section">
        <Field label="Headline" value={s.hero.title} onChange={(v) => setHero("title", v)} />
        <Field label="Subtitle" textarea value={s.hero.subtitle} onChange={(v) => setHero("subtitle", v)} />
        <ImagePicker label="Hero image" value={s.hero.image} onPick={(f) => upload(f, (d) => setHero("image", d), 1000)} onClear={() => setHero("image", "")} />
      </Panel>

      <Panel title="Teacher profile">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={s.teacher.name} onChange={(v) => setTeacher("name", v)} />
          <Field label="Title" value={s.teacher.title} onChange={(v) => setTeacher("title", v)} />
        </div>
        <Field label="Qualifications" value={s.teacher.qualifications} onChange={(v) => setTeacher("qualifications", v)} />
        <Field label="Bio" textarea value={s.teacher.bio} onChange={(v) => setTeacher("bio", v)} />
        <ImagePicker label="Teacher photo" value={s.teacher.photo} onPick={(f) => upload(f, (d) => setTeacher("photo", d), 600)} onClear={() => setTeacher("photo", "")} round />
      </Panel>

      <Panel title="Contact details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Phone" value={s.contact.phone} onChange={(v) => setContact("phone", v)} />
          <Field label="WhatsApp" value={s.contact.whatsapp} onChange={(v) => setContact("whatsapp", v)} />
        </div>
        <Field label="Email" value={s.contact.email} onChange={(v) => setContact("email", v)} />
        <Field label="Address" value={s.contact.address} onChange={(v) => setContact("address", v)} />
      </Panel>

      <Panel title="Payment details (shown at checkout)">
        <p className="-mt-1 mb-1 text-xs" style={{ color: "#94a3b8" }}>Students pay here directly, then you verify each payment under the Payments tab to unlock the note.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="UPI ID" value={pay.upiId || ""} onChange={(v) => setPay("upiId", v)} placeholder="academy@okhdfcbank" />
          <Field label="UPI display name" value={pay.upiName || ""} onChange={(v) => setPay("upiName", v)} placeholder="Academy name" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bank name" value={pay.bankName || ""} onChange={(v) => setPay("bankName", v)} placeholder="HDFC Bank" />
          <Field label="Account holder" value={pay.accountName || ""} onChange={(v) => setPay("accountName", v)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Account number" value={pay.accountNumber || ""} onChange={(v) => setPay("accountNumber", v)} />
          <Field label="IFSC" value={pay.ifsc || ""} onChange={(v) => setPay("ifsc", v)} />
        </div>
        <Field label="Instructions to students" textarea value={pay.instructions || ""} onChange={(v) => setPay("instructions", v)} />
        <ImagePicker label="Payment QR code" value={pay.qr || ""} onPick={(f) => upload(f, (d) => setPay("qr", d), 700)} onClear={() => setPay("qr", "")} />
      </Panel>

      <Panel title="Testimonials">
        <div className="space-y-3">
          {s.testimonials.map((t, i) => (
            <div key={t.id} className="rounded-xl p-3" style={{ border: `1px solid ${T.line}` }}>
              <div className="mb-2 flex justify-between">
                <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Testimonial {i + 1}</span>
                <button onClick={() => delTesti(i)}><Trash2 size={14} style={{ color: "#e11d48" }} /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field value={t.name} onChange={(v) => setTesti(i, "name", v)} placeholder="Name" />
                <Field value={t.role} onChange={(v) => setTesti(i, "role", v)} placeholder="Class / subject" />
              </div>
              <div className="mt-2"><Field textarea rows={2} value={t.text} onChange={(v) => setTesti(i, "text", v)} placeholder="Quote" /></div>
            </div>
          ))}
          <Btn kind="soft" size="sm" onClick={addTesti}><Plus size={14} /> Add testimonial</Btn>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex justify-end">
        <Btn kind="primary" size="lg" onClick={save}><Check size={18} /> Save all changes</Btn>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-bold" style={{ ...DISPLAY, color: T.ink }}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ImagePicker({ label, value, onPick, onClear, round }) {
  return (
    <div>
      <span className="block text-sm font-medium mb-1.5" style={{ color: T.ink }}>{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-20 place-items-center overflow-hidden" style={{ borderRadius: round ? "9999px" : 14, background: "rgba(67,56,202,0.06)", border: `1px solid ${T.line}` }}>
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={22} style={{ color: "#cbd5e1" }} />}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer rounded-xl px-3 py-2 text-center text-sm font-semibold" style={{ background: "rgba(67,56,202,0.08)", color: T.indigo }}>
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files[0])} />
          </label>
          {value && <button onClick={onClear} className="text-xs font-medium" style={{ color: "#e11d48" }}>Remove</button>}
        </div>
      </div>
    </div>
  );
}
