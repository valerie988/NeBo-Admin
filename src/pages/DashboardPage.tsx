import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, ShoppingBasket, ClipboardList, TrendingUp, UserCheck, AlertCircle } from "lucide-react";
import { adminApi } from "../services/api";
import { StatCard, Skeleton } from "../components/ui";
import { format } from "date-fns";

const COLORS = ["#1B4332","#52B788","#B7E4C7","#D8F3DC","#F0FAF4"];

export default function DashboardPage() {
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );

  // Fallback mock data if backend not yet set up
  const s = stats || {
    total_users: 142, total_farmers: 38, total_customers: 104,
    total_products: 87, total_orders: 213, total_revenue: 4850000,
    pending_verifications: 7, flagged_products: 3,
    revenue_trend: Array.from({length:7},(_,i)=>({
      day: format(new Date(Date.now()-((6-i)*86400000)),"EEE"),
      revenue: Math.floor(Math.random()*500000+100000),
      orders: Math.floor(Math.random()*30+5),
    })),
    orders_by_status: [
      {name:"Processing",value:45},
      {name:"Confirmed",value:62},
      {name:"In Transit",value:38},
      {name:"Delivered",value:58},
      {name:"Cancelled",value:10},
    ],
    top_categories: [
      {name:"Vegetables",count:34},
      {name:"Fruits",count:22},
      {name:"Grains",count:15},
      {name:"Dairy",count:9},
      {name:"Other",count:7},
    ],
    recent_orders: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">NeBo platform overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Users"    value={s.total_users}    sub={`${s.total_farmers} farmers · ${s.total_customers} customers`} color="bg-brand-700"/>
        <StatCard icon={ShoppingBasket} label="Products"      value={s.total_products} sub="Active listings"           color="bg-blue-500"/>
        <StatCard icon={ClipboardList} label="Orders"         value={s.total_orders}   sub="All time"                  color="bg-amber-500"/>
        <StatCard icon={TrendingUp}    label="Revenue"        value={`${(s.total_revenue/1000).toFixed(0)}k XAF`} sub="Total processed" color="bg-purple-500"/>
      </div>

      {/* Alert cards */}
      {(s.pending_verifications > 0 || s.flagged_products > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {s.pending_verifications > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <UserCheck size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-800 text-sm">{s.pending_verifications} farmers pending verification</p>
                <p className="text-amber-600 text-xs mt-0.5">Review and approve their documents</p>
              </div>
              <a href="/users?filter=pending" className="ml-auto text-xs font-bold text-amber-600 hover:underline whitespace-nowrap">
                Review →
              </a>
            </div>
          )}
          {s.flagged_products > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-700 text-sm">{s.flagged_products} flagged products</p>
                <p className="text-red-500 text-xs mt-0.5">Require moderation action</p>
              </div>
              <a href="/products?filter=flagged" className="ml-auto text-xs font-bold text-red-500 hover:underline whitespace-nowrap">
                Review →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
          <h3 className="font-bold text-brand-900 mb-1">Revenue & Orders (7 days)</h3>
          <p className="text-xs text-gray-400 mb-4">XAF</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={s.revenue_trend}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B4332" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0faf4"/>
              <XAxis dataKey="day" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}
                tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v:any,n:string)=>[n==="revenue"?`${v.toLocaleString()} XAF`:v, n==="revenue"?"Revenue":"Orders"]}/>
              <Area type="monotone" dataKey="revenue" stroke="#1B4332" strokeWidth={2.5} fill="url(#rev)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
          <h3 className="font-bold text-brand-900 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={s.orders_by_status} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                {s.orders_by_status.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip/>
              <Legend iconSize={10} wrapperStyle={{fontSize:"11px"}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top categories */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
          <h3 className="font-bold text-brand-900 mb-4">Top Product Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={s.top_categories} barSize={32} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0faf4" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={70}/>
              <Tooltip/>
              <Bar dataKey="count" fill="#1B4332" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
          <h3 className="font-bold text-brand-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:"Verify Farmers",   href:"/users?filter=pending",  icon:"✅", color:"bg-green-50 border-green-200 text-green-700"},
              {label:"Review Products",  href:"/products?filter=flagged",icon:"🚩", color:"bg-red-50 border-red-200 text-red-600"},
              {label:"Send Notification",href:"/notifications",          icon:"📣", color:"bg-blue-50 border-blue-200 text-blue-600"},
              {label:"View Analytics",   href:"/analytics",              icon:"📊", color:"bg-purple-50 border-purple-200 text-purple-600"},
            ].map(({label,href,icon,color})=>(
              <a key={label} href={href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${color} hover:opacity-80 transition-opacity`}>
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-semibold text-center">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
