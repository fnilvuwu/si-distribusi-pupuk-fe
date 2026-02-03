import { login } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface LoginPetaniProps {
  setRole: (role: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function LoginRole({ setRole, setActiveTab }: LoginPetaniProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("NIK/Username dan Password harus diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await login({ username, password });

      // Validate that the user is admin, distributor, or super_admin (not petani)
      const allowedRoles = ["admin", "distributor", "super_admin"];
      if (!allowedRoles.includes(response.role)) {
        setError("Halaman ini hanya untuk Admin, Distributor, dan Super Admin. Silakan gunakan halaman login petani.");
        return;
      }

      // Store token and user info
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("role", response.role);
      if (response.full_name) {
        localStorage.setItem("full_name", response.full_name);
      }

      // Set role and navigate
      setRole(response.role);
      // Set the correct initial tab based on role
      const initialTab = response.role === "super_admin" || response.role === "distributor" ? "dashboard" : "home";
      setActiveTab(initialTab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">

        {/* Header */}
        <div className="bg-emerald-700 p-10 text-white text-center">
          <h1 className="text-4xl font-black tracking-tighter italic">SIPUPUK</h1>
          <p className="text-emerald-100 mt-1 text-sm font-medium mb-3">
            Sistem Informasi Distribusi Pupuk Gratis
          </p>

          <div className="flex justify-center">
            <img src="/logo_mamasa.png" className="h-24 w-24 object-contain" />
          </div>

          <div className="mt-3 text-[10px] uppercase tracking-widest bg-emerald-800 inline-block px-3 py-1 rounded-full font-bold">
            Kabupaten Mamasa
          </div>
        </div>

        {/* Login */}
        <div className="p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 text-center">
            Login Admin / Distributor
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <input
            placeholder="NIK / Username"
            className="w-full border-2 rounded-xl p-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border-2 rounded-xl p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={isLoading}
          />

          <Button
            className="w-full py-3"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk sebagai Admin / Distributor"}
          </Button>

          <div className="pt-4 border-t flex justify-center">
            <button
              onClick={() => setActiveTab("login-petani")}
              className="text-xs font-bold text-gray-500 hover:text-emerald-600"
            >
              Login sebagai Petani
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
