import { useState } from "react";
import { 
  Bell, Users, User, ShoppingBasket, Send, Sprout, 
  ShoppingBag, UserCircle, PartyPopper 
} from "lucide-react";
import { adminApi } from "../services/api";
import { PageHeader, Btn } from "../components/ui";
import toast from "react-hot-toast";

const TEMPLATES = [
  { title: "Welcome to NeBo!",        body: "Discover fresh produce from local farmers near you. Start exploring today! ",                    icon: Sprout,       iconColor: "text-green-600" },
  { title: "New products available",  body: "Fresh produce just listed in your area. Check out the latest listings now.",                       icon: ShoppingBag,  iconColor: "text-brand-600" },
  { title: "Complete your profile",   body: "Add your location and photo to get personalised recommendations.",                                 icon: UserCircle,   iconColor: "text-blue-500" },
  { title: "Farmers: List your crops",body: "Reach hundreds of customers in your area. Add your first product listing today!",                  icon: Sprout,     iconColor: "text-emerald-600" },
  { title: "Weekend market special",  body: "Fresh picks from local farms available this weekend. Order now for delivery!",                     icon: PartyPopper,  iconColor: "text-amber-500" },
];

export default function NotificationsPage() {
  const [title,    setTitle]    = useState("");
  const [body,     setBody]     = useState("");
  const [target,   setTarget]   = useState<"all"|"farmers"|"customers">("all");
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState<any[]>([]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (!confirm(`Send "${title}" to all ${target}?`)) return;

    setSending(true);
    try {
      const { data } = await adminApi.sendPush({ title, body, target });
      toast.success(`Notification sent to ${data.sent_count || 0} users`);
      setSent(prev => [{
        id:       Date.now(),
        title,
        body,
        target,
        sent_at:  new Date().toISOString(),
        count:    data.sent_count || 0,
      }, ...prev.slice(0, 9)]);
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTitle(t.title);
    setBody(t.body);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" sub="Send push notifications to users"/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Compose panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
            <h2 className="font-black text-brand-900 mb-5 flex items-center gap-2">
              <Bell size={18}/> Compose Notification
            </h2>

            {/* Target audience */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Send To
              </label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "all",       label: "Everyone",  icon: Users,          color: "brand"  },
                  { key: "farmers",   label: "Farmers",   icon: ShoppingBasket, color: "green"  },
                  { key: "customers", label: "Customers", icon: User,           color: "blue"   },
                ] as const).map(({ key, label, icon: Icon, color }) => (
                  <button key={key} onClick={() => setTarget(key as any)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      target === key
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-brand-200"
                    }`}>
                    <Icon size={18}/>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Notification Title *
              </label>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Fresh produce available!"
                maxLength={65}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/65</p>
            </div>

            {/* Body */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Message *
              </label>
              <textarea
                value={body} onChange={e => setBody(e.target.value)}
                placeholder="Write your notification message here…"
                rows={4} maxLength={178}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/178</p>
            </div>

            {/* Preview */}
            {(title || body) && (
              <div className="mb-5 bg-gray-900 rounded-2xl p-4">
                <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">Preview</p>
                <div className="bg-white/10 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-900 text-sm font-black">N</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{title || "Notification title"}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{body || "Message body"}</p>
                  </div>
                </div>
              </div>
            )}

            <Btn
              variant="primary" size="lg"
              disabled={!title.trim() || !body.trim() || sending}
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending…</>
              ) : (
                <><Send size={16}/> Send Notification</>
              )}
            </Btn>
          </div>
        </div>

        {/* Templates + history */}
        <div className="space-y-5">
          {/* Templates */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
            <h3 className="font-bold text-brand-900 mb-3 text-sm">Quick Templates</h3>
            <div className="space-y-2">
              {TEMPLATES.map((t, i) => {
                const TemplateIcon = t.icon;
                return (
                  <button key={i} onClick={() => applyTemplate(t)}
                    className="w-full text-left p-3 rounded-xl hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100">
                    <div className="flex items-start gap-3">
                      <TemplateIcon size={18} className={`${t.iconColor} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-xs font-bold text-brand-900">{t.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{t.body}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent sent */}
          {sent.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-3 text-sm">Recently Sent</h3>
              <div className="space-y-3">
                {sent.map(s => (
                  <div key={s.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-brand-900">{s.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{s.body}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400 capitalize">{s.target}</span>
                      <span className="text-[10px] text-green-600 font-semibold">{s.count} sent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}