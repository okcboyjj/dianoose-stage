import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X, HelpCircle, UserPlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const AssignmentEntity = base44.entities.ServiceAssignment;

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",  icon: HelpCircle },
  accepted: { label: "Accepted", color: "bg-green-500/15 text-green-400 border-green-500/30",     icon: Check },
  declined: { label: "Declined", color: "bg-red-500/15 text-red-400 border-red-500/30",           icon: X },
  maybe:    { label: "Maybe",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",         icon: HelpCircle },
};

function AssignmentRow({ assignment, member, isCurrentUser, onStatusChange, onRemove, isAdmin }) {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const initials = `${member?.first_name?.[0] || ""}${member?.last_name?.[0] || ""}`.toUpperCase();

  const updateStatus = async (status) => {
    setUpdating(true);
    await AssignmentEntity.update(assignment.id, { status });
    onStatusChange();
    setUpdating(false);
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: member?.avatar_color || "#6C63FF" }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{member?.first_name} {member?.last_name}</p>
        {assignment.role_in_service && (
          <p className="text-[11px] text-muted-foreground">{assignment.role_in_service}</p>
        )}
      </div>
      <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border flex items-center gap-1 ${cfg.color}`}>
        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
        {cfg.label}
      </span>
      {isCurrentUser && assignment.status !== "accepted" && (
        <button onClick={() => updateStatus("accepted")} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5 font-semibold hover:bg-green-500/20 transition-colors">
          Accept
        </button>
      )}
      {isCurrentUser && assignment.status !== "declined" && (
        <button onClick={() => updateStatus("declined")} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 font-semibold hover:bg-red-500/20 transition-colors">
          Decline
        </button>
      )}
      {isCurrentUser && assignment.status !== "maybe" && (
        <button onClick={() => updateStatus("maybe")} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 font-semibold hover:bg-blue-500/20 transition-colors">
          Maybe
        </button>
      )}
      {isAdmin && (
        <button onClick={() => onRemove(assignment.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ServiceAssignmentPanel({ service, allMembers, currentUser, isAdmin, onRefresh }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [roleLabel, setRoleLabel] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await AssignmentEntity.filter({ service_id: service.id });
    setAssignments(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [service.id]);

  const assignedMemberIds = assignments.map(a => a.member_id);
  const unassigned = allMembers.filter(m => !assignedMemberIds.includes(m.id));

  const addAssignment = async () => {
    if (!selectedMemberId) return;
    const member = allMembers.find(m => m.id === selectedMemberId);
    await AssignmentEntity.create({
      service_id: service.id,
      member_id: selectedMemberId,
      member_name: `${member?.first_name} ${member?.last_name}`,
      user_id: member?.user_id || "",
      church_id: service.church_id,
      status: "pending",
      role_in_service: roleLabel
    });
    setSelectedMemberId("");
    setRoleLabel("");
    setAdding(false);
    load();
    onRefresh && onRefresh();
  };

  const removeAssignment = async (id) => {
    await AssignmentEntity.delete(id);
    load();
  };

  const currentUserId = currentUser?.user_id || currentUser?.id;

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Assignments ({assignments.length})</p>
        {isAdmin && (
          <button onClick={() => setAdding(v => !v)} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
            <UserPlus className="w-3 h-3" /> Assign
          </button>
        )}
      </div>

      {adding && isAdmin && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/30 rounded-xl p-3 space-y-2 border border-border/30">
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="w-full bg-background/60 border border-border/50 text-foreground text-sm rounded-lg px-3 py-2 outline-none"
          >
            <option value="">Select member...</option>
            {unassigned.map(m => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name} {m.instrument ? `— ${m.instrument}` : ""}</option>
            ))}
          </select>
          <input
            value={roleLabel}
            onChange={e => setRoleLabel(e.target.value)}
            placeholder="Role (e.g. Lead Guitar)..."
            className="w-full bg-background/60 border border-border/50 text-foreground text-sm rounded-lg px-3 py-2 outline-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-1.5 rounded-lg text-xs text-muted-foreground border border-border/40 hover:bg-secondary/40 transition-colors">Cancel</button>
            <button onClick={addAssignment} disabled={!selectedMemberId} className="flex-1 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground font-semibold disabled:opacity-50 transition-colors">Assign</button>
          </div>
        </motion.div>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <UserPlus className="w-7 h-7 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No one assigned yet</p>
        </div>
      )}

      <div>
        {assignments.map(a => {
          const member = allMembers.find(m => m.id === a.member_id);
          const isCurrentUser = a.user_id === currentUserId;
          return (
            <AssignmentRow
              key={a.id}
              assignment={a}
              member={member}
              isCurrentUser={isCurrentUser}
              onStatusChange={load}
              onRemove={removeAssignment}
              isAdmin={isAdmin}
            />
          );
        })}
      </div>
    </div>
  );
}