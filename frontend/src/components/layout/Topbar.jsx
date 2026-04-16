import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, X, Check, AlertTriangle, MessageSquare, CheckCircle2, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const notificationIcons = {
  task_assigned: CheckCircle2,
  deadline_warning: AlertTriangle,
  task_completed: Check,
  comment: MessageSquare,
  project_update: Folder,
};

const notificationColors = {
  task_assigned: 'text-primary-400',
  deadline_warning: 'text-amber-400',
  task_completed: 'text-emerald-400',
  comment: 'text-cyan-400',
  project_update: 'text-violet-400',
};

export default function Topbar({ title, subtitle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { currentUser } = useAuth();
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-surface-900/60 backdrop-blur-xl border-b border-surface-700/50">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-100">{title}</h1>
          {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 rounded-xl bg-surface-800/60 border border-surface-700/50 text-sm
                text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50
                focus:ring-1 focus:ring-primary-500/20 transition-all duration-200"
              id="global-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-surface-700/50 transition-colors duration-200"
              id="notification-bell"
            >
              <Bell className="w-5 h-5 text-surface-400" />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-96 glass-card shadow-glass overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700/50">
                    <h3 className="font-semibold text-surface-200">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-surface-500 py-8 text-sm">No notifications</p>
                    ) : (
                      notifications.map((notif) => {
                        const Icon = notificationIcons[notif.type] || Bell;
                        const colorClass = notificationColors[notif.type] || 'text-surface-400';
                        return (
                          <button
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-surface-700/30 transition-colors
                              text-left ${!notif.read ? 'bg-primary-500/5' : ''}`}
                          >
                            <div className={`mt-0.5 ${colorClass}`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? 'text-surface-200 font-medium' : 'text-surface-400'}`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-surface-500 mt-1">
                                {format(parseISO(notif.timestamp), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          {currentUser && (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer
                hover:ring-2 hover:ring-primary-500/30 transition-all duration-200"
              style={{ backgroundColor: currentUser.color + '25', color: currentUser.color }}
              title={currentUser.name}
            >
              {currentUser.initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
