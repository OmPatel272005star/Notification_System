export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
