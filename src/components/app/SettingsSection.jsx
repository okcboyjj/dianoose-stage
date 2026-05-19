import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2, Check, Trash2, AlertTriangle } from "lucide-react";

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

  // Church info
  const [churchForm, setChurchForm] = useState({ name: church?.name || "", city: church?.city || "", state: church?.state || "", website: church?.website || "", denomination: church?.denomination || "" });
  const [churchSaving, setChurchSaving] = useState(false);
  const [churchSaved, setChurchSaved] = useState(false);

  // Schedule
  const [schedForm, setSchedForm] = useState({ service_day: church?.service_day || "Sunday", service_time: church?.service_time || "10:00", service_name: church?.service_name || "Morning Worship", timezone: church?.timezone || "Eastern (ET)" });
  const [schedSaving, setSchedSaving] = useState(false);
  const [schedSaved, setSchedSaved] = useState(false);

  // Profile
  const [profileForm, setProfileForm] = useState({ first_name: user?.first_name || "", last_name: user?.last_name || "", instrument: user?.instrument || "", avatar_color: user?.avatar_color || AVATAR_COLORS[0] });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const setC = (k, v) => setChurchForm(f => ({ ...f, [k]: v }));
  const setSc = (k, v) => setSchedForm(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));

  const saveChurch = async () => {
    setChurchSaving(true);
    const updated = await ChurchEntity.update(church.id, churchForm);
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

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      if (user?.id) await ChurchMemberEntity.delete(user.id);
      await base44.auth.logout("/");
    } catch (e) {
      setDeleting(false);
    }
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
    } catch (e) {
      setPwError(e.message || "Failed to change password.");
    } finally { setPwSaving(false); }
  };

  const tabs = [
    { id: "church", label: "⛪ Church" },
    { id: "schedule", label: "📅 Schedule" },
    { id: "profile", label: "👤 Profile" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">Customize your church workspace and personal preferences.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "church" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">⛪ Church Info</h2>
              <SaveBar saving={churchSaving} saved={churchSaved} />
            </div>
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
        </div>
      )}

      {tab === "schedule" && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-foreground">📅 Service Schedule</h2>
            <SaveBar saving={schedSaving} saved={schedSaved} />
          </div>
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">👤 My Profile</h2>
              <SaveBar saving={profileSaving} saved={profileSaved} />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">First Name</Label><Input value={profileForm.first_name} onChange={e => setP("first_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
                <div><Label className="text-xs font-medium text-muted-foreground ml-1">Last Name</Label><Input value={profileForm.last_name} onChange={e => setP("last_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              </div>
              <div><Label className="text-xs font-medium text-muted-foreground ml-1">Instrument / Role</Label><Input value={profileForm.instrument} onChange={e => setP("instrument", e.target.value)} placeholder="Lead Guitar, Keys, Vocals..." className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" /></div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground ml-1 block mb-2">Avatar Color</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => setP("avatar_color", c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-all ${profileForm.avatar_color === c ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" : "hover:scale-105"}`} />
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={profileSaving} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold px-6">
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Update Profile</>}
            </Button>
          </div>

          {/* Delete Account */}
          <div className="glass-panel rounded-2xl p-6 border-destructive/20">
            <h2 className="text-base font-bold text-destructive mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h2>
            <p className="text-xs text-muted-foreground mb-4">Removing your account will delete your member profile. This cannot be undone.</p>
            {!showDeleteConfirm ? (
              <Button onClick={() => setShowDeleteConfirm(true)} variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 h-9 px-4 rounded-xl text-xs font-semibold">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete My Account
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive font-medium">Type <span className="font-bold">DELETE</span> below to confirm account removal.</p>
                </div>
                <Input
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="bg-background/50 border-destructive/40 text-foreground text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }} variant="outline" className="flex-1 border-border/50 h-9 rounded-xl text-xs">Cancel</Button>
                  <Button onClick={deleteAccount} disabled={deleteConfirmText !== "DELETE" || deleting} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-xl text-xs font-bold">
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Delete"}
                  </Button>
                </div>
              </div>
            )}
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