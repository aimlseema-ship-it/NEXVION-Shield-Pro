import { useState, useEffect, useRef } from "react";
import { X, Lock, User, ShieldCheck, Loader2, AlertTriangle, CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { scanInbox } from "@/lib/inboxScan";
import { RISK_CONFIG } from "@/lib/detection";

export default function ConnectModal({ platform, mode = "connect", existing, onClose, onConnected }) {
  const [step, setStep] = useState(mode === "results" && existing?.scan ? "results" : "credentials");
  const [username, setUsername] = useState(existing?.username || "");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(existing?.scan || null);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const Icon = platform.icon;

  const handleConnect = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setStep("connecting");
    setProgress(0);
    const start = Date.now();
    const duration = 3200;
    timerRef.current = setInterval(() => {
      const p = Math.min(((Date.now() - start) / duration) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current);
        const res = scanInbox(platform.name);
        setResult(res);
        setStep("results");
        onConnected({ username: username.trim(), scan: res });
      }
    }, 50);
  };

  const statusLabel =
    progress < 35
      ? "Authenticating credentials…"
      : progress < 65
      ? "Establishing secure connection…"
      : progress < 90
      ? `Scanning ${platform.name} inbox…`
      : "Analyzing messages…";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={step === "connecting" ? undefined : onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: platform.color, color: platform.name === "Snapchat" ? "#333" : "#fff" }}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900">Connect {platform.name}</h3>
            <p className="text-xs text-slate-500">Secure account scan</p>
          </div>
          {step !== "connecting" && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Credentials step */}
        {step === "credentials" && (
          <form onSubmit={handleConnect} className="p-5 space-y-4">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">Sign in to let NEXVION scan your inbox for spam and scam messages.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username or Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`@your_${platform.name.toLowerCase()}_handle`}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg transition-colors shadow-sm shadow-blue-200"
            >
              <ShieldCheck className="w-4 h-4" /> Connect & Scan Inbox
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Demo simulation — credentials are not stored or transmitted anywhere. No real login occurs.
            </p>
          </form>
        )}

        {/* Connecting step */}
        {step === "connecting" && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-900">{statusLabel}</p>
              <p className="text-xs text-slate-400 mt-1">Connecting as {username}</p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 text-center">{Math.round(progress)}% complete</p>
          </div>
        )}

        {/* Results step */}
        {step === "results" && result && (
          <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="rounded-2xl border border-slate-200 p-5 text-center bg-gradient-to-br from-slate-50 to-white">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-red-50 items-center justify-center mb-3">
                  <ShieldAlert className="w-7 h-7 text-red-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900">{result.spamCount}</div>
                <p className="text-sm font-medium text-slate-600 mt-1">spam messages detected</p>
                <p className="text-xs text-slate-400 mt-0.5">out of {result.total} messages scanned in @{existing?.username || username}</p>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="rounded-xl bg-slate-50 py-2.5">
                    <div className="text-lg font-bold text-slate-900">{result.total}</div>
                    <div className="text-[11px] text-slate-500">Scanned</div>
                  </div>
                  <div className="rounded-xl bg-red-50 py-2.5">
                    <div className="text-lg font-bold text-red-600">{result.spamCount}</div>
                    <div className="text-[11px] text-red-500">Spam</div>
                  </div>
                  <div className="rounded-xl bg-green-50 py-2.5">
                    <div className="text-lg font-bold text-green-600">{result.safeCount}</div>
                    <div className="text-[11px] text-green-600">Safe</div>
                  </div>
                </div>
              </div>

              {/* Flagged messages */}
              {result.flagged.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Flagged Messages ({result.flagged.length})
                  </h4>
                  <div className="space-y-2">
                    {result.flagged.map((m, i) => {
                      const cfg = RISK_CONFIG[m.riskLevel] || RISK_CONFIG.medium;
                      return (
                        <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {m.from}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{m.text}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{m.time} · {m.issues[0]?.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-800">Inbox scan complete. Suspicious messages have been flagged for review.</p>
              </div>

              <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}