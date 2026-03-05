"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, setAccessToken } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSeen?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name:string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ---------------- RESTORE SESSION ---------------- */

  useEffect(() => {
    async function restore() {
      try {
        const token = await api.refreshToken();
        setAccessToken(token);

        const me = await api.get("/me");
        setUser(me);
      } catch {
        setUser(null);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  /* ---------------- LOGIN ---------------- */

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    setAccessToken(res.accessToken);

    const me = await api.get("/me");
    setUser(me);

    router.push("/");
  };

  /* ---------------- REGISTER ---------------- */

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    await api.post("/auth/register", {
      name,
      email,
      password,
    });

    router.push("/login");
    // Auto login after register
    // await login(email, password);
  };

  /* ---------------- LOGOUT ---------------- */

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {}

    setAccessToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          Restoring session...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}