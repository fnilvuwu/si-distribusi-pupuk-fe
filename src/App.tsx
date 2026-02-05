import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { logout } from "@/api/auth";

// Auth Pages
import LoginPetani from "@/pages/auth/LoginPetani";
import RegisterPetani from "@/pages/auth/RegisterPetani";
import LoginRole from "@/pages/auth/LoginRole";

// Layout
import DashboardLayout from "@/components/layout/DashboardLayout";

// Petani Pages
import PetaniHome from "@/pages/petani/Home";
import PetaniPengajuan from "@/pages/petani/Pengajuan";
import PetaniJadwal from "@/pages/petani/Jadwal";
import PetaniLaporan from "@/pages/petani/Laporan";

// Admin Pages
import AdminHome from "@/pages/admin/Home";
import AdminVerifikasi from "@/pages/admin/Verifikasi";
import AdminPermohonan from "@/pages/admin/Permohonan"; // Persetujuan
import AdminAdminJadwal from "@/pages/admin/Jadwal"; // Distribusi
import AdminStok from "@/pages/admin/Stok";
import AdminLaporan from "@/pages/admin/Laporan";

// Distributor Pages
import DistributorDashboard from "@/pages/distributor/Dashboard";
import DistributorRiwayat from "@/pages/distributor/Riwayat";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import SuperAdminUsers from "@/pages/superadmin/Users";

export default function App() {
  const [role, setRole] = useState<string | null>(() => {
    return localStorage.getItem("role");
  });

  const [statusVerifikasi, setStatusVerifikasi] = useState<"pending" | "verified" | "rejected">(() => {
    const stored = localStorage.getItem("status_verifikasi");
    return (stored as "pending" | "verified" | "rejected") || "verified";
  });

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    localStorage.removeItem("status_verifikasi");
    setRole(null);
  };

  // Wrapper to update role state
  const handleSetRole = (newRole: string) => {
    setRole(newRole);
  };

  const handleSetStatusVerifikasi = (status: "pending" | "verified" | "rejected") => {
      setStatusVerifikasi(status);
      localStorage.setItem("status_verifikasi", status);
  }


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to={role ? `/${role === 'super_admin' ? 'superadmin' : role}` : "/login"} replace />} />
      
      <Route path="/login" element={!role ? <LoginPetani setRole={handleSetRole} /> : <Navigate to={`/${role === 'super_admin' ? 'superadmin' : role}`} replace />} />
      <Route path="/login/role" element={!role ? <LoginRole setRole={handleSetRole} /> : <Navigate to={`/${role === 'super_admin' ? 'superadmin' : role}`} replace />} />
      <Route path="/register" element={!role ? <RegisterPetani setRole={handleSetRole} setStatusVerifikasi={handleSetStatusVerifikasi} /> : <Navigate to={`/${role === 'super_admin' ? 'superadmin' : role}`} replace />} />

      {/* Protected Routes */}
      <Route element={<DashboardLayout role={role} onLogout={handleLogout} />}>
        
        {/* Petani Routes */}
        <Route path="/petani">
            <Route index element={<PetaniHome statusVerifikasi={statusVerifikasi} />} />
            <Route path="pengajuan" element={<PetaniPengajuan statusVerifikasi={statusVerifikasi} />} />
            <Route path="pengambilan" element={<PetaniJadwal statusVerifikasi={statusVerifikasi} />} />
            <Route path="laporan" element={<PetaniLaporan statusVerifikasi={statusVerifikasi} />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
            <Route index element={<AdminHome />} />
            <Route path="verifikasi" element={<AdminVerifikasi />} />
            <Route path="persetujuan" element={<AdminPermohonan />} />
            <Route path="jadwal" element={<AdminAdminJadwal />} />
            <Route path="stok" element={<AdminStok />} />
            <Route path="laporan" element={<AdminLaporan />} />
        </Route>

        {/* Distributor Routes */}
        <Route path="/distributor">
            <Route index element={<DistributorDashboard />} />
            <Route path="riwayat" element={<DistributorRiwayat />} />
        </Route>

        {/* Super Admin Routes */}
        <Route path="/superadmin">
            <Route index element={<SuperAdminDashboard />} />
            <Route path="users" element={<SuperAdminUsers />} />
        </Route>

      </Route>

      {/* Catch all */}
       <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}