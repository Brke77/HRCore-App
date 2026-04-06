import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, ShieldPlus, Edit3, X, AlertOctagon, CheckCircle, Save } from 'lucide-react';

const mockProductivity = [
  { name: 'Pzt', expected: 100, actual: 95 },
  { name: 'Sal', expected: 100, actual: 98 },
  { name: 'Çar', expected: 100, actual: 90 },
  { name: 'Per', expected: 100, actual: 105 },
  { name: 'Cum', expected: 100, actual: 92 },
];

const mockShifts = [
  { id: 1, name: 'Sabah (08:00 - 16:00)', total: 45, active: 42, color: 'bg-emerald-500' },
  { id: 2, name: 'Akşam (16:00 - 00:00)', total: 35, active: 31, color: 'bg-blue-500' },
  { id: 3, name: 'Gece (00:00 - 08:00)', total: 20, active: 18, color: 'bg-indigo-500' },
];

export default function OperationsSafety() {
  const { activeUser } = useUser();
  const { safetyData, addIncident, addPPEAudit, updateRiskAssessment } = useApp();
  const { addAuditLog, addNotification } = useNotifications();

  // Modals & Forms State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ department: 'Yazılım', type: '', level: 'Düşük Risk', date: new Date().toISOString().split('T')[0] });
  const [ppeForm, setPpeForm] = useState({ department: 'Yazılım', compliantRate: '' });
  
  // Table Editing State
  const [editingRiskId, setEditingRiskId] = useState(null);
  const [riskEditForm, setRiskEditForm] = useState({ score: '', level: '' });

  if (!activeUser || (activeUser.role !== 'ik_muduru' && activeUser.role !== 'departman_muduru' && activeUser.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  // --- HESAPLAMALAR ---
  // Kazasız Gün Sayısı
  const sortedIncidents = [...safetyData.incidents].sort((a,b) => new Date(b.date) - new Date(a.date));
  const lastIncidentDate = sortedIncidents.length > 0 ? new Date(sortedIncidents[0].date) : new Date(Date.now() - 142*24*60*60*1000);
  const daysSinceIncident = Math.floor((Date.now() - lastIncidentDate) / (1000 * 60 * 60 * 24));

  // PPE Uyumluluk Ortalama / Departman Bazlı
  // Eğer İK ise genel ortalamayı veya ilk sıradakini göster, eğer modül sadece 1 chart gösterecekse departmana göre de yapılabilir.
  // Burada kullanıcının departmanı global değilse kendi departman skorunu gösterelim, yoksa üretim departmanını varsayılan alalım.
  const targetDepartment = activeUser.department !== 'Global' ? activeUser.department : 'Üretim';
  const currentPPE = safetyData.ppeAudits.find(a => a.department === targetDepartment) || { compliantRate: 100 };
  
  const ppeData = [
    { name: 'Uygun', value: currentPPE.compliantRate, color: currentPPE.compliantRate >= 70 ? '#84cc16' : '#ef4444' }, 
    { name: 'Uygun Değil', value: 100 - currentPPE.compliantRate, color: '#f1f5f9' }, // #334155 in dark mode
  ];

  // --- FONKSİYONLAR ---
  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    if(!incidentForm.type) return;

    addIncident({
      id: 'inc_' + Date.now(),
      ...incidentForm
    });

    if (incidentForm.level === 'Yüksek Risk' || incidentForm.level === 'Kritik Risk') {
       addAuditLog(`🚨 ${incidentForm.department} departmanında kritik bir olay raporlandı: ${incidentForm.type}`, 'system');
       addNotification({
         type: 'SAFETY',
         title: 'CRITICAL: Acil İSG Durumu',
         message: `${incidentForm.department} departmanında ${incidentForm.level} güvenlik ihlali/kazası: ${incidentForm.type}`,
         targetRole: 'ik_muduru',
         targetId: 'risk_critical'
       });
    }

    setShowIncidentModal(false);
    setIncidentForm({ department: 'Yazılım', type: '', level: 'Düşük Risk', date: new Date().toISOString().split('T')[0] });
  };

  const handlePpeSubmit = (e) => {
    e.preventDefault();
    if (!ppeForm.compliantRate) return;
    
    addPPEAudit({
      id: 'ppe_' + Date.now(),
      department: ppeForm.department,
      compliantRate: Number(ppeForm.compliantRate),
      date: new Date().toLocaleDateString('tr-TR')
    });
    
    setPpeForm({ department: 'Yazılım', compliantRate: '' });
  };

  const startRiskEdit = (risk) => {
    setEditingRiskId(risk.id);
    setRiskEditForm({ score: risk.score, level: risk.level });
  };

  const saveRiskEdit = (id) => {
    updateRiskAssessment(id, { score: Number(riskEditForm.score), level: riskEditForm.level });
    setEditingRiskId(null);
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative">
      <Header />
      <div className="p-8 space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Operasyon ve İSG Paneli</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Canlı operasyonel verimlilik ve İSG (OHS) güvenlik metrikleri</p>
          </motion.div>
          
          <button 
            onClick={() => setShowIncidentModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95 text-sm"
          >
            <AlertOctagon className="w-4 h-4" />
            Kaza/Olay Bildir
          </button>
        </div>

        {/* Veri Giriş Şeridi (Inline PPE Form) */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
               <ShieldPlus className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hızlı KKD Denetim Girişi</h3>
               <p className="text-xs text-slate-500">Departmanlardaki güncel kask/gözlük vb. ekipman uyumunu girin.</p>
             </div>
          </div>
          <form onSubmit={handlePpeSubmit} className="flex gap-3 w-full sm:w-auto">
             <select 
               value={ppeForm.department} 
               onChange={(e) => setPpeForm({...ppeForm, department: e.target.value})}
               className="bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 px-4 py-2 outline-none dark:text-white"
             >
               <option value="Yazılım">Yazılım</option>
               <option value="Üretim">Üretim</option>
               <option value="Lojistik">Lojistik</option>
               <option value="Satış">Satış</option>
             </select>
             <div className="relative">
               <input 
                 type="number" min="0" max="100" placeholder="Skor (%)" required
                 value={ppeForm.compliantRate}
                 onChange={(e) => setPpeForm({...ppeForm, compliantRate: e.target.value})}
                 className="w-24 pl-3 pr-8 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
               />
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
             </div>
             <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 font-bold flex items-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
               <Save className="w-4 h-4" />
             </button>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* OHS Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldPlus className="w-5 h-5 text-[#84cc16]" /> Güvenlik Metrikleri (İSG)
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-center">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">PPE Uyumluluk (Kask & Gözlük)</h3>
                <div className="w-28 h-28 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ppeData} innerRadius={40} outerRadius={55} dataKey="value" stroke="none">
                        <Cell key="cell-0" fill={ppeData[0].color} />
                        <Cell key="cell-1" fill="#334155" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-800 dark:text-white">%{currentPPE.compliantRate}</span>
                  </div>
                </div>
                <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {targetDepartment} Departmanı
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 w-full h-1 bg-[#84cc16] group-hover:h-2 transition-all" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Kazsız Geçen Gün Sayacı</h3>
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="mt-4 text-center">
                  <span className="text-6xl font-black text-[#84cc16] tracking-tighter drop-shadow-md">
                    {daysSinceIncident}
                  </span>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 hover:text-[#84cc16] transition-colors cursor-help" title={`Son kaza tarihi: ${lastIncidentDate.toLocaleDateString('tr-TR')}`}>
                    Gün Geriye Sayım
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Departman Bazlı Risk Analizleri</h3>
              <div className="space-y-3">
                {safetyData.riskAssessments.map(risk => {
                  const isManagerOfThis = activeUser.department === risk.department || activeUser.isSuperAdmin || activeUser.department === 'Global';
                  const isEditing = editingRiskId === risk.id;

                  const getLevelBg = (lvl) => {
                     if (lvl.includes('Yüksek') || lvl.includes('Kritik')) return 'bg-red-500/10 text-red-500 border-red-500/20';
                     if (lvl.includes('Orta')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                     return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                  };

                  return (
                    <div key={risk.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 group">
                      <div className="flex-1">
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{risk.area} <span className="text-xs text-slate-400 font-medium ml-1">({risk.department})</span></p>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                           <input type="number" value={riskEditForm.score} onChange={e=>setRiskEditForm(p=>({ ...p, score:e.target.value }))} className="w-16 px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 outline-none" min="0" max="100"/>
                           <select value={riskEditForm.level} onChange={e=>setRiskEditForm(p=>({ ...p, level:e.target.value }))} className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 outline-none">
                              <option>Düşük Risk</option>
                              <option>Orta Riskli</option>
                              <option>Yüksek Riskli</option>
                           </select>
                           <button onClick={()=>saveRiskEdit(risk.id)} className="p-1.5 bg-emerald-500 text-white rounded"><CheckCircle className="w-3 h-3"/></button>
                           <button onClick={()=>setEditingRiskId(null)} className="p-1.5 bg-slate-300 text-slate-700 rounded"><X className="w-3 h-3"/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-black text-slate-600 dark:text-slate-400">Skor: {risk.score}</span>
                           <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getLevelBg(risk.level)}`}>{risk.level}</span>
                           {isManagerOfThis && (
                             <button onClick={() => startRiskEdit(risk)} className="p-1.5 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-primary">
                               <Edit3 className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Operations Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ec5b13]" /> Üretim & Verimlilik
            </h2>
            
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">İşgücü Verimliliği (Labor Productivity)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockProductivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <RechartsTooltip cursor={{ fill: '#e2e8f0', opacity: 0.1 }} contentStyle={{ borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }} />
                    <Bar dataKey="expected" name="Hedef" fill="#94a3b8" radius={[4, 4, 4, 4]} barSize={12} />
                    <Bar dataKey="actual" name="Gerçekleşen" fill="#ec5b13" radius={[4, 4, 4, 4]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Vardiya Doluluk Oranı</h3>
              <div className="space-y-5">
                {mockShifts.map(shift => (
                  <div key={shift.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{shift.name}</span>
                      <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{shift.active} / {shift.total} Personel</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(shift.active / shift.total) * 100}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                        className={`h-full ${shift.color} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Incident Modal */}
      <AnimatePresence>
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowIncidentModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                 <div>
                   <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                     <AlertOctagon className="w-5 h-5 text-red-500" /> Kaza/Olay Bildirimi
                   </h2>
                   <p className="text-xs text-slate-500 mt-1">Sisteme acil İSG durumu ekleyin.</p>
                 </div>
                 <button onClick={() => setShowIncidentModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 rounded-full transition-colors">
                   <X className="w-4 h-4" />
                 </button>
              </div>
              <form onSubmit={handleIncidentSubmit} className="p-6 space-y-5 flex flex-col">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Departman</label>
                   <select value={incidentForm.department} onChange={e=>setIncidentForm({...incidentForm, department: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white">
                     <option>Yazılım</option>
                     <option>Üretim</option>
                     <option>Lojistik</option>
                     <option>Satış</option>
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Kaza/Olay Tipi</label>
                   <input required type="text" value={incidentForm.type} onChange={e=>setIncidentForm({...incidentForm, type: e.target.value})} placeholder="Örn: Forklift çarpışması, Yüksekten düşme..." className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Tarih</label>
                   <input required type="date" value={incidentForm.date} onChange={e=>setIncidentForm({...incidentForm, date: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Kritiklik Seviyesi</label>
                   <select value={incidentForm.level} onChange={e=>setIncidentForm({...incidentForm, level: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white">
                     <option>Düşük Risk</option>
                     <option>Orta Risk</option>
                     <option>Yüksek Risk</option>
                     <option>Kritik Risk</option>
                   </select>
                 </div>
                 
                 <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform">
                      Olayı Sisteme Kaydet
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
