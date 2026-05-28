import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { PageHeader, SearchInput, Badge, Table, Tr, Td, Btn, Modal, Empty, Skeleton } from "../components/ui";
import { format } from "date-fns";
import clsx from "clsx";

const STATUS_COLOR: Record<string,string> = {
  processing: "amber", confirmed: "blue", in_transit: "purple", delivered: "green", cancelled: "red",
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("all");
  const [modal,   setModal]   = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search)          params.search = search;
      if (status !== "all") params.status = status;
      const { data } = await adminApi.orders(params);
      setOrders(data);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, status]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

  const tabs = ["all","processing","confirmed","in_transit","delivered","cancelled"];

  return (
    <div>
      <PageHeader
        title="Orders"
        sub={`${orders.length} orders · ${totalRevenue.toLocaleString()} XAF total`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by order ID or customer…"/>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setStatus(t)}
              className={clsx(
                "px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all",
                status === t ? "bg-brand-700 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-brand-300"
              )}>{t.replace("_"," ")}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i=><Skeleton key={i} className="h-14"/>)}</div>
        ) : orders.length === 0 ? (
          <Empty icon="📦" title="No orders found"/>
        ) : (
          <Table headers={["Order ID","Customer","Farmer","Items","Total","Status","Date",""]}>
            {orders.map(o => (
              <Tr key={o.id}>
                <Td><span className="font-mono text-xs text-gray-500">{o.id.slice(0,8)}…</span></Td>
                <Td>
                  <p className="text-sm font-medium text-brand-900">{o.customer?.full_name || "—"}</p>
                  <p className="text-xs text-gray-400">{o.customer?.phone || ""}</p>
                </Td>
                <Td><p className="text-sm text-gray-600">{o.farmer?.full_name || "—"}</p></Td>
                <Td><span className="text-sm text-gray-600">{o.items?.length || 0} item(s)</span></Td>
                <Td><span className="font-bold text-brand-700 text-sm">{o.total_amount?.toLocaleString()} XAF</span></Td>
                <Td><Badge color={STATUS_COLOR[o.status] || "gray"}>{o.status?.replace("_"," ")}</Badge></Td>
                <Td className="text-xs text-gray-400">{format(new Date(o.created_at),"dd MMM yyyy")}</Td>
                <Td>
                  <Btn variant="ghost" size="xs" onClick={() => setModal(o)}>View</Btn>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>

      {modal && (
        <Modal title={`Order #${modal.id.slice(0,8)}`} onClose={() => setModal(null)} width="max-w-xl">
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <Badge color={STATUS_COLOR[modal.status] || "gray"}>{modal.status?.replace("_"," ")}</Badge>
            </div>
            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Customer</p>
                <p className="font-semibold text-sm text-brand-900">{modal.customer?.full_name || "—"}</p>
                <p className="text-xs text-gray-400">{modal.customer?.phone || ""}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Farmer</p>
                <p className="font-semibold text-sm text-brand-900">{modal.farmer?.full_name || "—"}</p>
                <p className="text-xs text-gray-400">{modal.farmer?.phone || ""}</p>
              </div>
            </div>
            {/* Items */}
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Items</p>
              <div className="space-y-2">
                {(modal.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-50">
                        {item.product?.image
                          ? <img src={item.product.image} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>
                        }
                      </div>
                      <span className="font-medium text-brand-900">{item.product?.name || "Product"}</span>
                      <span className="text-gray-400">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-brand-700">{(item.unit_price * item.quantity).toLocaleString()} XAF</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Total */}
            <div className="flex justify-between font-black text-brand-900 border-t border-gray-100 pt-3">
              <span>Total</span>
              <span>{modal.total_amount?.toLocaleString()} XAF</span>
            </div>
            {modal.delivery_address && (
              <p className="text-xs text-gray-400">📍 {modal.delivery_address}</p>
            )}
            {modal.notes && (
              <p className="text-xs text-gray-400 italic">"{modal.notes}"</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
