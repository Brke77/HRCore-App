import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
  Briefcase,
  Zap,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/personel-listesi', label: 'Çalışan Listesi', icon: Users },
  { path: '/ise-alim', label: 'İşe Alım (ATS)', icon: Briefcase },
  { path: '/izin-takvimi', label: 'İzin Takvimi', icon: CalendarDays },
  { path: '/performans', label: 'Performans', icon: TrendingUp },
  { path: '/operasyon-isg', label: 'Operasyon & İSG', icon: ShieldAlert, restricted: true },
  { path: '/ie-optimizer', label: 'IE Optimizer', icon: Zap },
  { path: '/demirbas', label: 'Demirbaş Takibi', icon: Package },
  { path: '/egitim', label: 'Eğitim & Sertifika', icon: GraduationCap },
  { path: '/bordro', label: 'Bordro & Belgeler', icon: Wallet },
  { path: '/ayarlar', label: 'Ayarlar', icon: Settings },
];

const ROLE_COLORS = {
  SUPER_ADMIN: {
    bg: 'bg-primary',
    badge: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300',
    ring: 'ring-primary/30',
  },
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

function UserAvatar({ user }) {
  const colors = ROLE_COLORS[user?.role] || ROLE_COLORS.personel;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-600 object-cover ring-2 ${colors.ring}`}
      />
    );
  }

  const initials = (user?.name || 'HR')
    .split(' ')
    .map((token) => token[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold ring-2 ${colors.ring}`}>
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { activeUser } = useUser();
  const { logout } = useAuth();

  const colors = ROLE_COLORS[activeUser?.role] || ROLE_COLORS.personel;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-sm z-20 transition-colors duration-300">
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
              Secure Workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ path, label, icon: Icon, restricted }) => {
          if (
            restricted &&
            !activeUser?.isSuperAdmin &&
            activeUser?.role !== 'ik_muduru' &&
            activeUser?.role !== 'departman_muduru'
          ) {
            return null;
          }

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <UserAvatar user={activeUser} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{activeUser?.name}</p>
            <div className="flex flex-col gap-1 mt-1">
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                {activeUser?.roleLabel}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 truncate">
                {activeUser?.department}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800/30"
        >
          <LogOut className="w-4 h-4" />
          Oturumu Kapat
        </button>
      </div>
    </aside>
  );
}
