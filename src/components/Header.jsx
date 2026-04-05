import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';

export default function Header({ searchValue = '', onSearch = null, placeholder = 'Personel ara... Ctrl+K' }) {
  const [time, setTime] = useState(new Date());
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, hasUnread, unreadCount, markAllRead, markAsRead } = useNotifications();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(timer);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dateStr = time.toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = time.toLocaleTimeString('tr-TR', { hour12: false });

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
      {/* Search */}
      <div className="relative w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" />
        <input
          id="global-search"
          type="text"
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/30 focus:bg-white dark:focus:bg-slate-600 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Right tools */}
      <div className="flex items-center gap-5">
        {/* Date/time */}
        <motion.div
          className="text-right hidden sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{dateStr}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">{timeStr}</p>
        </motion.div>

        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(prev => !prev)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full transition-colors"
          >
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border-2 border-white dark:border-slate-800" />
              </span>
            )}
          </button>

          {/* Notification Popover */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Bildirimler</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{unreadCount} yeni</span>
                    )}
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold text-primary hover:text-primary-700 transition-colors"
                    >
                      Tümünü Oku
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-50 dark:divide-slate-700/50">
                  {notifications.slice(0, 5).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-start gap-3 ${!notif.read ? 'bg-primary/[0.03] dark:bg-primary/[0.06]' : ''}`}
                    >
                      <span className="text-xl mt-0.5">{notif.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                          {notif.text}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => { navigate('/ayarlar'); setShowNotifs(false); }}
                    className="w-full py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Bildirim Ayarlarını Yönet →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
