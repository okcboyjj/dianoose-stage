import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link, Copy, Check, UserPlus, X, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TeamInviteEntity = base44.entities.TeamInvite;

const ROLES = ["Musician", "Worship Leader", "Admin", "Production", "Vocalist"];
const INSTRUMENTS = ["Guitar", "Bass", "Drums", "Keys", "Piano", "Vocals", "Production", "Other"];

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function InviteRow({ invite, onRevoke }) {
  const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
  return (
    <div className="flex items-center gap-3 p-3 bg-card/50 border border-border/40 rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{invite.email || invite.phone || "Open invite"}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{invite.role}</span>
          {invite.instrument && <span className="text-[10px] text-muted-foreground">· {invite.instrument}</span>}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            invite.status === "accepted" ? "text-green-400 bg-green-400/10" :
            isExpired || invite.status === "expired" ? "text-red-400 bg-red-400/10" :
            "text-yellow-400 bg-yellow-400/10"
          }`}>
            {invite.status === "accepted" ? "✓ Joined" : isExpired ? "Expired" : "Pending"}
          </span>
        </div>
      </div>
      {invite.status === "pending" && !isExpired && (
        <button onClick={() => onRevoke(invite)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function InvitePanel({ church, user, members, onRefresh }) {
  const [tab, setTab] = useState("link");
  const [role, setRole] = useState("Musician");
  const [instrument, setInstrument] = useState("");
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const teamCode = church?.team_code || "";
  const joinUrl = `${window.location.origin}/?join=${teamCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async (linkUrl) => {
    const shareUrl = linkUrl || joinUrl;
    const shareText = `Hey! ${user?.first_name} ${user?.last_name} is inviting you to join the ${church?.name} worship team on Dianoose Stage. Tap the link to join:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${church?.name} on Dianoose Stage`, text: shareText, url: shareUrl });
      } catch (e) {
        if (e.name !== "AbortError") await fallbackShare(shareUrl);
      }
    } else {
      await fallbackShare(shareUrl);
    }
  };

  const fallbackShare = async (url) => {
    // Copy to clipboard as reliable fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Last resort: open SMS
      const smsLink = `sms:?body=${encodeURIComponent(url)}`;
      window.open(smsLink);
    }
  };

  const generatePersonalLink = async () => {
    const code = generateInviteCode();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invite = await TeamInviteEntity.create({
      church_id: church.id,
      church_name: church.name,
      invite_code: code,
      invited_by_id: user?.user_id || user?.id,
      invited_by_name: `${user?.first_name} ${user?.last_name}`,
      role,
      instrument,
      status: "pending",
      expires_at: expires
    });
    const link = `${window.location.origin}/?invite=${code}`;
    setGeneratedLink(link);
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadInvites = async () => {
    setLoadingInvites(true);
    try {
      const list = await TeamInviteEntity.filter({ church_id: church.id }, "-created_date", 20);
      setInvites(list);
    } finally { setLoadingInvites(false); }
  };

  const revokeInvite = async (invite) => {
    await TeamInviteEntity.update(invite.id, { status: "expired" });
    setInvites(prev => prev.map(i => i.id === invite.id ? { ...i, status: "expired" } : i));
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-secondary/20 rounded-xl p-1">
        {[{ id: "link", label: "🔗 Share Link" }, { id: "history", label: "📋 Sent Invites" }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "history") loadInvites(); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

          {tab === "link" && (
            <div className="space-y-4">
              {/* Team code card */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-5">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Team Join Code</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-foreground tracking-[0.3em] font-mono">{teamCode}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Share this code with your team. They enter it on the "Join My Church" tab.</p>
                <button onClick={copyLink} className="flex items-center gap-2 w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                  <span className="flex-1 truncate text-left">{joinUrl}</span>
                  {copied ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                </button>
                <button onClick={() => shareInvite(joinUrl)} className="flex items-center justify-center gap-2 w-full bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 text-xs font-semibold text-primary hover:bg-primary/20 transition-all">
                  <Share2 className="w-4 h-4 shrink-0" />
                  {copied ? "✓ Link Copied!" : "Share Invite (Text / Messages)"}
                </button>
              </div>

              {/* Role-specific invite link */}
              <div className="bg-card/50 border border-border/40 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-foreground">Generate Role-Specific Link</p>
                <p className="text-xs text-muted-foreground">Create a personal invite link with a pre-assigned role. Link expires in 7 days.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full mt-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground outline-none">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium">Instrument</label>
                    <select value={instrument} onChange={e => setInstrument(e.target.value)} className="w-full mt-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground outline-none">
                      <option value="">None</option>
                      {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={generatePersonalLink} className="flex-1 bg-primary text-primary-foreground h-9 rounded-xl text-xs font-semibold">
                    <Link className="w-3.5 h-3.5 mr-2" />
                    {copied ? "Copied!" : "Generate & Copy Link"}
                  </Button>
                  {generatedLink && (
                    <Button onClick={() => shareInvite(generatedLink)} variant="outline" className="h-9 rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10 px-3">
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                {generatedLink && (
                  <p className="text-[10px] text-muted-foreground bg-secondary/30 rounded-lg p-2 font-mono truncate">{generatedLink}</p>
                )}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-2">
              {loadingInvites ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">No invites sent yet</p>
                </div>
              ) : (
                invites.map(invite => (
                  <InviteRow key={invite.id} invite={invite} onRevoke={revokeInvite} />
                ))
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}