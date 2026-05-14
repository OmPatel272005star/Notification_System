export function Table({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key] || "—"}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
