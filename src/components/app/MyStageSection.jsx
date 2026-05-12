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

  // Find upcoming services the user is part of
  const upcomingServices = services
    .filter(s => s.status !== "past" && (s.musicians || []).includes(userId))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // Next service (upcoming or just the first service in the list)
  const nextService = upcomingServices[0] || services.filter(s => s.status !== "past").sort((a, b) => (a.date || "").localeCompare(b.date || ""))[0];

  const nextServiceSongs = (nextService?.songs || []).map(id => songs.find(s => s.id === id)).filter(Boolean);

  const handleSendComment = async () => {
    if (!comment.trim() || !church?.id) return;
    setSending(true);
    // Broadcast to all church members
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
    // Add user to service musicians list
    if (nextService && !confirmed) {
      const musicians = [...new Set([...(nextService.musicians || []), userId])];
      await ServiceEntity.update(nextService.id, { musicians });
      setConfirmed(true);
      // Notify admins
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

      {/* My Services */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">📅 My Services</h2>
        </div>
        {upcomingServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't been assigned to any upcoming services yet.</p>
        ) : (
          <div className="space-y-2">
            {upcomingServices.slice(0, 5).map(svc => (
              <div key={svc.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
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

      {/* Songs for Next Service */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">🎵 Songs — Next Service</h2>
        </div>
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

      {/* Ready Confirmation */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Check className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">✅ Ready Confirmation</h2>
        </div>
        {!nextService ? (
          <p className="text-sm text-muted-foreground">No upcoming service to confirm for.</p>
        ) : isConfirmed ? (
          <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
            <Check className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">You're confirmed for {nextService.name}!</p>
              <p className="text-xs text-muted-foreground">Your worship leader has been notified.</p>
            </div>
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

      {/* Team Comments */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">💬 Team Comments</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Send a message to the whole team as a notification.</p>
        <div className="flex gap-3">
          <Input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write something to the team..."
            className="bg-background/50 border-border/50 text-foreground text-sm flex-1"
            onKeyDown={e => e.key === "Enter" && handleSendComment()}
          />
          <Button onClick={handleSendComment} disabled={sending || !comment.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-xl font-semibold px-5 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}