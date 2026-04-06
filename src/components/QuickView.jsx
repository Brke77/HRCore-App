import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import {
  Clock, MapPin, Mail, Phone, Calendar,
  MessageSquare, Send, Lock, TrendingUp, DollarSign,
  ShieldAlert, UserCheck, UserMinus, AlertTriangle,
  UserSearch, CheckCircle, Package
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

function DonutChart({ remaining, total }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? remaining / total : 0;
  const offset = circumference * (1 - pct);
  const strokeColor = remaining > 10 ? '#ec5b13' : remaining > 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Kalan İzin Hakkı</h4>
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="10" />
          <circle cx="64" cy="64" r={radius} fill="transparent" stroke={strokeColor} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }} />
        </svg>
        <div className="absolute text-center">
          <span className="block text-2xl font-extrabold text-slate-800 dark:text-white">{remaining}</span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Gün</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Toplam: {total} Gün</p>
    </div>
  );
}

function AvatarFallback({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-3xl ring-4 ring-primary/10 mx-auto">
      {initials}
    </div>
  );
}

// Yorum türü renkleri
const COMMENT_TYPE_CONFIG = {
  performance: {
    label: 'Performans Notu',
    icon: TrendingUp,
    bubble: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    iconColor: 'text-emerald-500',
  },
  payroll: {
    label: 'Finansal Not',
    icon: DollarSign,
    bubble: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/40',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    iconColor: 'text-blue-500',
  },
};

