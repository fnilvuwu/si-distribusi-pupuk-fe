import Home from "./Home";
import Pengajuan from "./Pengajuan";
import Jadwal from "./Jadwal";
import Laporan from "./Laporan";

interface Props {
  activeTab: string;
  statusVerifikasi: "pending" | "verified" | "rejected";
  setStatusVerifikasi: (v: "pending" | "verified" | "rejected") => void;
}

export function PetaniRoutes({ activeTab, statusVerifikasi }: Props) {
  switch (activeTab) {
    case "home":
      return <Home statusVerifikasi={statusVerifikasi} />;
    case "pengajuan":
      return <Pengajuan statusVerifikasi={statusVerifikasi} />;
    case "jadwal":
      return <Jadwal statusVerifikasi={statusVerifikasi} />;
    case "laporan": // Tab baru
      return <Laporan statusVerifikasi={statusVerifikasi} />;
    default:
      return <Home statusVerifikasi={statusVerifikasi} />;
  }
}
