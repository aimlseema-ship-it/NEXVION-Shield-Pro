import { useState } from "react";
import { UserSearch, Sparkles, Scan, Trash2 } from "lucide-react";
import { scanProfile } from "@/lib/detection";
import { addScan, addNotification } from "@/lib/store";
import ScanResult from "@/components/ScanResult";

const PLATFORMS = ["Instagram", "Snapchat", "Telegram", "WhatsApp", "Facebook", "TikTok"];

const DEMOS = [
  { label: "Fake Giveaway Bot", data: { username: "official_giveaway_real_2026", displayName: "Free iPhone Giveaway", bio: "Verified official account! DM to claim your prize 🎁", followers: 12, following: 950, posts: 0, hasProfilePic: false, accountAgeDays: 5 } },
  { label: "Impersonator", data: { username: "elon_musk_officia1", displayName: "Elon Musk", bio: "The real Elon Musk. Send BTC to double your money!", followers: 340, following: 12, posts: 3, hasProfilePic: true, accountAgeDays: 18 } },
  { label: "Legitimate Profile", data: { username: "jane_photography", displayName: "Jane Smith", bio: "Professional photographer 📸 | NYC | Bookings open", followers: 12400, following: 380, posts: 287, hasProfilePic: true, accountAgeDays: 720 } },
];

export default function ProfileScanner() {
  const [platform, setPlatform] = useState("Instagram");
  const [form, setForm] = useState({ username: "", displayName: "", bio: "", followers: "", following: "", posts: "", hasProfilePic: true, accountAgeDays: "" });
  const [result, setResult] = useState(null);
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleScan = () => {
    const data = {
      username: form.username,
      displayName: form.displayName,
      bio: form.bio,
      followers: parseInt(form.followers) || 0,
      following: parseInt(form.following) || 0,
      posts: parseInt(form.posts) || 0,
      hasProfilePic: form.hasProfilePic,
      accountAgeDays: parseInt(form.accountAgeDays) || 0,
    };
    const res = scanProfile(data);
    setResult(res);
    setSaved(false);
    setRecord(null);
  };

  const handleSave = () => {
    const inputStr = `@${form.username} — ${form.followers || 0} followers, ${form.following || 0} following, ${form.posts || 0} posts, ${form.accountAgeDays || 0} days old`;
    const rec = addScan({ scanType: "profile", platform, input: inputStr, ...result });
    setRecord(rec);
    setSaved(true);
    if (["high", "critical"].includes(result.riskLevel)) {
      addNotification({ title: "Fake profile detected", message: `A ${platform} profile was flagged as ${result.riskLevel} risk.`, type: result.riskLevel });
    }
  };

  const loadDemo = (d) => {
    setForm({
      username: d.data.username,
      displayName: d.data.displayName,
      bio: d.data.bio,
      followers: String(d.data.followers),
      following: String(d.data.following),
      posts: String(d.data.posts),
      hasProfilePic: d.data.hasProfilePic,
      accountAgeDays: String(d.data.accountAgeDays),
    });
    setResult(null);
    setSaved(false);
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const numInput = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserSearch className="w-6 h-6 text-blue-600" /> Profile Scanner
        </h1>
        <p className="text-sm text-slate-500 mt-1">Check if a social profile is fake, a bot, or an impersonator.</p>
      </div>

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

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${platform === p ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="@username" className={numInput} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
            <input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Display name" className={numInput} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={2} placeholder="Profile bio..." className={`${numInput} resize-none`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Followers</label>
            <input type="number" value={form.followers} onChange={(e) => update("followers", e.target.value)} placeholder="0" className={numInput} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Following</label>
            <input type="number" value={form.following} onChange={(e) => update("following", e.target.value)} placeholder="0" className={numInput} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Posts</label>
            <input type="number" value={form.posts} onChange={(e) => update("posts", e.target.value)} placeholder="0" className={numInput} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Age (days)</label>
            <input type="number" value={form.accountAgeDays} onChange={(e) => update("accountAgeDays", e.target.value)} placeholder="0" className={numInput} />
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.hasProfilePic} onChange={(e) => update("hasProfilePic", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Has profile picture</span>
        </label>

        <div className="flex gap-3">
          <button onClick={handleScan} disabled={!form.username}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm shadow-blue-200">
            <Scan className="w-4 h-4" /> Scan Profile
          </button>
          {form.username && (
            <button onClick={() => { setForm({ username: "", displayName: "", bio: "", followers: "", following: "", posts: "", hasProfilePic: true, accountAgeDays: "" }); setResult(null); setSaved(false); }}
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