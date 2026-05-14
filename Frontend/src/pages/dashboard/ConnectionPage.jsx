import { useState } from "react";
import { Plus, Trash2, RefreshCw, ExternalLink, Plug, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const PROVIDERS = [
  { id: "resend", name: "Resend", desc: "Modern email API for developers", color: "bg-black dark:bg-white", textColor: "text-white dark:text-black", letter: "R" },
  { id: "sendgrid", name: "SendGrid", desc: "Cloud-based email delivery service", color: "bg-[#1A82E2]", textColor: "text-white", letter: "SG" },
  { id: "mailgun", name: "Mailgun", desc: "Email API for developers", color: "bg-[#F06B26]", textColor: "text-white", letter: "MG" },
  { id: "ses", name: "AWS SES", desc: "Amazon Simple Email Service", color: "bg-[#FF9900]", textColor: "text-white", letter: "SES" },
  { id: "smtp", name: "Custom SMTP", desc: "Connect any SMTP server", color: "bg-gray-700", textColor: "text-white", letter: "⚙" },
];

const INIT_CONNECTIONS = [
  { id: 1, provider: "Resend", email: "noreply@mailflow.io", status: "Connected", lastSync: "May 14, 2026", messagesDay: "2,400/day" },
  { id: 2, provider: "SendGrid", email: "team@mailflow.io", status: "Connected", lastSync: "May 13, 2026", messagesDay: "10,000/day" },
  { id: 3, provider: "AWS SES", email: "alerts@mailflow.io", status: "Warning", lastSync: "May 10, 2026", messagesDay: "50,000/day" },
];

const STATUS_CFG = {
  Connected: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500", icon: CheckCircle, iconCls: "text-emerald-500" },
  Warning:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", dot: "bg-amber-500", icon: AlertTriangle, iconCls: "text-amber-500" },
  Failed:    { cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500", icon: XCircle, iconCls: "text-red-500" },
};

const PROV_COLORS = {
  Resend: "bg-black dark:bg-gray-800",
  SendGrid: "bg-[#1A82E2]",
  "AWS SES": "bg-[#FF9900]",
  Mailgun: "bg-[#F06B26]",
  "Custom SMTP": "bg-gray-600",
};
const PROV_LETTERS = { Resend: "R", SendGrid: "SG", "AWS SES": "SES", Mailgun: "MG", "Custom SMTP": "⚙" };

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

export default function ConnectionPage() {
  const { addToast } = useToast();
  const [connections, setConnections] = useState(INIT_CONNECTIONS);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProv, setSelectedProv] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const handleDisconnect = (id) => {
    setConnections(p => p.filter(c => c.id !== id));
    addToast("Connection removed", "success");
  };

  const handleTest = (name) => addToast(`Testing ${name} connection...`, "info");

  const handleConnect = () => {
    if (!selectedProv) { addToast("Select a provider", "error"); return; }
    if (!apiKey.trim() && selectedProv.id !== "smtp") { addToast("API key required", "error"); return; }
    const nc = { id: Date.now(), provider: selectedProv.name, email: senderEmail || "noreply@example.com", status: "Connected", lastSync: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), messagesDay: "1,000/day" };
    setConnections(p => [...p, nc]);
    setShowAdd(false); setSelectedProv(null); setApiKey(""); setSenderEmail("");
    addToast(`${selectedProv.name} connected successfully`, "success");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Connections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Connect your email sending providers</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Add Connection
        </button>
      </div>

      {/* Health overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Healthy", connections.filter(c => c.status === "Connected").length, "text-emerald-600 dark:text-emerald-400", "bg-emerald-50 dark:bg-emerald-950/40"],
          ["Warnings", connections.filter(c => c.status === "Warning").length, "text-amber-600 dark:text-amber-400", "bg-amber-50 dark:bg-amber-950/40"],
          ["Failed", connections.filter(c => c.status === "Failed").length, "text-red-600 dark:text-red-400", "bg-red-50 dark:bg-red-950/40"],
        ].map(([l, v, tc, bg]) => (
          <div key={l} className={`${bg} border border-transparent rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${tc}`}>{v}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Connection cards */}
      {connections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connections.map(conn => {
            const cfg = STATUS_CFG[conn.status] || STATUS_CFG.Connected;
            const StatusIcon = cfg.icon;
            const provBg = PROV_COLORS[conn.provider] || "bg-gray-600";
            const letter = PROV_LETTERS[conn.provider] || "?";
            return (
              <div key={conn.id} className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${provBg} rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                      {letter}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{conn.provider}</h3>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{conn.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{conn.status}
                  </span>
                </div>

                {/* Health indicator bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>API Health</span>
                    <StatusIcon className={`w-3.5 h-3.5 ${cfg.iconCls}`} />
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className={`h-full rounded-full ${conn.status === "Connected" ? "bg-emerald-500 w-full" : conn.status === "Warning" ? "bg-amber-500 w-3/4" : "bg-red-500 w-1/4"}`} />
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Send limit</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{conn.messagesDay}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Last sync</span>
                    <span className="text-gray-600 dark:text-gray-300">{conn.lastSync}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleTest(conn.provider)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Test
                  </button>
                  <button onClick={() => addToast("Settings coming soon", "info")} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Settings
                  </button>
                  <button onClick={() => handleDisconnect(conn.id)} className="py-1.5 px-2 text-xs border border-red-200 dark:border-red-900/50 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {/* Add more card */}
          <button onClick={() => setShowAdd(true)} className="border-2 border-dashed border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-[#6D5EF5]/50 hover:text-[#6D5EF5] transition-all group min-h-[200px]">
            <div className="w-12 h-12 border-2 border-dashed border-current rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Add Provider</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <Plug className="w-8 h-8 text-[#6D5EF5]" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No connections yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect your email provider to start sending</p>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium">Add Connection</button>
        </div>
      )}

      {/* Add Connection Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setSelectedProv(null); }}>
        <div className="px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Add Email Connection</h2>
          <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg">×</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose your email provider</p>
          <div className="grid grid-cols-1 gap-2">
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => setSelectedProv(p)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedProv?.id === p.id ? "border-[#6D5EF5] bg-[#6D5EF5]/5 dark:bg-[#6D5EF5]/10" : "border-[#E4E7EC] dark:border-[#2A2F3A] hover:border-[#6D5EF5]/40"}`}>
                <div className={`w-9 h-9 ${p.color} rounded-lg flex items-center justify-center ${p.textColor} font-bold text-xs flex-shrink-0`}>{p.letter}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </div>
                {selectedProv?.id === p.id && <CheckCircle className="w-4 h-4 text-[#6D5EF5] ml-auto" />}
              </button>
            ))}
          </div>
          {selectedProv && (
            <div className="space-y-3 pt-2 border-t border-[#E4E7EC] dark:border-[#2A2F3A]">
              {selectedProv.id !== "smtp" ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">API Key *</label>
                  <input type="password" placeholder="Enter your API key" value={apiKey} onChange={e => setApiKey(e.target.value)} className={inputCls} />
                </div>
              ) : (
                <div className="space-y-2">
                  {[["Host","smtp.example.com"],["Port","587"],["Username","user@example.com"],["Password","••••••••"]].map(([l, ph]) => (
                    <div key={l}>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{l}</label>
                      <input placeholder={ph} className={inputCls} />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sender Email</label>
                <input type="email" placeholder="noreply@yourdomain.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
            <button onClick={handleConnect} className="flex-1 py-2 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg transition-all font-medium">Connect</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
