import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../ui/index";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) { setError("All fields required."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => {
      signup(form);
      navigate("/home");
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6">M</div>
          <h1 className="text-3xl font-bold mb-3">MailFlow</h1>
          <p className="text-indigo-200 text-lg">Email campaigns made simple.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Create account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">Get started with MailFlow</p>
            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 text-sm rounded-lg">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" placeholder="John Doe" value={form.fullName} onChange={set("fullName")} required />
              <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
              <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
              <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} required />
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Sign Up"}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}