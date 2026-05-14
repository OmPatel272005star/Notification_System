export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    danger: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function statusBadge(status) {
  const map = {
    Published: "success",
    Active: "success",
    Draft: "default",
    Approved: "info",
    Scheduled: "warning",
    Failed: "danger",
    Pending: "warning",
    "Pending Approval": "orange",
    Completed: "success",
    Deactivated: "default",
    Deleted: "danger",
    Email: "info",
    SMS: "purple",
    WhatsApp: "success",
    "Web Push": "orange",
  };
  return map[status] || "default";
}
