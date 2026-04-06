import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
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
  Briefcase,
  ChevronDown,
  Check,
  UserCog,
  ShieldAlert,
  Package,
  GraduationCap,
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/personel-listesi', label: 'Çalışan Listesi', icon: Users },
  { path: '/ise-alim', label: 'İşe Alım (ATS)', icon: Briefcase },
  { path: '/izin-takvimi', label: 'İzin Takvimi', icon: CalendarDays },
  { path: '/performans', label: 'Performans', icon: TrendingUp },
  { path: '/operasyon-isg', label: 'Operasyon & İSG', icon: ShieldAlert, restricted: true },
  { path: '/demirbas', label: 'Demirbaş Takibi', icon: Package },
  { path: '/egitim', label: 'Eğitim & Sertifika', icon: GraduationCap },
  { path: '/bordro', label: 'Bordro & Belgeler', icon: Wallet },
  { path: '/ayarlar', label: 'Ayarlar', icon: Settings },
];

const ROLE_COLORS = {
  ik_muduru: {
    bg: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    ring: 'ring-emerald-400/30',
  },
  finans_muduru: {
    bg: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    ring: 'ring-blue-400/30',
  },
  departman_muduru: {
    bg: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
    ring: 'ring-indigo-400/30',
  },
  admin: {
    bg: 'bg-primary',
    badge: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300',
    ring: 'ring-primary/30',
  },
  personel: {
    bg: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400',
    ring: 'ring-slate-400/30',
  },
};

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 280, damping: 30 },
  },
};

function UserAvatar({ user, size = 'md' }) {
  const colors = ROLE_COLORS[user?.role] || ROLE_COLORS.personel;
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm';

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClass} rounded-full border-2 border-slate-100 dark:border-slate-600 object-cover ring-2 ${colors.ring}`}
      />
    );
  }
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${sizeClass} rounded-full ${colors.bg} flex items-center justify-center text-white font-bold ring-2 ${colors.ring}`}>
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { activeUser, switchUser, MOCK_USERS } = useUser();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const switcherRef = useRef(null);

  const colors = ROLE_COLORS[activeUser?.role] || ROLE_COLORS.ik_muduru;

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        {NAV_ITEMS.map(({ path, label, icon: Icon, restricted }, index) => {
          if (restricted && activeUser?.role !== 'ik_muduru' && activeUser?.role !== 'admin' && activeUser?.role !== 'departman_muduru') {
            return null;
          }

          return (
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
          );
        })}
      </nav>

      {/* User Switcher */}
      <div className="px-3 pb-2 border-t border-slate-100 dark:border-slate-700 pt-3" ref={switcherRef}>
        {/* Aktif Kullanıcı Değiştir Butonu */}
        <button
          onClick={() => setShowSwitcher((prev) => !prev)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
          <UserCog className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors flex-1 text-left">
            Kullanıcı Değiştir
          </span>
          <motion.div animate={{ rotate: showSwitcher ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </motion.div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {showSwitcher && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="mt-1 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden"
              style={{ background: 'var(--tw-bg-opacity, none)' }}
            >
              <div className="p-2 space-y-1">
                {MOCK_USERS.map((user) => {
                  const uc = ROLE_COLORS[user?.role] || ROLE_COLORS.personel;
                  const isActive = activeUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setShowSwitcher(false);
                        navigate('/dashboard');
                        setTimeout(() => switchUser(user.id), 10);
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary/5 dark:bg-primary/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <UserAvatar user={user} size="sm" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {user.name}
                        </p>
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${uc.badge}`}>
                          {user.roleLabel}
                        </span>
                      </div>
                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active User Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUser.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="relative">
              <UserAvatar user={activeUser} />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{activeUser?.name}</p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                {activeUser?.roleLabel}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
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
