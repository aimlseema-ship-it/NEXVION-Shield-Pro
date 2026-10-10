import { useState, useEffect } from "react";
import { Bell, CheckCheck, BellOff, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/store";

const TYPE_CONFIG = {
  critical: { icon: ShieldAlert, bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  high: { icon: AlertTriangle, bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  info: { icon: Info, bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const refresh = () => setNotifications(getNotifications());

  const handleRead = (id) => {
    markNotificationRead(id);
    refresh();
  };

  const handleAllRead = () => {
    markAllNotificationsRead();
    refresh();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.` : "You're all caught up."}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleAllRead} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No notifications yet. You'll be alerted when threats are detected.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && handleRead(n.id)}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  n.read ? "border-slate-200 opacity-70" : `${cfg.border} hover:shadow-md`
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1.5">{new Date(n.created_date).toLocaleString()}</p>
                </div>
                {n.read && <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0 mt-1" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}