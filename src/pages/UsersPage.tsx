import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { UserCheck, BadgeCheck, Ban, Trash2, Eye } from "lucide-react";
import { adminApi } from "../services/api";
import {
  PageHeader, SearchInput, Badge, Table, Tr, Td,
  Btn, Modal, Avatar, Empty, Skeleton,
} from "../components/ui";
import toast from "react-hot-toast";
import { format } from "date-fns";

const BADGES = [
  { key: "top_seller",   label: "🏆 Top Seller",   color: "amber"  },
  { key: "verified_farm",label: "🌿 Verified Farm", color: "green"  },
  { key: "organic",      label: "🍃 Organic",       color: "green"  },
  { key: "fast_delivery",label: "⚡ Fast Delivery",  color: "blue"   },
  { key: "trusted",      label: "💎 Trusted",       color: "purple" },
];

function UserRow({ user, onAction }: { user: any; onAction: (action: string, u: any) => void }) {
  const roleBadge  = user.role === "farmer" ? "green" : "blue";
  const statusColor = user.is_banned ? "red" : user.is_verified ? "green" : "amber";
  const statusLabel = user.is_banned ? "Banned" : user.is_verified ? "Verified" : "Pending";

  return (
    <Tr>
      <Td>
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name} url={user.avatar_url} />
          <div>
            <p className="font-semibold text-brand-900 text-sm">{user.full_name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </Td>
      <Td><Badge color={roleBadge}>{user.role === "farmer" ? "🌱 Farmer" : "🛍️ Customer"}</Badge></Td>
      <Td><Badge color={statusColor}>{statusLabel}</Badge></Td>
      <Td>
        <div className="flex flex-wrap gap-1">
          {(user.badges || []).map((b: string) => (
            <span key={b} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">
              {BADGES.find(x => x.key === b)?.label || b}
            </span>
          ))}
          {(!user.badges || user.badges.length === 0) && <span className="text-xs text-gray-300">—</span>}
        </div>
      </Td>
      <Td className="text-xs text-gray-400">{format(new Date(user.created_at), "dd MMM yyyy")}</Td>
      <Td>
        <div className="flex items-center gap-1.5">
          <Btn variant="ghost" onClick={() => onAction("view", user)} className="!p-1.5">
            <Eye size={14} />
          </Btn>
          {user.role === "farmer" && !user.is_verified && (
            <Btn variant="success" size="xs" onClick={() => onAction("verify", user)}>
              <UserCheck size={12} className="inline mr-1"/>Verify
            </Btn>
          )}
          {user.role === "farmer" && (
            <Btn variant="warning" size="xs" onClick={() => onAction("badge", user)}>
              <BadgeCheck size={12} className="inline mr-1"/>Badge
            </Btn>
          )}
          {!user.is_banned ? (
            <Btn variant="danger" size="xs" onClick={() => onAction("ban", user)}>
              <Ban size={12} className="inline mr-1"/>Ban
            </Btn>
          ) : (
            <Btn variant="secondary" size="xs" onClick={() => onAction("unban", user)}>Unban</Btn>
          )}
          <Btn variant="ghost" size="xs" onClick={() => onAction("delete", user)} className="!text-red-400 hover:!bg-red-50">
            <Trash2 size={12}/>
          </Btn>
        </div>
      </Td>
    </Tr>
  );
}

