import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Copy, Check, RefreshCw, Loader2, Share2, X, Plus, Trash2 } from "lucide-react";

const ChurchEntity = base44.entities.Church;
const ChurchMemberEntity = base44.entities.ChurchMember;

const ROLES = ["Musician", "Worship Leader", "Production", "Admin"];
const AVATAR_COLORS = ["#6C63FF", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6"];

function TeamCodeModal({ church, onClose, onCodeRegenerated }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(church.team_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = async () => {
    setRegenerating(true);
    const newCode = [
      Math.random().toString(36).substring(2, 5),
      Math.random().toString(36).substring(2, 5)
    ].join("").toUpperCase().replace(/[^A-Z0-9]/g, "X").substring(0, 8);
    await ChurchEntity.update(church.id, { team_code: newCode });
    setRegenerating(false);
    onCodeRegenerated(newCode);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
          <h3 className="font-bold text-foreground text-lg">Team Join Code</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-secondary/30 border border-border/30 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-foreground">How to get your team logged in:</p>
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
      await ChurchMemberEntity.create({
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        email: form.email.trim(), instrument: form.instrument.trim(),
        role: form.role, avatar_color: form.avatar_color,
        church_id: churchId, is_active: true, user_id: ""
      });
      onSave();
    } catch (e) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        // Account exists — still create the member record without a new auth account
        try {
          await ChurchMemberEntity.create({
            first_name: form.first_name.trim(), last_name: form.last_name.trim(),
            email: form.email.trim(), instrument: form.instrument.trim(),
            role: form.role, avatar_color: form.avatar_color,
            church_id: churchId, is_active: true, user_id: ""
          });
          onSave();
        } catch (e2) { setError(e2.message || "Failed to add member."); }
      } else {
        setError(e.message || "Failed to add member.");
      }
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
  const [editMember, setEditMember] = useState(null);
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
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground font-medium">Manage church members, roles, and data.</p>
      </div>

      {/* Share Team Code */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Share2 className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Share with Your Team</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Team members need a <strong className="text-foreground">Team Join Code</strong> to load the app on their phone.</p>
        <Button onClick={() => setShowCodeModal(true)} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 h-10 rounded-xl font-semibold transition-all">
          <Share2 className="w-4 h-4 mr-2" /> Generate Team Code
        </Button>
      </div>

      {/* Members Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Church Members</h2>
            <span className="text-xs text-muted-foreground ml-1">({members.length})</span>
          </div>
          <Button onClick={() => setShowAddMember(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-4 font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Member
          </Button>
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
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: member.avatar_color || "#6C63FF" }}>{initials}</div>
                        <span className="text-sm font-semibold text-foreground">{member.first_name} {member.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground">{member.email}</span></td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border uppercase tracking-wider ${roleColor(member.role)}`}>{member.role}</span></td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><span className="text-xs text-muted-foreground">{member.instrument || "—"}</span></td>
                    <td className="px-6 py-3.5 text-right">
                      <button onClick={() => handleDeleteMember(member)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {members.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No members yet. Click "Add Member" to get started.</p>}
        </div>
      </div>

      {showCodeModal && (
        <TeamCodeModal
          church={localChurch}
          onClose={() => setShowCodeModal(false)}
          onCodeRegenerated={(code) => {
            const updated = { ...localChurch, team_code: code };
            setLocalChurch(updated);
            onChurchUpdate(updated);
          }}
        />
      )}
      {showAddMember && <AddMemberModal churchId={church.id} onClose={() => setShowAddMember(false)} onSave={() => { setShowAddMember(false); onRefresh(); }} />}
    </div>
  );
}