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
  const [form, setForm] = useState({
    first_name: member?.first_name || "",
    last_name: member?.last_name || "",
    email: member?.email || "",
    instrument: member?.instrument || "",
    role: member?.role || "Musician",
    avatar_color: member?.avatar_color || AVATAR_COLORS[0],
    is_active: member?.is_active !== false,
    password: ""
  });
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
        // Register the new member's auth account
        await base44.auth.register({ email: form.email.trim(), password: form.password });
        // Find the created user by looking for a newly-created member via email match after a brief moment
        // We create the member record; user_id will be linked when they first sign in
        await ChurchMemberEntity.create({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          instrument: form.instrument.trim(),
          role: form.role,
          avatar_color: form.avatar_color,
          church_id: churchId,
          is_active: true,
          user_id: "" // will be populated on first sign-in via handleJoin
        });
      } else {
        await ChurchMemberEntity.update(member.id, {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          instrument: form.instrument.trim(),
          role: form.role,
          avatar_color: form.avatar_color,
          is_active: form.is_active
        });
      }
      onSave();
    } catch (e) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        setError("An account with this email already exists.");
      } else {
        setError(e.message || "Failed to save member.");
      }
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
            <div>
              <Label className="text-xs font-medium text-muted-foreground ml-1">First Name *</Label>
              <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground ml-1">Last Name *</Label>
              <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1">Email *</Label>
            <Input value={form.email} onChange={e => set("email", e.target.value)} type="email" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground ml-1">Instrument / Role</Label>
            <Input value={form.instrument} onChange={e => set("instrument", e.target.value)} placeholder="e.g. Lead Guitar, Keys, Vocals" className="mt-1.5 bg-background/50 border-border/50 text-foreground text-sm" />
          </div>
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
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => set("avatar_color", c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-all ${form.avatar_color === c ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" : "hover:scale-105"}`} />
              ))}
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

  const filtered = members.filter(m =>
    !search || `${m.first_name} ${m.last_name} ${m.instrument} ${m.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role) => {
    if (role === "Admin") return "bg-primary/10 text-primary border-primary/20";
    if (role === "Worship Leader") return "bg-accent/10 text-accent border-accent/20";
    return "bg-secondary text-muted-foreground border-border/40";
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Musicians</h1>
          <p className="text-sm text-muted-foreground font-medium">Team overview — {members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditMember(null); setShowModal(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        )}
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
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg" style={{ backgroundColor: member.avatar_color || "#6C63FF" }}>
                  {initials || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{member.first_name} {member.last_name}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{member.instrument || "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-bold rounded-full px-3 py-1 border uppercase tracking-wider ${roleColor(member.role)}`}>{member.role}</span>
                  {member.role === "Admin" && <Shield className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <MemberModal
          member={editMember}
          churchId={churchId}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); onRefresh(); }}
        />
      )}
    </div>
  );
}