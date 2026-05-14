import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Avatar } from "../ui/index";

const navItems = [
  { path: "/home", label: "Home", icon: "🏠" },
  { path: "/audience", label: "Audience", icon: "👥" },
  { path: "/templates", label: "Templates", icon: "📄" },
  { path: "/campaigns", label: "Campaigns", icon: "📧" },
  { path: "/connections", label: "Connections", icon: "🔌" },
  { path: "/users", label: "Users", icon: "👤" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            M
          </div>
          {!collapsed && (
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              MailFlow
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded"
            title="Collapse sidebar"
          >
            ◀
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded"
            title="Expand sidebar"
          >
            ▶
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border-l-2 border-indigo-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-1 ${collapsed ? "justify-center" : ""}`}
          title="Toggle theme"
        >
          <span>{dark ? "🌙" : "☀️"}</span>
          {!collapsed && <span>{dark ? "Dark Mode" : "Light Mode"}</span>}
        </button>

        {/* User */}
        {user && (
          <div className={`flex items-center gap-2 px-2 py-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
            <Avatar name={user.name} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1 ${collapsed ? "justify-center" : ""}`}
          title="Logout"
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}   