import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  ArrowRightCircle,
  CheckCircle,
  ClipboardList,
  Edit3,
  Save,
  ShieldPlus,
  Sparkles,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';

const productivity = [
  { name: 'Pzt', expected: 100, actual: 95 },
  { name: 'Sal', expected: 100, actual: 98 },
  { name: 'Çar', expected: 100, actual: 90 },
  { name: 'Per', expected: 100, actual: 105 },
  { name: 'Cum', expected: 100, actual: 92 },
];

const shifts = [
  { id: 1, name: 'Sabah (08:00 - 16:00)', total: 45, active: 42, color: 'bg-emerald-500' },
  { id: 2, name: 'Akşam (16:00 - 00:00)', total: 35, active: 31, color: 'bg-blue-500' },
  { id: 3, name: 'Gece (00:00 - 08:00)', total: 20, active: 18, color: 'bg-indigo-500' },
];

const STATUS_STYLES = {
  Beklemede: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  'Yapılıyor': 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  Tamamlandı: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
};

function levelStyle(level) {
  if (level.includes('Çözüldü')) return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20';
  if (level.includes('Yüksek') || level.includes('Kritik')) return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (level.includes('Orta')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
}

export default function OperationsSafety() {
  const { activeUser } = useUser();
  const {
    safetyData,
    addIncident,
    addPPEAudit,
    updateRiskAssessment,
    actionPlans,
    createActionPlanFromRisk,
    updateActionPlanStatus,
    focusedOperationalItem,
    clearFocusedOperationalItem,
  } = useApp();
  const { addAuditLog, addNotification } = useNotifications();
  const riskRefs = useRef({});
  const today = useMemo(() => new Date(), []);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    department: 'Yazılım',
    type: '',
    level: 'Düşük Risk',
    date: new Date().toISOString().split('T')[0],
  });
  const [ppeForm, setPpeForm] = useState({ department: 'Yazılım', compliantRate: '' });
  const [editingRiskId, setEditingRiskId] = useState(null);
  const [riskEditForm, setRiskEditForm] = useState({ score: '', level: '' });

  if (!activeUser || (!activeUser?.isSuperAdmin && !['ik_muduru', 'departman_muduru', 'admin'].includes(activeUser.role))) {
    return <Navigate to="/" replace />;
  }

  const sortedIncidents = useMemo(
    () => [...safetyData.incidents].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [safetyData.incidents]
  );
  const fallbackIncidentDate = useMemo(() => {
    const base = new Date(today);
    base.setDate(base.getDate() - 142);
    return base;
  }, [today]);
  const lastIncidentDate = sortedIncidents[0] ? new Date(sortedIncidents[0].date) : fallbackIncidentDate;
  const daysSinceIncident = Math.floor((today - lastIncidentDate) / 86400000);

  const focusDepartment = focusedOperationalItem?.department || null;
  const focusedRisk = useMemo(() => {
    if (!focusedOperationalItem) return null;
    if (focusedOperationalItem.riskId) {
      return safetyData.riskAssessments.find((risk) => risk.id === focusedOperationalItem.riskId) || null;
    }
    return safetyData.riskAssessments.find((risk) => risk.department === focusedOperationalItem.department) || null;
  }, [focusedOperationalItem, safetyData.riskAssessments]);

  useEffect(() => {
    if (!focusedRisk) return;
    riskRefs.current[focusedRisk.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedRisk]);

  const targetDepartment = focusDepartment || (activeUser.department !== 'Global' ? activeUser.department : 'Üretim');
  const currentPPE = safetyData.ppeAudits.find((audit) => audit.department === targetDepartment) || { compliantRate: 100 };
  const ppeData = [
    { name: 'Uygun', value: currentPPE.compliantRate, color: currentPPE.compliantRate >= 70 ? '#84cc16' : '#ef4444' },
    { name: 'Uygun Değil', value: 100 - currentPPE.compliantRate, color: '#f1f5f9' },
  ];
  const visiblePlans = actionPlans.filter((plan) =>
    activeUser.isSuperAdmin || activeUser.department === 'Global' ? true : plan.department === activeUser.department
  );

  const handleIncidentSubmit = (event) => {
    event.preventDefault();
    if (!incidentForm.type) return;
    addIncident({ id: 'inc_' + Date.now(), ...incidentForm });
    if (incidentForm.level === 'Yüksek Risk' || incidentForm.level === 'Kritik Risk') {
      addAuditLog(`🚨 ${incidentForm.department} departmanında kritik olay: ${incidentForm.type}`, 'system');
      addNotification({
        type: 'SAFETY',
        title: 'CRITICAL: Acil İSG Durumu',
        message: `${incidentForm.department} departmanında ${incidentForm.level} güvenlik ihlali/kazası: ${incidentForm.type}`,
        targetRole: 'ik_muduru',
      });
    }
    setShowIncidentModal(false);
    setIncidentForm({ department: 'Yazılım', type: '', level: 'Düşük Risk', date: new Date().toISOString().split('T')[0] });
  };

  const handlePpeSubmit = (event) => {
    event.preventDefault();
    if (!ppeForm.compliantRate) return;
    addPPEAudit({
      id: 'ppe_' + Date.now(),
      department: ppeForm.department,
      compliantRate: Number(ppeForm.compliantRate),
      date: new Date().toLocaleDateString('tr-TR'),
    });
    setPpeForm({ department: 'Yazılım', compliantRate: '' });
  };

  const handleCreateActionPlan = (risk) => {
    const existing = actionPlans.find((plan) => plan.sourceRiskId === risk.id);
    createActionPlanFromRisk(risk, activeUser.name);
    addAuditLog(`${activeUser.name}, ${risk.area} riski için 5S aksiyon planı ${existing ? 'açtı' : 'oluşturdu'}.`, 'system');
    addNotification({
      type: 'SYSTEM',
      title: existing ? 'Aksiyon Planı Mevcut' : '5S Aksiyon Planı Oluşturuldu',
      message: existing
        ? `${risk.area} için mevcut görev tablosu görüntülendi.`
        : `${risk.department} departmanındaki ${risk.area} riski için görev atandı.`,
      targetDepartment: risk.department,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1 min-w-0 overflow-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative">
      <Header />
      <div className="p-8 space-y-8 pb-20">
        {focusedOperationalItem && (
          <motion.div layoutId="operational-risk-focus" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 shadow-lg shadow-primary/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Odaklı Uyarı</p>
                <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {focusDepartment ? `${focusDepartment} departmanına ait kritik alan vurgulandı.` : 'Seçili risk satırı vurgulandı.'}
                </p>
              </div>
              <button onClick={clearFocusedOperationalItem} className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Operasyon ve İSG Paneli</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Canlı operasyon, İSG görünürlüğü ve 5S aksiyon planları</p>
          </motion.div>
          <button onClick={() => setShowIncidentModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95 text-sm">
            <AlertOctagon className="w-4 h-4" /> Kaza/Olay Bildir
          </button>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500"><ShieldPlus className="w-5 h-5" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hızlı KKD Denetim Girişi</h3>
              <p className="text-xs text-slate-500">Departmanlardaki güncel ekipman uyumunu girin.</p>
            </div>
          </div>
          <form onSubmit={handlePpeSubmit} className="flex gap-3 w-full sm:w-auto">
            <select value={ppeForm.department} onChange={(event) => setPpeForm({ ...ppeForm, department: event.target.value })} className="bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 px-4 py-2 outline-none dark:text-white">
              <option value="Yazılım">Yazılım</option><option value="Üretim">Üretim</option><option value="Lojistik">Lojistik</option><option value="Satış">Satış</option>
            </select>
            <div className="relative">
              <input type="number" min="0" max="100" required value={ppeForm.compliantRate} onChange={(event) => setPpeForm({ ...ppeForm, compliantRate: event.target.value })} className="w-24 pl-3 pr-8 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
            <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 font-bold flex items-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"><Save className="w-4 h-4" /></button>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><ShieldPlus className="w-5 h-5 text-[#84cc16]" /> Güvenlik Metrikleri (İSG)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border p-6 rounded-2xl shadow-sm flex flex-col items-center transition-all ${focusDepartment === targetDepartment ? 'border-primary/40 shadow-[0_0_0_1px_rgba(236,91,19,0.25),0_0_32px_rgba(236,91,19,0.12)]' : 'border-slate-200 dark:border-slate-800'}`}>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">PPE Uyumluluk</h3>
                <div className="w-28 h-28 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={ppeData} innerRadius={40} outerRadius={55} dataKey="value" stroke="none"><Cell key="a" fill={ppeData[0].color} /><Cell key="b" fill="#334155" /></Pie></PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-black text-slate-800 dark:text-white">%{currentPPE.compliantRate}</span></div>
                </div>
                <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{targetDepartment} Departmanı</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Kazsız Gün</h3>
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="mt-4 text-center">
                  <span className="text-6xl font-black text-[#84cc16] tracking-tighter">{daysSinceIncident}</span>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2" title={`Son kaza tarihi: ${lastIncidentDate.toLocaleDateString('tr-TR')}`}>Geriye Sayım</p>
                </motion.div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Departman Bazlı Risk Analizleri</h3>
              <div className="space-y-3">
                {safetyData.riskAssessments.map((risk) => {
                  const isEditing = editingRiskId === risk.id;
                  const isFocused = focusedRisk?.id === risk.id || (!focusedRisk && focusDepartment === risk.department);
                  const canEdit = activeUser.department === risk.department || activeUser.isSuperAdmin || activeUser.department === 'Global';
                  const canAssign = activeUser.role === 'ik_muduru' && (risk.level.includes('Yüksek') || risk.level.includes('Kritik'));
                  return (
                    <motion.div key={risk.id} ref={(node) => { if (node) riskRefs.current[risk.id] = node; }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${isFocused ? 'border-primary/40 bg-primary/10 shadow-[0_0_0_1px_rgba(236,91,19,0.25),0_0_30px_rgba(236,91,19,0.12)]' : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{risk.area} <span className="text-xs text-slate-400 font-medium ml-1">({risk.department})</span></p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" max="100" value={riskEditForm.score} onChange={(event) => setRiskEditForm((prev) => ({ ...prev, score: event.target.value }))} className="w-16 px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 outline-none" />
                          <select value={riskEditForm.level} onChange={(event) => setRiskEditForm((prev) => ({ ...prev, level: event.target.value }))} className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 outline-none">
                            <option>Düşük Risk</option><option>Orta Riskli</option><option>Yüksek Riskli</option>
                          </select>
                          <button onClick={() => { updateRiskAssessment(risk.id, { score: Number(riskEditForm.score), level: riskEditForm.level }); setEditingRiskId(null); }} className="p-1.5 bg-emerald-500 text-white rounded"><CheckCircle className="w-3 h-3" /></button>
                          <button onClick={() => setEditingRiskId(null)} className="p-1.5 bg-slate-300 text-slate-700 rounded"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap justify-end">
                          <span className="text-xs font-black text-slate-600 dark:text-slate-400">Skor: {risk.score}</span>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${levelStyle(risk.level)}`}>{risk.level}</span>
                          {canAssign && <button onClick={() => handleCreateActionPlan(risk)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-600 transition-colors"><Sparkles className="w-3.5 h-3.5" /> Aksiyon Ata</button>}
                          {canEdit && <button onClick={() => { setEditingRiskId(risk.id); setRiskEditForm({ score: risk.score, level: risk.level }); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-primary"><Edit3 className="w-4 h-4" /></button>}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Activity className="w-5 h-5 text-[#ec5b13]" /> Üretim & Verimlilik</h2>
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">İşgücü Verimliliği</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                {shifts.map((shift) => (
                  <div key={shift.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{shift.name}</span>
                      <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{shift.active} / {shift.total} Personel</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(shift.active / shift.total) * 100}%` }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} className={`h-full ${shift.color} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_18px_50px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> 5S Audit & Action Plan</h3>
              <p className="text-xs text-slate-500 mt-1">Ayıkla, Düzenle, Temizle, Standartlaştır ve Disiplin görevlerini dijital takip edin.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{visiblePlans.length} aktif görev</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-900/60"><th className="px-6 py-4">Aksiyon Tanımı</th><th className="px-6 py-4">Sorumlu</th><th className="px-6 py-4">Termin</th><th className="px-6 py-4">Durum</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {visiblePlans.map((plan) => {
                  const linked = focusedRisk?.id === plan.sourceRiskId || (!focusedRisk && focusDepartment === plan.department);
                  return (
                    <tr key={plan.id} className={linked ? 'bg-primary/10 shadow-[inset_0_0_0_1px_rgba(236,91,19,0.2)]' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors'}>
                      <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{plan.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{plan.department}</p></td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{plan.owner}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{plan.dueDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${STATUS_STYLES[plan.status] || STATUS_STYLES.Beklemede}`}>{plan.status}</span>
                          <select value={plan.status} onChange={(event) => updateActionPlanStatus(plan.id, event.target.value)} className="bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20">
                            <option>Beklemede</option><option>Yapılıyor</option><option>Tamamlandı</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visiblePlans.length === 0 && <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">Henüz aksiyon planı bulunmuyor. Yüksek risk satırındaki butondan görev oluşturabilirsiniz.</div>}
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowIncidentModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div><h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-red-500" /> Kaza/Olay Bildirimi</h2><p className="text-xs text-slate-500 mt-1">Sisteme acil İSG durumu ekleyin.</p></div>
                <button onClick={() => setShowIncidentModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleIncidentSubmit} className="p-6 space-y-5 flex flex-col">
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Departman</label><select value={incidentForm.department} onChange={(event) => setIncidentForm({ ...incidentForm, department: event.target.value })} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white"><option>Yazılım</option><option>Üretim</option><option>Lojistik</option><option>Satış</option></select></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Kaza/Olay Tipi</label><input required type="text" value={incidentForm.type} onChange={(event) => setIncidentForm({ ...incidentForm, type: event.target.value })} placeholder="Örn: Forklift çarpışması" className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Tarih</label><input required type="date" value={incidentForm.date} onChange={(event) => setIncidentForm({ ...incidentForm, date: event.target.value })} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Kritiklik Seviyesi</label><select value={incidentForm.level} onChange={(event) => setIncidentForm({ ...incidentForm, level: event.target.value })} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 px-4 py-3 outline-none dark:text-white"><option>Düşük Risk</option><option>Orta Risk</option><option>Yüksek Risk</option><option>Kritik Risk</option></select></div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700"><button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"><ArrowRightCircle className="w-4 h-4" /> Olayı Sisteme Kaydet</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
