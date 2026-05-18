import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LayoutDashboard, Users, FileText, Mail, Plug, UserCog, Settings, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Zap } from "lucide-react";

const NAV_ITEMS = [
  { path: "/home", label: "Dashboard", icon: LayoutDashboard },
  { path: "/audience", label: "Audience", icon: Users },
  { path: "/templates", label: "Templates", icon: FileText },
  { path: "/campaigns", label: "Campaigns", icon: Mail },
  { path: "/connections", label: "Connections", icon: Plug },
  { path: "/users", label: "Users", icon: UserCog },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-[#111827] border-r border-[#E4E7EC] dark:border-[#2A2F3A] flex flex-col transition-all duration-300 z-30 ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      {/* ── Logo ─────────────────────────────── */}
      <div className="flex items-center h-14 px-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#6D5EF5]/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">MailFlow</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-gradient-to-r from-[#6D5EF5]/15 to-[#8B7CFF]/10 dark:from-[#6D5EF5]/25 dark:to-[#8B7CFF]/15 text-[#6D5EF5] dark:text-[#8B7CFF]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#6D5EF5] rounded-r-full" />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-[#6D5EF5] dark:text-[#8B7CFF]" : ""}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────── */}
      <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A] p-2 flex-shrink-0 space-y-0.5">
        {/* Settings */}
        {/* <button
          onClick={() => {}}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button> */}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? (dark ? "Light mode" : "Dark mode") : undefined}
        >
          {dark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* User + logout */}
        {user && (
          <div className={`flex items-center gap-2 px-2 py-2 mt-1 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate leading-none">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5 leading-none">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
