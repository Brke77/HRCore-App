import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STATUS_BADGE = {
  Aktif: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  İzinli: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Ayrıldı: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

const STATUS_DOT = {
  Aktif: 'bg-emerald-500',
  İzinli: 'bg-amber-500',
  Ayrıldı: 'bg-slate-400',
};

const PAGE_SIZE = 6;

function AvatarFallback({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/10 flex-shrink-0">
      {initials}
    </div>
  );
}

export default function EmployeeTable({ employees }) {
  const { setSelectedEmployee } = useApp();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(employees.length / PAGE_SIZE);
  const paginated = employees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleView = (emp) => setSelectedEmployee(emp);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Çalışan</th>
              <th className="px-6 py-4">Departman</th>
              <th className="px-6 py-4">E-posta / Telefon</th>
              <th className="px-6 py-4">İşe Giriş</th>
              <th className="px-6 py-4 text-center">Puan</th>
              <th className="px-6 py-4 text-center">Durum</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginated.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-slate-50 dark:border-slate-700/50 hover:bg-primary/[0.02] dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                  onClick={() => handleView(emp)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all flex-shrink-0"
                        />
                      ) : (
                        <AvatarFallback name={emp.name} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{emp.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{emp.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-tight">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{emp.email}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{emp.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{emp.startDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                       <span className="text-yellow-500">⭐</span> {emp.performanceScore || 85}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={STATUS_BADGE[emp.status] || STATUS_BADGE.Aktif}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[emp.status] || STATUS_DOT.Aktif}`} />
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleView(emp)}
                        className="p-1.5 text-slate-300 dark:text-slate-500 hover:text-primary transition-colors"
                        title="Görüntüle"
                      >
                        <Eye className="w-4.5 h-4.5" size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-slate-300 dark:text-slate-500 hover:text-primary transition-colors"
                        title="Düzenle"
                      >
                        <Pencil size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700">
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
          {employees.length} sonuçtan {Math.min((page - 1) * PAGE_SIZE + 1, employees.length)}-
          {Math.min(page * PAGE_SIZE, employees.length)} gösteriliyor
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg transition-all ${
                p === page
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 border border-transparent'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