function CommentBubble({ comment }) {
  const typeConfig = COMMENT_TYPE_CONFIG[comment.type] || COMMENT_TYPE_CONFIG.performance;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 space-y-2 ${typeConfig.bubble}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TypeIcon className={`w-3.5 h-3.5 ${typeConfig.iconColor} flex-shrink-0`} />
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeConfig.badge}`}>
            {typeConfig.label}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{comment.date}</span>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{comment.text}</p>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
          {comment.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          {comment.authorName}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">· {comment.authorRoleLabel}</span>
      </div>
    </motion.div>
  );
}

function ManagerNotesSection({ emp }) {
  const { addComment } = useApp();
  const { activeUser } = useUser();
  const [text, setText] = useState('');

  const canComment = (activeUser.canCommentPerformance && activeUser.canViewPerformance) ||
                     (activeUser.canCommentPayroll && activeUser.canViewPayroll);

  // Rolüne göre hangi yorumları görebilir
  const visibleComments = (emp.comments || []).filter((c) => {
    if (activeUser.role === 'admin') return true;
    if (activeUser.canViewPerformance && c.type === 'performance') return true;
    if (activeUser.canViewPayroll && c.type === 'payroll') return true;
    return false;
  });

  // Yorum tipi rolüne göre belirlenir
  const commentType = activeUser.canCommentPayroll && !activeUser.canCommentPerformance
    ? 'payroll'
    : 'performance';

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(emp.id, {
      text: text.trim(),
      authorName: activeUser.name,
      authorRole: activeUser.role,
      authorRoleLabel: activeUser.roleLabel,
      type: commentType,
    });
    setText('');
  };

  // Erişim yoksa kilitli ekran göster
  if (!canComment && visibleComments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center gap-2 text-center">
        <ShieldAlert className="w-6 h-6 text-slate-300 dark:text-slate-600" />
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Bu alana erişim yetkiniz yok.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mevcut yorumlar */}
      {visibleComments.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-0.5">
          {visibleComments.map((c) => (
            <CommentBubble key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
          Henüz yorum eklenmemiş.
        </p>
      )}

      {/* Yorum formu */}
      {canComment && (
        <div className="space-y-2">
          {/* Gizlilik uyarısı */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <Lock className="w-3 h-3" />
            <span>
              {activeUser.role === 'finans_muduru'
                ? 'Yalnızca finansal notlar ekliyorsunuz'
                : activeUser.role === 'ik_muduru'
                ? 'Yalnızca performans notları ekliyorsunuz'
                : 'Tüm not türlerini ekleyebilirsiniz'}
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              commentType === 'payroll'
                ? 'Ödeme durumu, finansal not...'
                : 'Performans değerlendirmesi, geri bildirim...'
            }
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all"
            style={{ backgroundColor: '#ec5b13' }}
          >
            <Send className="w-3.5 h-3.5" />
            Yorum Gönder
          </button>
        </div>
      )}
    </div>
  );
}

export default function QuickView() {
  const { selectedEmployee: emp, makeManager, deleteEmployee, updateEmployeePerformance, approveEmployeeActivity } = useApp();
  const { activeUser } = useUser();
  const { addAuditLog, addNotification } = useNotifications();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleMakeManager = () => {
    makeManager(emp.id);
    addAuditLog(`${activeUser.name}, ${emp.name} adlı personeli Müdür olarak atadı.`, 'role');
  };

  const handleDelete = () => {
    deleteEmployee(emp.id);
    setShowConfirmDelete(false);
    addAuditLog(`${activeUser.name}, ${emp.name} adlı personelin ilişiğini kesti.`, 'system');
  };

  const handleApprove = (activityId) => {
    approveEmployeeActivity(emp.name, activityId);
    updateEmployeePerformance(emp.name, +5);
    addNotification(
      `Müdürünüz son hareketinizi onayladı ve +5 performans puanı kazandınız!`,
      '⭐',
      { role: 'personel', department: emp.department }
    );
  };

  if (!emp) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full h-full min-h-[400px] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-colors duration-300"
      >
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
          <UserSearch className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-500 text-center">
          Detaylarını görmek için<br />bir çalışana tıklayın
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={emp.id}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 space-y-6 transition-colors duration-300 relative z-10"
      >
        {/* Profile */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {emp.avatar ? (
                <img src={emp.avatar} alt={emp.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/10 mx-auto" />
              ) : (
                <AvatarFallback name={emp.name} />
              )}
              <span className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full border-[3px] border-white dark:border-slate-800 ${emp.status === 'Aktif' ? 'bg-emerald-400' : emp.status === 'İzinli' ? 'bg-amber-400' : 'bg-slate-300'}`} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">{emp.name}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">{emp.title}</p>
            <div className="flex flex-col items-center justify-center gap-2 mt-3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                {emp.daysWorked} Gündür Bizimle
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold rounded-full tracking-wide">
                ⭐ {emp.performanceScore || 85} Performans Puanı
              </span>
            </div>
          </div>

          {/* Admin Actions */}
          {activeUser.isSuperAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleMakeManager}
                disabled={emp.isManager || emp.status !== 'Aktif'}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck className="w-3.5 h-3.5" />
                {emp.isManager ? 'Müdür' : 'Müdür Ata'}
              </button>
              
              {showConfirmDelete ? (
                <div className="flex-1 flex items-center gap-1">
                  <button onClick={handleDelete} className="flex-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors">Eminim</button>
                  <button onClick={() => setShowConfirmDelete(false)} className="flex-1 px-2 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors">İptal</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  İlişiği Kes
                </button>
              )}
            </div>
          )}

          {/* Quick info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              <span className="truncate">{emp.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              <span>{emp.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              <span>{emp.location}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
              <span>İşe Giriş: {emp.startDate}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Assets info */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              Zimmetli Varlıklar
            </h4>
            {(!emp.assets || emp.assets.length === 0) ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Zimmetli varlık bulunamadı.</p>
            ) : (
              <div className="space-y-2">
                {emp.assets.map((asset, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{asset.name}</span>
                       <span className="text-[10px] text-slate-500">{asset.kind}</span>
                    </div>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <DonutChart remaining={emp.remainingLeave} total={emp.totalLeave} />

          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Recent activity */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              Kişisel Son Hareketler
            </h4>
            <div className="relative space-y-4 before:absolute before:left-[9px] before:top-1 before:h-[calc(100%-8px)] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
              {emp.recentActivity.map((act, i) => (
                <motion.div
                  key={act.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="relative flex flex-col gap-2 pl-6 group"
                >
                  <div className="flex items-start gap-3">
                    <span className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-800 flex-shrink-0 ${i === 0 ? 'border-primary' : 'border-slate-200 dark:border-slate-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{act.desc}</p>
                      
                      {act.isApproved && (
                        <span className="inline-flex mt-1 items-center gap-1 text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-widest">
                           Müdür Onaylı ✅
                        </span>
                      )}

                      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">{act.date}</p>
                    </div>
                  </div>

                  {/* Aferin Onay Butonu (Yönetici için) */}
                  {act.type === 'feed' && !act.isApproved && activeUser?.role !== 'personel' && activeUser?.department === emp.department && (
                    <div className="flex pl-8 mt-1">
                      <button
                        onClick={() => handleApprove(act.id)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm font-bold text-[10px] transition-transform active:scale-95"
                      >
                        <CheckCircle className="w-3 h-3" /> Aferin! (+5 Puan)
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── Yönetici Notları Bölümü ─── */}
          <div className="border-t border-slate-100 dark:border-slate-700" />
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              Yönetici Yorumları
              {(emp.comments?.length > 0) && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {emp.comments.filter(c =>
                    activeUser?.role === 'admin' ||
                    (activeUser?.canViewPerformance && c.type === 'performance') ||
                    (activeUser?.canViewPayroll && c.type === 'payroll')
                  ).length}
                </span>
              )}
            </h4>
            <ManagerNotesSection emp={emp} />
          </div>
        </motion.aside>
    </AnimatePresence>
  );
}
