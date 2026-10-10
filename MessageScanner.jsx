import { useState } from "react";
import { MessageSquare, Sparkles, Scan, Trash2 } from "lucide-react";
import { scanMessage } from "@/lib/detection";
import { addScan, addNotification } from "@/lib/store";
import ScanResult from "@/components/ScanResult";

const PLATFORMS = ["WhatsApp", "Instagram", "Snapchat", "Telegram", "Gmail", "SMS"];

const DEMOS = [
  {
    label: "OTP Scam",
    platform: "WhatsApp",
    text: "Hi, this is WhatsApp support. We detected unusual activity. Please share your 6-digit verification code to confirm your identity. Your account will be suspended if you don't reply immediately.",
  },
  {
    label: "Phishing + Payment",
    platform: "SMS",
    text: "URGENT: Your bank account has been suspended. Verify now to avoid permanent closure: http://secure-bank-verify.tk/login. A payment of $0.01 is required to reactivate.",
  },
  {
    label: "Fake Offer",
    platform: "Telegram",
    text: "Congratulations! You won a free iPhone 15 Pro! Click here to claim your prize now: http://bit.ly/free-iphone-claim. Limited time offer, act now!",
  },
  {
    label: "Safe Message",
    platform: "Gmail",
    text: "Hi team, please review the attached document for our meeting tomorrow at 2pm. Let me know if you have any questions. Thanks!",
  },
];

export default function MessageScanner() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("WhatsApp");
  const [result, setResult] = useState(null);
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleScan = () => {
    if (!text.trim()) return;
    const res = scanMessage(text);
    setResult(res);
    setSaved(false);
    setRecord(null);
  };

  const handleSave = () => {
    const rec = addScan({ scanType: "message", platform, input: text, ...result });
    setRecord(rec);
    setSaved(true);
    if (["high", "critical"].includes(result.riskLevel)) {
      addNotification({ title: `${result.riskLevel === "critical" ? "Critical" : "High"} threat detected`, message: `A ${platform} message was flagged as ${result.riskLevel} risk.`, type: result.riskLevel });
    }
  };

  const loadDemo = (d) => {
    setText(d.text);
    setPlatform(d.platform);
    setResult(null);
    setSaved(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" /> Message Scanner
        </h1>
        <p className="text-sm text-slate-500 mt-1">Paste any suspicious message to detect spam, OTP scams, phishing, and fraud.</p>
      </div>

      {/* Demo examples */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Try a demo example
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMOS.map((d) => (
            <button key={d.label} onClick={() => loadDemo(d)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  platform === p ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste the message you want to scan..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none scrollbar-thin"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={handleScan} disabled={!text.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm shadow-blue-200">
            <Scan className="w-4 h-4" /> Scan Message
          </button>
          {text && (
            <button onClick={() => { setText(""); setResult(null); setSaved(false); }}
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