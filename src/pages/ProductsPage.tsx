import { useEffect, useState } from "react";
import { CheckCircle, Flag, Trash2, Eye, MapPin } from "lucide-react";
import { adminApi } from "../services/api";
import {
  PageHeader, SearchInput, Badge, Table, Tr, Td,
  Btn, Modal, Avatar, Empty, Skeleton,
} from "../components/ui";
import toast from "react-hot-toast";
import { format } from "date-fns";

function ProductRow({ product, onAction }: { product: any; onAction: (a: string, p: any) => void }) {
  const statusColor = product.is_flagged ? "red" : product.is_active ? "green" : "gray";
  const statusLabel = product.is_flagged ? "Flagged" : product.is_active ? "Active" : "Inactive";

  return (
    <Tr>
      <Td>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0">
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
              : <div className="w-full h-full flex items-center justify-center text-xl">!</div>
            }
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">{product.name}</p>
            <p className="text-xs text-gray-400 capitalize">{product.category}</p>
          </div>
        </div>
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <Avatar name={product.farmer?.full_name || "?"} url={product.farmer?.avatar_url} size="sm"/>
          <span className="text-xs text-gray-600">{product.farmer?.full_name || "—"}</span>
        </div>
      </Td>
      <Td>
        <p className="font-bold text-brand-700 text-sm">{product.price?.toLocaleString()} XAF</p>
        <p className="text-xs text-gray-400">{product.quantity} {product.unit}</p>
      </Td>
      <Td>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin size={10}/>{product.location}
        </p>
      </Td>
      <Td><Badge color={statusColor}>{statusLabel}</Badge></Td>
      <Td className="text-xs text-gray-400">{format(new Date(product.created_at), "dd MMM yyyy")}</Td>
      <Td>
        <div className="flex items-center gap-1.5">
          <Btn variant="ghost" size="xs" onClick={() => onAction("view", product)} className="!p-1.5">
            <Eye size={14}/>
          </Btn>
          {product.is_flagged && (
            <Btn variant="success" size="xs" onClick={() => onAction("approve", product)}>
              <CheckCircle size={12} className="inline mr-1"/>Approve
            </Btn>
          )}
          {!product.is_flagged && (
            <Btn variant="warning" size="xs" onClick={() => onAction("flag", product)}>
              <Flag size={12} className="inline mr-1"/>Flag
            </Btn>
          )}
          <Btn variant="ghost" size="xs" onClick={() => onAction("delete", product)} className="!text-red-400 hover:!bg-red-50">
            <Trash2 size={12}/>
          </Btn>
        </div>
      </Td>
    </Tr>
  );
}

export default function ProductsPage() {
  const [products, setProducts]   = useState<any[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");
  const [filter,   setFilter]     = useState("all");
  const [modal,    setModal]      = useState<{type:string; product:any} | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [acting,   setActing]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search)          params.search   = search;
      if (filter === "flagged")  params.flagged = true;
      if (filter === "inactive") params.active  = false;
      const { data } = await adminApi.products(params);
      setProducts(data);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filter]);

  const handleAction = async (action: string, product: any) => {
    if (action === "view") { setModal({ type: "view", product }); return; }
    if (action === "flag") { setModal({ type: "flag", product }); return; }
    if (action === "delete" && !confirm(`Delete "${product.name}"?`)) return;

    setActing(true);
    try {
      if (action === "approve") await adminApi.approveProduct(product.id);
      if (action === "delete")  await adminApi.deleteProduct(product.id);
      toast.success(`Product ${action}d`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Action failed");
    } finally { setActing(false); }
  };

  const handleFlag = async () => {
    if (!modal || !flagReason.trim()) return;
    setActing(true);
    try {
      await adminApi.flagProduct(modal.product.id, flagReason);
      toast.success("Product flagged");
      setModal(null);
      setFlagReason("");
      load();
    } catch { toast.error("Failed to flag product"); }
    finally { setActing(false); }
  };

  const flagged  = products.filter(p => p.is_flagged).length;
  const inactive = products.filter(p => !p.is_active).length;

  return (
    <div>
      <PageHeader title="Products" sub={`${products.length} total · ${flagged} flagged · ${inactive} inactive`}/>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products…"/>
        <div className="flex gap-2">
          {["all","flagged","inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f ? "bg-brand-700 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-brand-300"
              }`}>{f === "all" ? "All" : f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16"/>)}
          </div>
        ) : products.length === 0 ? (
          <Empty icon="🌿" title="No products found" sub="Try a different filter"/>
        ) : (
          <Table headers={["Product","Farmer","Price","Location","Status","Listed","Actions"]}>
            {products.map(p => <ProductRow key={p.id} product={p} onAction={handleAction}/>)}
          </Table>
        )}
      </div>

      {/* View modal */}
      {modal?.type === "view" && (
        <Modal title="Product Details" onClose={() => setModal(null)} width="max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="aspect-video bg-brand-50 rounded-2xl overflow-hidden">
              {modal.product.image
                ? <img src={modal.product.image} alt={modal.product.name} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
              }
            </div>
            <div className="space-y-3">
              {[
                ["Name",        modal.product.name],
                ["Category",    modal.product.category],
                ["Price",       `${modal.product.price?.toLocaleString()} XAF / ${modal.product.unit}`],
                ["Quantity",    `${modal.product.quantity} ${modal.product.unit}`],
                ["Location",    modal.product.location],
                ["Farmer",      modal.product.farmer?.full_name || "—"],
                ["Status",      modal.product.is_flagged ? "⚠️ Flagged" : modal.product.is_active ? "✅ Active" : "❌ Inactive"],
                ["Listed",      format(new Date(modal.product.created_at), "dd MMM yyyy")],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-semibold text-brand-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
          {modal.product.description && (
            <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{modal.product.description}</p>
          )}
          <div className="flex gap-2 mt-4">
            {modal.product.is_flagged && (
              <Btn variant="success" onClick={() => { handleAction("approve", modal.product); setModal(null); }}>
                ✅ Approve
              </Btn>
            )}
            <Btn variant="danger" onClick={() => { handleAction("delete", modal.product); setModal(null); }}>
              Delete
            </Btn>
          </div>
        </Modal>
      )}

      {/* Flag modal */}
      {modal?.type === "flag" && (
        <Modal title={`Flag: ${modal.product.name}`} onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500 mb-3">Provide a reason for flagging this product:</p>
          <textarea
            value={flagReason} onChange={e => setFlagReason(e.target.value)}
            placeholder="e.g. Misleading description, inappropriate image…"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none mb-4"
          />
          <Btn variant="warning" size="md" disabled={!flagReason.trim() || acting} onClick={handleFlag}
            className="w-full justify-center">
            {acting ? "Flagging…" : "Flag Product"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
