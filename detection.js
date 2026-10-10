// NEXVION — Rule-based detection engine (no paid APIs)

const SEVERITY_SCORES = { low: 12, medium: 22, high: 35, critical: 50 };

function calculateRisk(issues) {
  const score = Math.min(issues.reduce((s, i) => s + SEVERITY_SCORES[i.severity], 0), 100);
  let level;
  if (score === 0) level = "safe";
  else if (score <= 20) level = "low";
  else if (score <= 50) level = "medium";
  else if (score <= 78) level = "high";
  else level = "critical";
  return { riskScore: score, riskLevel: level };
}

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".xyz", ".click", ".loan", ".work", ".kim", ".science", ".review", ".country", ".bid", ".date"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "shorte.st", "cutt.ly", "t.me"];
const BRANDS = ["paypal", "google", "apple", "amazon", "microsoft", "facebook", "instagram", "netflix", "whatsapp", "snapchat", "telegram", "gmail", "outlook", "binance", "coinbase"];

export function analyzeUrl(rawUrl) {
  const issues = [];
  const url = rawUrl.trim();
  const lower = url.toLowerCase();

  if (!/^https?:\/\//i.test(url)) {
    issues.push({ id: "no_protocol", severity: "low", title: "Missing Protocol", message: "URL has no http:// or https:// prefix." });
  }

  // IP address as host
  if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(url)) {
    issues.push({ id: "ip_url", severity: "critical", title: "IP Address URL", message: "Uses a raw IP address instead of a domain — very common in phishing." });
  }

  const hostMatch = lower.match(/https?:\/\/([^\/\?:#]+)/);
  const host = hostMatch ? hostMatch[1].replace(/^www\./, "") : lower;

  // Suspicious TLD
  if (SUSPICIOUS_TLDS.some((tld) => lower.includes(tld))) {
    issues.push({ id: "suspicious_tld", severity: "high", title: "Suspicious Domain Extension", message: "Uses a domain extension frequently associated with spam and scams." });
  }

  // Shortener
  if (SHORTENERS.some((s) => lower.includes(s))) {
    issues.push({ id: "shortener", severity: "medium", title: "Shortened URL", message: "Uses a URL shortener that hides the real destination. Expand it before trusting." });
  }

  // Many subdomains
  if (host && host.split(".").length > 4) {
    issues.push({ id: "subdomains", severity: "medium", title: "Excessive Subdomains", message: "Has an unusually high number of subdomains, often used to mimic legitimate sites." });
  }

  // Many hyphens
  if (host && (host.match(/-/g) || []).length > 2) {
    issues.push({ id: "hyphens", severity: "medium", title: "Many Hyphens in Domain", message: "Domain contains multiple hyphens — a common phishing pattern." });
  }

  // Brand misspelling
  BRANDS.forEach((brand) => {
    const levenshtein = (a, b) => {
      const m = a.length, n = b.length;
      const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
          dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      return dp[m][n];
    };
    const parts = host.split(".");
    parts.forEach((part) => {
      if (part.length >= 4 && part !== brand && levenshtein(part, brand) === 1) {
        issues.push({ id: "misspelled_brand", severity: "critical", title: "Misspelled Brand Domain", message: `"${part}" closely resembles "${brand}" but is misspelled — a classic phishing trick.` });
      }
    });
  });

  // Insecure
  if (lower.startsWith("http://")) {
    issues.push({ id: "insecure", severity: "medium", title: "Insecure HTTP", message: "Uses unencrypted HTTP instead of HTTPS. Legitimate sites use HTTPS." });
  }

  // @ symbol
  if (url.includes("@") && url.indexOf("@") < url.indexOf("/", 8)) {
    issues.push({ id: "at_symbol", severity: "high", title: "URL Redirect Obfuscation", message: "Contains an @ symbol which can redirect to a different site than expected." });
  }

  // Excessive length
  if (url.length > 100) {
    issues.push({ id: "long_url", severity: "low", title: "Excessively Long URL", message: "Unusually long URL, which can hide the real destination." });
  }

  // Login keywords
  if (/(login|signin|verify|account|update|secure|wallet|password|reset)/i.test(lower) && issues.length > 0) {
    issues.push({ id: "credential_keywords", severity: "high", title: "Credential-Harvesting Keywords", message: "URL contains keywords commonly used in credential-stealing pages." });
  }

  return issues;
}

const MESSAGE_RULES = [
  {
    id: "otp_request",
    severity: "critical",
    title: "OTP / Verification Code Request",
    test: (t) => /(\botp\b|one[- ]time password|verification code|enter.*code|share.*code|send.*code|6[- ]?digit)/i.test(t),
    message: "Asks for an OTP or verification code. No legitimate service will ever ask for these.",
  },
  {
    id: "personal_info",
    severity: "critical",
    title: "Sensitive Information Request",
    test: (t) => /(password|credit card|cvv|card number|ssn|social security|pin code|mother.?s maiden|date of birth|aadhaar|passport)/i.test(t),
    message: "Requests sensitive personal or financial information. Never share these via message.",
  },
  {
    id: "payment",
    severity: "high",
    title: "Payment / Money Request",
    test: (t) => /(send (money|payment)|wire|bank transfer|\bupi\b|bitcoin|crypto|wallet|deposit|payment (required|now|due|pending)|send.*\$|pay.*fee)/i.test(t),
    message: "Requests a payment or money transfer. Always verify through official channels first.",
  },
  {
    id: "fake_offer",
    severity: "high",
    title: "Too-Good-To-Be-True Offer",
    test: (t) => /(you (won|win)|congratulations|prize|lottery|gift card|free (gift|prize|iphone|money|btc)|claim (now|your)|selected (for|to)|100% free|get.*free)/i.test(t),
    message: "Promises rewards or prizes that are almost certainly fake — designed to bait you.",
  },
  {
    id: "threat",
    severity: "high",
    title: "Account Suspension Threat",
    test: (t) => /(account (suspended|blocked|closed|locked|terminated|disabled)|verify (your )?account|confirm your identity|your account will be)/i.test(t),
    message: "Threatens account suspension to panic you into acting without verifying.",
  },
  {
    id: "urgency",
    severity: "medium",
    title: "False Urgency",
    test: (t) => /(urgent|immediately|act now|right now|asap|within \d+ (hours|minutes)|expires|last chance|final (notice|warning|reminder)|limited time)/i.test(t),
    message: "Creates artificial urgency to pressure you into acting without thinking.",
  },
  {
    id: "impersonation",
    severity: "medium",
    title: "Possible Impersonation",
    test: (t) => /(we are (from|with)|official (team|account|message)|support team|customer service|security team|from (the|your) (bank|government|agency)|on behalf of)/i.test(t),
    message: "May be impersonating a trusted organization or authority.",
  },
  {
    id: "phishing_link",
    severity: "high",
    title: "Suspicious Link",
    test: (t) => {
      const urls = t.match(/https?:\/\/[^\s]+/gi) || [];
      return urls.some((u) => analyzeUrl(u).some((i) => ["critical", "high"].includes(i.severity)));
    },
    message: "Contains links that may lead to phishing or malware sites.",
  },
  {
    id: "grammar_anomaly",
    severity: "low",
    title: "Unusual Language / Grammar",
    test: (t) => /(dear (customer|user|sir|madam)|kindly|revert back|do the needful|urgent reply|pls\b|ur\b|\bu\b \br\b)/i.test(t) || (t.match(/\b\w+\b/g) || []).length > 0 && (t.match(/!/g) || []).length > 3,
    message: "Contains unusual phrasing or excessive punctuation common in scam messages.",
  },
];

function generateRecommendations(issues) {
  const recs = [];
  const has = (id) => issues.some((i) => i.id === id);
  if (has("otp_request") || has("personal_info")) recs.push("Never share OTPs, passwords, or financial details with anyone — no legitimate service will ask.");
  if (has("phishing_link")) recs.push("Do not click any links in this message. If you need to visit a site, type the address manually in your browser.");
  if (has("payment")) recs.push("Verify any payment request through official channels before sending money.");
  if (has("fake_offer")) recs.push("If it seems too good to be true, it probably is. Never pay a fee to claim a prize.");
  if (has("urgency") || has("threat")) recs.push("Scammers create urgency to make you act fast. Pause and verify independently.");
  if (has("impersonation")) recs.push("Contact the organization directly using their official website or phone number — never the one in the message.");
  if (recs.length === 0) recs.push("No major threats detected, but always stay cautious with unexpected messages.");
  recs.push("Report and block the sender if you suspect a scam.");
  return recs;
}

export function scanMessage(text) {
  const issues = MESSAGE_RULES.filter((r) => r.test(text)).map((r) => ({ id: r.id, severity: r.severity, title: r.title, message: r.message }));
  const risk = calculateRisk(issues);
  const recommendations = generateRecommendations(issues);
  const summary =
    issues.length === 0
      ? "This message appears safe. No suspicious patterns were detected."
      : `Detected ${issues.length} potential threat indicator${issues.length > 1 ? "s" : ""}.`;
  return { ...risk, issues, recommendations, summary };
}

export function scanUrl(url) {
  const issues = analyzeUrl(url);
  const risk = calculateRisk(issues);
  const recommendations = generateRecommendations(issues);
  const summary =
    issues.length === 0
      ? "This URL appears safe. No suspicious indicators were detected."
      : `Detected ${issues.length} suspicious indicator${issues.length > 1 ? "s" : ""} in this URL.`;
  return { ...risk, issues, recommendations, summary };
}

export function scanProfile(data) {
  const issues = [];
  const { username, displayName, bio, followers, following, posts, hasProfilePic, accountAgeDays } = data;

  if (!hasProfilePic) issues.push({ id: "no_pic", severity: "medium", title: "No Profile Picture", message: "Account has no profile picture, common in fake accounts." });
  if (accountAgeDays < 30) issues.push({ id: "very_new", severity: "high", title: "Recently Created Account", message: `Account is only ${accountAgeDays} days old. Scammers frequently create fresh accounts.` });
  else if (accountAgeDays < 90) issues.push({ id: "new", severity: "low", title: "New Account", message: "Account is relatively new (under 3 months)." });
  if (username && (username.match(/\d/g) || []).length > 5) issues.push({ id: "random_numbers", severity: "medium", title: "Username with Many Numbers", message: "Username contains many random numbers — a common fake-account pattern." });
  if (followers < 50) issues.push({ id: "few_followers", severity: "medium", title: "Very Few Followers", message: "Account has very few followers for its claimed identity." });
  if (following > 0 && following > followers * 5 && following > 100) issues.push({ id: "ratio", severity: "medium", title: "Following-to-Follower Imbalance", message: "Follows many accounts but has few followers — typical of bot or fake accounts." });
  if (!bio || bio.trim().length === 0) issues.push({ id: "no_bio", severity: "low", title: "No Bio", message: "Account has no bio, which is unusual for legitimate accounts." });
  if (posts === 0) issues.push({ id: "no_posts", severity: "medium", title: "No Posts", message: "Account has no posts, common in fake or bot accounts." });
  if (/^(user|test|temp|fake|new|admin|real)/i.test(displayName || "")) issues.push({ id: "generic_name", severity: "low", title: "Generic Display Name", message: "Uses a generic or placeholder display name." });
  if (/verified|official|real account|the real/i.test(bio || "")) issues.push({ id: "self_verify", severity: "high", title: "Self-Claimed Verification", message: 'Bio claims to be "verified" or "official" without a badge — impersonation red flag.' });

  const risk = calculateRisk(issues);
  const recommendations = generateRecommendations(issues);
  const summary =
    issues.length === 0
      ? "This profile appears legitimate. No suspicious indicators were detected."
      : `Detected ${issues.length} suspicious indicator${issues.length > 1 ? "s" : ""}.`;
  return { ...risk, issues, recommendations, summary };
}

export const RISK_CONFIG = {
  safe: { label: "Safe", color: "#16a34a", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", ring: "text-green-600" },
  low: { label: "Low Risk", color: "#65a30d", bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", ring: "text-lime-600" },
  medium: { label: "Medium Risk", color: "#d97706", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "text-amber-600" },
  high: { label: "High Risk", color: "#ea580c", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", ring: "text-orange-600" },
  critical: { label: "Critical Risk", color: "#dc2626", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", ring: "text-red-600" },
};

export const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "#dc2626", bg: "bg-red-100", text: "text-red-700" },
  high: { label: "High", color: "#ea580c", bg: "bg-orange-100", text: "text-orange-700" },
  medium: { label: "Medium", color: "#d97706", bg: "bg-amber-100", text: "text-amber-700" },
  low: { label: "Low", color: "#65a30d", bg: "bg-lime-100", text: "text-lime-700" },
};