interface HeaderProps {
  role: string;
  activeTab: string;
  isSidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({
  role,
  activeTab,
  // isSidebarOpen and setSidebarOpen are not used in this component yet
  // but are kept in the interface for future mobile menu functionality
}: HeaderProps) {
  const fullName = localStorage.getItem("full_name") || "User";
  const initials = fullName
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="font-black text-lg md:text-xl capitalize text-slate-800 tracking-tight">
          {activeTab.replace("-", " ")}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 leading-none mb-1">
            {role}
          </p>
          <p className="text-sm font-bold text-slate-700">{fullName}</p>
        </div>
        <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black border-2 border-white shadow-sm ring-1 ring-emerald-50">
          {initials}
        </div>
      </div>
    </header>
  );
}
