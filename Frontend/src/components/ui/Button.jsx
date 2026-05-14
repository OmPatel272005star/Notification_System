export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  onClick,
  type = "button",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  const variants = {
    primary:
      "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] hover:shadow-lg text-white focus:ring-indigo-500",
    secondary:
      "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-gray-400",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
