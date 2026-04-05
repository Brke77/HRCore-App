import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Info, X, MapPin, AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LeaveCalendar() {
  const { employees, leaveRequests, addLeaveRequest, cancelLeave } = useApp();
  const { addNotification, addAuditLog } = useNotifications();
  
  // Simulate today's date context properly, as requested by the user: "Bugünün tarihi (5 Nisan 2026)"
  const fakeToday = new Date('2026-04-05T12:00:00');
  const [currentDate, setCurrentDate] = useState(fakeToday);
  
  // Filter and Selection
  const [departmentFilter, setDepartmentFilter] = useState('Tüm Departmanlar');
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, leaf: null });

  // Modal Form State
  const [modalForm, setModalForm] = useState({ employeeId: '', startDate: '', endDate: '', type: 'Yıllık İzin' });

  // Navigation Options
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(fakeToday);

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const parseDate = (dString) => {
    if (!dString) return null;
    const [y, m, d] = dString.split('-');
    return new Date(y, m - 1, d);
  };

  const processedLeaves = useMemo(() => {
    return leaveRequests.map(req => {
      const emp = employees.find(e => e.id === req.employeeId);
      return {
        ...req,
        start: parseDate(req.startDate),
        end: parseDate(req.endDate),
        department: emp?.department || 'Bilinmiyor'
      };
    }).filter(req => {
      if (departmentFilter === 'Tüm Departmanlar') return true;
      return req.department.toLowerCase() === departmentFilter.toLowerCase();
    });
  }, [leaveRequests, employees, departmentFilter]);

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6; 
    
    const days = [];
    
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevLastDay - i), isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  }, [currentDate]);

  const getLeavesForDate = (date) => {
    const timeStart = new Date(date).setHours(0, 0, 0, 0);
    return processedLeaves.filter(l => {
      if (!l.start || !l.end) return false;
      const lsTime = new Date(l.start).setHours(0,0,0,0);
      const leTime = new Date(l.end).setHours(0,0,0,0);
      return timeStart >= lsTime && timeStart <= leTime;
    });
  };

  const isToday = (date) => {
    return date.getDate() === fakeToday.getDate() && 
           date.getMonth() === fakeToday.getMonth() && 
           date.getFullYear() === fakeToday.getFullYear();
  };

  const isWeekend = (date) => {
    const d = date.getDay();
    return d === 0 || d === 6; 
  };

  const checkConflict = (date, department, isLeader = false) => {
    const dailyLeaves = getLeavesForDate(date);
    const deptLeaves = dailyLeaves.filter(l => l.department === department);
    let leaderCount = dailyLeaves.filter(l => l.title && l.title.toLowerCase().includes('lider')).length;
    
    return {
      deptConflict: deptLeaves.length >= 3,
      leaderConflict: isLeader && leaderCount >= 1,
      actualCount: deptLeaves.length
    };
  };

  const formConflictWarning = useMemo(() => {
    if (!modalForm.employeeId || !modalForm.startDate || !modalForm.endDate) return null;
    
    const emp = employees.find(e => e.id === Number(modalForm.employeeId));
    if (!emp) return null;

    const start = new Date(modalForm.startDate);
    const end = new Date(modalForm.endDate);
    if (start > end) return null;

    const isLeader = emp.title && emp.title.toLowerCase().includes('lider');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const conflictStatus = checkConflict(d, emp.department, isLeader);
      if (conflictStatus.deptConflict || conflictStatus.leaderConflict) {
        return {
          department: emp.department,
          hasDeptConflict: conflictStatus.deptConflict,
          hasLeaderConflict: conflictStatus.leaderConflict
        };
      }
    }
    return null;
  }, [modalForm.employeeId, modalForm.startDate, modalForm.endDate, processedLeaves, employees]);

  const colorMap = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 dark:border dark:border-blue-700/50',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-100 dark:border dark:border-purple-700/50',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-100 dark:border dark:border-red-700/50',
    green: 'bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border dark:border-emerald-700/50',
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalForm.employeeId || !modalForm.startDate || !modalForm.endDate) return;
    
    const emp = employees.find(emp => emp.id === Number(modalForm.employeeId));
    if (!emp) return;

    const diff = new Date(modalForm.endDate) - new Date(modalForm.startDate);
    const durationDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);

    const typeColors = {
      'Yıllık İzin': 'blue',
      'Sağlık İzni': 'red',
      'Hastalık İzni': 'red',
      'Mazeret İzni': 'purple'
    };

    addLeaveRequest({
      employeeId: emp.id,
      name: emp.name,
      title: emp.title,
      avatar: emp.avatar,
      type: modalForm.type,
      typeColor: typeColors[modalForm.type] || 'blue',
      duration: `${durationDays} Gün`,
      startDate: modalForm.startDate,
      endDate: modalForm.endDate,
      date: `${new Date(modalForm.startDate).getDate()}-${new Date(modalForm.endDate).getDate()} ${monthNames[new Date(modalForm.startDate).getMonth()]} ${new Date(modalForm.startDate).getFullYear()}`
    });

    setIsModalOpen(false);
    setModalForm({ employeeId: '', startDate: '', endDate: '', type: 'Yıllık İzin' });
  };

  const handleCancelConfirm = () => {
    if (!cancelModal.leaf) return;
    const { employeeId, id, name } = cancelModal.leaf;
    cancelLeave(employeeId, id);
    addAuditLog(`Selin Yılmaz, ${name} adlı kişinin iznini iptal etti.`, 'system'); 
    addNotification(`${name} adlı kişinin izni başarıyla iptal edildi ve bakiye iade edildi.`, '✅');
    
    setCancelModal({ isOpen: false, leaf: null });
  };

  const leavesForSelectedDay = selectedDay ? getLeavesForDate(selectedDay) : [];

  return (
    <div className="flex flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex-1 overflow-y-auto px-8 py-8 w-full transition-all duration-300">
        
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-bold font-headline text-slate-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors duration-300">
              İzin Takvimi
            </h2>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-1.5 border border-slate-100 dark:border-slate-700 transition-colors duration-300">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="w-32 text-center font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 transition-colors duration-300"></div>
              <button onClick={goToToday} className="px-3 py-1 text-sm font-semibold text-primary hover:bg-primary/5 dark:hover:bg-primary/20 rounded-lg transition-colors">
                Bugün
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all cursor-pointer"
              >
                <option value="Tüm Departmanlar">Tüm Departmanlar</option>
                <option value="Yazılım">Yazılım</option>
                <option value="Pazarlama">Pazarlama</option>
                <option value="İK">İnsan Kaynakları</option>
              </select>
              <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 rotate-[-90deg] pointer-events-none transition-colors" />
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-primary to-orange-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Yeni Talep
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-950 backdrop-blur-xl border border-white dark:border-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors duration-300"
        >
          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100/60 dark:divide-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300">
            {calendarGrid.map((dayData, i) => {
              const leaves = getLeavesForDate(dayData.date);
              const maxDisplay = 3;
              const hasMore = leaves.length > maxDisplay;

              const deptCounts = {};
              let leaderC = 0;
              leaves.forEach(l => {
                deptCounts[l.department] = (deptCounts[l.department] || 0) + 1;
                if (l.title && l.title.toLowerCase().includes('lider')) leaderC++;
              });
              const dayHasConflict = Object.values(deptCounts).some(count => count > 3) || leaderC >= 2;

              return (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedDay(dayData.date);
                  }}
                  className={classNames(
                    'min-h-[140px] p-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer flex flex-col relative',
                    !dayData.isCurrentMonth ? 'opacity-40 bg-slate-50/30 dark:bg-slate-950' : 'bg-white dark:bg-slate-900',
                    isWeekend(dayData.date) && dayData.isCurrentMonth && 'bg-slate-50/60 dark:bg-slate-900/40',
                    dayHasConflict && 'bg-red-50/40 dark:bg-red-900/20 border-[1.5px] border-red-200 dark:border-red-900/50 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)] dark:shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]',
                    selectedDay && selectedDay.getTime() === dayData.date.getTime() && 'ring-2 ring-inset ring-primary bg-orange-50/30 dark:bg-primary/5'
                  )}
                >
                  {/* Nabız Efekti */}
                  {dayHasConflict && (
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <span className={classNames(
                      'text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full transition-all',
                      isToday(dayData.date) 
                         ? 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 dark:ring-orange-500/50 dark:shadow-[0_0_12px_rgba(236,91,19,0.4)]' 
                         : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {dayData.date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    {leaves.slice(0, maxDisplay).map(l => (
                      <motion.div 
                        layoutId={`leave-pill-${l.id}-${dayData.date.getTime()}`}
                        key={l.id} 
                        className={classNames('text-[11px] px-2 py-1 rounded truncate border border-transparent shadow-sm', colorMap[l.typeColor] || colorMap.blue)}
                        title={`${l.name} - ${l.type}`}
                      >
                        {l.name}
                      </motion.div>
                    ))}
                    {hasMore && (
                      <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 pl-1 transition-colors">+ {leaves.length - maxDisplay} kişi daha</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Side Panel for Selected Day */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-96 bg-white dark:bg-slate-900/90 dark:backdrop-blur-md border-l border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col z-30 transition-colors duration-300"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 transition-colors">Seçili Tarih</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">
                  {selectedDay.getDate()} {monthNames[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {leavesForSelectedDay.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 transition-colors">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium transition-colors">Bu tarihte izinli personel bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leavesForSelectedDay.map(leaf => (
                    <motion.div 
                      layoutId={`leave-detail-${leaf.id}`}
                      key={leaf.id} 
                      className="bg-white dark:bg-slate-800 border text-left border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img src={leaf.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaf.name)}&background=ec5b13&color=fff`} alt={leaf.name} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm object-cover transition-colors" />
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm transition-colors">{leaf.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">{leaf.department} • {leaf.title}</p>
                        </div>
                      </div>
                      <div className={classNames('inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border border-transparent', colorMap[leaf.typeColor] || colorMap.blue)}>
                        {leaf.type}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5"/> {leaf.duration}</span>
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setCancelModal({ isOpen: true, leaf });
                          }} 
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-transparent text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-100 dark:hover:border-red-900/50 transition-all font-bold group"
                          title="İzni İptal Et"
                        >
                          İptal Et <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Leave Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                <h3 className="text-xl font-bold font-headline text-slate-800 dark:text-white transition-colors">Yeni İzin Talebi Oluştur</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors">Personel Seçin</label>
                    <select required value={modalForm.employeeId} onChange={e => setModalForm(prev => ({...prev, employeeId: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
                      <option value="">Seçiniz...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors">İzin Türü</label>
                      <select required value={modalForm.type} onChange={e => setModalForm(prev => ({...prev, type: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer">
                        <option value="Yıllık İzin">Yıllık İzin</option>
                        <option value="Sağlık İzni">Sağlık İzni</option>
                        <option value="Mazeret İzni">Mazeret İzni</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors">Başlangıç Tarihi</label>
                      <input required type="date" value={modalForm.startDate} onChange={e => setModalForm(prev => ({...prev, startDate: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all color-scheme-dark"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors">Bitiş Tarihi</label>
                      <input required type="date" value={modalForm.endDate} onChange={e => setModalForm(prev => ({...prev, endDate: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all color-scheme-dark"/>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 transition-colors">
                  <AnimatePresence>
                    {formConflictWarning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/50 shadow-sm flex items-start gap-3 transition-colors"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-sm font-semibold">
                          {formConflictWarning.hasDeptConflict && (
                            <p>Dikkat: <span className="font-bold underline text-red-600 dark:text-red-300">{formConflictWarning.department}</span> departmanında bu tarihte kritik personel limitine (3'ten fazla) ulaşıldı!</p>
                          )}
                          {formConflictWarning.hasLeaderConflict && (
                            <p className="mt-1">Kritik Kilit: Bu tarihte başka bir Ekip Lideri zaten izinli!</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">İptal</button>
                    <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/25 dark:shadow-[0_0_15px_rgba(236,91,19,0.3)] active:scale-95 transition-all flex items-center gap-2">
                       Listeye Ekle
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelModal.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm"
              onClick={() => setCancelModal({ isOpen: false, leaf: null })}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center text-center transition-colors duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/30">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">
                İzin Kaydı İptali
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 transition-colors">
                Bu izin kaydı silinecek ve <span className="font-bold text-slate-700 dark:text-slate-300">{cancelModal.leaf?.name}</span> adlı personelin izin hakkı ({cancelModal.leaf?.duration}) bakiyesine otomatik iade edilecektir. Onaylıyor musunuz?
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setCancelModal({ isOpen: false, leaf: null })}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Geri Dön
                </button>
                <button 
                  onClick={handleCancelConfirm}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 active:scale-95 rounded-xl transition-all"
                >
                  Evet, İptal Et
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
