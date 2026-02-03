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
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "pengajuan", label: "Pengajuan Pupuk", icon: PlusCircle },
    { id: "jadwal", label: "Pengambilan Pupuk", icon: CalendarCheck },
    { id: "laporan", label: "Hasil Tani", icon: Sprout }, // Tab Baru
  ],
  admin: [
    { id: "home", label: "Home", icon: LayoutDashboard }, // Dashboard Admin
    { id: "verifikasi", label: "Verifikasi", icon: Users },
    { id: "permohonan", label: "Persetujuan Pupuk", icon: CheckCircle },
    { id: "jadwal", label: "Distribusi Pupuk", icon: Calendar }, // New Tab
    { id: "stok", label: "Stok Pupuk", icon: Package },
    { id: "laporan", label: "Laporan Rekap", icon: FileText },
  ],
  distributor: [
    { id: "dashboard", label: "Distribusi Pupuk", icon: Truck },
    { id: "riwayat", label: "Riwayat Selesai", icon: Clock },
  ],
  super_admin: [
    { id: "dashboard", label: "Monitoring Sistem", icon: TrendingUp },
    { id: "users", label: "Monitoring User", icon: Settings },
  ],
};
