import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, CreditCard, Activity } from "lucide-react";

const PAGE_TITLES = {
  "/home": "Dashboard",
  "/audience": "Audience",
  "/templates": "Templates",
  "/campaigns": "Campaigns",
  "/connections": "Connections",
  "/users": "Users",
  "/settings": "Settings",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const profileRef = useRef();
  const searchRef = useRef();

  const pageTitle = PAGE_TITLES[location.pathname] || "MailFlow";

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const profileItems = [
    { icon: User, label: "My Profile", action: () => {} },
    { icon: Settings, label: "Account Settings", action: () => {} },
    { icon: CreditCard, label: "Billing", action: () => {} },
    { icon: Activity, label: "Activity Logs", action: () => {} },
  ];

  return (
    <header className="h-14 bg-white dark:bg-[#161B22] border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-center px-5 gap-4 flex-shrink-0 sticky top-0 z-20">
      {/* Left: breadcrumb / title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
          <span>MailFlow</span>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-400 font-medium">{pageTitle}</span>
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate hidden sm:block">{pageTitle}</h2>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setShowSearch(s => !s)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          {showSearch && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl z-30 p-2 animate-scale-in">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search campaigns, templates..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 border border-[#E4E7EC] dark:border-[#2A2F3A] focus:outline-none focus:ring-1 focus:ring-[#6D5EF5]"
                />
              </div>
              {!searchVal && (
                <p className="text-xs text-gray-400 text-center py-3">Type to search...</p>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#6D5EF5] rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#E4E7EC] dark:bg-[#2A2F3A]" />

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(s => !s)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-none">{user?.name?.split(" ")[0]}</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl z-30 py-1 animate-scale-in">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              {profileItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <item.icon className="w-3.5 h-3.5 text-gray-400" />
                  {item.label}
                </button>
              ))}

              <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
