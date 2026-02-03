import Dashboard from "./Dashboard";
import Users from "./Users";

export function SuperAdminRoutes({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard />;
    case "users":
      return <Users />;
    default:
      return <Dashboard />;
  }
}
