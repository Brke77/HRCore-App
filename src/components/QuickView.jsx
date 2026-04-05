import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Clock, MapPin, Mail, Phone, Calendar } from 'lucide-react';

function DonutChart({ remaining, total }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? remaining / total : 0;
  const offset = circumference * (1 - pct);

  // Color by remaining days
  const strokeColor = remaining > 10 ? '#ec5b13' : remaining > 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Kalan İzin Hakkı</h4>
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-700"
            strokeWidth="10"
          />
          <circle
            cx="64" cy="64" r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }}
          />
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

export default function QuickView() {
  const { selectedEmployee: emp } = useApp();

  return (
    <AnimatePresence mode="wait">
      {emp && (
        <motion.aside
          key={emp.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 transition-colors duration-300"
        >
          {/* Profile */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {emp.avatar ? (
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/10 mx-auto"
                />
              ) : (
                <AvatarFallback name={emp.name} />
              )}
              <span
                className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full border-[3px] border-white dark:border-slate-800 ${
                  emp.status === 'Aktif' ? 'bg-emerald-400' : emp.status === 'İzinli' ? 'bg-amber-400' : 'bg-slate-300'
                }`}
              />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">{emp.name}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">{emp.title}</p>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
              {emp.daysWorked} Gündür Bizimle
            </span>
          </div>

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

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Donut chart */}
          <DonutChart remaining={emp.remainingLeave} total={emp.totalLeave} />

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Recent activity */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              Son Hareketler
            </h4>
            <div className="relative space-y-4 before:absolute before:left-[9px] before:top-1 before:h-[calc(100%-8px)] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
              {emp.recentActivity.map((act, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="relative flex items-start gap-3 pl-6"
                >
                  <span
                    className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-800 flex-shrink-0 ${
                      i === 0 ? 'border-primary' : 'border-slate-200 dark:border-slate-600'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{act.desc}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5">{act.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
