# Dianoose Stage — Complete Netlify Export
# Generated from the LIVE working Base44 version

## QUICKSTART

```bash
mkdir dianoose-stage && cd dianoose-stage
npm create vite@latest . -- --template react
npm install @base44/sdk @tanstack/react-query framer-motion lucide-react react-router-dom class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react
npx tailwindcss init -p
npx shadcn@latest init   # choose: TypeScript=No, style=Default, base color=Slate, CSS vars=Yes
npx shadcn@latest add button input label textarea badge toast
echo "VITE_BASE44_APP_ID=YOUR_APP_ID_HERE" > .env
```

> **Find your App ID:** In the Base44 editor, look at the URL bar — it's the value between `/apps/` and `/editor/`

---

## FILE: netlify.toml  (root of project)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## FILE: vite.config.js  (root of project)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## FILE: tailwind.config.js  (root of project)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      fontFamily: {
        heading: ['"-apple-system"', 'sans-serif'],
        body: ['"-apple-system"', 'sans-serif'],
        sans: ['"-apple-system"', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

---

## FILE: src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --accent: 122.4 39.4% 49.2%;
    --accent-foreground: 222.2 84% 4.9%;
    --background: 240 20% 4.9%;
    --border: 240 11.9% 42.7%;
    --card: 240 16% 19.6%;
    --card-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --foreground: 210 40% 98%;
    --input: 217.2 32.6% 17.5%;
    --muted: 240 11.9% 42.7%;
    --muted-foreground: 210 40% 65%;
    --popover: 240 20% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 243.5 100% 69.4%;
    --primary-foreground: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --ring: 243.4 100% 79.2%;
    --secondary: 240 10.3% 11.4%;
    --secondary-foreground: 0 0% 100%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: hsl(var(--secondary)); }
::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.6); }

input[type="time"]::-webkit-calendar-picker-indicator,
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="color"] { filter: invert(1); opacity: 0.6; cursor: pointer; }

select {
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2360607A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25em 1.25em;
  padding-right: 2.5rem;
}
```

---

## FILE: src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

---

## FILE: src/api/base44Client.js
### ⚠️ THIS IS THE ONLY AUTH SYSTEM — NO localStorage, NO custom tokens

```js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
});
```

---

## FILE: src/lib/utils.js

```js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs) { return twMerge(clsx(inputs)) }
```

---

## FILE: src/lib/query-client.js

```js
import { QueryClient } from '@tanstack/react-query';
export const queryClientInstance = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});
```

---

## FILE: src/App.jsx

```jsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import Home from './pages/Home'
import ResetPassword from './pages/ResetPassword'

function Layout() {
  return <div className="bg-background text-foreground min-h-screen"><Outlet /></div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}
```

---

## FILE: src/pages/ResetPassword.jsx

```jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, AlertCircle, Loader2, Check, Eye, EyeOff } from "lucide-react";

const GS = () => <style>{`
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .glass-panel{background:hsl(var(--card)/.8);backdrop-filter:blur(12px);border:1px solid hsl(var(--border)/.5)}
`}</style>;

export default function ResetPassword() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("token") || p.get("reset_token") || p.get("resetToken");
    if (!t) setError("No reset token found. Please request a new password reset email.");
    else setToken(t);
  }, []);

  const handleReset = async () => {
    setError("");
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      setSuccess(true);
      setTimeout(() => { window.location.href = "/"; }, 2500);
    } catch (e) {
      setError("This reset link has expired or is invalid. Please request a new one.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <GS />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" style={{animation:'floatA 12s ease-in-out infinite'}} />
      <motion.div initial={{opacity:0,y:30,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.8,ease:[0.16,1,0.3,1]}} className="w-full max-w-[420px] mx-4 relative z-10">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20"><Music className="w-7 h-7 text-primary-foreground" /></div>
            <h1 className="text-xl font-bold text-foreground">Dianoose Stage</h1>
            <p className="text-xs text-muted-foreground mt-1.5">Set your new password below.</p>
          </div>
          <AnimatePresence mode="wait">
            {error && <motion.div key="e" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-destructive">{error}</p>
              </div>
            </motion.div>}
          </AnimatePresence>
          {success ? (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-primary" /></div>
              <p className="text-base font-semibold text-foreground">Password updated!</p>
              <p className="text-xs text-muted-foreground">Redirecting…</p>
            </motion.div>
          ) : !token ? (
            <div className="text-center"><button onClick={() => window.location.href="/"} className="text-primary font-semibold hover:underline text-xs">← Back to Sign In</button></div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground ml-1">New Password</Label>
                <div className="relative mt-1.5">
                  <Input value={password} onChange={e=>setPassword(e.target.value)} type={show?"text":"password"} placeholder="••••••••" className="bg-background/50 border-border/50 text-foreground text-sm pr-10" onKeyDown={e=>e.key==="Enter"&&handleReset()} />
                  <button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground ml-1">Confirm Password</Label>
                <Input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" placeholder="••••••••" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" onKeyDown={e=>e.key==="Enter"&&handleReset()} />
              </div>
              <Button onClick={handleReset} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold relative overflow-hidden mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set New Password"}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">Remembered it? <button onClick={()=>window.location.href="/"} className="text-primary font-semibold hover:underline">Sign In</button></p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

---

## FILE: src/pages/Home.jsx
### ⚠️ COMPLETE FILE — ALL AUTH USES base44.auth.* ONLY — NO localStorage, NO custom sessions

```jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Music, Home as HomeIcon, List, Star, Guitar, Users, Calendar,
  Bell, Shield, Settings, LogOut, Menu, X, Plus, Search,
  RefreshCw, Save, Trash2, Send, Check, ArrowRight,
  AlertCircle, Loader2, Zap, Flame, Mail
} from "lucide-react";
import ServicesSection from "@/components/app/ServicesSection";
import MyLibrarySection from "@/components/app/MyLibrarySection";
import MusicianSection from "@/components/app/MusicianSection";
import AdminSection from "@/components/app/AdminSection";
import SettingsSection from "@/components/app/SettingsSection";
import NotificationsSection from "@/components/app/NotificationsSection";
import MyStageSection from "@/components/app/MyStageSection";

const SongEntity = base44.entities.Song;
const ServiceEntity = base44.entities.Service;
const ChurchMemberEntity = base44.entities.ChurchMember;
const ChurchEntity = base44.entities.Church;
const MyLibrarySongEntity = base44.entities.MyLibrarySong;
const NotificationEntity = base44.entities.Notification;

// ─── Global state (module-level, persists across re-renders) ──────────────────
let globalUser = null;
let globalChurch = null;

// ─── Shared CSS / animations ──────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(3deg)}}
    @keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-15px) rotate(-2deg)}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .glass-panel{background:hsl(var(--card)/.8);backdrop-filter:blur(12px);border:1px solid hsl(var(--border)/.5)}
  `}</style>
);

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
const AnimatedElement = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) { setVisible(true); return; }
    const fb = setTimeout(() => setVisible(true), 800 + delay);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { clearTimeout(fb); setTimeout(() => setVisible(true), delay); obs.unobserve(el); } }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fb); };
  }, [delay]);
  return <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>{children}</div>;
};

