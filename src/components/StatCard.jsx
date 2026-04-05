import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, colorClass, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between group cursor-default transition-colors duration-300"
    >
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</h3>
      </div>
      <div
        className={`p-3.5 rounded-2xl transition-transform duration-200 group-hover:scale-110 ${colorClass}`}
      >
        <Icon className="w-7 h-7" strokeWidth={1.8} />
      </div>
    </motion.div>
  );
}
