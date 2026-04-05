import { motion } from 'framer-motion';
import { Users, Sunrise, Clock, History, CheckCircle, UserPlus, DollarSign, ShieldCheck, Settings2 } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LeaveRequestTable from '../components/LeaveRequestTable';
import QuickView from '../components/QuickView';
import { STATS } from '../data/mockData';
import { useNotifications } from '../context/NotificationContext';

const STAT_CARDS = [
  {
    label: 'Toplam Personel',
    value: STATS.totalEmployees,
    icon: Users,
    colorClass: 'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
    delay: 0.05,
  },
  {
    label: 'Bugün İzinli',
    value: STATS.onLeaveToday,
    icon: Sunrise,
    colorClass: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400',
    delay: 0.1,
  },
  {
    label: 'Bekleyen Talepler',
    value: STATS.pendingRequests,
    icon: Clock,
    colorClass: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400',
    delay: 0.15,
  },
];

const AUDIT_ICONS = {
  approve: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  reject: { icon: Clock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
  add: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  payroll: { icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  role: { icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  system: { icon: Settings2, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-700/30' },
};

export default function Dashboard() {
  const { auditLogs } = useNotifications();

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-auto">
      <Header />
      <div className="p-8 space-y-8">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            İK Yönetim Paneli
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Hoşgeldiniz Selin, bugün her şey yolunda görünüyor 👋
          </p>
        </motion.div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STAT_CARDS.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        {/* Main layout: requests + quick view */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <LeaveRequestTable />
          </div>
          <div className="lg:col-span-4">
            <QuickView />
          </div>
        </section>

        {/* Audit Log Panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <History className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Son İşlemler</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Sistem hareket logları</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {auditLogs.slice(0, 5).map((log, i) => {
              const config = AUDIT_ICONS[log.type] || AUDIT_ICONS.system;
              const IconComp = config.icon;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <IconComp className={`w-4.5 h-4.5 ${config.color}`} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{log.text}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">{log.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
