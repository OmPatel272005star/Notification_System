import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, Building2, Zap, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", companyName: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      signup(form);
      navigate("/home");
      setLoading(false);
    }, 700);
  };

  const field = (key, label, type, placeholder, Icon) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-4 py-2.5 text-sm rounded-xl border ${errors[key] ? "border-red-400 focus:ring-red-400" : "border-[#E4E7EC] dark:border-[#2A2F3A] focus:ring-[#6D5EF5] focus:border-[#6D5EF5]"} bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
        />
      </div>
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] dark:bg-[#0F1117] p-6">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D5EF5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#6D5EF5]/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100">MailFlow</span>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start sending beautiful emails in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field("fullName", "Full Name", "text", "John Doe", User)}
            {field("email", "Email Address", "email", "you@company.com", Mail)}
            {field("companyName", "Company Name", "text", "Acme Corp", Building2)}

            {/* Password with toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${errors.password ? "border-red-400 focus:ring-red-400" : "border-[#E4E7EC] dark:border-[#2A2F3A] focus:ring-[#6D5EF5]"} bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {field("confirmPassword", "Confirm Password", "password", "Repeat password", Lock)}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] hover:from-[#5D4EE5] hover:to-[#7B6CEF] text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <> Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#6D5EF5] dark:text-[#8B7CFF] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
