import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
    role: string;
    navigation: Record<string, { id: string; label: string; icon: React.ComponentType<{ size: number }> }[]>;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onLogout: () => void;
    children: React.ReactNode;
}

export default function Layout({
    role,
    navigation,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setSidebarOpen,
    onLogout,
    children
}: LayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
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
                onLogout={onLogout}
            />

            <main className="flex-1 flex flex-col min-w-0">
                <Header
                    role={role}
                    activeTab={activeTab}
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="p-4 md:p-8 flex-1 overflow-auto max-w-7xl mx-auto w-full mb-16 md:mb-0">
                    {children}
                </div>

                <footer className="hidden md:block py-4 px-8 text-center text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                    &copy; 2026 Pemerintah Kabupaten Mamasa • Sistem Informasi Distribusi Pupuk Gratis
                </footer>
            </main>
        </div>
    );
}
