import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Avatar } from "../ui/index";

const pageTitles = {
  "/home": "Home",
  "/audience": "Audience",
  "/templates": "Templates",
  "/campaigns": "Campaigns",
  "/connections": "Connections",
  "/users": "Users",
  "/profile": "Profile",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropRef = useRef();

  const title = pageTitles[location.pathname] || "MailFlow";

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">MailFlow / {title}</p>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 relative transition-colors">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar name={user?.name || "User"} size="sm" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
              {user?.name?.split(" ")[0] || "User"}
            </span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                👤 My Profile
              </Link>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}