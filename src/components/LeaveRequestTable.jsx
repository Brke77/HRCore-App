import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';

const TYPE_COLORS = {
  blue:   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  green:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber:  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const rowVariants = {
  hidden:  { opacity: 0, x: -20, height: 0 },
  visible: { opacity: 1, x: 0, height: 'auto' },
  exit:    { opacity: 0, x: 40, height: 0, transition: { duration: 0.3 } },
};

function AvatarFallback({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
}

export default function LeaveRequestTable() {
  const { leaveRequests, approveRequest, rejectRequest, setSelectedEmployee, employees } = useApp();
  const { addAuditLog, addNotification } = useNotifications();
  const { activeUser } = useUser();

  const filteredRequests = leaveRequests.filter((req) => {
    if (activeUser.isSuperAdmin || activeUser.department === 'Global') return true;
    const emp = employees.find((e) => e.id === req.employeeId);
    return emp?.department === activeUser.department;
  });

  const handleSelectEmployee = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) setSelectedEmployee(emp);
  };

  const handleApprove = (req) => {
    approveRequest(req.id);
    addAuditLog(`${activeUser.name}, ${req.name}'ın izin talebini onayladı`, 'approve');
    addNotification({
      type: 'LEAVE',
      title: 'Izin Talebi Onaylandi',
      message: `${req.name} icin olusturulan izin talebi onaylandi.`,
      targetDepartment: activeUser.department,
      targetId: req.id,
    });
  };

  const handleReject = (req) => {
    rejectRequest(req.id);
    addAuditLog(`${activeUser.name}, ${req.name}'ın izin talebini reddetti`, 'reject');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Onay Bekleyen Talepler</h2>
          {filteredRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {filteredRequests.length}
            </span>
          )}
        </div>
        <button className="text-primary text-sm font-semibold hover:underline">Tümünü Gör</button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <Check className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Bekleyen talep bulunmuyor</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Tüm talepler işlendi 🎉</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/30 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Personel</th>
                <th className="px-6 py-4">İzin Türü</th>
                <th className="px-6 py-4">Süre</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredRequests.map((req, i) => (
                  <motion.tr
                    key={req.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: i * 0.05 }}
                    className="border-t border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectEmployee(req.employeeId)}
                        className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                      >
                        {req.avatar ? (
                          <img
                            src={req.avatar}
                            alt={req.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all flex-shrink-0"
                          />
                        ) : (
                          <AvatarFallback name={req.name} />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{req.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{req.title}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${TYPE_COLORS[req.typeColor] || TYPE_COLORS.blue}`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{req.duration}</span>
                      {req.date && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{req.date}</p>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReject(req)}
                          className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl transition-colors"
                          title="Reddet"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleApprove(req)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 rounded-xl transition-colors"
                          title="Onayla"
                        >
                          <Check className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
