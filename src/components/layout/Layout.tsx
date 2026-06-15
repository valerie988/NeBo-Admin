import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShoppingBasket, ClipboardList,
  MessageSquare, Bell, BarChart3, LogOut, Sprout, Menu, X, Shield,
} from "lucide-react";
import { useState } from "react";
import { useAdminStore } from "../../store/authStore";
import clsx from "clsx";
import logoImg from "../../assets/images/logo.png";

const nav = [
  { to: "/",             icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/users",        icon: Users,           label: "Users"         },
  { to: "/products",     icon: ShoppingBasket,  label: "Products"      },
  { to: "/orders",       icon: ClipboardList,   label: "Orders"        },
  { to: "/chat",         icon: MessageSquare,   label: "Chat Monitor"  },
  { to: "/notifications",icon: Bell,            label: "Notifications" },
  { to: "/analytics",    icon: BarChart3,       label: "Analytics"     },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { admin, logout } = useAdminStore();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
         <img
            src={logoImg}
            alt="NeBo Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <p className="font-black text-white text-base leading-tight">NeBo</p>
          <p className="text-brand-400 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"} onClick={onNav}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive ? "bg-white/20 text-white" : "text-brand-200 hover:bg-white/10 hover:text-white"
            )}>
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>

      {/* Admin profile */}
      <div className="border-t border-white/10 p-3 mt-2">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-brand-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{admin?.full_name || "Admin"}</p>
            <p className="text-brand-400 text-[10px] truncate">{admin?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-brand-200 hover:bg-white/10 hover:text-white transition-all text-sm">
          <LogOut size={16} />Logout
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-brand-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative z-10 w-56 bg-brand-700 h-full flex flex-col">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-brand-100">
          <button onClick={() => setOpen(true)} className="text-brand-700"><Menu size={22} /></button>
          <span className="font-black text-brand-700">NeBo Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
