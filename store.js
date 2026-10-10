// NEXVION — localStorage data store (no backend, no paid APIs)

const KEYS = {
  scans: "nexvion_scans",
  apps: "nexvion_apps",
  notifications: "nexvion_notifications",
  seeded: "nexvion_seeded",
};

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function getScans() {
  return read(KEYS.scans, []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
}
export function addScan(scan) {
  const scans = read(KEYS.scans, []);
  const record = { ...scan, id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, created_date: new Date().toISOString() };
  scans.unshift(record);
  write(KEYS.scans, scans);
  return record;
}
export function deleteScan(id) {
  write(KEYS.scans, read(KEYS.scans, []).filter((s) => s.id !== id));
}
export function clearScans() {
  write(KEYS.scans, []);
}

export function getConnectedApps() {
  return read(KEYS.apps, []);
}
export function setConnectedApp(platform, data = {}) {
  const apps = read(KEYS.apps, []);
  const idx = apps.findIndex((a) => a.platform === platform);
  const record = { platform, connected: true, connected_date: new Date().toISOString(), ...data };
  if (idx >= 0) apps[idx] = record;
  else apps.push(record);
  write(KEYS.apps, apps);
  return record;
}
export function removeConnectedApp(platform) {
  write(KEYS.apps, read(KEYS.apps, []).filter((a) => a.platform !== platform));
}

export function getNotifications() {
  return read(KEYS.notifications, []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
}
export function addNotification(notif) {
  const list = read(KEYS.notifications, []);
  const record = { ...notif, id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, read: false, created_date: new Date().toISOString() };
  list.unshift(record);
  write(KEYS.notifications, list);
  return record;
}
export function markNotificationRead(id) {
  const list = read(KEYS.notifications, []).map((n) => (n.id === id ? { ...n, read: true } : n));
  write(KEYS.notifications, list);
}
export function markAllNotificationsRead() {
  write(KEYS.notifications, read(KEYS.notifications, []).map((n) => ({ ...n, read: true })));
}
export function getUnreadCount() {
  return read(KEYS.notifications, []).filter((n) => !n.read).length;
}

export function getStats() {
  const scans = getScans();
  const total = scans.length;
  const threats = scans.filter((s) => s.riskLevel !== "safe").length;
  const safe = scans.filter((s) => s.riskLevel === "safe").length;
  const critical = scans.filter((s) => ["high", "critical"].includes(s.riskLevel)).length;
  const byType = { message: 0, url: 0, profile: 0 };
  const byLevel = { safe: 0, low: 0, medium: 0, high: 0, critical: 0 };
  scans.forEach((s) => {
    if (byType[s.scanType] !== undefined) byType[s.scanType]++;
    if (byLevel[s.riskLevel] !== undefined) byLevel[s.riskLevel]++;
  });
  const connectedApps = getConnectedApps().length;
  return { total, threats, safe, critical, byType, byLevel, connectedApps };
}

const DEMO_SCANS = [
  {
    scanType: "message",
    platform: "WhatsApp",
    input: "URGENT: Your bank account will be suspended in 24 hours. Verify now: http://secure-bank-verify.tk/login",
    riskScore: 92,
    riskLevel: "critical",
    issues: [
      { id: "threat", severity: "high", title: "Account Suspension Threat", message: "Threatens account suspension to panic you." },
      { id: "urgency", severity: "medium", title: "False Urgency", message: "Creates artificial urgency." },
      { id: "phishing_link", severity: "high", title: "Suspicious Link", message: "Contains a phishing link." },
    ],
    recommendations: ["Do not click any links in this message.", "Contact your bank directly using their official number."],
    summary: "Detected 3 potential threat indicators.",
  },
  {
    scanType: "url",
    platform: "SMS",
    input: "http://paypa1-login.com/verify?id=8273",
    riskScore: 88,
    riskLevel: "critical",
    issues: [
      { id: "misspelled_brand", severity: "critical", title: "Misspelled Brand Domain", message: '"paypa1" closely resembles "paypal" but is misspelled.' },
      { id: "credential_keywords", severity: "high", title: "Credential-Harvesting Keywords", message: "URL contains keywords used in credential-stealing pages." },
    ],
    recommendations: ["Do not visit this URL.", "Report it as phishing."],
    summary: "Detected 2 suspicious indicators in this URL.",
  },
  {
    scanType: "profile",
    platform: "Instagram",
    input: "@official_giveaway_real_2026 — 12 followers, 950 following, 0 posts, 5 days old",
    riskScore: 78,
    riskLevel: "high",
    issues: [
      { id: "very_new", severity: "high", title: "Recently Created Account", message: "Account is only 5 days old." },
      { id: "few_followers", severity: "medium", title: "Very Few Followers", message: "Account has very few followers." },
      { id: "ratio", severity: "medium", title: "Following-to-Follower Imbalance", message: "Follows many but has few followers." },
      { id: "no_posts", severity: "medium", title: "No Posts", message: "Account has no posts." },
    ],
    recommendations: ["Do not engage with or send money to this account.", "Report and block the profile."],
    summary: "Detected 4 suspicious indicators.",
  },
  {
    scanType: "message",
    platform: "Gmail",
    input: "Hi team, please review the attached document for our meeting tomorrow. Thanks!",
    riskScore: 0,
    riskLevel: "safe",
    issues: [],
    recommendations: ["No major threats detected, but always stay cautious with unexpected messages."],
    summary: "This message appears safe.",
  },
  {
    scanType: "message",
    platform: "Telegram",
    input: "Congratulations! You won a free iPhone 15 Pro! Click here to claim your prize now: http://bit.ly/free-iphone-claim",
    riskScore: 80,
    riskLevel: "high",
    issues: [
      { id: "fake_offer", severity: "high", title: "Too-Good-To-Be-True Offer", message: "Promises rewards that are likely fake." },
      { id: "phishing_link", severity: "high", title: "Suspicious Link", message: "Contains a shortened phishing link." },
    ],
    recommendations: ["If it seems too good to be true, it probably is.", "Do not click any links."],
    summary: "Detected 2 potential threat indicators.",
  },
];

const DEMO_NOTIFICATIONS = [
  { title: "Critical threat detected", message: "A WhatsApp message was flagged as critical risk.", type: "critical" },
  { title: "Phishing URL blocked", message: "A phishing URL was identified in an SMS scan.", type: "warning" },
  { title: "Welcome to NEXVION", message: "Your account is set up. Start scanning to stay safe.", type: "info" },
];

export function seedDemoData() {
  if (read(KEYS.seeded, false)) return;
  const now = Date.now();
  const scans = DEMO_SCANS.map((s, i) => ({
    ...s,
    id: `demo_scan_${i}`,
    created_date: new Date(now - (i + 1) * 3600_000).toISOString(),
  }));
  write(KEYS.scans, scans);
  const notifs = DEMO_NOTIFICATIONS.map((n, i) => ({
    ...n,
    id: `demo_notif_${i}`,
    read: i > 0,
    created_date: new Date(now - (i + 1) * 7200_000).toISOString(),
  }));
  write(KEYS.notifications, notifs);
  write(KEYS.seeded, true);
}