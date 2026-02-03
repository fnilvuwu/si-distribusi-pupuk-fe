interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: keyof typeof variants;
  className?: string;
  icon?: React.ComponentType<{ size: number }>;
  disabled?: boolean;
  size?: keyof typeof sizes;
}

const variants = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-emerald-600 hover:bg-emerald-50",
  outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled = false,
  size = "md",
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 18} />}
      {children}
    </button>
  );
};
