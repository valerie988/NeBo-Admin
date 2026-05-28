import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { adminApi } from "../services/api";
import { PageHeader, Skeleton } from "../components/ui";
import { format, subDays } from "date-fns";

const COLORS = ["#1B4332","#52B788","#B7E4C7","#2D6A4F","#95D5B2"];

function mock7Days(base: number, variance: number) {
  return Array.from({ length: 7 }, (_, i) => ({
    day:      format(subDays(new Date(), 6 - i), "EEE"),
    value:    Math.floor(Math.random() * variance + base),
    value2:   Math.floor(Math.random() * (variance / 2) + base / 2),
  }));
}

function mock30Days(base: number, variance: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    day:   format(subDays(new Date(), 29 - i), "dd MMM"),
    value: Math.floor(Math.random() * variance + base),
  }));
}

export default function AnalyticsPage() {
  const [range,   setRange]   = useState<"7d"|"30d"|"90d">("7d");
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.analytics(range)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range]);

  // Use mock data until backend is ready
  const d = data || {
    revenue:       range === "7d" ? mock7Days(200000, 300000) : mock30Days(150000, 250000),
    orders:        range === "7d" ? mock7Days(20, 40)         : mock30Days(15, 35),
    new_users:     range === "7d" ? mock7Days(5, 15)          : mock30Days(3, 12),
    farmer_signups: range === "7d" ? mock7Days(2, 6)          : mock30Days(1, 5),
    top_farmers:   [
      { name: "Nkomo Farm",       orders: 34, revenue: 1250000 },
      { name: "Mbeki Gardens",    orders: 28, revenue: 980000  },
      { name: "Fon Agric",        orders: 21, revenue: 760000  },
      { name: "Tiomela Fresh",    orders: 18, revenue: 620000  },
      { name: "Bah Produce",      orders: 15, revenue: 510000  },
    ],
    top_products:  [
      { name: "Roma Tomatoes",    orders: 89 },
      { name: "Sweet Plantains",  orders: 72 },
      { name: "Fresh Ginger",     orders: 61 },
      { name: "Garden Eggs",      orders: 48 },
      { name: "Okra",             orders: 41 },
    ],
    category_revenue: [
      { name: "Vegetables", value: 2100000 },
      { name: "Fruits",     value: 1400000 },
      { name: "Grains",     value: 850000  },
      { name: "Dairy",      value: 420000  },
      { name: "Other",      value: 180000  },
    ],
    growth: {
      users_growth:    "+18%",
      revenue_growth:  "+24%",
      orders_growth:   "+31%",
      retention_rate:  "67%",
    },
  };

  const ranges: ("7d"|"30d"|"90d")[] = ["7d","30d","90d"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        sub="Platform performance and growth metrics"
        actions={
          <div className="flex gap-2">
            {ranges.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  range === r ? "bg-brand-700 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-brand-300"
                }`}>{r}</button>
            ))}
          </div>
        }
      />

      {/* Growth KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "User Growth",     value: d.growth.users_growth,   color: "bg-green-50 border-green-200 text-green-700"   },
          { label: "Revenue Growth",  value: d.growth.revenue_growth, color: "bg-blue-50 border-blue-200 text-blue-700"     },
          { label: "Order Growth",    value: d.growth.orders_growth,  color: "bg-purple-50 border-purple-200 text-purple-700"},
          { label: "Retention Rate",  value: d.growth.retention_rate, color: "bg-amber-50 border-amber-200 text-amber-700"  },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-5 border ${color}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
            <p className="text-xs opacity-60 mt-0.5">vs previous period</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64"/>)}
        </div>
      ) : (
        <>
          {/* Revenue + Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-4">Revenue (XAF)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={d.revenue}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1B4332" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0faf4"/>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}
                    tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                  <Tooltip formatter={(v:any) => [`${v.toLocaleString()} XAF`]}/>
                  <Area type="monotone" dataKey="value" stroke="#1B4332" strokeWidth={2.5} fill="url(#rev)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-4">Orders</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d.orders} barSize={range === "7d" ? 32 : 12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0faf4"/>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <Tooltip/>
                  <Bar dataKey="value" fill="#52B788" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User growth + Category revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-4">New Users vs Farmer Signups</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={d.new_users.map((u: any, i: number) => ({
                  ...u, farmers: d.farmer_signups[i]?.value || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0faf4"/>
                  <XAxis dataKey="day" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <Tooltip/>
                  <Legend iconSize={10} wrapperStyle={{fontSize:"11px"}}/>
                  <Line type="monotone" dataKey="value"   name="All Users" stroke="#1B4332" strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="farmers" name="Farmers"   stroke="#52B788" strokeWidth={2} dot={false} strokeDasharray="4 2"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={d.category_revenue} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                    {d.category_revenue.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(v:any) => [`${(v/1000).toFixed(0)}k XAF`]}/>
                  <Legend iconSize={10} wrapperStyle={{fontSize:"11px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top farmers + top products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-4">Top Farmers</h3>
              <div className="space-y-3">
                {d.top_farmers.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-black text-gray-300 flex-shrink-0">#{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-brand-900">{f.name}</span>
                        <span className="text-brand-600 font-bold">{(f.revenue/1000).toFixed(0)}k XAF</span>
                      </div>
                      <div className="bg-brand-50 rounded-full h-1.5">
                        <div className="bg-brand-700 h-1.5 rounded-full transition-all"
                          style={{ width: `${(f.revenue / d.top_farmers[0].revenue) * 100}%` }}/>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{f.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-100">
              <h3 className="font-bold text-brand-900 mb-4">Top Products</h3>
              <div className="space-y-3">
                {d.top_products.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-black text-gray-300 flex-shrink-0">#{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-brand-900">{p.name}</span>
                        <span className="text-brand-600 font-bold">{p.orders} orders</span>
                      </div>
                      <div className="bg-brand-50 rounded-full h-1.5">
                        <div className="bg-brand-400 h-1.5 rounded-full"
                          style={{ width: `${(p.orders / d.top_products[0].orders) * 100}%` }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
