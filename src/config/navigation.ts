import {
  Calendar,
  CalendarCheck,
  CheckCircle,
  Clock,
  FileText,
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  Sprout,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

export const navigation = {
  petani: [
    { id: "home", label: "Home", icon: LayoutDashboard, path: "/petani" },
    { id: "pengajuan", label: "Pengajuan Pupuk", icon: PlusCircle, path: "/petani/pengajuan" },
    { id: "jadwal", label: "Pengambilan Pupuk", icon: CalendarCheck, path: "/petani/pengambilan" },
    { id: "laporan", label: "Hasil Tani", icon: Sprout, path: "/petani/laporan" }, // Tab Baru
  ],
  admin: [
    { id: "home", label: "Home", icon: LayoutDashboard, path: "/admin" }, // Dashboard Admin
    { id: "verifikasi", label: "Verifikasi", icon: Users, path: "/admin/verifikasi" },
    { id: "permohonan", label: "Persetujuan Pupuk", icon: CheckCircle, path: "/admin/persetujuan" },
    { id: "jadwal", label: "Distribusi Pupuk", icon: Calendar, path: "/admin/jadwal" }, // New Tab
    { id: "stok", label: "Stok Pupuk", icon: Package, path: "/admin/stok" },
    { id: "laporan", label: "Laporan Rekap", icon: FileText, path: "/admin/laporan" },
  ],
  distributor: [
    { id: "dashboard", label: "Distribusi Pupuk", icon: Truck, path: "/distributor" },
    { id: "riwayat", label: "Riwayat Selesai", icon: Clock, path: "/distributor/riwayat" },
  ],
  super_admin: [
    { id: "dashboard", label: "Monitoring Sistem", icon: TrendingUp, path: "/superadmin" },
    { id: "users", label: "Monitoring User", icon: Settings, path: "/superadmin/users" },
  ],
};
