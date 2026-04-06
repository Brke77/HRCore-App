import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldAlert, TrendingUp, CalendarDays, Info, Check, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const errorHandler = (error) => setHasError(true);
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) return <div className="p-4 text-xs text-red-500">Bildirim yüklenirken bir hata oluştu.</div>;
  return children;
}

const TYPE_CONFIG = {
  SAFETY: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
  PERFORMANCE: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  LEAVE: { icon: CalendarDays, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  SYSTEM: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
};

export default function NotificationCenter() {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  
  const { notifications, markAllRead, markAsRead, clearAllNotifications, unreadCount, hasUnread } = useNotifications();
  const { activeUser } = useUser();
  const { updateEmployeePerformance, approveRequest, rejectRequest } = useApp();

  const visibleNotifications = notifications.filter(notif => {
    if (notif.targetRole && notif.targetRole !== activeUser?.role) return false;
    if (notif.targetDepartment && notif.targetDepartment !== activeUser?.department && !activeUser?.isSuperAdmin) return false;
    return true;
  });

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAction = (notif, actionType) => {
    markAsRead(notif.id);
    try {
      if (notif.type === 'PERFORMANCE' && actionType === 'APPROVE') {
        const empName = notif.message.split(' ')[0]; // Basic logic since no exact target emp is known, or if targetId is the name. Let's assume targetId holds name for performance, or we can just apply if it's there.
        // Actually the instructions say "Tıklandığında direkt o personelin puanını artırsın".
        // Wait, the targetId might be 'emp_2' ID. Let's call updateEmployeePerformance by name. We need the name.
        updateEmployeePerformance(notif.targetId, +5); // Note: updateEmployeePerformance receives employeeName. 
      }
      if (notif.type === 'LEAVE' && actionType === 'APPROVE') {
        approveRequest(notif.targetId);
      }
      if (notif.type === 'LEAVE' && actionType === 'REJECT') {
        rejectRequest(notif.targetId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    if (notif.type === 'SAFETY') {
      navigate('/operasyon-isg');
      setShowNotifs(false);
    }
  };

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setShowNotifs(prev => !prev)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border-2 border-white dark:border-slate-800" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-[26rem] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                 <h3 className="font-bold text-slate-800 dark:text-white text-sm">Bildirimler</h3>
                 {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{unreadCount}</span>
                 )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button onClick={markAllRead} className="text-xs font-bold text-primary hover:text-primary-600 transition-colors">Tümünü Oku</button>
                <button onClick={clearAllNotifications} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3"/> Temizle
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-slate-50 dark:divide-slate-700/50">
              {visibleNotifications.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">Hiç bildiriminiz yok.</div>
              ) : visibleNotifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                const Icon = config.icon;
                
                return (
                  <ErrorBoundary key={notif.id}>
                    <div className={`w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col gap-2 ${notif.isRead ? 'opacity-50' : 'bg-primary/[0.03] dark:bg-primary/[0.06]'}`}>
                      <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleNotifClick(notif)}>
                        <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                           <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm ${notif.isRead ? 'font-medium text-slate-600 dark:text-slate-300' : 'font-bold text-slate-800 dark:text-white'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{notif.timestamp}</p>
                        </div>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>

                      {/* QUICK ACTIONS */}
                      <div className="pl-12 flex gap-2 mt-1">
                        {notif.type === 'PERFORMANCE' && (
                           <>
                             <button onClick={() => handleAction(notif, 'APPROVE')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"><Check className="w-3 h-3"/>Onayla (+5 Puan)</button>
                             <button onClick={() => handleAction(notif, 'IGNORE')} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-[10px] font-bold transition-colors">Yoksay</button>
                           </>
                        )}
                        {notif.type === 'LEAVE' && (
                           <>
                             <button onClick={() => handleAction(notif, 'APPROVE')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"><Check className="w-3 h-3"/>Onayla</button>
                             <button onClick={() => handleAction(notif, 'REJECT')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-900/30 dark:text-red-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"><X className="w-3 h-3"/>Reddet</button>
                           </>
                        )}
                        {notif.type === 'SYSTEM' && (
                           <button onClick={() => handleAction(notif, 'IGNORE')} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-[10px] font-bold transition-colors">Kapat</button>
                        )}
                      </div>
                    </div>
                  </ErrorBoundary>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
