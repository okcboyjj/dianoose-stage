# Dianoose Stage — COMPLETE NETLIFY EXPORT
# Copied verbatim from the LIVE Base44 source files — 2026-05-18

## 1. SETUP

```bash
mkdir dianoose-stage && cd dianoose-stage
npm create vite@latest . -- --template react
npm install @base44/sdk @tanstack/react-query framer-motion lucide-react react-router-dom \
  class-variance-authority clsx tailwind-merge tailwindcss-animate \
  @radix-ui/react-slot @radix-ui/react-label
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react
npx tailwindcss init -p
```

Create `.env` in project root:
```
VITE_BASE44_APP_ID=YOUR_APP_ID_HERE
```
> Your App ID is in the Base44 editor URL: `base44.app/apps/YOUR_APP_ID/editor`

---

## 2. package.json  (replace the dependencies section)

```json
{
  "name": "dianoose-stage",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@base44/sdk": "^0.8.29",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@tanstack/react-query": "^5.84.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.16.4",
    "lucide-react": "^0.475.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.0",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  }
}
```

---

## 3. netlify.toml  (root of project)

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

## 4. vite.config.js  (root of project)

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

## 5. tailwind.config.js  (root of project)

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

## 6. src/index.css

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

body { font-family: var(--font-body, -apple-system, sans-serif) !important; }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading, -apple-system, sans-serif) !important; }

