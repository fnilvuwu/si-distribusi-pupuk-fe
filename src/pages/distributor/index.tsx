import Dashboard from "./Dashboard";
import Riwayat from "./Riwayat";

export function DistributorRoutes({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard />;
    case "riwayat":
      return <Riwayat />;
    default:
      return <Dashboard />;
  }
}
