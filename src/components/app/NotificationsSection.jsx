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