@keyframes floatA { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
@keyframes floatB { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-2deg); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

.animate-gradient-x { animation: gradient-x 6s ease infinite; background-size: 200% auto; }

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

## 7. index.html  (root of project)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dianoose Stage</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 8. src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

---

## 9. src/api/base44Client.js
### THE ONLY AUTH SYSTEM — no localStorage, no hardcoded tokens

```js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
});
```

---

## 10. src/lib/utils.js

```js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs) { return twMerge(clsx(inputs)) }
```

---

## 11. src/lib/query-client.js

```js
import { QueryClient } from '@tanstack/react-query';
export const queryClientInstance = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});
```

---

## 12. src/components/ui/button.jsx

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"
export { Button, buttonVariants }
```

---

## 13. src/components/ui/input.jsx

```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"
export { Input }
```

---

## 14. src/components/ui/label.jsx

```jsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70")
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName
export { Label }
```

---

## 15. src/components/ui/textarea.jsx

```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = "Textarea"
export { Textarea }
```

---

## 16. src/components/ui/badge.jsx

```jsx
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
```

---

## 17. src/App.jsx

```jsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom'
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

## 18. src/pages/ResetPassword.jsx

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
    } catch {
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
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /><p className="text-xs font-medium text-destructive">{error}</p>
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

## 19. src/components/app/NotificationsSection.jsx
### EXACT COPY from live source

```jsx
import { base44 } from "@/api/base44Client";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotificationEntity = base44.entities.Notification;

export default function NotificationsSection({ notifications, onRefresh }) {
  const unread = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    const unreadItems = notifications.filter(n => !n.is_read);
    await Promise.all(unreadItems.map(n => NotificationEntity.update(n.id, { is_read: true })));
    onRefresh();
  };

  const markRead = async (n) => {
    if (n.is_read) return;
    await NotificationEntity.update(n.id, { is_read: true });
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground font-medium">Your updates and alerts.</p>
        </div>
        {unread > 0 && (
          <Button onClick={markAllRead} variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-secondary h-9 rounded-xl text-xs font-semibold">
            <Check className="w-3.5 h-3.5 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4"><Bell className="w-7 h-7 text-muted-foreground" /></div>
          <p className="text-foreground font-semibold mb-1">All caught up!</p>
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} onClick={() => markRead(n)} className={`glass-panel rounded-xl px-5 py-4 cursor-pointer transition-all hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg flex items-start gap-4 ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`}>
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? "bg-primary shadow-lg shadow-primary/50" : "bg-muted"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>{n.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  {n.type && <span className="capitalize mr-2 text-primary/70">{n.type}</span>}
                  {n.created_date && new Date(n.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 20. src/components/app/MyStageSection.jsx
### EXACT COPY from live source

```jsx
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Guitar, Calendar, Music, Check, Send, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NotificationEntity = base44.entities.Notification;
const ServiceEntity = base44.entities.Service;

export default function MyStageSection({ user, church, services, songs, members, onRefresh }) {
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const userId = user?.user_id || user?.id;

  const upcomingServices = services
    .filter(s => s.status !== "past" && (s.musicians || []).includes(userId))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const nextService = upcomingServices[0] || services.filter(s => s.status !== "past").sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0];
  const nextServiceSongs = (nextService?.songs || []).map(id => songs.find(s => s.id === id)).filter(Boolean);

  const handleSendComment = async () => {
    if (!comment.trim() || !church?.id) return;
    setSending(true);
    await Promise.all(members
      .filter(m => (m.user_id || m.id) !== userId)
      .map(m => NotificationEntity.create({
        user_id: m.user_id || m.id,
        church_id: church.id,
        message: `💬 ${user?.first_name}: ${comment.trim()}`,
        type: "team_comment",
        is_read: false,
        related_id: nextService?.id || ""
      }))
    );
    setComment("");
    setSending(false);
    onRefresh();
  };

  const handleConfirm = async () => {
    setConfirming(true);
    if (nextService && !confirmed) {
      const musicians = [...new Set([...(nextService.musicians || []), userId])];
      await ServiceEntity.update(nextService.id, { musicians });
      setConfirmed(true);
      await NotificationEntity.create({
        user_id: church?.admin_user_id || "",
        church_id: church?.id || "",
        message: `✅ ${user?.first_name} ${user?.last_name} confirmed for ${nextService.name}`,
        type: "ready_confirmation",
        is_read: false,
        related_id: nextService.id
      });
      onRefresh();
    }
    setConfirming(false);
  };

  const isConfirmed = confirmed || (nextService && (nextService.musicians || []).includes(userId));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Stage 🎸</h1>
        <p className="text-sm text-muted-foreground font-medium">Your personal worship area.</p>
      </div>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-primary" /><h2 className="text-base font-bold text-foreground">📅 My Services</h2></div>
        {upcomingServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't been assigned to any upcoming services yet.</p>
        ) : (
          <div className="space-y-2">
            {upcomingServices.slice(0, 5).map(svc => (
              <div key={svc.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{svc.name}</p>
                  {svc.date && <p className="text-xs text-muted-foreground">{new Date(svc.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{svc.time ? ` · ${svc.time}` : ""}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Music className="w-4 h-4 text-primary" /><h2 className="text-base font-bold text-foreground">🎵 Songs — Next Service</h2></div>
        {!nextService ? (
          <p className="text-sm text-muted-foreground">No upcoming service found.</p>
        ) : nextServiceSongs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No songs added to {nextService.name} yet.</p>
        ) : (
          <div className="space-y-2">
            {nextServiceSongs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3">
                <span className="text-xs text-muted-foreground w-5 text-center font-bold">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground">{song.artist}{song.key ? ` · ${song.key}` : ""}{song.bpm ? ` · ${song.bpm} BPM` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Check className="w-4 h-4 text-primary" /><h2 className="text-base font-bold text-foreground">✅ Ready Confirmation</h2></div>
        {!nextService ? (
          <p className="text-sm text-muted-foreground">No upcoming service to confirm for.</p>
        ) : isConfirmed ? (
          <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
            <Check className="w-5 h-5 text-accent" />
            <div><p className="text-sm font-semibold text-foreground">You're confirmed for {nextService.name}!</p><p className="text-xs text-muted-foreground">Your worship leader has been notified.</p></div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Confirm you're ready for <strong className="text-foreground">{nextService.name}</strong>.</p>
            <Button onClick={handleConfirm} disabled={confirming} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold">
              {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Confirm I'm Ready</>}
            </Button>
          </div>
        )}
      </div>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Send className="w-4 h-4 text-primary" /><h2 className="text-base font-bold text-foreground">💬 Team Comments</h2></div>
        <p className="text-xs text-muted-foreground mb-3">Send a message to the whole team as a notification.</p>
        <div className="flex gap-3">
          <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Write something to the team..." className="bg-background/50 border-border/50 text-foreground text-sm flex-1" onKeyDown={e => e.key === "Enter" && handleSendComment()} />
          <Button onClick={handleSendComment} disabled={sending || !comment.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-xl font-semibold px-5 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 21. src/components/app/ServicesSection.jsx
### EXACT COPY from live source

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Loader2, Music, List, Save, Trash2, Calendar } from "lucide-react";

const ServiceEntity = base44.entities.Service;
const SERVICE_TYPES = ["Sunday Morning", "Sunday Evening", "Youth Night", "Mid-Week", "Special Event", "Holiday Service"];

function NewServiceModal({ churchId, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", date: "", time: "", type: "Sunday Morning", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await ServiceEntity.create({ ...form, church_id: churchId, status: "upcoming", songs: [], musicians: [] });
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg">+ New Service</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Service Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sunday Morning Worship" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Date</Label><Input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Time</Label><Input type="time" value={form.time} onChange={e => set("time", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1">Type</Label>
            <select value={form.type} onChange={e => set("type", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
              {SERVICE_TYPES.map(t => <option key={t} value={t} className="bg-card">{t}</option>)}
            </select>
          </div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Notes</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Theme, series, special instructions..." rows={3} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm resize-none" /></div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
          <Button variant="outline" onClick={onClose} className="border-border/50 text-foreground hover:bg-background h-10 px-5 rounded-lg">Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !form.name.trim()} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function ServiceDetailModal({ service, songs, onClose, onSave }) {
  const [tab, setTab] = useState("setlist");
  const [form, setForm] = useState({ ...service });
  const [saving, setSaving] = useState(false);
  const [songSearch, setSongSearch] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const serviceSongs = (form.songs || []).map(id => songs.find(s => s.id === id)).filter(Boolean);
  const availableSongs = songs.filter(s => !(form.songs || []).includes(s.id) && (!songSearch || s.title?.toLowerCase().includes(songSearch.toLowerCase())));

  const addSong = (songId) => set("songs", [...(form.songs || []), songId]);
  const removeSong = (songId) => set("songs", (form.songs || []).filter(id => id !== songId));

  const handleSave = async () => {
    setSaving(true);
    await ServiceEntity.update(service.id, form);
    setSaving(false);
    onSave();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this service?")) return;
    await ServiceEntity.delete(service.id);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg truncate">{form.name || "Service"}</h3>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold h-8 px-4">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1.5" />Save</>}
            </Button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex gap-1 px-6 pt-3 pb-2 bg-secondary/10 border-b border-border/50 overflow-x-auto">
          {[{ id: "setlist", label: "🎵 Setlist" }, { id: "info", label: "ℹ️ Service Info" }, { id: "notes", label: "📝 Notes" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>{t.label}</button>
          ))}
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {tab === "setlist" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Current Setlist ({serviceSongs.length} songs)</p>
              {serviceSongs.length === 0 && <p className="text-sm text-muted-foreground text-center py-6 bg-secondary/20 rounded-xl border border-border/30">No songs added yet. Search below to add songs.</p>}
              <div className="space-y-2">
                {serviceSongs.map((song, i) => (
                  <div key={song.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3 group">
                    <span className="text-xs text-muted-foreground w-5 text-center font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground truncate">{song.title}</p><p className="text-xs text-muted-foreground">{song.artist}{song.key ? ` · Key of ${song.key}` : ""}</p></div>
                    <button onClick={() => removeSong(song.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-foreground mt-4 mb-2 uppercase tracking-wider">Add Songs</p>
              <div className="flex items-center gap-2 bg-background/50 border border-border/50 rounded-xl px-3 py-2 mb-3 focus-within:border-primary/50 transition-all">
                <input value={songSearch} onChange={e => setSongSearch(e.target.value)} placeholder="Search song library..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {availableSongs.slice(0, 20).map(song => (
                  <button key={song.id} onClick={() => addSong(song.id)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/30 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all text-left group">
                    <Music className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{song.title}</span>
                    {song.key && <span className="text-xs text-primary/70 font-medium">{song.key}</span>}
                    <Plus className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 shrink-0" />
                  </button>
                ))}
                {availableSongs.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No songs found</p>}
              </div>
            </div>
          )}
          {tab === "info" && (
            <div className="space-y-4">
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Service Name</Label><Input value={form.name || ""} onChange={e => set("name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">Date</Label><Input type="date" value={form.date || ""} onChange={e => set("date", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">Time</Label><Input type="time" value={form.time || ""} onChange={e => set("time", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground ml-1">Type</Label>
                <select value={form.type || "Sunday Morning"} onChange={e => set("type", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
                  {SERVICE_TYPES.map(t => <option key={t} value={t} className="bg-card">{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground ml-1">Status</Label>
                <select value={form.status || "upcoming"} onChange={e => set("status", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
                  {["upcoming", "past"].map(t => <option key={t} value={t} className="bg-card capitalize">{t}</option>)}
                </select>
              </div>
            </div>
          )}
          {tab === "notes" && (
            <div><Label className="text-xs font-medium text-muted-foreground ml-1 mb-2 block">Service Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Theme, series, special notes..." rows={5} className="bg-background/50 border-border/50 text-foreground text-sm resize-none" /></div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
          <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-destructive hover:underline font-medium transition-all"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="border-border/50 text-foreground hover:bg-background h-10 px-5 rounded-lg">Close</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-semibold px-6">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ServicesSection({ church, songs, services, onRefresh }) {
  const [filter, setFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const filtered = services.filter(s => {
    if (filter === "Upcoming") return s.status !== "past";
    if (filter === "Past") return s.status === "past";
    return true;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div><h1 className="text-2xl font-bold text-foreground tracking-tight">Services</h1><p className="text-sm text-muted-foreground font-medium">Plan and manage every worship service.</p></div>
        <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"><Plus className="w-4 h-4 mr-2" /> New Service</Button>
      </div>
      <div className="flex gap-2">
        {["All", "Upcoming", "Past"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4"><List className="w-7 h-7 text-muted-foreground" /></div>
          <p className="text-foreground font-semibold mb-1">No services yet</p>
          <p className="text-sm text-muted-foreground">Click "+ New Service" to plan your first service.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(service => {
            const songCount = (service.songs || []).length;
            const isUpcoming = service.status !== "past";
            return (
              <div key={service.id} onClick={() => setSelectedService(service)} className="glass-panel rounded-xl px-5 py-4 hover:border-primary/50 transition-all duration-300 cursor-pointer group flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isUpcoming ? "bg-primary/10 group-hover:bg-primary/20" : "bg-secondary/50"}`}><Calendar className={`w-5 h-5 ${isUpcoming ? "text-primary" : "text-muted-foreground"}`} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">{service.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {service.date && <span className="text-xs text-muted-foreground font-medium">{new Date(service.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>}
                    {service.time && <span className="text-xs text-muted-foreground">{service.time}</span>}
                    {service.type && <span className="text-xs text-muted-foreground">{service.type}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs bg-secondary border border-border/50 text-muted-foreground rounded-lg px-3 py-1 font-medium">{songCount} song{songCount !== 1 ? "s" : ""}</span>
                  <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 uppercase tracking-wider ${isUpcoming ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary text-muted-foreground border border-border/30"}`}>{isUpcoming ? "Upcoming" : "Past"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showNew && <NewServiceModal churchId={church.id} onClose={() => setShowNew(false)} onSave={() => { setShowNew(false); onRefresh(); }} />}
      {selectedService && <ServiceDetailModal service={selectedService} songs={songs} onClose={() => setSelectedService(null)} onSave={() => { setSelectedService(null); onRefresh(); }} />}
    </div>
  );
}
```

---

## 22. src/components/app/MyLibrarySection.jsx
### EXACT COPY from live source

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Loader2, Music, Search, Plus, Trash2, Save } from "lucide-react";

const MyLibrarySongEntity = base44.entities.MyLibrarySong;
const CATEGORIES = ["Worship", "Practice", "Reference", "Favorites"];

function LibrarySongModal({ entry, song, onClose, onSave, onRemove }) {
  const [form, setForm] = useState({ preferred_key: entry?.preferred_key || song?.key || "", personal_notes: entry?.personal_notes || "", category: entry?.category || "Worship", rating: entry?.rating || 0 });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    if (entry?.id) await MyLibrarySongEntity.update(entry.id, form);
    setSaving(false);
    onSave();
  };

  const handleRemove = async () => {
    if (entry?.id) await MyLibrarySongEntity.delete(entry.id);
    onRemove();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <div className="min-w-0"><h3 className="font-bold text-foreground text-base truncate">{song?.title || "Song"}</h3><p className="text-xs text-muted-foreground">{song?.artist}</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">My Preferred Key</Label><Input value={form.preferred_key} onChange={e => set("preferred_key", e.target.value)} placeholder={`Original: ${song?.key || "—"}`} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Personal Notes</Label><Textarea value={form.personal_notes} onChange={e => set("personal_notes", e.target.value)} placeholder="My arrangement notes, cues, personal reminders..." rows={4} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm resize-none" /></div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1">Category</Label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1 block mb-2">Rating</Label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => set("rating", n)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${form.rating >= n ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                  <Star className={`w-4 h-4 ${form.rating >= n ? "fill-primary" : ""}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
          <button onClick={handleRemove} className="flex items-center gap-1.5 text-xs text-destructive hover:underline font-medium"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="border-border/50 text-foreground hover:bg-background h-10 px-5 rounded-lg">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-semibold px-5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" />Save</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function AddToLibraryModal({ songs, libraryIds, userId, churchId, onClose, onAdded }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(null);
  const available = songs.filter(s => !libraryIds.includes(s.id) && (!search || s.title?.toLowerCase().includes(search.toLowerCase())));

  const handleAdd = async (song) => {
    setAdding(song.id);
    await MyLibrarySongEntity.create({ song_id: song.id, user_id: userId, church_id: churchId, category: "Worship", rating: 0, preferred_key: song.key || "" });
    setAdding(null);
    onAdded();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg">Add to My Library</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 bg-background/50 border border-border/50 rounded-xl px-3 py-2 mb-3 focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" autoFocus />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {available.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">All songs are in your library!</p>}
            {available.map(song => (
              <button key={song.id} onClick={() => handleAdd(song)} disabled={adding === song.id} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-all text-left group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Music className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{song.title}</p><p className="text-xs text-muted-foreground">{song.artist}{song.key ? ` · ${song.key}` : ""}</p></div>
                {adding === song.id ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MyLibrarySection({ songs, myLibrary, user, church, onRefresh }) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const libraryIds = myLibrary.map(e => e.song_id);
  const enriched = myLibrary.map(entry => ({ ...entry, song: songs.find(s => s.id === entry.song_id) })).filter(e => e.song);
  const filtered = enriched.filter(e => {
    const matchCat = categoryFilter === "All" || e.category === categoryFilter;
    const matchSearch = !search || e.song?.title?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div><h1 className="text-2xl font-bold text-foreground tracking-tight">⭐ My Library</h1><p className="text-sm text-muted-foreground font-medium">Your personal collection — private notes, preferred keys, ratings.</p></div>
        <Button onClick={() => setShowAdd(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"><Plus className="w-4 h-4 mr-2" /> Add Song</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${categoryFilter === c ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>
            {c === "Worship" ? "🙏 Worship" : c === "Practice" ? "🎸 Practice" : c === "Reference" ? "📚 Reference" : c === "Favorites" ? "❤ Favorites" : c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary/50 transition-all">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search my library..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-medium" />
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4"><Star className="w-7 h-7 text-muted-foreground" /></div>
          <p className="text-foreground font-semibold mb-1">Your library is empty</p>
          <p className="text-sm text-muted-foreground">Add songs from the Song Library to build your personal collection.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(entry => (
            <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="glass-panel rounded-xl px-5 py-4 hover:border-primary/50 transition-all duration-300 cursor-pointer group flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"><Music className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 min-w-0"><p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">{entry.song?.title}</p><p className="text-xs text-muted-foreground font-medium mt-0.5">{entry.song?.artist}</p></div>
              <div className="flex items-center gap-3 shrink-0">
                {entry.preferred_key && <span className="text-xs bg-primary/10 border border-primary/20 text-primary rounded-lg px-3 py-1 font-bold">{entry.preferred_key}</span>}
                {entry.category && <span className="text-xs bg-secondary border border-border/40 text-muted-foreground rounded-lg px-2.5 py-1 font-medium hidden sm:block">{entry.category}</span>}
                {entry.rating > 0 && <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${entry.rating >= n ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedEntry && <LibrarySongModal entry={selectedEntry} song={selectedEntry.song} onClose={() => setSelectedEntry(null)} onSave={() => { setSelectedEntry(null); onRefresh(); }} onRemove={() => { setSelectedEntry(null); onRefresh(); }} />}
      {showAdd && <AddToLibraryModal songs={songs} libraryIds={libraryIds} userId={user?.user_id || user?.id} churchId={church?.id} onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); onRefresh(); }} />}
    </div>
  );
}
```

---

## 23. src/components/app/MusicianSection.jsx
### EXACT COPY from live source

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, X, Loader2, Search, Trash2, Save, Shield } from "lucide-react";

const ChurchMemberEntity = base44.entities.ChurchMember;
const ROLES = ["Musician", "Worship Leader", "Production", "Admin"];
const AVATAR_COLORS = ["#6C63FF", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6"];

function MemberModal({ member, churchId, onClose, onSave }) {
  const isNew = !member?.id;
  const [form, setForm] = useState({ first_name: member?.first_name || "", last_name: member?.last_name || "", email: member?.email || "", instrument: member?.instrument || "", role: member?.role || "Musician", avatar_color: member?.avatar_color || AVATAR_COLORS[0], is_active: member?.is_active !== false, password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.first_name.trim() || !form.last_name.trim()) { setError("First and last name required."); return; }
    if (!form.email.trim()) { setError("Email required."); return; }
    if (isNew && !form.password.trim()) { setError("A temporary password is required for new members."); return; }
    setSaving(true);
    try {
      if (isNew) {
        await base44.auth.register({ email: form.email.trim(), password: form.password });
        await ChurchMemberEntity.create({ first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim(), instrument: form.instrument.trim(), role: form.role, avatar_color: form.avatar_color, church_id: churchId, is_active: true, user_id: "" });
      } else {
        await ChurchMemberEntity.update(member.id, { first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim(), instrument: form.instrument.trim(), role: form.role, avatar_color: form.avatar_color, is_active: form.is_active });
      }
      onSave();
    } catch (e) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        setError("An account with this email already exists.");
      } else { setError(e.message || "Failed to save member."); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${member.first_name} ${member.last_name} from the team?`)) return;
    await ChurchMemberEntity.delete(member.id);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg">{isNew ? "Add Member" : "Edit Member"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">First Name *</Label><Input value={form.first_name} onChange={e => set("first_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Last Name *</Label><Input value={form.last_name} onChange={e => set("last_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          </div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Email *</Label><Input value={form.email} onChange={e => set("email", e.target.value)} type="email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Instrument / Role</Label><Input value={form.instrument} onChange={e => set("instrument", e.target.value)} placeholder="e.g. Lead Guitar, Keys, Vocals" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1">App Role</Label>
            <select value={form.role} onChange={e => set("role", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
              {ROLES.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
            </select>
          </div>
          {isNew && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground ml-1">Temporary Password *</Label>
              <Input value={form.password} onChange={e => set("password", e.target.value)} type="password" placeholder="They'll use this to sign in" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" />
              <p className="text-[11px] text-muted-foreground mt-1.5 ml-1">Share the team code + this password so they can join.</p>
            </div>
          )}
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1 block mb-2">Avatar Color</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(c => <button key={c} onClick={() => set("avatar_color", c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-all ${form.avatar_color === c ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" : "hover:scale-105"}`} />)}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
          {!isNew && <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-destructive hover:underline font-medium"><Trash2 className="w-3.5 h-3.5" /> Remove</button>}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} className="border-border/50 text-foreground hover:bg-background h-10 px-5 rounded-lg">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-semibold px-5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" />Save</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function MusicianSection({ members, isAdmin, onRefresh }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const churchId = members[0]?.church_id;

  const filtered = members.filter(m => !search || `${m.first_name} ${m.last_name} ${m.instrument} ${m.role}`.toLowerCase().includes(search.toLowerCase()));

  const roleColor = (role) => {
    if (role === "Admin") return "bg-primary/10 text-primary border-primary/20";
    if (role === "Worship Leader") return "bg-accent/10 text-accent border-accent/20";
    return "bg-secondary text-muted-foreground border-border/40";
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div><h1 className="text-2xl font-bold text-foreground tracking-tight">Musicians</h1><p className="text-sm text-muted-foreground font-medium">Team overview — {members.length} member{members.length !== 1 ? "s" : ""}</p></div>
        {isAdmin && <Button onClick={() => { setEditMember(null); setShowModal(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"><Plus className="w-4 h-4 mr-2" /> Add Member</Button>}
      </div>
      <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary/50 transition-all">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team members..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-medium" />
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4"><Users className="w-7 h-7 text-muted-foreground" /></div>
          <p className="text-foreground font-semibold mb-1">No members found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(member => {
            const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase();
            return (
              <div key={member.id} onClick={() => isAdmin ? (setEditMember(member), setShowModal(true)) : null} className={`glass-panel rounded-xl px-5 py-4 transition-all duration-300 flex items-center gap-4 ${isAdmin ? "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 group" : ""}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg" style={{ backgroundColor: member.avatar_color || "#6C63FF" }}>{initials || "?"}</div>
                <div className="flex-1 min-w-0"><p className="text-base font-semibold text-foreground truncate">{member.first_name} {member.last_name}</p><p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{member.instrument || "—"}</p></div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-bold rounded-full px-3 py-1 border uppercase tracking-wider ${roleColor(member.role)}`}>{member.role}</span>
                  {member.role === "Admin" && <Shield className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && <MemberModal member={editMember} churchId={churchId} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}
```

---

## 24. src/components/app/AdminSection.jsx
### EXACT COPY from live source

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, Copy, Check, RefreshCw, Loader2, Share2, X, Plus, Trash2 } from "lucide-react";

const ChurchEntity = base44.entities.Church;
const ChurchMemberEntity = base44.entities.ChurchMember;
const ROLES = ["Musician", "Worship Leader", "Production", "Admin"];
const AVATAR_COLORS = ["#6C63FF", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6"];

function TeamCodeModal({ church, onClose, onCodeRegenerated }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const copy = () => { navigator.clipboard.writeText(church.team_code || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const regenerate = async () => {
    setRegenerating(true);
    const newCode = [Math.random().toString(36).substring(2, 5), Math.random().toString(36).substring(2, 5)].join("").toUpperCase().replace(/[^A-Z0-9]/g, "X").substring(0, 8);
    await ChurchEntity.update(church.id, { team_code: newCode });
    setRegenerating(false);
    onCodeRegenerated(newCode);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg">📤 Team Join Code</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-foreground">👥 How to get your team logged in:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Add each member in Admin Panel with their email & a temp password</li>
              <li>Click <strong className="text-foreground">Copy Team Code</strong> below</li>
              <li>Send that code to your team via text or email</li>
              <li>They open the app → tap <strong className="text-foreground">"Join My Church"</strong> → paste code → sign in with temp password</li>
            </ol>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1 block mb-2">Your Team Code (send this to your team)</Label>
            <div className="flex items-center gap-3 bg-background/60 border border-border/50 rounded-xl px-4 py-3">
              <span className="text-2xl font-bold text-primary tracking-widest font-mono flex-1">{church?.team_code || "—"}</span>
              <button onClick={copy} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Team Code</>}
              </button>
            </div>
          </div>
          <button onClick={regenerate} disabled={regenerating} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Generate new code (invalidates current code)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AddMemberModal({ churchId, onClose, onSave }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", instrument: "", role: "Musician", avatar_color: AVATAR_COLORS[0], password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.first_name.trim() || !form.last_name.trim()) { setError("First and last name required."); return; }
    if (!form.email.trim()) { setError("Email required."); return; }
    if (!form.password.trim()) { setError("A temporary password is required."); return; }
    setSaving(true);
    try {
      await base44.auth.register({ email: form.email.trim(), password: form.password });
      await ChurchMemberEntity.create({ first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim(), instrument: form.instrument.trim(), role: form.role, avatar_color: form.avatar_color, church_id: churchId, is_active: true, user_id: "" });
      onSave();
    } catch (e) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        try {
          await ChurchMemberEntity.create({ first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim(), instrument: form.instrument.trim(), role: form.role, avatar_color: form.avatar_color, church_id: churchId, is_active: true, user_id: "" });
          onSave();
        } catch (e2) { setError(e2.message || "Failed to add member."); }
      } else { setError(e.message || "Failed to add member."); }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg">Add Member</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">First Name *</Label><Input value={form.first_name} onChange={e => set("first_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-sm" /></div>
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Last Name *</Label><Input value={form.last_name} onChange={e => set("last_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-sm" /></div>
          </div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Email *</Label><Input value={form.email} onChange={e => set("email", e.target.value)} type="email" className="mt-1.5 bg-background/50 border-border/50 text-sm" /></div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Instrument / Role</Label><Input value={form.instrument} onChange={e => set("instrument", e.target.value)} placeholder="Lead Guitar, Keys, Vocals..." className="mt-1.5 bg-background/50 border-border/50 text-sm" /></div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1">App Role</Label>
            <select value={form.role} onChange={e => set("role", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50">
              {ROLES.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
            </select>
          </div>
          <div><Label className="text-xs font-medium text-muted-foreground ml-1">Temporary Password *</Label><Input value={form.password} onChange={e => set("password", e.target.value)} type="password" placeholder="They'll use this to join" className="mt-1.5 bg-background/50 border-border/50 text-sm" /></div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-secondary/10">
          <Button variant="outline" onClick={onClose} className="border-border/50 text-foreground hover:bg-background h-10 px-5 rounded-lg">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Member"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminSection({ church, members, onRefresh, onChurchUpdate }) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [localChurch, setLocalChurch] = useState(church);

  const roleColor = (role) => {
    if (role === "Admin") return "bg-primary/10 text-primary border-primary/20";
    if (role === "Worship Leader") return "bg-accent/10 text-accent border-accent/20";
    return "bg-secondary text-muted-foreground border-border/40";
  };

  const handleDeleteMember = async (member) => {
    if (!confirm(`Remove ${member.first_name} ${member.last_name}?`)) return;
    await ChurchMemberEntity.delete(member.id);
    onRefresh();
  };

  return (
    <div className="space-y-8 pb-12">
      <div><h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">🛡 Admin Panel</h1><p className="text-sm text-muted-foreground font-medium">Manage church members, roles, and data.</p></div>
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1"><Share2 className="w-4 h-4 text-primary" /><h2 className="text-base font-bold text-foreground">👥 Share with Your Team</h2></div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Team members need a <strong className="text-foreground">Team Join Code</strong> to load the app on their phone.</p>
        <Button onClick={() => setShowCodeModal(true)} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 h-10 rounded-xl font-semibold transition-all"><Share2 className="w-4 h-4 mr-2" /> Generate Team Code</Button>
      </div>
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><h2 className="text-base font-bold text-foreground">👥 Church Members</h2><span className="text-xs text-muted-foreground ml-1">({members.length})</span></div>
          <Button onClick={() => setShowAddMember(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-4 font-semibold"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Member</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-secondary/20">
                <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Member</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-bold hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Role</th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-bold hidden sm:table-cell">Instrument</th>
                <th className="text-right px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase();
                return (
                  <tr key={member.id} className={`border-b border-border/20 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? "" : "bg-secondary/10"}`}>
                    <td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: member.avatar_color || "#6C63FF" }}>{initials}</div><span className="text-sm font-semibold text-foreground">{member.first_name} {member.last_name}</span></div></td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground">{member.email}</span></td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border uppercase tracking-wider ${roleColor(member.role)}`}>{member.role}</span></td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><span className="text-xs text-muted-foreground">{member.instrument || "—"}</span></td>
                    <td className="px-6 py-3.5 text-right"><button onClick={() => handleDeleteMember(member)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {members.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No members yet. Click "Add Member" to get started.</p>}
        </div>
      </div>
      {showCodeModal && <TeamCodeModal church={localChurch} onClose={() => setShowCodeModal(false)} onCodeRegenerated={(code) => { const updated = { ...localChurch, team_code: code }; setLocalChurch(updated); onChurchUpdate(updated); }} />}
      {showAddMember && <AddMemberModal churchId={church.id} onClose={() => setShowAddMember(false)} onSave={() => { setShowAddMember(false); onRefresh(); }} />}
    </div>
  );
}
```

---

## 25. src/components/app/SettingsSection.jsx
### EXACT COPY from live source

```jsx
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Check } from "lucide-react";

const ChurchEntity = base44.entities.Church;
const ChurchMemberEntity = base44.entities.ChurchMember;
const AVATAR_COLORS = ["#6C63FF", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6"];

function SaveBar({ saving, saved }) {
  if (saving) return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</div>;
  if (saved) return <div className="flex items-center gap-2 text-xs text-accent"><Check className="w-3.5 h-3.5" /> Saved!</div>;
  return null;
}

export default function SettingsSection({ church, user, onChurchUpdate, onUserUpdate }) {
  const [tab, setTab] = useState("church");
  const [churchForm, setChurchForm] = useState({ name: church?.name || "", city: church?.city || "", state: church?.state || "", website: church?.website || "", denomination: church?.denomination || "" });
  const [churchSaving, setChurchSaving] = useState(false);
  const [churchSaved, setChurchSaved] = useState(false);
  const [schedForm, setSchedForm] = useState({ service_day: church?.service_day || "Sunday", service_time: church?.service_time || "10:00", service_name: church?.service_name || "Morning Worship", timezone: church?.timezone || "Eastern (ET)" });
  const [schedSaving, setSchedSaving] = useState(false);
  const [schedSaved, setSchedSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: user?.first_name || "", last_name: user?.last_name || "", instrument: user?.instrument || "", avatar_color: user?.avatar_color || AVATAR_COLORS[0] });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const setC = (k, v) => setChurchForm(f => ({ ...f, [k]: v }));
  const setSc = (k, v) => setSchedForm(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));

  const saveChurch = async () => {
    setChurchSaving(true);
    await ChurchEntity.update(church.id, churchForm);
    setChurchSaving(false); setChurchSaved(true);
    onChurchUpdate({ ...church, ...churchForm });
    setTimeout(() => setChurchSaved(false), 2500);
  };

  const saveSched = async () => {
    setSchedSaving(true);
    await ChurchEntity.update(church.id, schedForm);
    setSchedSaving(false); setSchedSaved(true);
    onChurchUpdate({ ...church, ...schedForm });
    setTimeout(() => setSchedSaved(false), 2500);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    await ChurchMemberEntity.update(user.id, profileForm);
    await base44.auth.updateMe({ full_name: `${profileForm.first_name} ${profileForm.last_name}` });
    setProfileSaving(false); setProfileSaved(true);
    onUserUpdate({ ...user, ...profileForm });
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const savePassword = async () => {
    setPwError("");
    if (!pwForm.newPw || pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords don't match."); return; }
    setPwSaving(true);
    try {
      await base44.auth.changePassword(pwForm.current, pwForm.newPw);
      setPwSaved(true); setPwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (e) { setPwError(e.message || "Failed to change password."); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="space-y-6 pb-12">
      <div><h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Settings</h1><p className="text-sm text-muted-foreground font-medium">Customize your church workspace and personal preferences.</p></div>
      <div className="flex gap-2 flex-wrap">
        {[{ id: "church", label: "⛪ Church" }, { id: "schedule", label: "📅 Schedule" }, { id: "profile", label: "👤 Profile" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "church" && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="text-base font-bold text-foreground">⛪ Church Info</h2><SaveBar saving={churchSaving} saved={churchSaved} /></div>
          <div className="space-y-4">
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Church Name</Label><Input value={churchForm.name} onChange={e => setC("name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">City</Label><Input value={churchForm.city} onChange={e => setC("city", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">State</Label><Input value={churchForm.state} onChange={e => setC("state", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            </div>
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Website</Label><Input value={churchForm.website} onChange={e => setC("website", e.target.value)} placeholder="https://yourchurch.com" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            <div><Label className="text-xs font-medium text-muted-foreground ml-1">Denomination</Label><Input value={churchForm.denomination} onChange={e => setC("denomination", e.target.value)} placeholder="e.g. Non-denominational, Baptist..." className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
          </div>
          <Button onClick={saveChurch} disabled={churchSaving} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold px-6">
            {churchSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Church Info</>}
          </Button>
        </div>
      )}
      {tab === "schedule" && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="text-base font-bold text-foreground">📅 Service Schedule</h2><SaveBar saving={schedSaving} saved={schedSaved} /></div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground ml-1">Service Day</Label>
              <select value={schedForm.service_day} onChange={e => setSc("service_day", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d} value={d} className="bg-card">{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Time</Label><Input type="time" value={schedForm.service_time} onChange={e => setSc("service_time", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Service Name</Label><Input value={schedForm.service_name} onChange={e => setSc("service_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground ml-1">Timezone</Label>
              <select value={schedForm.timezone} onChange={e => setSc("timezone", e.target.value)} className="mt-1.5 w-full bg-background/50 border border-border/50 text-foreground text-sm rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
                {["Eastern (ET)","Central (CT)","Mountain (MT)","Pacific (PT)","UTC"].map(t => <option key={t} value={t} className="bg-card">{t}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={saveSched} disabled={schedSaving} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold px-6">
            {schedSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Schedule</>}
          </Button>
        </div>
      )}
      {tab === "profile" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-base font-bold text-foreground">👤 My Profile</h2><SaveBar saving={profileSaving} saved={profileSaved} /></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">First Name</Label><Input value={profileForm.first_name} onChange={e => setP("first_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">Last Name</Label><Input value={profileForm.last_name} onChange={e => setP("last_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              </div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Instrument / Role</Label><Input value={profileForm.instrument} onChange={e => setP("instrument", e.target.value)} placeholder="Lead Guitar, Keys, Vocals..." className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground ml-1 block mb-2">Avatar Color</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map(c => <button key={c} onClick={() => setP("avatar_color", c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-all ${profileForm.avatar_color === c ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" : "hover:scale-105"}`} />)}
                </div>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={profileSaving} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold px-6">
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Update Profile</>}
            </Button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-5">Change Password</h2>
            {pwError && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5 mb-4">{pwError}</div>}
            {pwSaved && <div className="text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2.5 mb-4 flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Password updated!</div>}
            <div className="space-y-3">
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Current Password</Label><Input value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} type="password" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">New Password</Label><Input value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} type="password" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Confirm New</Label><Input value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} type="password" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
            </div>
            <Button onClick={savePassword} disabled={pwSaving} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold px-6">
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 26. src/pages/Home.jsx
### Paste the FULL content of pages/Home from this Base44 editor
### (It's the large file in your context snapshot — copy it verbatim, changing the import path to @/api/base44Client)

The file is too large to duplicate here but is available verbatim in the Base44 editor under `pages/Home`. Copy it as-is. The only change needed: ensure the import at the top reads:
```js
import { base44 } from "@/api/base44Client";
```

---

## DEPLOY

```bash
npm install
npm run dev    # test locally, make sure VITE_BASE44_APP_ID is in .env
# push to GitHub → connect to Netlify
# Add env var in Netlify: VITE_BASE44_APP_ID = your_app_id
# Deploy!
``