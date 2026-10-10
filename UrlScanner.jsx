import { useState } from "react";
import { Link as LinkIcon, Sparkles, Scan, Trash2 } from "lucide-react";
import { scanUrl } from "@/lib/detection";
import { addScan, addNotification } from "@/lib/store";
import ScanResult from "@/components/ScanResult";

const DEMOS = [
  { label: "Misspelled PayPal", url: "http://paypa1-login.com/verify?id=8273" },
  { label: "Suspicious TLD", url: "https://free-prize-claim.tk/login" },
  { label: "IP Address", url: "http://192.168.1.55/account-verify/login.html" },
  { label: "Shortened URL", url: "https://bit.ly/2xK9pLm" },
  { label: "Safe URL", url: "https://www.google.com/search?q=safety+tips" },
];

export default function UrlScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleScan = () => {
    if (!url.trim()) return;
    const res = scanUrl(url);
    setResult(res);
    setSaved(false);
    setRecord(null);
  };

  const handleSave = () => {
    const rec = addScan({ scanType: "url", platform: "URL", input: url, ...result });
    setRecord(rec);
    setSaved(true);
    if (["high", "critical"].includes(result.riskLevel)) {
      addNotification({ title: "Phishing URL detected", message: `A URL was flagged as ${result.riskLevel} risk.`, type: result.riskLevel });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-blue-600" /> URL Scanner
        </h1>
        <p className="text-sm text-slate-500 mt-1">Check any link for phishing domains, misspelled brands, and suspicious redirects.</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Try a demo example
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMOS.map((d) => (
            <button key={d.label} onClick={() => { setUrl(d.url); setResult(null); setSaved(false); }}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">URL to Scan</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleScan} disabled={!url.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm shadow-blue-200">
            <Scan className="w-4 h-4" /> Scan URL
          </button>
          {url && (
            <button onClick={() => { setUrl(""); setResult(null); setSaved(false); }}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {result && <ScanResult result={result} onSave={handleSave} saved={saved} scanRecord={record} />}
    </div>
  );
}