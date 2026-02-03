interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    footer?: React.ReactNode;
}

export const Card = ({ children, className = "", title, subtitle, footer }: CardProps) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
        {title && (
            <div className="px-6 py-4 border-b bg-gray-50/50">
                <h3 className="font-bold text-gray-700">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 font-normal mt-0.5">{subtitle}</p>}
            </div>
        )}
        <div className="p-6 flex-1">{children}</div>
        {footer && <div className="px-6 py-3 bg-gray-50 border-t">{footer}</div>}
    </div>
);