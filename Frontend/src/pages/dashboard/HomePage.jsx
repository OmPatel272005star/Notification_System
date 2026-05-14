import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrendingUp, Users, Mail, Plug, ArrowRight, BarChart2, Clock, CheckCircle, AlertCircle, Calendar, Layers } from "lucide-react";

const stats = [
  { label: "Total Audience", value: "12,450", icon: Users, trend: "+8%", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
  { label: "Active Campaigns", value: "7", icon: Mail, trend: "+2 this week", bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400" },
  { label: "Emails Sent", value: "48,200", icon: BarChart2, trend: "+12%", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  { label: "Avg Open Rate", value: "32.4%", icon: TrendingUp, trend: "+3.1%", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-600 dark:text-orange-400" },
  { label: "Templates", value: "14", icon: Layers, trend: "+3 new", bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-600 dark:text-pink-400" },
  { label: "Connections", value: "3", icon: Plug, trend: "All healthy", bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400" },
];

const statusMap = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Failed: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  Sending: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

const campaigns = [
  { name: "May Newsletter", status: "Published", audience: "5,200", sent: "May 8, 2026", openRate: "34%", template: "Newsletter v3" },
  { name: "Product Launch Email", status: "Scheduled", audience: "8,100", sent: "May 20, 2026", openRate: "—", template: "Product Launch" },
  { name: "Welcome Series #1", status: "Draft", audience: "—", sent: "—", openRate: "—", template: "Welcome Email" },
  { name: "Q1 Recap", status: "Completed", audience: "12,000", sent: "Apr 1, 2026", openRate: "29%", template: "Newsletter v2" },
  { name: "Spring Promo", status: "Approved", audience: "9,500", sent: "May 25, 2026", openRate: "—", template: "Promo Basic" },
];

const activity = [
  { icon: CheckCircle, color: "text-emerald-500", text: "May Newsletter sent to 5,200 contacts", time: "2h ago" },
  { icon: Users, color: "text-blue-500", text: "47 new contacts imported via CSV", time: "5h ago" },
  { icon: AlertCircle, color: "text-amber-500", text: "Product Launch scheduled for May 20", time: "1d ago" },
  { icon: Mail, color: "text-purple-500", text: "Welcome Email template published", time: "2d ago" },
];

const quickActions = [
  { label: "Create Campaign", icon: Mail, desc: "Launch a new email campaign", to: "/campaigns", gradient: "from-[#6D5EF5] to-[#8B7CFF]" },
  { label: "Import Audience", icon: Users, desc: "Add contacts via CSV upload", to: "/audience", gradient: "from-blue-500 to-blue-600" },
  { label: "Add Connection", icon: Plug, desc: "Connect an email provider", to: "/connections", gradient: "from-emerald-500 to-teal-500" },
];

export default function HomePage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{greeting}, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's what's happening with your campaigns today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] px-3 py-2 rounded-xl">
          <Calendar className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-4 h-4 ${s.text}`} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{s.label}</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recent Campaigns</h3>
            <Link to="/campaigns" className="text-xs text-[#6D5EF5] dark:text-[#8B7CFF] hover:underline font-medium flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
            {campaigns.map((c) => (
              <div key={c.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
                <div className="w-8 h-8 bg-[#6D5EF5]/10 dark:bg-[#6D5EF5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#6D5EF5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.template}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[c.status] || statusMap.Draft}`}>{c.status}</span>
                  <span className="text-xs text-gray-400">{c.audience} contacts</span>
                </div>
                <div className="hidden lg:block text-right min-w-[60px]">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.openRate}</p>
                  <p className="text-xs text-gray-400">open rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((a) => (
                <Link key={a.label} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A2030] border border-transparent hover:border-[#E4E7EC] dark:hover:border-[#2A2F3A] transition-all group">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${a.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                    <a.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <a.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.color}`} />
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
