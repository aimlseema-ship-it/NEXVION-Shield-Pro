import { RISK_CONFIG, SEVERITY_CONFIG } from "@/lib/detection";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Lightbulb, Download } from "lucide-react";
import { downloadScanReport } from "@/lib/report";

export default function ScanResult({ result, scanRecord, onSave, saved }) {
  if (!result) return null;
  const cfg = RISK_CONFIG[result.riskLevel] || RISK_CONFIG.medium;
  const isSafe = result.riskLevel === "safe";
  const isFake = ["medium", "high", "critical"].includes(result.riskLevel);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Verdict: real or fake */}
      <div className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${isFake ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isFake ? "bg-red-100" : "bg-green-100"}`}>
          {isFake ? <ShieldAlert className="w-7 h-7 text-red-600" /> : <ShieldCheck className="w-7 h-7 text-green-600" />}
        </div>
        <div className="min-w-0">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isFake ? "text-red-500" : "text-green-600"}`}>Verdict</span>
          <p className={`text-2xl font-extrabold leading-tight ${isFake ? "text-red-700" : "text-green-700"}`}>
            {isFake ? "FAKE" : "REAL"}
          </p>
          <p className={`text-sm mt-0.5 ${isFake ? "text-red-600" : "text-green-700"}`}>
            {isFake
              ? "This shows clear scam or fake signals — do not trust it, click links, or share information."
              : "No scam or fake signals detected. It looks legitimate, but always stay cautious."}
          </p>
        </div>
      </div>

      {/* Risk score card */}
      <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isSafe ? "bg-green-100" : "bg-white"}`}>
            {isSafe ? <ShieldCheck className="w-7 h-7 text-green-600" /> : <ShieldAlert className={`w-7 h-7 ${cfg.ring}`} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className={`text-xl font-bold ${cfg.text}`}>{cfg.label}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                {result.riskScore}/100
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{result.summary}</p>
          </div>
        </div>

        {/* Risk meter */}
        <div className="mt-5">
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${result.riskScore}%`, backgroundColor: cfg.color }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
            <span>Safe</span><span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
          </div>
        </div>
      </div>

      {/* Issues */}
      {result.issues && result.issues.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Detection Reasons ({result.issues.length})
          </h4>
          <div className="space-y-3">
            {result.issues.map((issue, i) => {
              const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.medium;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 ${sev.bg} ${sev.text}`}>
                    {sev.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{issue.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{issue.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
          <Lightbulb className="w-4 h-4 text-blue-500" />
          Safety Recommendations
        </h4>
        <ul className="space-y-2.5">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {onSave && (
          <button
            onClick={onSave}
            disabled={saved}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {saved ? "Saved to History" : "Save to History"}
          </button>
        )}
        {scanRecord && (
          <button
            onClick={() => downloadScanReport(scanRecord)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        )}
      </div>
    </div>
  );
}