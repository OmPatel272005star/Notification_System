import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Badge, statusBadge, Card } from "../components/ui/index";

const stats = [
  { label: "Total Audience", value: "12,450", icon: "👥", trend: "+8%", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40" },
  { label: "Active Campaigns", value: "7", icon: "📧", trend: "+2", color: "text-green-600 bg-green-100 dark:bg-green-900/40" },
  { label: "Emails Sent", value: "48,200", icon: "✉️", trend: "+12%", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/40" },
  { label: "Connections", value: "3", icon: "🔌", trend: "Active", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/40" },
];

const recentCampaigns = [
  { name: "May Newsletter", status: "Published", audience: "5,200", scheduled: "May 8, 2026", template: "Newsletter v3" },
  { name: "Product Launch Email", status: "Scheduled", audience: "8,100", scheduled: "May 20, 2026", template: "Product Launch" },
  { name: "Welcome Series #1", status: "Draft", audience: "—", scheduled: "—", template: "Welcome Email" },
  { name: "Q1 Recap", status: "Completed", audience: "12,000", scheduled: "Apr 1, 2026", template: "Newsletter v2" },
  { name: "Promo - Spring Sale", status: "Approved", audience: "9,500", scheduled: "May 25, 2026", template: "Promo Basic" },
];

const quickActions = [
  { label: "Create Campaign", icon: "📧", desc: "Launch a new email campaign", to: "/campaigns" },
  { label: "Import Audience", icon: "👥", desc: "Add contacts via CSV upload", to: "/audience" },
  { label: "Add Connection", icon: "🔌", desc: "Connect an email provider", to: "/connections" },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Here's what's happening with your campaigns today.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{s.value}</p>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 inline-block">{s.trend} this month</span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.color}`}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent campaigns + Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent campaigns */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recent Campaigns</h3>
            <Link to="/campaigns" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentCampaigns.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.scheduled} · {c.audience} contacts</p>
                </div>
                <Badge variant={statusBadge(c.status)}>{c.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Quick Actions</h3>
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to}>
              <Card className="p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center text-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}