import { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationCenter from './NotificationCenter';

export default function Header({ searchValue = '', onSearch = null, placeholder = 'Personel ara... Ctrl+K' }) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  useUser();
  const { safetyData } = useApp();
  const { addNotification } = useNotifications();

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

  const dateStr = time.toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = time.toLocaleTimeString('tr-TR', { hour12: false });

  // Dinamik Derived State (Risk var mı?)
  const criticalRisk = safetyData?.riskAssessments?.find(r => r.level.includes('Yüksek') || r.level.includes('Kritik'));

  const handleAlertClick = () => {
    if (criticalRisk) {
      addNotification({
        type: 'SAFETY',
        title: 'Kritik İSG Uyarısı',
        message: `${criticalRisk.department} departmanı acil müdahale gerektiriyor.`,
        targetDepartment: criticalRisk.department,
      });
      navigate('/operasyon-isg');
    }
  };

  return (
    <div className="flex flex-col sticky top-0 z-40">
      {/* Safety Alert Banner */}
      {criticalRisk && (
        <div 
          onClick={handleAlertClick}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 cursor-pointer shadow-md transition-colors"
        >
          <AlertTriangle className="w-5 h-5 animate-pulse flex-shrink-0" />
          <p className="text-xs font-bold tracking-wide uppercase">
            KRİTİK GÜVENLİK UYARISI: {criticalRisk.department} departmanında {criticalRisk.level} durumu tespit edildi ({criticalRisk.area})! Hemen inceleyin.
          </p>
        </div>
      )}
      
      <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 transition-colors duration-300">
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
        <NotificationCenter />
      </div>
      </header>
    </div>
  );
}
