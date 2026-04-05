import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  Building2,
  TrendingUp,
  Wallet,
  Briefcase
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/personel-listesi', label: 'Çalışan Listesi', icon: Users },
  { path: '/ise-alim', label: 'İşe Alım (ATS)', icon: Briefcase },
  { path: '/izin-takvimi', label: 'İzin Takvimi', icon: CalendarDays },
  { path: '/performans', label: 'Performans', icon: TrendingUp },
  { path: '/bordro', label: 'Bordro & Belgeler', icon: Wallet },
  { path: '/ayarlar', label: 'Ayarlar', icon: Settings },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 280, damping: 30 },
  },
};

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-sm z-20 transition-colors duration-300"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              HRCore
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-0.5">
              İK Yönetim Sistemi
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ path, label, icon: Icon }, index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.1 }}
          >
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </span>
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGPSVUyjrtwjpS-5YwLe2VOFnGamVdLBt8zJj0EEUzKwR0laaNwcAAzkJMTF-OdR-4TTjJXvYHb__KxKB_pr_fcIeeYjrwwLr6NAHCfN0jBlLKtx3Py5yfH33u0JToSgP5px_8q5OsEltEn9Av2bmlRSJFI4VqaYWk1eagUMqOJEiwjYl5Mbfw4KD-abHsCilHqWE_tyzS_3EIRr9783xPi_Gjy0bmmNWL2PmEB7OzLNLqV0EEE_WLF5xe3RUFPc5wGsyoy4xpaM-h"
              alt="HR Manager"
              className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-600 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Selin Yılmaz</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">İK Müdürü</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800/30"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </motion.aside>
  );
}
