import { useState, useEffect } from "react";
import { History, Download, Trash2, Filter, MessageSquare, Link as LinkIcon, UserSearch, Search } from "lucide-react";
import { getScans, deleteScan, clearScans } from "@/lib/store";
import { RISK_CONFIG } from "@/lib/detection";
import { downloadScanReport } from "@/lib/report";

const TYPE_ICONS = { message: MessageSquare, url: LinkIcon, profile: UserSearch };
const TYPE_FILTERS = ["all", "message", "url", "profile"];
const LEVEL_FILTERS = ["all", "safe", "low", "medium", "high", "critical"];

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setScans(getScans());
  }, []);

  const refresh = () => setScans(getScans());

  const filtered = scans.filter((s) => {
    if (typeFilter !== "all" && s.scanType !== typeFilter) return false;
    if (levelFilter !== "all" && s.riskLevel !== levelFilter) return false;
    if (search && !s.input?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id) => {
    deleteScan(id);
    refresh();
  };

  const handleClear = () => {
    if (confirm("Clear all scan history? This cannot be undone.")) {
      clearScans();
      refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" /> Scan History
          </h1>
          <p className="text-sm text-slate-500 mt-1">All your past scans with downloadable reports.</p>
        </div>
        {scans.length > 0 && (
          <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search scans..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wide"><Filter className="w-3.5 h-3.5" /> Type:</span>
          {TYPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${typeFilter === t ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
              {t}
            </button>
          ))}
          <span className="ml-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Risk:</span>
          {LEVEL_FILTERS.map((l) => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${levelFilter === l ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{scans.length === 0 ? "No scans yet. Start scanning to build your history." : "No scans match your filters."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const cfg = RISK_CONFIG[s.riskLevel] || RISK_CONFIG.medium;
            const Icon = TYPE_ICONS[s.scanType] || MessageSquare;
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.ring}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.scanType} · {s.platform}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        {cfg.label} · {s.riskScore}/100
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 line-clamp-2">{s.input}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(s.created_date).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => downloadScanReport(s)} title="Download report"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} title="Delete"
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}