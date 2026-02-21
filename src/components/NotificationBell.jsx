import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, Info, Wrench, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// ── Helpers ──────────────────────────────────────────────────
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const TYPE_STYLE = {
  critical: { icon: AlertTriangle, dot: 'bg-red-500',    text: 'text-red-500',    bg: 'bg-red-50'    },
  warning:  { icon: AlertTriangle, dot: 'bg-amber-400',  text: 'text-amber-500',  bg: 'bg-amber-50'  },
  info:     { icon: Info,          dot: 'bg-blue-500',   text: 'text-blue-500',   bg: 'bg-blue-50'   },
  system:   { icon: Wrench,        dot: 'bg-gray-400',   text: 'text-gray-500',   bg: 'bg-gray-50'   },
};

// ── Notification item row ─────────────────────────────────────
function NotifItem({ notif, onRead }) {
  const id    = notif.id ?? notif._id;
  const style = TYPE_STYLE[notif.type] ?? TYPE_STYLE.info;
  const Icon  = style.icon;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${notif.read ? 'opacity-60' : ''}`}
    >
      {/* Type icon */}
      <div className={`w-7 h-7 rounded-full ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={13} className={style.text} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold text-gray-800 leading-snug ${!notif.read ? 'font-bold' : ''}`}>
            {notif.title}
          </p>
          {!notif.read && (
            <button
              onClick={() => onRead(id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-300 hover:text-gray-500 shrink-0"
              aria-label="Mark as read"
            >
              <X size={11} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
        <p className="text-[10px] text-gray-300 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0 mt-1.5`} />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
function NotificationBell() {
  const { unreadCount, notifications, fetchList, markRead, markAllRead } = useNotifications();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open]);

  const toggle = useCallback(() => {
    if (!open) {
      setOpen(true);
      setLoading(true);
      fetchList().finally(() => setLoading(false));
    } else {
      setOpen(false);
    }
  }, [open, fetchList]);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={toggle}
        className={`relative p-2 transition-colors ${open ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium leading-none px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ maxHeight: 420 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs font-medium text-gray-400">({unreadCount} unread)</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {loading ? (
              <div className="space-y-0 py-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-50 rounded w-full" />
                      <div className="h-2 bg-gray-50 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell size={28} className="text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No notifications</p>
                <p className="text-xs text-gray-300 mt-0.5">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <NotifItem
                    key={n.id ?? n._id}
                    notif={n}
                    onRead={markRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
