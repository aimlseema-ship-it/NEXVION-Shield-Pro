import { scanMessage } from "./detection";

// Simulated inbox message pools per platform (demo data).
// Each message is scored with the real NEXVION detection engine,
// so the spam counts are produced by our own rules — not hardcoded.

const POOLS = {
  Instagram: [
    { from: "@crypto_giveaway_x", time: "2m ago", text: "Congratulations! You won 1 BTC! Claim your prize now: http://bit.ly/claim-btc-now" },
    { from: "@official_giveaway_2026", time: "18m ago", text: "You have been selected for a FREE iPhone 15 Pro! Click here to claim: http://free-prize.tk/claim" },
    { from: "@sarah.johnson", time: "1h ago", text: "Hey! Loved your last post 😍 Where did you get that jacket?" },
    { from: "@crypto_invest_pro", time: "2h ago", text: "Make $5000 a week with our verified crypto bot! Send BTC to this wallet to start now." },
    { from: "@account_security_team", time: "3h ago", text: "We detected unusual activity. Share your 6-digit verification code to confirm your identity." },
    { from: "@mike_travels", time: "5h ago", text: "Hey, are we still on for the trip next weekend?" },
    { from: "@promo_winner", time: "7h ago", text: "You are our lucky winner! Send your bank details to claim your $10,000 prize." },
    { from: "@fashion.deals", time: "9h ago", text: "URGENT! Your account will be suspended. Verify now: http://insta-verify-login.tk" },
    { from: "@design.inspo", time: "11h ago", text: "Thanks for the follow! Check out my latest work 🎨" },
    { from: "@fitness.coach.amy", time: "1d ago", text: "New workout plan is live! Let me know what you think 💪" },
  ],
  Snapchat: [
    { from: "@snap_prize_bot", time: "4m ago", text: "You won free Snapchat premium! Verify your account now: http://snap-verify.tk" },
    { from: "@jess.photo", time: "40m ago", text: "omg did you see the sunset yesterday?? 🌅" },
    { from: "@crypto_snaps", time: "1h ago", text: "Double your money instantly! Send crypto to this wallet now." },
    { from: "@deal_alert", time: "2h ago", text: "Limited time! Claim your free gift card now: http://bit.ly/free-giftcard" },
    { from: "@winner_announce", time: "4h ago", text: "Congratulations! You are selected to win $5000. Click to claim now!" },
    { from: "@alex_r", time: "6h ago", text: "haha that meme was too good 😂" },
    { from: "@promo_official", time: "8h ago", text: "URGENT: verify your account within 24 hours or it will be closed." },
    { from: "@lucky_draw", time: "10h ago", text: "Final notice! You won the lottery. Send payment to release your prize." },
    { from: "@mia.k", time: "14h ago", text: "are you coming to the party tonight?" },
    { from: "@ben_codes", time: "1d ago", text: "shipped the new feature, check it out 🚀" },
  ],
  WhatsApp: [
    { from: "+91 98xxx xx210", time: "1m ago", text: "URGENT: Your bank account will be suspended in 24 hours. Verify now: http://secure-bank-verify.tk/login" },
    { from: "Mom", time: "25m ago", text: "Don't forget to buy milk on your way home 🙂" },
    { from: "+234 80xxx xx907", time: "1h ago", text: "Congratulations! You won a free iPhone 15 Pro! Click to claim: http://bit.ly/free-iphone-claim" },
    { from: "Work Group", time: "2h ago", text: "Meeting moved to 3pm tomorrow. See you all there." },
    { from: "+1 305xxx xx881", time: "3h ago", text: "This is Amazon support. Share your OTP to confirm your delivery address." },
    { from: "Priya", time: "5h ago", text: "Thanks for your help earlier! 🙏" },
    { from: "+44 77xxx xx334", time: "7h ago", text: "Your parcel is on hold. Pay a small fee to release it: http://delivery-fee.xyz/pay" },
    { from: "Dad", time: "9h ago", text: "Call me when you're free." },
    { from: "+91 70xxx xx455", time: "11h ago", text: "You have been selected for a government subsidy. Send your Aadhaar and bank details now." },
    { from: "Football Group", time: "1d ago", text: "Match starts at 8, who's in?" },
  ],
  Telegram: [
    { from: "@airdrop_official_bot", time: "3m ago", text: "Your wallet is eligible for the $5000 airdrop! Connect and claim now: http://airdrop-claim.tk" },
    { from: "@dev_group", time: "30m ago", text: "Pushed the fix to staging, please review." },
    { from: "@crypto_signals_vip", time: "1h ago", text: "GUARANTEED 300% returns! Send BTC to join our VIP signals now." },
    { from: "@telegram_support", time: "2h ago", text: "We detected a login attempt. Share your verification code to secure your account." },
    { from: "@news_channel", time: "4h ago", text: "Breaking: markets rally after new policy announcement." },
    { from: "@free_premium", time: "6h ago", text: "Congratulations! You won Telegram Premium for a year! Claim now: http://bit.ly/tg-premium" },
    { from: "@investment_advisor", time: "8h ago", text: "Double your money in 24 hours. Send payment to start now." },
    { from: "@study_group", time: "10h ago", text: "Notes for chapter 5 are uploaded 📚" },
    { from: "@startup_team", time: "13h ago", text: "Standup in 10 minutes, don't forget!" },
    { from: "@art_share", time: "1d ago", text: "New piece finished today, thoughts? 🎨" },
  ],
  Gmail: [
    { from: "security@paypa1-verify.com", time: "6m ago", text: "URGENT: Your PayPal account has been suspended. Verify now: http://paypa1-login.com/verify" },
    { from: "colleague@company.com", time: "45m ago", text: "Please review the attached document for our meeting tomorrow." },
    { from: "no-reply@amaz0n-alerts.xyz", time: "2h ago", text: "Your order is on hold. Confirm your payment details: http://amaz0n-verify.xyz/pay" },
    { from: "winner@lottery-intl.com", time: "3h ago", text: "Congratulations! You won $1,000,000 in the international lottery. Send your bank details to claim." },
    { from: "newsletter@medium.com", time: "5h ago", text: "Your weekly reading list is here 📬" },
    { from: "support@apple-icloud-secure.tk", time: "7h ago", text: "Your iCloud storage is full. Update your password now: http://icloud-verify.tk" },
    { from: "crypto@binance-alerts.co", time: "9h ago", text: "Suspicious login detected. Verify your account immediately: http://binance-verify.co/login" },
    { from: "friend@gmail.com", time: "11h ago", text: "Are we still meeting for lunch on Friday?" },
    { from: "hr@company.com", time: "1d ago", text: "Reminder: submit your timesheet by end of day." },
    { from: "team@github.com", time: "1d ago", text: "Your pull request has been merged ✅" },
  ],
  SMS: [
    { from: "+1 555-0142", time: "2m ago", text: "URGENT: Your bank account has been suspended. Verify now: http://secure-bank-verify.tk/login" },
    { from: "John", time: "35m ago", text: "See you at 7 for dinner?" },
    { from: "+1 555-0199", time: "1h ago", text: "Congratulations! You won a $1000 gift card! Claim now: http://bit.ly/claim-giftcard" },
    { from: "+1 555-0177", time: "3h ago", text: "Your parcel is on hold. Pay the delivery fee here: http://delivery-fee.xyz/pay" },
    { from: "Bank Alerts", time: "4h ago", text: "Your package will arrive today between 2-4pm." },
    { from: "+1 555-0123", time: "6h ago", text: "You have been selected for a free vacation! Click to claim now: http://bit.ly/free-vacation" },
    { from: "Mom", time: "8h ago", text: "Happy birthday! 🎉" },
    { from: "+1 555-0155", time: "10h ago", text: "Final notice: your account will be closed. Verify your identity now." },
    { from: "Appointment", time: "1d ago", text: "Reminder: dentist appointment tomorrow at 10am." },
    { from: "Delivery", time: "1d ago", text: "Your order #4821 has been delivered. Thanks!" },
  ],
};

const RANK = { safe: 0, low: 1, medium: 2, high: 3, critical: 4 };

export function scanInbox(platform) {
  const pool = POOLS[platform] || POOLS.Instagram;
  const results = pool.map((m) => {
    const scan = scanMessage(m.text);
    return { from: m.from, time: m.time, text: m.text, ...scan };
  });
  const flagged = results
    .filter((r) => r.riskLevel !== "safe")
    .sort((a, b) => RANK[b.riskLevel] - RANK[a.riskLevel] || b.riskScore - a.riskScore);
  const spamCount = flagged.length;
  const topRisk = flagged[0]?.riskLevel || "safe";
  return {
    total: results.length,
    spamCount,
    safeCount: results.length - spamCount,
    topRisk,
    flagged,
    scannedAt: new Date().toISOString(),
  };
}

export const PLATFORM_POOL_SIZE = (platform) => (POOLS[platform] || []).length;