import Home from "./Home";
import Jadwal from "./Jadwal";
import Laporan from "./Laporan";
import Permohonan from "./Permohonan";
import Stok from "./Stok";
import Verifikasi from "./Verifikasi";

export function AdminRoutes({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "home":
      return <Home />;
    case "verifikasi":
      return <Verifikasi />;
    case "permohonan":
      return <Permohonan />;
    case "jadwal":
      return <Jadwal />;
    case "stok":
      return <Stok />;
    case "laporan":
      return <Laporan />;
    default:
      return <Home />;
  }
}