export default function UsersPage() {
  const [searchParams]      = useSearchParams();
  const [users,   setUsers]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [roleFilter, setRole] = useState("all");
  const [modal,   setModal]   = useState<{type:string; user:any} | null>(null);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [acting,  setActing]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search)             params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      if (searchParams.get("filter") === "pending") params.verified = false;
      const { data } = await adminApi.users(params);
      setUsers(data);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleAction = async (action: string, user: any) => {
    if (action === "view" || action === "badge") {
      setModal({ type: action, user });
      return;
    }
    if (action === "delete" && !confirm(`Delete ${user.full_name}? This cannot be undone.`)) return;
    if (action === "ban"    && !confirm(`Ban ${user.full_name}?`)) return;

    setActing(true);
    try {
      if (action === "verify") await adminApi.verifyFarmer(user.id);
      if (action === "ban")    await adminApi.banUser(user.id);
      if (action === "unban")  await adminApi.unbanUser(user.id);
      if (action === "delete") await adminApi.deleteUser(user.id);
      toast.success(`User ${action}ed successfully`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Action failed");
    } finally { setActing(false); }
  };

  const handleBadge = async () => {
    if (!selectedBadge || !modal) return;
    setActing(true);
    try {
      await adminApi.badgeFarmer(modal.user.id, selectedBadge);
      toast.success("Badge awarded!");
      setModal(null);
      load();
    } catch { toast.error("Failed to award badge"); }
    finally { setActing(false); }
  };

  const farmers   = users.filter(u => u.role === "farmer").length;
  const customers = users.filter(u => u.role === "customer").length;
  const pending   = users.filter(u => u.role === "farmer" && !u.is_verified).length;

  return (
    <div>
      <PageHeader
        title="Users"
        sub={`${users.length} total · ${farmers} farmers · ${customers} customers · ${pending} pending`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" />
        <div className="flex gap-2">
          {["all","farmer","customer"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                roleFilter === r ? "bg-brand-700 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-brand-300"
              }`}>{r === "all" ? "All Roles" : r}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14"/>)}
          </div>
        ) : users.length === 0 ? (
          <Empty icon="👥" title="No users found" sub="Try a different search"/>
        ) : (
          <Table headers={["User","Role","Status","Badges","Joined","Actions"]}>
            {users.map(u => <UserRow key={u.id} user={u} onAction={handleAction}/>)}
          </Table>
        )}
      </div>

      {/* View user modal */}
      {modal?.type === "view" && (
        <Modal title="User Details" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={modal.user.full_name} url={modal.user.avatar_url} size="lg"/>
              <div>
                <p className="font-black text-brand-900 text-lg">{modal.user.full_name}</p>
                <p className="text-gray-400 text-sm">{modal.user.email}</p>
              </div>
            </div>
            {[
              ["Role",     modal.user.role],
              ["Phone",    modal.user.phone    || "—"],
              ["Location", modal.user.location || "—"],
              ["Status",   modal.user.is_banned ? "Banned" : modal.user.is_verified ? "Verified" : "Pending"],
              ["Joined",   format(new Date(modal.user.created_at), "dd MMM yyyy")],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-medium">{k}</span>
                <span className="font-semibold text-brand-900 capitalize">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              {modal.user.role === "farmer" && !modal.user.is_verified && (
                <Btn variant="success" onClick={() => { handleAction("verify", modal.user); setModal(null); }}>
                  ✅ Verify Farmer
                </Btn>
              )}
              {!modal.user.is_banned
                ? <Btn variant="danger" onClick={() => { handleAction("ban", modal.user); setModal(null); }}>Ban User</Btn>
                : <Btn variant="secondary" onClick={() => { handleAction("unban", modal.user); setModal(null); }}>Unban</Btn>
              }
            </div>
          </div>
        </Modal>
      )}

      {/* Badge modal */}
      {modal?.type === "badge" && (
        <Modal title={`Award Badge — ${modal.user.full_name}`} onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500 mb-4">Select a badge to award to this farmer:</p>
          <div className="grid grid-cols-1 gap-2 mb-5">
            {BADGES.map(b => (
              <button key={b.key} onClick={() => setSelectedBadge(b.key)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  selectedBadge === b.key
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 hover:border-brand-200"
                }`}>
                <span className="text-lg">{b.label.split(" ")[0]}</span>
                {b.label}
              </button>
            ))}
          </div>
          <Btn variant="primary" size="md" disabled={!selectedBadge || acting} onClick={handleBadge}
            className="w-full justify-center">
            {acting ? "Awarding…" : "Award Badge"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
