import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  path?: string; // Add path
}

interface SidebarProps {
  role: string;
  navigation: Record<string, NavItem[]>;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  role,
  navigation,
  isSidebarOpen,
  setSidebarOpen,
  onLogout
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:w-20"}
        fixed md:relative z-50 h-full bg-white border-r transition-all duration-300 w-64 flex flex-col shadow-xl md:shadow-none
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b flex items-center gap-3 bg-emerald-700 text-white md:bg-white md:text-emerald-700">
        <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
          <img
            src="/logo_mamasa.png"
            alt="Pemerintah Mamasa Logo"
            className="h-full w-full object-contain"
          />
        </div>
        {isSidebarOpen && (
          <span className="font-black text-2xl tracking-tighter">SIPUPUK</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {navigation[role]?.map((item) => {
          const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname === '/' + role);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                }
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 p-3 rounded-xl transition-all
                ${isActive
                  ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                }
              `}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
        >
          <LogOut size={20} />
          {isSidebarOpen && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
