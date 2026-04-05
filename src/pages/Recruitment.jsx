import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  KanbanSquare,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  CalendarDays,
  FileText,
  X,
  Briefcase,
  Pencil,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Clock,
  UserCheck,
  Award
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useApp } from '../context/AppContext';

const INITIAL_CANDIDATES = [
  { id: 'c1', name: 'Melih Şahin', position: 'Frontend Geliştirici', status: 'Mülakat', appliedDate: '2026-04-01', email: 'melih.sahin@example.com', phone: '0532 123 4567', notes: 'React ve Tailwind bilgisi iyi. Portfolyosu etkileyici.', experience: '3 Yıl' },
  { id: 'c2', name: 'Ayşe Kaya', position: 'İK Uzmanı', status: 'Başvuru', appliedDate: '2026-04-03', email: 'ayse.kaya@example.com', phone: '0555 987 6543', notes: 'Önceki çalıştığı yerden referansları henüz gelmedi.', experience: '5 Yıl' },
  { id: 'c3', name: 'Kaan Yıldız', position: 'Backend Geliştirici', status: 'Teklif', appliedDate: '2026-03-25', email: 'kaan.yildiz@example.com', phone: '0544 321 0987', notes: 'Maaş beklentisi bütçemize uygun. Node.js mimarisine çok hakim.', experience: '4 Yıl' },
  { id: 'c4', name: 'Zeynep Çelik', position: 'Grafik Tasarımcı', status: 'İşe Alındı', appliedDate: '2026-03-10', email: 'zeynep.celik@example.com', phone: '0533 111 2233', notes: 'Tasarımları çok modern. 10 Nisan itibariyle işbaşı yapacak.', experience: '2 Yıl' },
  { id: 'c5', name: 'Emre Can', position: 'Proje Yöneticisi', status: 'Başvuru', appliedDate: '2026-04-04', email: 'emre.can@example.com', phone: '0541 456 7890', notes: 'Scrum master sertifikası var.', experience: '6 Yıl' }
];

const COLUMNS = ['Başvuru', 'Mülakat', 'Teklif', 'İşe Alındı'];

const COLUMN_META = {
  'Başvuru':   { color: 'bg-slate-400',   dot: 'bg-slate-400',   icon: Clock },
  'Mülakat':   { color: 'bg-blue-500',    dot: 'bg-blue-500',    icon: Users },
  'Teklif':    { color: 'bg-purple-500',  dot: 'bg-purple-500',  icon: Award },
  'İşe Alındı':{ color: 'bg-emerald-500', dot: 'bg-emerald-500', icon: UserCheck },
};

const STATUS_COLORS = {
  'Başvuru':   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  'Mülakat':   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
  'Teklif':    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
  'İşe Alındı':'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
};

const EMPTY_FORM = { name: '', position: '', email: '', phone: '', experience: '', notes: '', status: 'Başvuru' };

function classNames(...c) { return c.filter(Boolean).join(' '); }

