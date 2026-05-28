import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { PageHeader, SearchInput, Table, Tr, Td, Btn, Modal, Avatar, Empty, Skeleton } from "../components/ui";
import { format } from "date-fns";

export default function ChatPage() {
  const [convos,  setConvos]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<any>(null);
  const [messages,setMessages]= useState<any[]>([]);
  const [loadMsg, setLoadMsg] = useState(false);

  useEffect(() => {
    adminApi.conversations({ search })
      .then(r => setConvos(r.data || []))
      .catch(() => setConvos([]))
      .finally(() => setLoading(false));
  }, [search]);

  const openConvo = async (convo: any) => {
    setModal(convo);
    setLoadMsg(true);
    try {
      const { data } = await adminApi.messages(convo.id);
      setMessages(data || []);
    } catch { setMessages([]); }
    finally { setLoadMsg(false); }
  };

  return (
    <div>
      <PageHeader title="Chat Monitor" sub="View all conversations on the platform"/>

      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search conversations…"/>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3,4].map(i=><Skeleton key={i} className="h-16"/>)}</div>
        ) : convos.length === 0 ? (
          <Empty icon="💬" title="No conversations yet"/>
        ) : (
          <Table headers={["Participants","Last Message","Messages","Date",""]}>
            {convos.map(c => (
              <Tr key={c.id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={c.participant_one_name || "User"} size="sm"/>
                    <span className="text-xs text-gray-400">↔</span>
                    <Avatar name={c.participant_two_name || "User"} size="sm"/>
                    <div className="ml-1">
                      <p className="text-xs font-semibold text-brand-900">{c.participant_one_name || c.participant_one.slice(0,8)}</p>
                      <p className="text-xs text-gray-400">{c.participant_two_name || c.participant_two.slice(0,8)}</p>
                    </div>
                  </div>
                </Td>
                <Td><p className="text-xs text-gray-600 max-w-48 truncate">{c.last_message || "—"}</p></Td>
                <Td><span className="text-sm font-semibold text-brand-900">{c.message_count || 0}</span></Td>
                <Td className="text-xs text-gray-400">{format(new Date(c.updated_at), "dd MMM yyyy · HH:mm")}</Td>
                <Td><Btn variant="ghost" size="xs" onClick={() => openConvo(c)}>View</Btn></Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>

      {modal && (
        <Modal title="Conversation" onClose={() => { setModal(null); setMessages([]); }} width="max-w-2xl">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <Avatar name={modal.participant_one_name || "User 1"} size="md"/>
            <span className="text-gray-400">↔</span>
            <Avatar name={modal.participant_two_name || "User 2"} size="md"/>
            <div className="ml-1">
              <p className="font-semibold text-sm text-brand-900">
                {modal.participant_one_name} ↔ {modal.participant_two_name}
              </p>
              <p className="text-xs text-gray-400">{modal.message_count || 0} messages</p>
            </div>
          </div>

          {loadMsg ? (
            <div className="space-y-3">{[1,2,3].map(i=><Skeleton key={i} className="h-12"/>)}</div>
          ) : messages.length === 0 ? (
            <Empty icon="💬" title="No messages"/>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {messages.map((m: any) => {
                const isOne = m.sender_id === modal.participant_one;
                return (
                  <div key={m.id} className={`flex ${isOne ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isOne ? "bg-brand-50 text-brand-900 rounded-bl-sm" : "bg-brand-700 text-white rounded-br-sm"
                    }`}>
                      <p className={`text-[10px] font-semibold mb-1 ${isOne ? "text-brand-400" : "text-brand-300"}`}>
                        {isOne ? modal.participant_one_name : modal.participant_two_name}
                      </p>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${isOne ? "text-gray-400" : "text-brand-300"}`}>
                        {format(new Date(m.created_at), "HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
