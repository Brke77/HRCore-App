import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, CalendarPlus, FileSpreadsheet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { label: 'Yeni Personel', icon: UserPlus, path: '/yeni-personel', color: 'bg-blue-500' },
  { label: 'İzin Talebi Oluştur', icon: CalendarPlus, path: '/izin-takvimi', color: 'bg-emerald-500' },
  { label: 'Bordro Çıkar', icon: FileSpreadsheet, path: '/bordro', color: 'bg-purple-500' },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Action items */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-40"
            />

            {/* Menu items */}
            <div className="relative z-50 flex flex-col items-end gap-2 mb-2">
              {ACTIONS.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 22 }}
                  onClick={() => { navigate(action.path); setOpen(false); }}
                  className="flex items-center gap-3 pl-4 pr-3 py-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 dark:border-slate-700/60 hover:scale-105 transition-transform group"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{action.label}</span>
                  <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center text-white shadow-lg`}>
                    <action.icon className="w-4.5 h-4.5" size={18} />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative z-50 w-14 h-14 bg-gradient-to-br from-primary to-primary-700 text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:shadow-2xl transition-shadow"
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>

        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping-slow bg-primary/30" />
        )}
      </motion.button>
    </div>
  );
}
