import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { navigation } from "@/config/navigation";
import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
    role: string | null;
    onLogout: () => void;
}

export default function DashboardLayout({ role, onLogout }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const location = useLocation();

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    // Determine title based on current path
    // Flatten navigation for easier search
    const allNavItems = Object.values(navigation).flat();
    const currentNav = allNavItems.find(item => item.path === location.pathname);
    const activeTab = currentNav ? currentNav.label : "Dashboard"; // Fallback

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
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={onLogout}
            />

            <main className="flex-1 flex flex-col min-w-0">
                <Header
                    role={role}
                    activeTab={activeTab /* Pass title as activeTab for compatibility */}
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="flex-1 p-4 md:p-8 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
