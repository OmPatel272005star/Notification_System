import { ROLE_STYLE, ROLE_LABEL } from "./userConstants";
import { UserRowMenu } from "./UserRowMenu";

export function UserTableRow({ user, onEdit, onDelete, onToggleBlock }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">

      {/* User */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {user.initials}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
            {user.name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            user.status === "active"  ? "text-emerald-600 dark:text-emerald-400" :
            user.status === "blocked" ? "text-red-500 dark:text-red-400" :
            "text-gray-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user.status === "active"  ? "bg-emerald-500" :
              user.status === "blocked" ? "bg-red-500" :
              "bg-gray-400"
            }`}
          />
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      </td>

      {/* Role */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            ROLE_STYLE[user.role] || ROLE_STYLE.viewer
          }`}
        >
          {ROLE_LABEL[user.role] || user.role}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <UserRowMenu
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleBlock={onToggleBlock}
        />
      </td>
    </tr>
  );
}
