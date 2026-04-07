import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Check,
  Lightbulb,
  PencilLine,
  Send,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';

const DAY_LABELS = ['Pzt', 'Sal', 'Car', 'Per', 'Cum'];

function getLoadPalette(value) {
  if (value < 70) {
    return 'bg-emerald-500/30 text-emerald-900 border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.18)]';
  }
  if (value < 90) {
    return 'bg-amber-500/30 text-amber-900 border-amber-400/40 shadow-[0_0_18px_rgba(245,158,11,0.18)]';
  }
  return 'bg-red-500/40 text-white border-red-400/45 shadow-[0_0_18px_rgba(239,68,68,0.24)]';
}

function getStatusLabel(value) {
  if (value < 70) return 'Dusuk Yuk';
  if (value < 90) return 'Optimal';
  return 'Darbogaz';
}

export default function IEOptimizer() {
  const {
    employees,
    capacityProfiles,
    updateCapacityProfile,
    departmentCapacitySummary,
    kaizenSuggestions,
    submitKaizenSuggestion,
    toggleKaizenUpvote,
    markKaizenApplied,
  } = useApp();
  const { activeUser } = useUser();
  const { addAuditLog, addNotification } = useNotifications();

  const [hoveredProfileId, setHoveredProfileId] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [formState, setFormState] = useState({
    title: '',
    text: '',
    impact: '',
  });

  const isGlobalViewer = activeUser?.isSuperAdmin || activeUser?.department === 'Global';
  const isManager = activeUser?.role !== 'personel';
  const actorEmployee = employees.find((employee) => employee.name === activeUser?.name);

  const visibleProfiles = useMemo(
    () =>
      capacityProfiles.filter(
        (profile) => isGlobalViewer || profile.department === activeUser?.department
      ),
    [activeUser?.department, capacityProfiles, isGlobalViewer]
  );

  const groupedProfiles = useMemo(() => {
    return visibleProfiles.reduce((acc, profile) => {
      if (!acc[profile.department]) acc[profile.department] = [];
      acc[profile.department].push(profile);
      return acc;
    }, {});
  }, [visibleProfiles]);

  const visibleDepartments = useMemo(
    () =>
      departmentCapacitySummary.filter(
        (summary) => isGlobalViewer || summary.department === activeUser?.department
      ),
    [activeUser?.department, departmentCapacitySummary, isGlobalViewer]
  );

  const visibleKaizens = useMemo(() => {
    return kaizenSuggestions.filter((suggestion) => {
      if (isGlobalViewer) return true;
      if (isManager) return suggestion.department === activeUser?.department;
      return (
        suggestion.employeeName === activeUser?.name ||
        (suggestion.department === activeUser?.department && suggestion.status === 'applied')
      );
    });
  }, [activeUser?.department, activeUser?.name, isGlobalViewer, isManager, kaizenSuggestions]);

  const hoveredProfile = visibleProfiles.find((profile) => profile.employeeId === hoveredProfileId) || null;

  const handleCapacityChange = (employeeId, day, value) => {
    updateCapacityProfile(employeeId, day, Number(value));
    setHoveredProfileId(employeeId);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.text.trim()) return;

    const suggestionPayload = {
      employeeId: actorEmployee?.id || null,
      employeeName: activeUser?.name || 'Anonim',
      department: actorEmployee?.department || activeUser?.department || 'Global',
      title: formState.title.trim(),
      text: formState.text.trim(),
      impact: formState.impact.trim() || 'Saha gozlemi',
    };

    submitKaizenSuggestion(suggestionPayload);
    addAuditLog(
      `${suggestionPayload.employeeName} yeni bir Kaizen onerisi girdi: ${suggestionPayload.title}`,
      'system'
    );
    addNotification({
      type: 'SYSTEM',
      title: 'Yeni Kaizen Onerisi',
      message: `${suggestionPayload.department} ekibinden ${suggestionPayload.employeeName} yeni bir iyilestirme onerisi girdi.`,
      targetDepartment: suggestionPayload.department,
      targetRole: 'departman_muduru',
    });
    setFormState({ title: '', text: '', impact: '' });
  };

  const handleApplyKaizen = (suggestion) => {
    const appliedSuggestion = markKaizenApplied(suggestion.id, activeUser.name);
    if (!appliedSuggestion) return;

    addAuditLog(
      `${activeUser.name}, ${appliedSuggestion.employeeName} tarafindan girilen "${appliedSuggestion.title}" Kaizen onerisini uyguladi.`,
      'system'
    );
    addNotification({
      type: 'SYSTEM',
      title: 'Kaizen Uygulandi ✅',
      message: `${appliedSuggestion.employeeName} kisinin Kaizen onerisi onaylandi ve +20 performans puani eklendi.`,
      targetDepartment: appliedSuggestion.department,
      targetId: appliedSuggestion.employeeName,
    });
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-auto bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),radial-gradient(circle_at_right,_rgba(236,72,153,0.08),_transparent_24%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(163,230,53,0.09),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <Header />
      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 space-y-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <motion.h1
              layout
              className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3"
            >
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5" />
              </span>
              IE Optimizer
            </motion.h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Kapasite planlama, darboğaz görünürlüğü ve Kaizen aksiyonlarını aynı panelde yönetin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[280px]">
            {visibleDepartments.slice(0, 3).map((summary) => (
              <motion.div
                layout
                key={summary.department}
                className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-4 shadow-sm"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  {summary.department}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      %{summary.averageUtilization}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ortalama kullanim
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                      summary.hasBottleneck
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                    }`}
                  >
                    {summary.hasBottleneck ? 'Risk' : 'Dengeli'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <motion.section
            layout
            className="xl:col-span-7 rounded-[28px] border border-white/40 dark:border-white/10 bg-white/65 dark:bg-slate-800/85 backdrop-blur-xl shadow-[0_22px_60px_rgba(15,23,42,0.12)] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Workforce Capacity Heatmap
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Her hucre canli olarak duzenlenebilir; %90+ degerler dashboard riskini aninda tetikler.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.6)]" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                {hoveredProfile ? (
                  <motion.div
                    key={hoveredProfile.employeeId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-cyan-400/20 bg-slate-950/80 text-white px-4 py-3 flex flex-wrap items-center gap-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">
                        Hover Insight
                      </p>
                      <p className="text-sm font-bold mt-1">{hoveredProfile.employeeName}</p>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="rounded-full bg-white/10 px-3 py-1.5">
                        Verimlilik Skoru: %{hoveredProfile.efficiencyScore}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5">
                        Kapasite Kullanim: %{hoveredProfile.utilizationRate}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5">
                        Durum: {getStatusLabel(hoveredProfile.utilizationRate)}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-tooltip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 px-4 py-3 text-xs text-slate-500 dark:text-slate-400"
                  >
                    Bir personelin satirina gelin; verimlilik skoru ve kapasite kullanim orani burada gorunsun.
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                {Object.entries(groupedProfiles).map(([department, profiles]) => (
                  <motion.div layout key={department} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {department}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {profiles.length} personel aktif kapasite izleniyor
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                        Haftalik Grid
                      </span>
                    </div>

                    <div className="grid grid-cols-[minmax(180px,1.4fr)_repeat(5,minmax(64px,1fr))_minmax(88px,0.8fr)] gap-2">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 px-3 py-2">
                        Personel
                      </div>
                      {DAY_LABELS.map((day) => (
                        <div
                          key={day}
                          className="text-center text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 px-3 py-2"
                        >
                          {day}
                        </div>
                      ))}
                      <div className="text-center text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 px-3 py-2">
                        Avg
                      </div>

                      {profiles.map((profile) => (
                        <motion.div
                          layout
                          key={profile.employeeId}
                          onMouseEnter={() => setHoveredProfileId(profile.employeeId)}
                          onMouseLeave={() => setHoveredProfileId(null)}
                          className="contents"
                        >
                          <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/65 px-4 py-3">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {profile.employeeName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              {profile.title}
                            </p>
                          </div>
                          {DAY_LABELS.map((day) => {
                            const isEditingCell =
                              editingCell?.employeeId === profile.employeeId && editingCell?.day === day;

                            return (
                              <motion.div
                                layout
                                key={`${profile.employeeId}-${day}`}
                                onClick={() => setEditingCell({ employeeId: profile.employeeId, day })}
                                className={`relative rounded-2xl border px-3 py-3 text-center transition-all cursor-pointer ${
                                  getLoadPalette(profile.weeklyLoad[day])
                                } ${isEditingCell ? 'ring-2 ring-primary/50 scale-[1.02]' : 'hover:-translate-y-0.5'}`}
                              >
                                {isEditingCell ? (
                                  <div
                                    className="space-y-2"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between gap-2 text-[11px] font-black">
                                      <span>{day}</span>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCell(null)}
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/20 text-current"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={profile.weeklyLoad[day]}
                                      onChange={(event) =>
                                        handleCapacityChange(profile.employeeId, day, event.target.value)
                                      }
                                      className="w-full accent-current"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={profile.weeklyLoad[day]}
                                      onChange={(event) =>
                                        handleCapacityChange(profile.employeeId, day, event.target.value)
                                      }
                                      className="w-full rounded-xl border border-black/10 bg-white/70 px-2 py-1 text-center text-sm font-black text-slate-900 outline-none"
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <p className="text-lg font-bold tracking-tight drop-shadow-sm">
                                      %{profile.weeklyLoad[day]}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">
                                      {getStatusLabel(profile.weeklyLoad[day])}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold opacity-80">
                                      <PencilLine className="w-3 h-3" />
                                      Duzenle
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                          <div
                            className={`rounded-2xl border px-3 py-3 text-center ${getLoadPalette(profile.utilizationRate)}`}
                          >
                            <p className="text-lg font-bold tracking-tight drop-shadow-sm">
                              %{profile.utilizationRate}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">
                              Ortalama
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            layout
            className="xl:col-span-5 rounded-[28px] border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_22px_60px_rgba(15,23,42,0.12)] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/70">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Digital Kaizen Suggestion Box
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sahadan gelen iyilestirmeleri toplayin, oylayin ve uygulanabilir olanlari odullendirin.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <form
                onSubmit={handleSubmit}
                className="rounded-[24px] border border-white/50 dark:border-white/10 bg-white/55 dark:bg-white/5 backdrop-blur-2xl p-5 space-y-4 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Surec Iyilestirme Onerisi
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Oneri sahibi: {activeUser?.name}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <input
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Oneri basligi"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-950/70 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <textarea
                  rows={4}
                  value={formState.text}
                  onChange={(event) => setFormState((prev) => ({ ...prev, text: event.target.value }))}
                  placeholder="Orn: Montaj hattindaki baret istasyonu 2 metre sola alinirse tasima suresi %10 duser."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-950/70 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none resize-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={formState.impact}
                  onChange={(event) => setFormState((prev) => ({ ...prev, impact: event.target.value }))}
                  placeholder="Beklenen etki (orn: tasima suresi -10%)"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-950/70 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary hover:bg-primary-600 text-white px-4 py-3 font-bold text-sm shadow-lg shadow-primary/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Oneriyi Kaydet
                </button>
              </form>

              <div className="space-y-4">
                {visibleKaizens.map((suggestion) => {
                  const canApply =
                    isManager &&
                    suggestion.status !== 'applied' &&
                    (isGlobalViewer || suggestion.department === activeUser?.department);
                  const isUpvoted = suggestion.upvotedBy.includes(activeUser.id);

                  return (
                    <motion.article
                      layout
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[24px] border border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl px-5 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
                              {suggestion.department}
                            </span>
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${
                                suggestion.status === 'applied'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                              }`}
                            >
                              {suggestion.status === 'applied' ? 'Uygulandi' : 'Degerlendirmede'}
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            {suggestion.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {suggestion.text}
                          </p>
                        </div>
                        {suggestion.status === 'applied' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {suggestion.employeeName}
                          </span>
                          {' · '}
                          {suggestion.createdAt}
                          {' · '}
                          Etki: {suggestion.impact}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleKaizenUpvote(suggestion.id, activeUser.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all ${
                              isUpvoted
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {suggestion.upvotes}
                          </button>
                          {canApply && (
                            <button
                              type="button"
                              onClick={() => handleApplyKaizen(suggestion)}
                              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Uygulanabilir
                            </button>
                          )}
                        </div>
                      </div>

                      {suggestion.status === 'applied' && (
                        <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Kaizen Uygulandi ✅ {suggestion.employeeName} icin +20 performans puani yazildi.
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>

              {visibleDepartments.some((summary) => summary.hasLiveRisk) && (
                <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-700 dark:text-rose-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Canli kapasite riski tespit edildi</p>
                    <p className="mt-1 text-xs leading-5">
                      Herhangi bir gunde %90 ustune cikan personel, dashboard uzerinde operasyonel risk tetigini aninda aktif eder.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}
