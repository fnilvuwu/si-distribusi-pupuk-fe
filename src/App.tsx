import { logout } from "@/api/auth";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { navigation } from "@/config/navigation";
import { AdminRoutes } from "@/pages/admin";
import { LoginRoutes } from "@/pages/auth";
import { DistributorRoutes } from "@/pages/distributor";
import { PetaniRoutes } from "@/pages/petani";
import { SuperAdminRoutes } from "@/pages/superadmin";
import { useState } from "react";

export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [statusVerifikasi, setStatusVerifikasi] =
    useState<"pending" | "verified" | "rejected">("verified");

  const handleLogout = async () => {
    // Call logout API
    await logout();

    // Clear all stored authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");

    // Reset state
    setRole(null);
    setActiveTab("dashboard");
  };

  if (!role) {
    return (
      <LoginRoutes
        activeTab={activeTab || "login-petani"}
        setRole={setRole}
        setActiveTab={setActiveTab}
        setStatusVerifikasi={setStatusVerifikasi}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={role}
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          role={role}
          activeTab={activeTab}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {role === "petani" && (
            <PetaniRoutes
              activeTab={activeTab}
              statusVerifikasi={statusVerifikasi}
              setStatusVerifikasi={setStatusVerifikasi}
            />
          )}

          {role === "admin" && <AdminRoutes activeTab={activeTab} />}
          {role === "distributor" && <DistributorRoutes activeTab={activeTab} />}
          {role === "super_admin" && <SuperAdminRoutes activeTab={activeTab} />}
        </div>

        <footer className="hidden md:block py-4 px-8 text-center text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
          &copy; 2026 Pemerintah Kabupaten Mamasa • Sistem Informasi Distribusi Pupuk Gratis
        </footer>
      </main>
    </div>
  );
}
