import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? "72px" : "256px" }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}