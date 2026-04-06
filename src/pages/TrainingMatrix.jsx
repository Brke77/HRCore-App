import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { GraduationCap, AlertTriangle, CheckCircle, Search, CalendarClock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';

const TRAININGS = [
  'İSG Temel Eğitimi (16 Saat)',
  'Yüksekte Çalışma Sertifikası',
  'İlkyardım Eğitimi',
  'Çevre Yönetimi ISO 14001',
  'İngilizce B2 Seviye'
];

export default function TrainingMatrix() {
  const { employees } = useApp();
  const { activeUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  // Sadece yetkili veya kendi departmanındakileri gör
  const visibleEmployees = employees.filter(emp => {
    if (activeUser?.isSuperAdmin || activeUser?.department === 'Global') return true;
    return emp.department === activeUser?.department;
  }).filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Let's create mock training matrix data if it doesn't exist on the employee
  // We'll generate dynamic scores based on their ID for realism
  const getTrainingMocks = (empId) => {
     // pseudo-random logic
     const seed = empId * 7;
     const hasExpiring = seed % 3 === 0;
     const completionRate = 40 + (seed % 60); // 40 to 100
     return {
        hasExpiring,
        completionRate,
        trainings: TRAININGS.map((t, idx) => {
          const isComplete = (seed + idx) % 2 === 0;
          return {
             name: t,
             status: isComplete ? 'Tamamlandı' : 'Bekliyor',
             expiresIn: hasExpiring && isComplete && idx === 1 ? 15 : null, // 15 days left warning
          }
        })
     }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header />
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Eğitim & Sertifika Matrisi</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Personel yetkinlik ve süresi dolan uyarı takibi.</p>
          </motion.div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                placeholder="Personel Ara..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white transition-all"
              />
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[200px]">Personel</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Eğitim Durumu</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[300px]">Sertifika Detayları</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {visibleEmployees.map(emp => {
                const matrix = getTrainingMocks(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                           {emp.name.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{emp.name}</p>
                           <p className="text-xs text-slate-500">{emp.department}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="w-40 space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                             <span className="text-slate-700 dark:text-slate-300">% {matrix.completionRate}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${matrix.completionRate < 50 ? 'bg-red-500' : matrix.completionRate < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${matrix.completionRate}%`}}></div>
                          </div>
                       </div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex flex-wrap gap-2 max-w-sm">
                          {matrix.trainings.map(t => (
                            <span key={t.name} className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 border ${
                               t.status === 'Tamamlandı' ? (t.expiresIn ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400') : 'bg-red-50 border-red-200 text-red-600 line-through opacity-60 dark:bg-red-900/10 dark:border-red-900/30'
                            }`}>
                               {t.status === 'Tamamlandı' && !t.expiresIn && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                               {t.expiresIn && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                               {t.name}
                               {t.expiresIn && <span className="text-amber-500 ml-1">({t.expiresIn} gün)</span>}
                            </span>
                          ))}
                       </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                       {matrix.hasExpiring && (
                           <div className="flex justify-end">
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-lg text-xs animate-pulse">
                                 <CalendarClock className="w-3.5 h-3.5" /> Yenileme Uyarısı
                              </span>
                           </div>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
