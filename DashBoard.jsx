import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, ShieldAlert, MessageSquare, Link as LinkIcon, UserSearch,
  Plug, Activity, TrendingUp, ArrowRight, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { getStats, getScans, getConnectedApps } from "@/lib/store";
import { RISK_CONFIG } from "@/lib/detection";
import { useAppAuth } from "@/lib/AppAuth";

export default function Dashboard() {
  const { user } = useAppAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [connected, setConnected] = useState([]);

  useEffect(() => {
    setStats(getStats());
    setRecent(getScans().slice(0, 5));
    setConnected(getConnectedApps());
  }, []);

  if (!stats) return null;

  const cards = [
    { label: "Total Scans", value: stats.total, icon: Activity, color: "blue" },
    { label: "Threats Detected", value: stats.threats, icon: ShieldAlert, color: "orange" },
    { label: "Safe Content", value: stats.safe, icon: ShieldCheck, color: "green" },
    { label: "Connected Apps", value: stats.connectedApps, icon: Plug, color: "indigo" },
  ];

  const colorMap = { blue: "bg-blue-50 text-blue-600", orange: "bg-orange-50 text-orange-600", green: "bg-green-50 text-green-600", indigo: "bg-indigo-50 text-indigo-600" };

  const typeData = [
    { name: "Messages", count: stats.byType.message, fill: "#2563eb" },
    { name: "URLs", count: stats.byType.url, fill: "#7c3aed" },
    { name: "Profiles", count: stats.byType.profile, fill: "#0891b2" },
  ];

  const levelData = [
    { name: "Safe", value: stats.byLevel.safe, fill: RISK_CONFIG.safe.color },
    { name: "Low", value: stats.byLevel.low, fill: RISK_CONFIG.low.color },
    { name: "Medium", value: stats.byLevel.medium, fill: RISK_CONFIG.medium.color },
    { name: "High", value: stats.byLevel.high, fill: RISK_CONFIG.high.color },
    { name: "Critical", value: stats.byLevel.critical, fill: RISK_CONFIG.critical.color },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0] || "User"} 👋</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your scam detection overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[c.color]}`}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{c.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: "/scan/message", icon: MessageSquare, title: "Scan a Message", desc: "Paste any suspicious message" },
          { to: "/scan/url", icon: LinkIcon, title: "Scan a URL", desc: "Check any link for phishing" },
          { to: "/scan/profile", icon: UserSearch, title: "Scan a Profile", desc: "Check if a profile is fake" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                {a.title}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-sm text-slate-500 mt-1">{a.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-5">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Scans by Type
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Level Distribution
          </h3>
          {levelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={levelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {levelData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No scans yet</div>
          )}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {levelData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent scans */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-900">Recent Scans</h3>
          <Link to="/history" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400">No scans yet. Start scanning to see results here.</div>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => {
              const cfg = RISK_CONFIG[s.riskLevel] || RISK_CONFIG.medium;
              const Icon = s.scanType === "message" ? MessageSquare : s.scanType === "url" ? LinkIcon : UserSearch;
              return (
                <Link key={s.id} to="/history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.ring}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{s.input}</p>
                    <p className="text-xs text-slate-400">{s.platform} · {new Date(s.created_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border} shrink-0`}>
                    {cfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}