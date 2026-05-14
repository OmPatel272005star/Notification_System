import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../ui/index";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "om@mailflow.io", password: "password" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(form.email, form.password);
      navigate("/home");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6">
            M
          </div>
          <h1 className="text-3xl font-bold mb-3">MailFlow</h1>
          <p className="text-indigo-200 text-lg mb-10">
            Send smarter. Reach farther.
          </p>
          <div className="space-y-4 text-left">
            {[
              { icon: "📧", text: "Manage all your email campaigns in one place" },
              { icon: "👥", text: "Build and segment your audience effortlessly" },
              { icon: "📊", text: "Track performance with real-time analytics" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-indigo-100 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">MailFlow</span>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Sign in to your account</p>

            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}