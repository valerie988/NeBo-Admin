import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate    = useNavigate();
  const { login }   = useAdminStore();
  const [email,     setEmail]    = useState("");
  const [password,  setPassword] = useState("");
  const [showPw,    setShowPw]   = useState(false);
  const [loading,   setLoading]  = useState(false);

 const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      // Extract the string message regardless of whether detail is an array or a string
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
      toast.error(msg || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <Shield size={32} className="text-brand-700" />
          </div>
          <div className="text-center text-white">
            <p className="text-2xl font-black">NeBo Admin</p>
            <p className="text-brand-300 text-sm mt-0.5">Management Dashboard</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <h2 className="text-xl font-black text-brand-900 mb-1">Sign in</h2>
          <p className="text-gray-400 text-sm mb-6">Admin access only</p>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@nebo.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-600 transition-colors disabled:opacity-60 mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