// ─── Email Verification Screen ────────────────────────────────────────────────
// Uses: base44.auth.verifyOtp  |  base44.auth.resendOtp
function VerifyEmailScreen({ email, password, onVerified, onBack }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async () => {
    setError(""); setLoading(true);
    try {
      if (!code.trim()) throw new Error("Please enter the verification code.");
      // Step 1: verify the OTP code
      await base44.auth.verifyOtp({ email, otpCode: code.trim() });
      // Step 2: log in to establish the session
      const { user } = await base44.auth.loginViaEmailPassword(email, password);
      if (!user) throw new Error("Verification succeeded but login failed. Please use Sign In.");
      onVerified(user);
    } catch (e) {
      const m = (e?.message || "").toLowerCase();
      if (m.includes("invalid") || m.includes("incorrect") || m.includes("wrong") || m.includes("mismatch")) {
        setError("That code is incorrect. Double-check your email and try again.");
      } else if (m.includes("expired")) {
        setError("This code has expired. Click 'Resend Code' to get a new one.");
      } else if (m.includes("already") || m.includes("verified")) {
        setError("Email already verified. Please use the Sign In tab.");
      } else {
        setError(e.message || "Verification failed. Please try again.");
      }
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(""); setSuccess(""); setResending(true);
    try {
      await base44.auth.resendOtp(email);
      setSuccess("New code sent! Check your inbox.");
      setCode(""); setCooldown(60);
    } catch (e) {
      setError("Could not resend the code. Please wait a moment and try again.");
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <GlobalStyles />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" style={{animation:"floatA 12s ease-in-out infinite"}} />
      <motion.div initial={{opacity:0,y:30,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.6,ease:[0.16,1,0.3,1]}} className="w-full max-w-[420px] mx-4 relative z-10">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20"><Mail className="w-7 h-7 text-primary-foreground" /></div>
            <h1 className="text-xl font-bold text-foreground">Check Your Email</h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">We sent a verification code to<br /><span className="text-foreground font-semibold">{email}</span></p>
          </div>
          <AnimatePresence mode="wait">
            {error && <motion.div key="e" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-destructive shrink-0" /><p className="text-xs font-medium text-destructive">{error}</p></div>
            </motion.div>}
            {success && <motion.div key="s" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5"><Check className="w-4 h-4 text-primary shrink-0" /><p className="text-xs font-medium text-primary">{success}</p></div>
            </motion.div>}
          </AnimatePresence>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground ml-1">Verification Code</Label>
              <Input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter code from your email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm font-mono tracking-widest text-center" onKeyDown={e=>e.key==="Enter"&&handleVerify()} autoFocus />
            </div>
            <Button onClick={handleVerify} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 relative overflow-hidden">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-4 h-4 mr-2" />Verify &amp; Continue</>}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
            </Button>
            <div className="flex items-center justify-between pt-1">
              <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
              <button onClick={handleResend} disabled={resending||cooldown>0} className="text-xs text-primary font-semibold hover:underline disabled:opacity-50">
                {resending?"Sending...":cooldown>0?`Resend in ${cooldown}s`:"Resend Code"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Setup Wizard ─────────────────────────────────────────────────────────────
// Uses: base44.auth.register  |  base44.auth.loginViaEmailPassword
function SetupWizard({ onDone, onBack }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);
  const [data, setData] = useState({
    churchName:"",city:"",state:"",website:"",
    serviceDay:"Sunday",serviceTime:"10:00",serviceName:"Morning Worship",timezone:"Eastern (ET)",
    accentColor:"#6C63FF",appIcon:"music",
    firstName:"",lastName:"",email:"",instrument:"",password:"",confirmPassword:""
  });
  const set = (k,v) => setData(d=>({...d,[k]:v}));

  const appIcons=[{id:"music",icon:Music},{id:"home",icon:HomeIcon},{id:"guitar",icon:Guitar},{id:"star",icon:Star},{id:"shield",icon:Shield},{id:"users",icon:Users}];
  const steps=[
    {title:"Welcome to Dianoose Stage",icon:Music,subtitle:"Set up your church workspace in 2 minutes."},
    {title:"Service Schedule",icon:Calendar,subtitle:"When is your main weekly service?"},
    {title:"Customize Your App",icon:Zap,subtitle:"Pick your church's accent color and icon."},
    {title:"Create Admin Account",icon:Shield,subtitle:"This is your main administrator account."}
  ];

  const completeWorkspaceSetup = async (user) => {
    await base44.auth.updateMe({ full_name: `${data.firstName.trim()} ${data.lastName.trim()}` });
    const teamCode = [Math.random().toString(36).substring(2,5),Math.random().toString(36).substring(2,5)].join("").toUpperCase().replace(/[^A-Z0-9]/g,"X").substring(0,8);
    const church = await ChurchEntity.create({
      name:data.churchName.trim(),city:data.city.trim(),state:data.state.trim(),website:data.website.trim(),
      service_day:data.serviceDay,service_time:data.serviceTime,service_name:data.serviceName.trim(),
      timezone:data.timezone,accent_color:data.accentColor,app_icon:data.appIcon,
      team_code:teamCode,admin_user_id:user.id
    });
    const member = await ChurchMemberEntity.create({
      first_name:data.firstName.trim(),last_name:data.lastName.trim(),
      email:data.email.trim(),instrument:data.instrument.trim(),
      role:"Admin",church_id:church.id,is_active:true,user_id:user.id
    });
    globalUser={...user,...member,full_name:`${data.firstName.trim()} ${data.lastName.trim()}`};
    globalChurch=church;
    onDone();
  };

  const handleFinish = async () => {
    setError(""); setLoading(true);
    try {
      if (!data.firstName.trim()||!data.lastName.trim()) throw new Error("Please enter your first and last name.");
      if (!data.email.trim()) throw new Error("Please enter your email address.");
      if (!data.password) throw new Error("Please enter a password.");
      if (data.password.length<6) throw new Error("Password must be at least 6 characters.");
      if (data.password!==data.confirmPassword) throw new Error("Passwords don't match.");
      if (!data.churchName.trim()) throw new Error("Church name is required.");

      // Register the new account
      await base44.auth.register({ email: data.email.trim(), password: data.password });

      // Try immediate login (works when email verification is not required)
      try {
        const { user } = await base44.auth.loginViaEmailPassword(data.email.trim(), data.password);
        if (user) { await completeWorkspaceSetup(user); return; }
      } catch (loginErr) {
        const m = (loginErr?.message||"").toLowerCase();
        if (m.includes("verify")||m.includes("confirm")||m.includes("email")) {
          // Email verification required — show verify screen
          setPendingVerification({ email: data.email.trim(), password: data.password });
          return;
        }
        throw loginErr;
      }
    } catch (e) {
      const m=(e?.message||"").toLowerCase();
      if (m.includes("already")||m.includes("exists")||m.includes("registered")||m.includes("duplicate")) {
        setError("An account with this email already exists. Please go back and sign in instead.");
      } else {
        setError(e.message||"Setup failed. Please check your connection and try again.");
      }
    } finally { setLoading(false); }
  };

  const CurrentIcon = steps[step].icon;

  if (pendingVerification) return (
    <VerifyEmailScreen
      email={pendingVerification.email}
      password={pendingVerification.password}
      onVerified={completeWorkspaceSetup}
      onBack={()=>setPendingVerification(null)}
    />
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <GlobalStyles />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" style={{animation:"floatA 12s ease-in-out infinite"}} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" style={{animation:"floatB 10s ease-in-out infinite 2s"}} />
      <motion.div initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.5}} className="w-full max-w-lg mx-4 relative z-10">
        <div className="glass-panel rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex h-1.5 bg-background/50">
            {steps.map((_,i)=><div key={i} className={`flex-1 transition-all duration-500 ${i<=step?"bg-primary":"bg-transparent"}`} />)}
          </div>
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div key={step} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <CurrentIcon className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">{steps[step].title}</h2>
              <p className="text-xs text-muted-foreground mt-1.5">{steps[step].subtitle}</p>
            </div>
            <AnimatePresence mode="wait">
              {error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-5">
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-destructive shrink-0" /><p className="text-xs font-medium text-destructive">{error}</p></div>
              </motion.div>}
            </AnimatePresence>
            <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.3}}>
              {step===0&&(
                <div className="space-y-4">
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Church Name *</Label><Input value={data.churchName} onChange={e=>set("churchName",e.target.value)} placeholder="e.g. Grace Community Church" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">City</Label><Input value={data.city} onChange={e=>set("city",e.target.value)} placeholder="Austin" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">State</Label><Input value={data.state} onChange={e=>set("state",e.target.value)} placeholder="TX" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  </div>
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Website (optional)</Label><Input value={data.website} onChange={e=>set("website",e.target.value)} placeholder="https://yourchurch.com" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                </div>
              )}
              {step===1&&(
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground ml-1">Service Day</Label>
                    <select value={data.serviceDay} onChange={e=>set("serviceDay",e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50">
                      {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d=><option key={d} value={d} className="bg-card">{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">Start Time</Label><Input type="time" value={data.serviceTime} onChange={e=>set("serviceTime",e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">Service Name</Label><Input value={data.serviceName} onChange={e=>set("serviceName",e.target.value)} placeholder="Morning Worship" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground ml-1">Timezone</Label>
                    <select value={data.timezone} onChange={e=>set("timezone",e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50">
                      {["Eastern (ET)","Central (CT)","Mountain (MT)","Pacific (PT)","UTC"].map(t=><option key={t} value={t} className="bg-card">{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {step===2&&(
                <div className="space-y-6">
                  <div className="bg-background/40 p-5 rounded-xl border border-border/30">
                    <Label className="text-xs font-bold text-foreground mb-3 block">Accent Color</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-border shadow-inner cursor-pointer hover:scale-105 transition-transform">
                        <input type="color" value={data.accentColor} onChange={e=>set("accentColor",e.target.value)} className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer" />
                      </div>
                      <div className="flex-1"><p className="text-sm font-medium text-foreground">Brand Color</p><p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase">{data.accentColor}</p></div>
                    </div>
                  </div>
                  <div className="bg-background/40 p-5 rounded-xl border border-border/30">
                    <Label className="text-xs font-bold text-foreground mb-3 block">App Icon</Label>
                    <div className="flex flex-wrap gap-3">
                      {appIcons.map(item=>(
                        <button key={item.id} onClick={()=>set("appIcon",item.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${data.appIcon===item.id?"bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110":"bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:scale-105"}`}>
                          <item.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {step===3&&(
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">First Name *</Label><Input value={data.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="Jordan" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">Last Name *</Label><Input value={data.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Cole" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  </div>
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Email Address *</Label><Input value={data.email} onChange={e=>set("email",e.target.value)} placeholder="you@yourchurch.com" type="email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Instrument / Role</Label><Input value={data.instrument} onChange={e=>set("instrument",e.target.value)} placeholder="e.g. Worship Leader, Lead Guitar" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">Password *</Label><Input value={data.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" type="password" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                    <div><Label className="text-xs font-medium text-muted-foreground ml-1">Confirm *</Label><Input value={data.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} placeholder="••••••••" type="password" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  </div>
                </div>
              )}
            </motion.div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={()=>step===0?onBack():setStep(s=>s-1)} className="border-border/50 bg-background/50 text-foreground hover:bg-secondary h-11 px-6 rounded-xl">
                {step===0?"Cancel":"Back"}
              </Button>
              {step<3?(
                <Button onClick={()=>{setError("");setStep(s=>s+1);}} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20">Continue →</Button>
              ):(
                <Button onClick={handleFinish} disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold relative overflow-hidden shadow-lg shadow-primary/20">
                  {loading?<Loader2 className="w-5 h-5 animate-spin mx-auto" />:"Launch Workspace"}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
// Uses: base44.auth.loginViaEmailPassword  |  base44.auth.resetPasswordRequest
function LoginScreen({ onAuth }) {
  const [tab, setTab] = useState("new");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);

  const handleSignIn = async () => {
    setError(""); setLoading(true);
    try {
      const { user } = await base44.auth.loginViaEmailPassword(signInEmail.trim(), signInPassword);
      if (!user) throw new Error("bad_credentials");
      const members = await ChurchMemberEntity.filter({ user_id: user.id });
      if (members.length > 0) {
        const churches = await ChurchEntity.filter({ id: members[0].church_id });
        globalUser={...user,...members[0]};
        globalChurch=churches[0]||null;
        onAuth(); return;
      }
      const adminChurches = await ChurchEntity.filter({ admin_user_id: user.id });
      if (adminChurches.length > 0) {
        const church = adminChurches[0];
        const nameParts = (user.full_name||"").trim().split(" ");
        const repairedMember = await ChurchMemberEntity.create({
          first_name:nameParts[0]||"Admin",last_name:nameParts.slice(1).join(" ")||"",
          email:user.email,role:"Admin",church_id:church.id,user_id:user.id,is_active:true
        });
        globalUser={...user,...repairedMember};
        globalChurch=church;
        onAuth(); return;
      }
      throw new Error("no_church");
    } catch (e) {
      const m=(e?.message||"").toLowerCase();
      if (m==="bad_credentials"||m.includes("invalid")||m.includes("credentials")||m.includes("incorrect")||m.includes("401")) {
        setError("Incorrect email or password. Please try again.");
      } else if (m==="no_church") {
        setError("Your account isn't linked to a church yet. Use 'Join My Church' or create a new workspace.");
      } else if (m.includes("verify")||m.includes("confirm")||m.includes("email")) {
        setPendingVerification({ email: signInEmail.trim(), password: signInPassword });
      } else {
        setError("Sign in failed. Please check your connection and try again.");
      }
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    setError(""); setLoading(true);
    try {
      if (!joinCode.trim()) throw new Error("Please enter your team code.");
      if (!joinEmail.trim()) throw new Error("Please enter your email address.");
      if (!joinPassword.trim()) throw new Error("Please enter your password.");
      const churches = await ChurchEntity.filter({ team_code: joinCode.trim().toUpperCase() });
      if (churches.length===0) throw new Error("That team code wasn't found. Double-check with your admin.");
      const church = churches[0];
      const { user } = await base44.auth.loginViaEmailPassword(joinEmail.trim(), joinPassword);
      if (!user) throw new Error("bad_credentials");
      const existing = await ChurchMemberEntity.filter({ church_id: church.id, user_id: user.id });
      if (existing.length>0) {
        globalUser={...user,...existing[0]}; globalChurch=church; onAuth(); return;
      }
      const nameParts=(user.full_name||"").trim().split(" ");
      const newMember = await ChurchMemberEntity.create({
        first_name:nameParts[0]||"",last_name:nameParts.slice(1).join(" ")||"",
        email:user.email,role:"Musician",church_id:church.id,user_id:user.id,is_active:true
      });
      globalUser={...user,...newMember}; globalChurch=church; onAuth();
    } catch (e) {
      const m=(e?.message||"").toLowerCase();
      if (m==="bad_credentials"||m.includes("invalid")||m.includes("credentials")||m.includes("incorrect")||m.includes("401")) {
        setError("Incorrect email or password. Please try again.");
      } else if (m.includes("team code")||m.includes("wasn't found")) {
        setError(e.message);
      } else if (m.includes("verify")||m.includes("confirm")) {
        setError("Please verify your email before joining. Check your inbox.");
      } else if (m.includes("please enter")) {
        setError(e.message);
      } else {
        setError("Could not join the church workspace. Please check your details and try again.");
      }
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (!resetEmail.trim()) throw new Error("Please enter your email address.");
      await base44.auth.resetPasswordRequest(resetEmail.trim());
      setSuccess("Password reset email sent! Check your inbox (and spam folder).");
    } catch (e) {
      setError(e?.message||"Failed to send reset email. Please try again.");
    } finally { setLoading(false); }
  };

  const handleVerifiedSignIn = async (user) => {
    const members = await ChurchMemberEntity.filter({ user_id: user.id });
    if (members.length>0) {
      const churches = await ChurchEntity.filter({ id: members[0].church_id });
      globalUser={...user,...members[0]}; globalChurch=churches[0]||null; onAuth();
    } else {
      setPendingVerification(null); setTab("new");
      setError("Email verified! Now set up or join your church workspace.");
    }
  };

  if (pendingVerification) return <VerifyEmailScreen email={pendingVerification.email} password={pendingVerification.password} onVerified={handleVerifiedSignIn} onBack={()=>setPendingVerification(null)} />;
  if (showSetup) return <SetupWizard onDone={onAuth} onBack={()=>setShowSetup(false)} />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <GlobalStyles />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" style={{animation:"floatA 12s ease-in-out infinite"}} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" style={{animation:"floatB 10s ease-in-out infinite 2s"}} />
      <motion.div initial={{opacity:0,y:30,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.8,ease:[0.16,1,0.3,1]}} className="w-full max-w-[420px] mx-4 relative z-10">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20"><Music className="w-7 h-7 text-primary-foreground" /></div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Dianoose Stage</h1>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">The Modern Command Center for Worship Teams.</p>
          </div>
          <div className="flex bg-background/60 rounded-lg p-1 mb-6 border border-border/40 backdrop-blur-md">
            {[{id:"signin",label:"Sign In"},{id:"join",label:"Join My Church"},{id:"new",label:"New Church"}].map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setError("");setSuccess("");setShowForgot(false);}} className={`flex-1 text-[11px] uppercase tracking-wider py-2.5 rounded-md font-bold transition-all duration-300 ${tab===t.id?"bg-primary text-primary-foreground shadow-md":"text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>{t.label}</button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {error&&<motion.div key="e" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5"><AlertCircle className="w-4 h-4 text-destructive shrink-0" /><p className="text-xs font-medium text-destructive">{error}</p></div>
            </motion.div>}
            {success&&<motion.div key="s" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mb-4">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5"><Check className="w-4 h-4 text-primary shrink-0" /><p className="text-xs font-medium text-primary">{success}</p></div>
            </motion.div>}
          </AnimatePresence>

          {tab==="signin"&&!showForgot&&(
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="space-y-4">
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Email Address</Label><Input value={signInEmail} onChange={e=>setSignInEmail(e.target.value)} placeholder="you@yourchurch.com" type="email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-medium text-muted-foreground ml-1">Password</Label>
                  <button onClick={()=>{setShowForgot(true);setResetEmail(signInEmail);setError("");setSuccess("");}} className="text-[11px] text-primary hover:underline font-semibold">Forgot Password?</button>
                </div>
                <Input value={signInPassword} onChange={e=>setSignInPassword(e.target.value)} placeholder="••••••••" type="password" className="bg-background/50 border-border/50 text-foreground text-sm" onKeyDown={e=>e.key==="Enter"&&handleSignIn()} />
              </div>
              <Button onClick={handleSignIn} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 relative overflow-hidden mt-2">
                {loading?<Loader2 className="w-5 h-5 animate-spin" />:"Sign In"}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
              </Button>
            </motion.div>
          )}

          {tab==="signin"&&showForgot&&(
            <motion.div initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Reset your password</p>
                <p className="text-xs text-muted-foreground mb-4">Enter your email and we'll send you a reset link.</p>
                <Label className="text-xs font-medium text-muted-foreground ml-1">Email Address</Label>
                <Input value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="you@yourchurch.com" type="email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" onKeyDown={e=>e.key==="Enter"&&handleForgotPassword()} />
              </div>
              <Button onClick={handleForgotPassword} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 relative overflow-hidden">
                {loading?<Loader2 className="w-5 h-5 animate-spin" />:"Send Reset Email"}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
              </Button>
              <button onClick={()=>{setShowForgot(false);setError("");setSuccess("");}} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">← Back to Sign In</button>
            </motion.div>
          )}

          {tab==="join"&&(
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="space-y-4">
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Team Join Code</Label><Input value={joinCode} onChange={e=>setJoinCode(e.target.value)} placeholder="Paste code from your admin" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm font-mono uppercase" /></div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Your Email</Label><Input value={joinEmail} onChange={e=>setJoinEmail(e.target.value)} placeholder="you@yourchurch.com" type="email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Password</Label><Input value={joinPassword} onChange={e=>setJoinPassword(e.target.value)} placeholder="Your password" type="password" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <Button onClick={handleJoin} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 mt-2">
                {loading?<Loader2 className="w-5 h-5 animate-spin" />:"Join My Church"}
              </Button>
            </motion.div>
          )}

          {tab==="new"&&(
            <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="space-y-5">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5"><Flame className="w-4 h-4 text-accent" /><p className="text-sm font-bold text-foreground">Starting fresh?</p></div>
                <p className="text-xs text-muted-foreground leading-relaxed">Set up your church workspace in 2 minutes. You'll become the admin and can add your whole team after.</p>
              </div>
              <Button onClick={()=>setShowSetup(true)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 relative overflow-hidden flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 opacity-70" />Set Up My Church<ArrowRight className="w-4 h-4 opacity-70" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">Already set up? <button onClick={()=>setTab("signin")} className="text-primary font-semibold hover:underline">Sign In</button> or <button onClick={()=>setTab("join")} className="text-primary font-semibold hover:underline">Join your church</button></p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ church }) {
  const [time, setTime] = useState({days:0,hours:0,mins:0,secs:0});
  const [nextDate, setNextDate] = useState("");
  useEffect(() => {
    const getDayNum=(d)=>["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(d);
    const tick=()=>{
      const now=new Date();
      const targetDay=getDayNum(church?.service_day||"Sunday");
      const [h,m]=(church?.service_time||"10:00").split(":").map(Number);
      let next=new Date(now);
      const diff=(targetDay-now.getDay()+7)%7;
      next.setDate(now.getDate()+(diff===0&&(now.getHours()>h||(now.getHours()===h&&now.getMinutes()>=m))?7:diff));
      next.setHours(h,m,0,0);
      setNextDate(next.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}));
      const delta=Math.max(0,Math.floor((next-now)/1000));
      setTime({days:Math.floor(delta/86400),hours:Math.floor((delta%86400)/3600),mins:Math.floor((delta%3600)/60),secs:delta%60});
    };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[church]);
  return (
    <div className="glass-panel bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-1.5 relative z-10"><HomeIcon className="w-4 h-4 text-primary" /><span className="text-xs font-bold text-primary uppercase tracking-widest">Next Service</span></div>
      <p className="text-lg text-foreground font-semibold mb-1 relative z-10">{church?.service_name||"Morning Worship"}</p>
      <p className="text-xs text-muted-foreground mb-5 relative z-10 font-medium">{nextDate}</p>
      <div className="flex items-end gap-3 relative z-10">
        {[{val:time.days,label:"Days"},{val:time.hours,label:"Hours"},{val:time.mins,label:"Mins"},{val:time.secs,label:"Secs"}].map((item,i)=>(
          <div key={i} className="flex items-end gap-3">
            <div className="text-center">
              <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl w-14 h-16 flex items-center justify-center shadow-inner">
                <span className="text-2xl font-bold text-foreground tabular-nums">{String(item.val).padStart(2,"0")}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">{item.label}</div>
            </div>
            {i<3&&<span className="text-primary/50 font-bold text-xl pb-6">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Song Modal ───────────────────────────────────────────────────────────────
function SongModal({ song, onClose, onSave, churchId }) {
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({
    title:song?.title||"",artist:song?.artist||"",key:song?.key||"",
    bpm:song?.bpm||"",time_signature:song?.time_signature||"4/4",capo:song?.capo||0,
    youtube_url:song?.youtube_url||"",chart_content:song?.chart_content||"",
    guitar_patch_notes:song?.guitar_patch_notes||"",keys_patch_notes:song?.keys_patch_notes||"",
    production_notes:song?.production_notes||""
  });
  const [saving, setSaving] = useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload={...form,church_id:churchId};
      if (song?.id) await SongEntity.update(song.id,payload);
      else await SongEntity.create(payload);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{opacity:0,scale:0.95,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:10}} transition={{type:"spring",duration:0.5,bounce:0.3}} className="bg-card border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
            <h3 className="font-bold text-foreground text-lg">{song?.id?"Edit Song":"New Song"}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1 px-6 pt-3 pb-2 bg-secondary/10 border-b border-border/50 overflow-x-auto">
            {["details","chart","patches","prod"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${tab===t?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {t==="chart"?"📄 Chart":t==="patches"?"🎭 Patches":t==="prod"?"🎬 Prod":"Details"}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto max-h-[60vh] p-6">
            {tab==="details"&&(
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Title</Label><Input value={form.title} onChange={e=>set("title",e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Artist</Label><Input value={form.artist} onChange={e=>set("artist",e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Key</Label><Input value={form.key} onChange={e=>set("key",e.target.value)} placeholder="G, A, Bb..." className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">BPM</Label><Input type="number" value={form.bpm} onChange={e=>set("bpm",e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Time Sig</Label><Input value={form.time_signature} onChange={e=>set("time_signature",e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                  <div><Label className="text-xs font-medium text-muted-foreground ml-1">Capo</Label><Input type="number" value={form.capo} onChange={e=>set("capo",e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                </div>
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">YouTube / Reference</Label><Input value={form.youtube_url} onChange={e=>set("youtube_url",e.target.value)} placeholder="https://youtube.com/..." type="url" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              </div>
            )}
            {tab==="chart"&&(
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground bg-secondary/30 rounded-lg p-3 border border-border/50 font-medium"><b className="text-foreground">[Verse 1]</b> = section header &nbsp;|&nbsp; <b className="text-foreground">G Em C D</b> = chord line &nbsp;|&nbsp; lyrics on next line</p>
                <Textarea value={form.chart_content} onChange={e=>set("chart_content",e.target.value)} placeholder="Paste or type chart here..." rows={12} className="bg-background/50 border-border/50 text-foreground text-sm font-mono leading-relaxed resize-none" />
              </div>
            )}
            {tab==="patches"&&(
              <div className="space-y-5">
                <div><Label className="text-xs font-medium text-muted-foreground ml-1 mb-2 block">Guitar Patch Notes</Label><Textarea value={form.guitar_patch_notes} onChange={e=>set("guitar_patch_notes",e.target.value)} placeholder="Guitar patches, effects chain..." rows={5} className="bg-background/50 border-border/50 text-foreground text-sm resize-none" /></div>
                <div><Label className="text-xs font-medium text-muted-foreground ml-1 mb-2 block">Keys / Piano</Label><Textarea value={form.keys_patch_notes} onChange={e=>set("keys_patch_notes",e.target.value)} placeholder="Keys patches, sounds..." rows={5} className="bg-background/50 border-border/50 text-foreground text-sm resize-none" /></div>
              </div>
            )}
            {tab==="prod"&&<div><Label className="text-xs font-medium text-muted-foreground ml-1 mb-2 block">Production Notes</Label><Textarea value={form.production_notes} onChange={e=>set("production_notes",e.target.value)} placeholder="Lighting cues, video notes, sound notes..." rows={12} className="bg-background/50 border-border/50 text-foreground text-sm resize-none" /></div>}
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
            <Button variant="outline" onClick={onClose} className="border-border/50 text-foreground hover:bg-background h-10 px-6 rounded-lg">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-semibold shadow-lg shadow-primary/20">
              {saving?<Loader2 className="w-4 h-4 animate-spin mx-auto" />:<><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [songs, setSongs] = useState([]);
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myLibrary, setMyLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSongModal, setShowSongModal] = useState(false);
  const [editSong, setEditSong] = useState(null);
  const [songSearch, setSongSearch] = useState("");
  const [songKeyFilter, setSongKeyFilter] = useState("All");

  const church=globalChurch;
  const user=globalUser;
  const isAdmin=user?.role==="Admin"||user?.role==="Worship Leader";

  const loadData = useCallback(async () => {
    if (!church?.id) return;
    setLoading(true);
    try {
      const [s,svc,m,n,ml]=await Promise.all([
        SongEntity.filter({church_id:church.id}),
        ServiceEntity.filter({church_id:church.id}),
        ChurchMemberEntity.filter({church_id:church.id}),
        NotificationEntity.filter({user_id:user?.user_id||user?.id}),
        MyLibrarySongEntity.filter({user_id:user?.user_id||user?.id})
      ]);
      setSongs(s);setServices(svc);setMembers(m);setNotifications(n);setMyLibrary(ml);
    } finally { setLoading(false); }
  },[church?.id]);

  useEffect(()=>{loadData();},[loadData]);

  const navItems=[
    {id:"dashboard",icon:HomeIcon,label:"Dashboard",group:"Main"},
    {id:"services",icon:List,label:"Services",group:"Main"},
    {id:"songs",icon:Music,label:"Song Library",group:"Main"},
    {id:"mylibrary",icon:Star,label:"My Library",badge:myLibrary.length,group:"Personal"},
    {id:"mystage",icon:Guitar,label:"My Stage",group:"Personal"},
    {id:"musicians",icon:Users,label:"Musicians",group:"Team"},
    {id:"notifications",icon:Bell,label:"Notifications",badge:notifications.filter(n=>!n.is_read).length,group:"Other"},
    {id:"admin",icon:Shield,label:"Admin Panel",group:"Other"},
    {id:"settings",icon:Settings,label:"Settings",group:"Other"}
  ];
  const groups=[...new Set(navItems.map(n=>n.group))];
  const avatarText=`${user?.first_name?.[0]||""}${user?.last_name?.[0]||""}`.toUpperCase()||"?";

  const Sidebar=({mobile=false})=>(
    <div className={`flex flex-col h-full ${mobile?"w-full":"w-64"} bg-card border-r border-border/30 shadow-2xl z-20 relative`}>
      <div className="p-5 border-b border-border/30 flex items-center gap-4 bg-background/20">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0"><Music className="w-5 h-5 text-primary-foreground" /></div>
        <div className="overflow-hidden"><h2 className="text-sm font-bold text-foreground truncate">Dianoose Stage</h2><span className="text-[11px] text-muted-foreground truncate block font-medium">{church?.name||"Your Church"}</span></div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {groups.map((group,gi)=>(
          <div key={group} className={gi>0?"mt-6":""}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 mb-2 font-bold">{group}</p>
            {navItems.filter(n=>n.group===group).map(item=>(
              <button key={item.id} onClick={()=>{setActiveSection(item.id);if(mobile)setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${activeSection===item.id?"bg-primary text-primary-foreground shadow-md shadow-primary/10":"text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-300 ${activeSection===item.id?"text-primary-foreground":"text-muted-foreground group-hover:text-primary"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge>0&&<span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${activeSection===item.id?"bg-primary-foreground text-primary":"bg-primary text-primary-foreground"}`}>{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border/30 bg-background/20 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0">{avatarText}</div>
        <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-foreground truncate">{user?.first_name} {user?.last_name}</p><p className="text-[10px] text-muted-foreground truncate">{user?.role||"Member"}</p></div>
        <button onClick={onLogout} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const renderContent=()=>{
    if (activeSection==="dashboard") return (
      <div className="space-y-8 pb-12">
        <AnimatedElement>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1">
                {(()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";})()}{user?.first_name?`, ${user.first_name}!`:"!"}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Here's everything you need for this week.</p>
            </div>
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100}><CountdownTimer church={church} /></AnimatedElement>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {label:"Total Songs",value:songs.length,icon:Music,color:"text-primary",bg:"bg-primary/10"},
            {label:"Services",value:services.length,icon:List,color:"text-accent",bg:"bg-accent/10"},
            {label:"Team Members",value:members.length,icon:Users,color:"text-primary",bg:"bg-primary/10"},
            {label:"My Library",value:myLibrary.length,icon:Star,color:"text-accent",bg:"bg-accent/10"}
          ].map((stat,i)=>(
            <AnimatedElement key={i} delay={i*80+200}>
              <div className="glass-panel rounded-2xl p-5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    );
    if (activeSection==="songs") return (
      <div className="space-y-6 pb-12">
        <AnimatedElement>
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div><h1 className="text-2xl font-bold text-foreground tracking-tight">Song Library</h1><p className="text-sm text-muted-foreground font-medium">{songs.length} songs available</p></div>
            <Button onClick={()=>{setEditSong(null);setShowSongModal(true);}} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"><Plus className="w-4 h-4 mr-2" />Add Song</Button>
          </div>
        </AnimatedElement>
        <AnimatedElement delay={100}>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary/50 transition-all">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input value={songSearch} onChange={e=>setSongSearch(e.target.value)} placeholder="Search songs, artists, keys..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-medium" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {["All","G","A","B","C","D","E","F"].map(k=>(
                <button key={k} onClick={()=>setSongKeyFilter(k)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${songKeyFilter===k?"bg-primary text-primary-foreground shadow-md":"bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"}`}>{k}</button>
              ))}
            </div>
          </div>
        </AnimatedElement>
        <div className="grid gap-3">
          {songs.filter(s=>(!songSearch||s.title?.toLowerCase().includes(songSearch.toLowerCase()))&&(songKeyFilter==="All"||s.key===songKeyFilter)).map((song,i)=>(
            <AnimatedElement key={song.id} delay={i*50+200}>
              <div onClick={()=>{setEditSong(song);setShowSongModal(true);}} className="glass-panel rounded-xl px-5 py-4 hover:border-primary/50 transition-all duration-300 cursor-pointer group flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"><Music className="w-5 h-5 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">{song.title}</p><p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{song.artist}</p></div>
                <div className="flex items-center gap-4 shrink-0">
                  {song.key&&<span className="text-xs bg-primary/10 border border-primary/20 text-primary rounded-lg px-3 py-1 font-bold">{song.key}</span>}
                  {song.bpm&&<span className="text-xs text-muted-foreground font-medium hidden sm:block">{song.bpm} BPM</span>}
                  <button onClick={async(e)=>{e.stopPropagation();await SongEntity.delete(song.id);loadData();}} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    );
    if (activeSection==="services") return <ServicesSection church={church} songs={songs} services={services} onRefresh={loadData} />;
    if (activeSection==="mylibrary") return <MyLibrarySection songs={songs} myLibrary={myLibrary} user={user} church={church} onRefresh={loadData} />;
    if (activeSection==="mystage") return <MyStageSection user={user} church={church} services={services} songs={songs} members={members} onRefresh={loadData} />;
    if (activeSection==="musicians") return <MusicianSection members={members} isAdmin={isAdmin} onRefresh={loadData} />;
    if (activeSection==="notifications") return <NotificationsSection notifications={notifications} onRefresh={loadData} />;
    if (activeSection==="admin") return <AdminSection church={church} members={members} onRefresh={loadData} onChurchUpdate={(u)=>{globalChurch=u;}} />;
    if (activeSection==="settings") return <SettingsSection church={church} user={user} onChurchUpdate={(u)=>{globalChurch=u;}} onUserUpdate={(u)=>{globalUser=u;}} />;
    return null;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <GlobalStyles />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="hidden sm:flex shrink-0"><Sidebar /></div>
      <AnimatePresence>
        {sidebarOpen&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 sm:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={()=>setSidebarOpen(false)} />
            <motion.div initial={{x:-280}} animate={{x:0}} exit={{x:-280}} transition={{type:"spring",damping:25,stiffness:200}} className="absolute inset-y-0 left-0 w-72 z-50">
              <Sidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-border/30 bg-background/50 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <button onClick={()=>setSidebarOpen(true)} className="sm:hidden w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={()=>setActiveSection("notifications")} className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
              <Bell className="w-4 h-4" />
              {notifications.filter(n=>!n.is_read).length>0&&<span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse" />}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {loading?<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>:renderContent()}
        </div>
      </div>
      {showSongModal&&<SongModal song={editSong} onClose={()=>setShowSongModal(false)} onSave={()=>{setShowSongModal(false);loadData();}} churchId={church?.id} />}
    </div>
  );
}

// ─── Root export — session check uses base44.auth.isAuthenticated + base44.auth.me ───
export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(()=>{
    const checkAuth=async()=>{
      try {
        // base44.auth.isAuthenticated() checks the SDK token — works on any host
        const isLoggedIn=await base44.auth.isAuthenticated();
        if (!isLoggedIn) { setChecking(false); return; }
        const user=await base44.auth.me();
        if (!user) { setChecking(false); return; }
        const members=await ChurchMemberEntity.filter({user_id:user.id});
        if (members.length>0) {
          const churchList=await ChurchEntity.filter({id:members[0].church_id});
          globalUser={...user,...members[0]};
          globalChurch=churchList[0]||null;
          setAuthed(true);
        } else {
          const adminChurches=await ChurchEntity.filter({admin_user_id:user.id});
          if (adminChurches.length>0) {
            const church=adminChurches[0];
            const nameParts=(user.full_name||"").trim().split(" ");
            const repairedMember=await ChurchMemberEntity.create({
              first_name:nameParts[0]||"Admin",last_name:nameParts.slice(1).join(" ")||"",
              email:user.email,role:"Admin",church_id:church.id,user_id:user.id,is_active:true
            });
            globalUser={...user,...repairedMember};
            globalChurch=church;
            setAuthed(true);
          }
        }
      } catch {}
      finally { setChecking(false); }
    };
    checkAuth();
  },[]);

  if (checking) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <GlobalStyles />
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse"><Music className="w-8 h-8 text-primary-foreground" /></div>
    </div>
  );

  if (!authed) return <LoginScreen onAuth={()=>setAuthed(true)} />;

  const handleLogout=()=>{
    globalUser=null; globalChurch=null; setAuthed(false);
    base44.auth.logout();
  };

  return <MainApp onLogout={handleLogout} />;
}
```

---

## COMPONENT FILES (src/components/app/)

These are unchanged from the previous export — copy them exactly:
- `ServicesSection.jsx` — from STEP 14 above
- `MyLibrarySection.jsx` — from STEP 15 above
- `MusicianSection.jsx` — from STEP 16 above
- `AdminSection.jsx` — from STEP 17 above
- `SettingsSection.jsx` — from STEP 18 above
- `NotificationsSection.jsx` — from STEP 12 above
- `MyStageSection.jsx` — from STEP 13 above

---

## DEPLOY CHECKLIST

```
✅ src/api/base44Client.js  — uses createClient({ appId: import.meta.env.VITE_BASE44_APP_ID })
✅ NO localStorage auth
✅ NO hardcoded tokens
✅ NO fake/demo users
✅ ALL auth: base44.auth.loginViaEmailPassword / register / verifyOtp / resendOtp / resetPasswordRequest / resetPassword / isAuthenticated / me / logout
✅ Sessions: handled by @base44/sdk automatically (stores token in localStorage under SDK's own key)
✅ netlify.toml: redirects /* to /index.html (required for React Router)
✅ VITE_BASE44_APP_ID set in Netlify → Site settings → Environment variables
```

## DEPLOY COMMANDS

```bash
npm install
npm run dev          # test locally first
# push to GitHub, connect to Netlify
# set VITE_BASE44_APP_ID in Netlify env vars
# deploy
``