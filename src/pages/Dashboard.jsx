import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, Sunrise, Clock, History, CheckCircle, UserPlus, DollarSign, ShieldCheck, Settings2, FileText, HeartPulse } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LeaveRequestTable from '../components/LeaveRequestTable';
import QuickView from '../components/QuickView';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

const AUDIT_ICONS = {
  approve: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  reject: { icon: Clock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
  add: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  payroll: { icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  role: { icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  system: { icon: Settings2, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-700/30' },
  feed: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
};

export default function Dashboard() {
  const { auditLogs, addAuditLog, approveAuditLog, addNotification } = useNotifications();
  const { activeUser } = useUser();
  const { employees, leaveRequests, updateEmployeePerformance, addEmployeeActivity } = useApp();
  
  const [feedText, setFeedText] = useState('');
  const [moodOption, setMoodOption] = useState(null);

  const moodData = [
    { name: 'Güvende', value: moodOption === 1 ? 76 : 75, color: '#10b981' },
    { name: 'Kısmen', value: moodOption === 2 ? 16 : 15, color: '#f59e0b' },
    { name: 'Güvensiz', value: moodOption === 3 ? 11 : 10, color: '#ef4444' }
  ];

  const handleFeedSubmit = () => {
    if (!feedText.trim()) return;
    
    // Global Audit Log
    addAuditLog(`${activeUser.name} şunu paylaştı: "${feedText.trim()}" - ${new Date().toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}`, 'feed', { employeeName: activeUser.name, department: activeUser.department, isApproved: false });
    
    // Kişisel Son Hareketler'e de ekle
    addEmployeeActivity(activeUser.name, `Durum Güncellemesi: "${feedText.trim()}"`, 'Şimdi', { type: 'feed', requiresApproval: true, isApproved: false });
    
    // Hedefli Bildirim (Sadece kendi departmanının müdürüne)
    addNotification({
      type: 'PERFORMANCE',
      title: 'Yeni Personel Hareketi',
      message: `Ekibinizden ${activeUser.name} yeni bir güncelleme paylaştı: "${feedText.trim()}"`,
      targetDepartment: activeUser.department,
      targetRole: 'departman_muduru',
      targetId: activeUser.name,
    });

    setFeedText('');
  };

  const handleApproveActivity = (log) => {
    approveAuditLog(log.id);
    updateEmployeePerformance(log.meta.employeeName, +5);
    
    // Çalışana bildirim gönder
    addNotification({
      type: 'SYSTEM',
      title: '⭐ Tebrikler!',
      message: `Müdürünüz son hareketinizi onayladı ve +5 performans puanı kazandınız!`,
      targetRole: 'personel',
      targetDepartment: log.meta.department
    });
  };

  const visibleEmployees = employees.filter(emp => activeUser?.isSuperAdmin || activeUser?.department === 'Global' || emp.department === activeUser?.department);
  const visibleRequests = leaveRequests.filter(req => {
      if (activeUser?.isSuperAdmin || activeUser?.department === 'Global') return true;
      const emp = employees.find(e => e.id === req.employeeId);
      return emp?.department === activeUser?.department;
  });

  const STAT_CARDS = [
    {
      label: 'Toplam Personel',
      value: visibleEmployees.length,
      icon: Users,
      colorClass: 'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
      delay: 0.05,
    },
    {
      label: 'Bugün İzinli',
      value: visibleEmployees.filter((e) => e.status === 'İzinli').length,
      icon: Sunrise,
      colorClass: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400',
      delay: 0.1,
    },
    {
      label: 'Bekleyen Talepler',
      value: visibleRequests.length,
      icon: Clock,
      colorClass: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400',
      delay: 0.15,
    },
  ];

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
            Hoşgeldiniz {activeUser?.name?.split(' ')[0]}, bugün her şey yolunda görünüyor 👋
          </p>
        </motion.div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STAT_CARDS.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        {/* Main layout: requests + quick view veya feed + quick view */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Mood Survey Widget */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center"
            >
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-primary" /> Haftalık Mood Anketi
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Bugün fabrikada kendini ne kadar güvende hissediyorsun?</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMoodOption(1)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${moodOption===1 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>Güvende 🟢</button>
                  <button onClick={() => setMoodOption(2)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${moodOption===2 ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>Kısmen 🟡</button>
                  <button onClick={() => setMoodOption(3)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${moodOption===3 ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>Güvensiz 🔴</button>
                </div>
              </div>
              
              <div className="w-28 h-28 relative flex-shrink-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                       <Pie data={moodData} innerRadius={28} outerRadius={46} dataKey="value" stroke="none">
                          {moodData.map((e,i) => <Cell key={i} fill={e.color} />)}
                       </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-xl font-bold text-slate-800 dark:text-slate-200">% {Math.round(moodData[0].value/(moodData[0].value+moodData[1].value+moodData[2].value)*100)}</span>
                 </div>
              </div>
            </motion.div>

            {/* Personel Durum Güncellemesi Alanı (Sadece personel rolü için) */}
            {activeUser?.role === 'personel' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                    {activeUser?.name?.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={feedText}
                      onChange={(e) => setFeedText(e.target.value)}
                      placeholder="Bugün ne üzerinde çalışıyorsunuz? Ekibinizi haberdar edin..."
                      className="w-full bg-transparent resize-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[60px]"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleFeedSubmit}
                        disabled={!feedText.trim()}
                        className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                        Paylaş
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeUser?.role !== 'personel' && <LeaveRequestTable />}
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
                  className="px-6 py-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 relative`}>
                      <IconComp className={`w-4.5 h-4.5 ${config.color}`} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {log.text}
                      </p>
                      {log.meta?.isApproved && (
                        <span className="inline-flex mt-1 items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-widest">
                           Müdür Onaylı ✅
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium self-start mt-1">{log.time}</span>
                  </div>
                  
                  {/* Approval Actions Array */}
                  {log.type === 'feed' && activeUser?.role !== 'personel' && activeUser?.department === log.meta?.department && !log.meta?.isApproved && (
                    <div className="pl-13 flex justify-start w-full">
                       <button
                         onClick={() => handleApproveActivity(log)}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm font-bold text-xs transition-transform active:scale-95"
                       >
                         <CheckCircle className="w-3.5 h-3.5" /> Aferin! (+5 Puan)
                       </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
