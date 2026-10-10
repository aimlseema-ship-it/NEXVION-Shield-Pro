import { useState, useEffect } from "react";
import {
  Plug, Check, X, Shield, Lock, Upload, FileText, MessageSquare,
  Instagram, MessageCircle, Send, Mail, Smartphone, Ghost, ScanSearch, AlertTriangle,
} from "lucide-react";
import { getConnectedApps, setConnectedApp, removeConnectedApp, addNotification } from "@/lib/store";
import ConnectModal from "@/components/ConnectModal";
import { RISK_CONFIG } from "@/lib/detection";

const PLATFORMS = [
  { name: "Instagram", icon: Instagram, color: "#E1306C", auth: "Official OAuth (Meta)", available: true, methods: ["Paste message", "Upload screenshot", "Import file"] },
  { name: "Snapchat", icon: Ghost, color: "#FFFC00", auth: "Limited API access", available: false, methods: ["Paste message", "Upload screenshot"] },
  { name: "WhatsApp", icon: MessageCircle, color: "#25D366", auth: "No inbox access available", available: false, methods: ["Paste message", "Upload screenshot", "Import chat export"] },
  { name: "Telegram", icon: Send, color: "#0088cc", auth: "Official Bot API", available: true, methods: ["Paste message", "Upload screenshot", "Forward to bot"] },
  { name: "Gmail", icon: Mail, color: "#EA4335", auth: "Official OAuth (Google)", available: true, methods: ["Paste email", "Upload screenshot", "Import .eml file"] },
  { name: "SMS", icon: Smartphone, color: "#6366f1", auth: "No direct access", available: false, methods: ["Paste message", "Upload screenshot"] },
];

export default function ConnectApps() {
  const [connected, setConnected] = useState([]);
  const [modal, setModal] = useState(null); // { platform, mode }

  useEffect(() => {
    setConnected(getConnectedApps());
  }, []);

  const getConn = (name) => connected.find((a) => a.platform === name);

  const handleConnected = (platform, data) => {
    setConnectedApp(platform.name, { auth: platform.auth, ...data });
    setConnected(getConnectedApps());
    addNotification({
      title: `${platform.name} inbox scanned`,
      message: `${data.scan.spamCount} spam messages detected in @${data.username}.`,
      type: ["high", "critical"].includes(data.scan.topRisk) ? data.scan.topRisk : "info",
    });
  };

  const handleDisconnect = (p) => {
    removeConnectedApp(p.name);
    setConnected(getConnectedApps());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Connect Apps</h1>
        <p className="text-sm text-slate-500 mt-1">Link a platform, sign in, and scan your inbox for spam. We never store your credentials.</p>
      </div>

      {/* Privacy banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Privacy-first by design</p>
          <p className="text-blue-700 mt-0.5">NEXVION never stores your passwords, OTPs, or session cookies. This is a simulated demo connection — the sign-in screen is a mock, and credentials are discarded immediately.</p>
        </div>
      </div>

      {/* Platform cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const conn = getConn(p.name);
          const scan = conn?.scan;
          const cfg = scan ? RISK_CONFIG[scan.topRisk] || RISK_CONFIG.medium : null;
          return (
            <div key={p.name} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color, color: p.name === "Snapchat" ? "#333" : "#fff" }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    {p.name}
                    {conn && <Check className="w-4 h-4 text-green-500" />}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{conn ? `Connected as @${conn.username}` : p.auth}</p>
                </div>
                {conn ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 shrink-0">Connected</span>
                ) : p.available ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 shrink-0">Available</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">Manual</span>
                )}
              </div>

              {scan ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-slate-50 py-2 text-center">
                    <div className="text-base font-bold text-slate-900">{scan.total}</div>
                    <div className="text-[10px] text-slate-500">Scanned</div>
                  </div>
                  <div className="rounded-xl bg-red-50 py-2 text-center">
                    <div className="text-base font-bold text-red-600">{scan.spamCount}</div>
                    <div className="text-[10px] text-red-500">Spam</div>
                  </div>
                  <div className="rounded-xl bg-green-50 py-2 text-center">
                    <div className="text-base font-bold text-green-600">{scan.safeCount}</div>
                    <div className="text-[10px] text-green-600">Safe</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.methods.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
                      {m.includes("Paste") ? <MessageSquare className="w-3 h-3" /> : m.includes("Upload") ? <Upload className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {conn ? (
                <div className="mt-auto flex gap-2">
                  <button onClick={() => setModal({ platform: p, mode: "results" })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200">
                    <ScanSearch className="w-4 h-4" /> View Results
                  </button>
                  <button onClick={() => handleDisconnect(p)}
                    className="px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setModal({ platform: p, mode: "connect" })}
                  className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200">
                  <Plug className="w-4 h-4" /> Connect & Scan
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">
          <strong className="text-slate-700">Note:</strong> Platforms marked "Manual" do not offer authorized inbox access. For these, use paste, screenshot upload, or file import. Connections and inbox scans on this page are simulated demo data — no real accounts are accessed.
        </p>
      </div>

      {modal && (
        <ConnectModal
          platform={modal.platform}
          mode={modal.mode}
          existing={getConn(modal.platform.name)}
          onClose={() => setModal(null)}
          onConnected={(data) => handleConnected(modal.platform, data)}
        />
      )}
    </div>
  );
}