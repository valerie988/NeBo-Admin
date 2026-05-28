import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../services/api";

interface Admin { id: string; full_name: string; email: string; role: string; }

interface AuthState {
  admin:       Admin | null;
  token:       string | null;
  login:       (email: string, password: string) => Promise<void>;
  logout:      () => void;
}

export const useAdminStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,

      login: async (email, password) => {
        const { data } = await authApi.login(email, password);
        if (data.role !== "admin") throw new Error("Not an admin account");
        localStorage.setItem("admin_token", data.access_token);
        set({ token: data.access_token });
        // Load profile
        const { default: api } = await import("../services/api");
        const me = await api.get("/api/users/me");
        set({ admin: me.data });
      },

      logout: () => {
        localStorage.removeItem("admin_token");
        set({ admin: null, token: null });
      },
    }),
    { name: "nebo-admin-auth", partialize: (s) => ({ token: s.token }) }
  )
);
