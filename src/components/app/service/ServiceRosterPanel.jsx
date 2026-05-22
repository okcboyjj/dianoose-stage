import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, GripVertical, UserPlus, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ServiceEntity = base44.entities.Service;

const DEFAULT_ROLES = [
  "Worship Leader", "Male Vocal", "Female Vocal",
  "Piano", "Keys", "Electric Guitar", "Acoustic Guitar",
  "Bass", "Drums", "MD", "Production", "Media", "Lighting", "Camera"
];

function MemberChip({ member, onRemove }) {
  const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase();
  return (
    <div className="flex items-center gap-1.5 bg-secondary/60 border border-border/40 rounded-full pl-1 pr-2 py-0.5 group">
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ backgroundColor: member.avatar_color || "#6C63FF" }}>{initials}</div>
      <span className="text-xs font-medium text-foreground">{member.first_name}</span>
      <button onClick={() => onRemove(member.id)} className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function RoleRow({ roleEntry, members, allMembers, onUpdate, onDelete, isAdmin }) {
  const [showPicker, setShowPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [roleName, setRoleName] = useState(roleEntry.role);

  const assignedMembers = (roleEntry.member_ids || [])
    .map(id => allMembers.find(m => m.id === id))
    .filter(Boolean);

  const unassigned = allMembers.filter(m => !(roleEntry.member_ids || []).includes(m.id));

  const addMember = (memberId) => {
    onUpdate({ ...roleEntry, member_ids: [...(roleEntry.member_ids || []), memberId] });
    setShowPicker(false);
  };

  const removeMember = (memberId) => {
    onUpdate({ ...roleEntry, member_ids: (roleEntry.member_ids || []).filter(id => id !== memberId) });
  };

  const saveRoleName = () => {
    onUpdate({ ...roleEntry, role: roleName });
    setEditingName(false);
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/20 last:border-0 group">
      {isAdmin && <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-1 shrink-0 cursor-grab" />}
      <div className="w-36 shrink-0">
        {editingName ? (
          <div className="flex items-center gap-1">
            <input
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveRoleName()}
              autoFocus
              className="bg-background/50 border border-primary/50 rounded px-2 py-1 text-xs text-foreground outline-none w-full"
            />
            <button onClick={saveRoleName} className="text-primary"><Check className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1 group/name">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{roleEntry.role}</span>
            {isAdmin && (
              <button onClick={() => setEditingName(true)} className="opacity-0 group-hover/name:opacity-100 transition-opacity">
                <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-wrap gap-1.5 items-center">
        {assignedMembers.map(m => (
          <MemberChip key={m.id} member={m} onRemove={isAdmin ? removeMember : undefined} />
        ))}
        {assignedMembers.length === 0 && (
          <span className="text-xs text-muted-foreground/50 italic">Unassigned</span>
        )}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowPicker(v => !v)}
              className="w-6 h-6 rounded-full border border-dashed border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="absolute left-0 top-8 z-50 bg-card border border-border/60 rounded-xl shadow-xl p-2 w-48 max-h-48 overflow-y-auto"
                >
                  {unassigned.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">All members assigned</p>}
                  {unassigned.map(m => (
                    <button
                      key={m.id}
                      onClick={() => addMember(m.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ backgroundColor: m.avatar_color || "#6C63FF" }}>
                        {`${m.first_name?.[0] || ""}${m.last_name?.[0] || ""}`.toUpperCase()}
                      </div>
                      <span className="text-xs text-foreground truncate">{m.first_name} {m.last_name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      {isAdmin && (
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive mt-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ServiceRosterPanel({ service, allMembers, isAdmin, onChange }) {
  const roleAssignments = service.role_assignments || [];
  const [newRoleName, setNewRoleName] = useState("");
  const [showAddRole, setShowAddRole] = useState(false);

  const updateRole = (index, updated) => {
    const newRoles = [...roleAssignments];
    newRoles[index] = updated;
    onChange(newRoles);
  };

  const deleteRole = (index) => {
    const newRoles = roleAssignments.filter((_, i) => i !== index);
    onChange(newRoles);
  };

  const addRole = (roleName) => {
    if (!roleName.trim()) return;
    onChange([...roleAssignments, { role: roleName.trim(), member_ids: [] }]);
    setNewRoleName("");
    setShowAddRole(false);
  };

  const addDefaultRole = (role) => {
    if (roleAssignments.find(r => r.role === role)) return;
    onChange([...roleAssignments, { role, member_ids: [] }]);
  };

  const unusedDefaults = DEFAULT_ROLES.filter(r => !roleAssignments.find(ra => ra.role === r));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Team Roster</p>
        {isAdmin && (
          <button
            onClick={() => setShowAddRole(v => !v)}
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            <Plus className="w-3 h-3" /> Add Role
          </button>
        )}
      </div>

      {roleAssignments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No roles configured yet</p>
          {isAdmin && <p className="text-xs mt-1">Add a role below to start building your team roster.</p>}
        </div>
      )}

      <div>
        {roleAssignments.map((entry, i) => (
          <RoleRow
            key={i}
            roleEntry={entry}
            allMembers={allMembers}
            onUpdate={(updated) => updateRole(i, updated)}
            onDelete={() => deleteRole(i)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {isAdmin && (
        <div className="space-y-3">
          {showAddRole && (
            <div className="flex gap-2">
              <input
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addRole(newRoleName)}
                placeholder="Custom role name..."
                className="flex-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
              />
              <button onClick={() => addRole(newRoleName)} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-semibold">Add</button>
            </div>
          )}
          {unusedDefaults.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unusedDefaults.slice(0, 8).map(role => (
                <button
                  key={role}
                  onClick={() => addDefaultRole(role)}
                  className="text-[11px] bg-secondary/40 border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/30 rounded-lg px-2.5 py-1 transition-all"
                >
                  + {role}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}