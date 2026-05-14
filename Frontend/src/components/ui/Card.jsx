export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}
