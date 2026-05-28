import clsx from "clsx";

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-brand-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Badge chip ────────────────────────────────────────────────────────────────
export function Badge({ children, color = "green" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green:  "bg-green-100 text-green-700",
    blue:   "bg-blue-100 text-blue-700",
    amber:  "bg-amber-100 text-amber-700",
    red:    "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-700",
    gray:   "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-brand-50">
            {headers.map(h => <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick}
      className={clsx("border-b border-brand-50 transition-colors", onClick && "cursor-pointer hover:bg-brand-50/50")}>
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx("px-4 py-3", className)}>{children}</td>;
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", size = "sm", disabled, className }: any) {
  const variants: Record<string, string> = {
    primary:   "bg-brand-700 text-white hover:bg-brand-600",
    secondary: "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50",
    danger:    "bg-red-600 text-white hover:bg-red-700",
    warning:   "bg-amber-500 text-white hover:bg-amber-600",
    success:   "bg-green-600 text-white hover:bg-green-700",
    ghost:     "text-gray-500 hover:bg-gray-100",
  };
  const sizes: Record<string, string> = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={clsx("font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant], sizes[size], className)}>
      {children}
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = "max-w-lg" }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-black text-brand-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, url, size = "sm" }: { name: string; url?: string; size?: "sm"|"md"|"lg" }) {
  const initials = (name || "?").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  const cls = size==="lg" ? "w-14 h-14 text-base" : size==="md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${cls} rounded-full overflow-hidden bg-brand-100 flex-shrink-0 flex items-center justify-center font-bold text-brand-700`}>
      {url ? <img src={url} alt={name} className="w-full h-full object-cover"/> : initials}
    </div>
  );
}

// ── Search input ──────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }: any) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full" />
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-brand-900">{title}</h1>
        {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("bg-gray-100 animate-pulse rounded-xl", className)} />;
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-5xl mb-3">{icon}</p>
      <p className="font-bold text-gray-600">{title}</p>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
