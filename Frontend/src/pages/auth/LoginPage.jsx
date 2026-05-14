import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, Zap, Users, BarChart3, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "om@mailflow.io", password: "password" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      login(form.email, form.password);
      navigate("/home");
      setLoading(false);
    }, 700);
  };

  const features = [
    { icon: Mail, text: "Manage all email campaigns in one beautiful dashboard" },
    { icon: Users, text: "Build and segment your audience with smart filters" },
    { icon: BarChart3, text: "Track real-time analytics and campaign performance" },
  ];

  return (
    <div className="min-h-screen flex bg-[#F7F8FC] dark:bg-[#0F1117]">
      {/* ── Left brand panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6D5EF5] via-[#7B6FF5] to-[#8B7CFF]" />
        {/* Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">MailFlow</span>
        </div>

        {/* Center content */}
        <div className="relative text-white max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur rounded-full text-xs font-medium mb-6 text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Enterprise Email Platform
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Modern Email<br />Campaign Platform
          </h1>
          <p className="text-white/75 text-lg mb-10">
            Create, manage, and scale email campaigns with beautiful design and powerful analytics.
          </p>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 text-sm leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative flex gap-8">
          {[
            { label: "Emails Sent", value: "48M+" },
            { label: "Active Users", value: "12K+" },
            { label: "Open Rate", value: "38%" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white text-xl font-bold">{s.value}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right auth panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">MailFlow</span>
          </div>

          <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Sign in to your MailFlow account</p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] focus:border-[#6D5EF5] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <a href="#" className="text-xs text-[#6D5EF5] dark:text-[#8B7CFF] hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] focus:border-[#6D5EF5] transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#6D5EF5] focus:ring-[#6D5EF5]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] hover:from-[#5D4EE5] hover:to-[#7B6CEF] text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#6D5EF5] dark:text-[#8B7CFF] hover:underline font-medium">
                Create one free
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