function CandidateModal({ formModal, closeFormModal, handleFormSubmit, setField, statusOptions }) {
  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-400";
  const labelCls = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {formModal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeFormModal}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800/60"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {formModal.mode === 'add' ? 'Yeni Aday Ekle' : 'Adayı Düzenle'}
              </h3>
              <button type="button" onClick={closeFormModal} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 rounded-full transition-colors pb-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable form internal */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              <form id="candidate-form" onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Ad Soyad</label>
                    <input required type="text" placeholder="Örn: Ahmet Yılmaz" value={formModal.data.name} onChange={e => setField('name', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Pozisyon</label>
                    <select required value={formModal.data.position} onChange={e => setField('position', e.target.value)} className={inputCls + ' cursor-pointer'}>
                      <option value="">Seçiniz…</option>
                      {['Frontend Geliştirici','Backend Geliştirici','Mobil Geliştirici','İK Uzmanı','Grafik Tasarımcı','Proje Yöneticisi','UX/UI Tasarımcı','Veri Analisti'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>E-posta</label>
                    <input required type="email" placeholder="ornek@email.com" value={formModal.data.email} onChange={e => setField('email', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Telefon</label>
                    <input type="tel" placeholder="0532 000 0000" value={formModal.data.phone} onChange={e => setField('phone', e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Tecrübe Süresi</label>
                    <select value={formModal.data.experience} onChange={e => setField('experience', e.target.value)} className={inputCls + ' cursor-pointer'}>
                      <option value="">Seçiniz…</option>
                      {['0-1 Yıl','1 Yıl','2 Yıl','3 Yıl','4 Yıl','5 Yıl','6 Yıl','7+ Yıl','10+ Yıl'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  {formModal.mode === 'edit' ? (
                    <div>
                      <label className={labelCls}>Mevcut Durum</label>
                      <select value={formModal.data.status} onChange={e => setField('status', e.target.value)} className={inputCls + ' cursor-pointer'}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ) : <div className="hidden sm:block"></div>}
                </div>

                <div>
                  <label className={labelCls}>Değerlendirme Notları</label>
                  <textarea rows={4} placeholder="Aday hakkında genel notlar, izlenimler, güçlü/zayıf yönler…" value={formModal.data.notes} onChange={e => setField('notes', e.target.value)} className={inputCls + ' resize-none'} />
                </div>
              </form>
            </div>

            {/* Footer fixed inside modal bottom */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={closeFormModal} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all">
                İptal
              </button>
              <button type="submit" form="candidate-form" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all">
                {formModal.mode === 'add' ? 'Kayıt Ekle' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function Recruitment() {
  const { addNotification, addAuditLog } = useNotifications();
  const { addEmployee } = useApp();

  const [viewMode, setViewMode]           = useState('kanban');
  const [candidates, setCandidates]       = useState(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery]     = useState('');
  const [draggedItem, setDraggedItem]     = useState(null);
  const [dragOverCol, setDragOverCol]     = useState(null);

  // Detail panel
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Unified add/edit modal
  const [formModal, setFormModal] = useState({ open: false, mode: 'add', data: EMPTY_FORM });

  // --- helpers ---
  const openAddModal = () =>
    setFormModal({ open: true, mode: 'add', data: EMPTY_FORM });

  const openEditModal = (candidate) => {
    setFormModal({
      open: true,
      mode: 'edit',
      data: {
        name:       candidate.name,
        position:   candidate.position,
        email:      candidate.email,
        phone:      candidate.phone,
        experience: candidate.experience,
        notes:      candidate.notes || '',
        status:     candidate.status,
        id:         candidate.id,
      }
    });
    setSelectedCandidate(null); // close drawer
  };

  const closeFormModal = () => setFormModal({ open: false, mode: 'add', data: EMPTY_FORM });

  // fire when a candidate reaches "İşe Alındı"
  const handleHired = (candidate) => {
    addEmployee({
      name:       candidate.name,
      email:      candidate.email,
      phone:      candidate.phone,
      department: candidate.position,
      title:      candidate.position,
      startDate:  new Date().toISOString().split('T')[0],
      avatar:     `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=ec5b13&color=fff`,
    });
    addNotification(`🎉 Tebrikler! ${candidate.name} işe alındı ve çalışan listesine eklendi.`, '🎉');
  };

  const updateStatus = (candidate, newStatus) => {
    const oldStatus = candidate.status;
    if (oldStatus === newStatus) return;

    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, status: newStatus } : c)
    );

    addAuditLog(
      `${candidate.name} adlı adayın durumu ${oldStatus} → ${newStatus} olarak güncellendi.`,
      'system'
    );

    if (newStatus === 'İşe Alındı') handleHired(candidate);

    // also refresh detail panel if open
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
    }
  };

  // --- form submit ---
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const fd = formModal.data;

    if (formModal.mode === 'add') {
      const newCand = {
        id:          'c' + Date.now(),
        name:        fd.name,
        position:    fd.position,
        email:       fd.email,
        phone:       fd.phone,
        experience:  fd.experience,
        notes:       fd.notes,
        status:      'Başvuru',
        appliedDate: new Date().toISOString().split('T')[0],
      };
      setCandidates(prev => [newCand, ...prev]);
      addNotification(`Yeni aday ${newCand.name} sisteme eklendi.`, '👤');
      addAuditLog(`Yeni aday eklendi: ${newCand.name}`, 'add');
    } else {
      // edit mode
      const oldCandidate = candidates.find(c => c.id === fd.id);
      const oldStatus    = oldCandidate?.status;

      setCandidates(prev =>
        prev.map(c =>
          c.id === fd.id
            ? { ...c, name: fd.name, position: fd.position, email: fd.email, phone: fd.phone, experience: fd.experience, notes: fd.notes, status: fd.status }
            : c
        )
      );

      if (oldStatus !== fd.status) {
        addAuditLog(`${fd.name} adlı adayın durumu ${oldStatus} → ${fd.status} olarak güncellendi.`, 'system');
        if (fd.status === 'İşe Alındı' && oldCandidate) handleHired({ ...oldCandidate, ...fd });
      }

      addNotification(`${fd.name} adayının bilgileri güncellendi.`, '✏️');
    }

    closeFormModal();
  };

  // --- drag & drop ---
  const handleDragStart = (e, candidate) => {
    setDraggedItem(candidate);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
  };
  const handleDragEnd   = (e) => { e.target.style.opacity = '1'; setDraggedItem(null); setDragOverCol(null); };
  const handleDragOver  = (e, col) => { e.preventDefault(); setDragOverCol(col); };
  const handleDrop      = (e, col) => {
    e.preventDefault();
    if (draggedItem) updateStatus(draggedItem, col);
    setDraggedItem(null);
    setDragOverCol(null);
  };

  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q) ||
      c.experience.toLowerCase().includes(q)
    );
  });

  const setField = (key, val) =>
    setFormModal(prev => ({ ...prev, data: { ...prev.data, [key]: val } }));

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-400";
  const labelCls = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="flex flex-1 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative" style={{minHeight:0}}>
      <div className="flex-1 overflow-y-auto px-8 py-8 w-full z-10 min-h-0">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-bold font-headline text-slate-900 dark:text-white tracking-tight">
              İşe Alım & ATS
            </h2>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-1.5 border border-slate-100 dark:border-slate-700 transition-colors">
              {[['list','Liste Gösterimi', Users], ['kanban','Kanban Board', KanbanSquare]].map(([mode, label, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={classNames('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                    viewMode === mode
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text" placeholder="Aday, pozisyon veya tecrübe ara…"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all w-72"
              />
            </div>
            <button onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 dark:shadow-[0_0_15px_rgba(236,91,19,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />Yeni Aday Ekle
            </button>
          </div>
        </div>

        {/* ── Kanban View ── */}
        {viewMode === 'kanban' ? (
          <div className="flex gap-5 h-[calc(100vh-220px)] pb-4 overflow-x-auto overflow-y-hidden scrollbar-thin">
            {COLUMNS.map(column => {
              const colCandidates = filteredCandidates.filter(c => c.status === column);
              const isOver = dragOverCol === column && draggedItem?.status !== column;
              const ColIcon = COLUMN_META[column].icon;
              return (
                <div
                  key={column}
                  onDragOver={e => handleDragOver(e, column)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={e => handleDrop(e, column)}
                  className={classNames(
                    'flex-shrink-0 w-[300px] flex flex-col rounded-2xl border transition-all duration-200',
                    isOver
                      ? 'border-primary/60 bg-primary/5 dark:bg-primary/10 shadow-[0_0_20px_rgba(236,91,19,0.15)]'
                      : 'border-slate-200/60 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40'
                  )}
                >
                  {/* Column header */}
                  <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 rounded-t-2xl backdrop-blur-sm">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                      <span className={classNames('w-2 h-2 rounded-full', COLUMN_META[column].dot)} />
                      {column}
                    </h3>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin">
                    <AnimatePresence>
                      {colCandidates.map(candidate => (
                        <motion.div
                          key={candidate.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          draggable
                          onDragStart={e => handleDragStart(e, candidate)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedCandidate(candidate)}
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all hover:border-primary/40 dark:hover:border-primary/40 group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{candidate.name}</h4>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); openEditModal(candidate); }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-primary"
                              title="Düzenle"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1.5 mb-3 pl-10">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              <Briefcase className="w-3 h-3 shrink-0" />{candidate.position}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                              <CalendarDays className="w-3 h-3 shrink-0" />{new Date(candidate.appliedDate).toLocaleDateString('tr-TR')}
                            </div>
                          </div>

                          {/* Inline status selector */}
                          <div className="pl-10">
                            <select
                              value={candidate.status}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { e.stopPropagation(); updateStatus(candidate, e.target.value); }}
                              className={classNames(
                                'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all',
                                STATUS_COLORS[candidate.status]
                              )}
                            >
                              {COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {colCandidates.length === 0 && (
                      <div className={classNames(
                        'h-24 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-xs font-medium italic border-2 border-dashed rounded-xl transition-all',
                        isOver ? 'border-primary/50 text-primary-400' : 'border-slate-200 dark:border-slate-800'
                      )}>
                        {isOver ? '➕ Buraya bırak' : 'Aday yok'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── List View ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Aday Bilgisi</th>
                    <th className="px-6 py-4 font-semibold">Pozisyon</th>
                    <th className="px-6 py-4 font-semibold">Başvuru Tarihi</th>
                    <th className="px-6 py-4 font-semibold">Tecrübe</th>
                    <th className="px-6 py-4 font-semibold">Durum</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  <AnimatePresence>
                    {filteredCandidates.map(candidate => (
                      <motion.tr
                        key={candidate.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(candidate)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm shrink-0">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{candidate.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{candidate.position}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{new Date(candidate.appliedDate).toLocaleDateString('tr-TR')}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{candidate.experience}</td>
                        <td className="px-6 py-4">
                          <select
                            value={candidate.status}
                            onChange={e => updateStatus(candidate, e.target.value)}
                            className={classNames(
                              'text-[11px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all',
                              STATUS_COLORS[candidate.status]
                            )}
                          >
                            {COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(candidate)}
                            className="text-primary hover:text-primary-600 font-semibold text-sm transition-colors inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />Düzenle
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Detail Side Drawer ── */}
      <AnimatePresence>
        {selectedCandidate && (() => {
          const live = candidates.find(c => c.id === selectedCandidate.id) || selectedCandidate;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSelectedCandidate(null)}
              />
              <motion.div
                initial={{ x: 420, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 420, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="absolute right-0 top-0 bottom-0 w-[400px] max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
              >
                {/* Drawer header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">Aday Profili</h3>
                  <button onClick={() => setSelectedCandidate(null)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                  {/* Avatar */}
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700/50">
                      {live.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{live.name}</h2>
                    <p className="text-sm font-medium text-primary">{live.position}</p>
                  </div>

                  {/* Inline status update */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Durum Değiştir</label>
                    <div className="flex flex-wrap gap-2">
                      {COLUMNS.map(s => (
                        <button key={s} onClick={() => updateStatus(live, s)}
                          className={classNames(
                            'text-[11px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-all',
                            live.status === s
                              ? STATUS_COLORS[s] + ' ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-primary/30'
                              : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/40'
                          )}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">İletişim</h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-2.5">
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`mailto:${live.email}`} className="hover:text-primary truncate">{live.email}</a>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${live.phone}`} className="hover:text-primary">{live.phone}</a>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Başvuru</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{new Date(live.appliedDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Tecrübe</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{live.experience}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {live.notes && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Değerlendirme Notları</h4>
                      <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{live.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <button className="w-full py-3 flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-all active:scale-95">
                    <FileText className="w-4 h-4" />Özgeçmişi (CV) Görüntüle
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openEditModal(live)}
                      className="py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="w-4 h-4" />Düzenle
                    </button>
                    <button
                      onClick={() => {
                        setCandidates(prev => prev.filter(c => c.id !== live.id));
                        addAuditLog(`${live.name} adlı aday sistemden silindi.`, 'system');
                        setSelectedCandidate(null);
                      }}
                      className="py-2.5 font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />Sil
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ── Add / Edit Modal ── */}
      <CandidateModal
        formModal={formModal}
        closeFormModal={closeFormModal}
        handleFormSubmit={handleFormSubmit}
        setField={setField}
        statusOptions={COLUMNS}
      />

    </div>
  );
}
