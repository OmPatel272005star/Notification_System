import { UserTableRow } from "./UserTableRow";

const HEADERS = ["User", "Email", "Status", "Role", ""];

export function UserTable({
  filtered,
  loading,
  error,
  search,
  onEdit,
  onDelete,
  onToggleBlock,
  onRetry,
}) {
  return (
    <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl">
      <table className="min-w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
          <tr>
            {HEADERS.map((h, i, arr) => (
              <th
                key={h || `col-${i}`}
                className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  i === 0             ? "rounded-tl-xl" :
                  i === arr.length - 1 ? "rounded-tr-xl" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                Loading users…
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-sm text-red-400">
                {error}{" "}
                <button onClick={onRetry} className="underline text-[#6D5EF5] ml-1">
                  Retry
                </button>
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                {search
                  ? "No users match your search."
                  : "No users yet. Add one to get started."}
              </td>
            </tr>
          ) : (
            filtered.map((u) => (
              <UserTableRow
                key={u.id}
                user={u}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleBlock={onToggleBlock}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
