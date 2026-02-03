interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    status: keyof typeof styles;
}

const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    terverifikasi: "bg-blue-100 text-blue-800 border-blue-200",
    dikirim: "bg-purple-100 text-purple-800 border-purple-200",
    selesai: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    dijadwalkan: "bg-indigo-100 text-indigo-800 border-indigo-200"
};

export const Badge = ({ children, status, className, ...props }: BadgeProps) => {
    return (
        <span 
            {...props}
            className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium border uppercase tracking-wider ${styles[status] || styles.pending} ${className || ""}`}
        >
            {children}
        </span>
    );
};