import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import Header from '../components/Header';
import EmployeeTable from '../components/EmployeeTable';
import QuickView from '../components/QuickView';
import { useApp } from '../context/AppContext';

const DEPARTMENTS = ['Tüm Departmanlar', 'Yazılım', 'Pazarlama', 'İK', 'Finans'];
const STATUSES = ['Tüm Durumlar', 'Aktif', 'İzinli', 'Ayrıldı'];
const LOCATIONS = ['Tüm Lokasyonlar', 'İstanbul', 'Ankara', 'İzmir', 'Uzaktan'];

export default function PersonelListesi() {
  const { employees } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('Tüm Departmanlar');
  const [status, setStatus] = useState('Tüm Durumlar');
  const [location, setLocation] = useState('Tüm Lokasyonlar');

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.title.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);
      const matchDept = department === 'Tüm Departmanlar' || emp.department === department;
      const matchStatus = status === 'Tüm Durumlar' || emp.status === status;
      const matchLocation = location === 'Tüm Lokasyonlar' || emp.location === location;
      return matchSearch && matchDept && matchStatus && matchLocation;
    });
  }, [employees, search, department, status, location]);

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-auto">
      <Header
        searchValue={search}
        onSearch={setSearch}
        placeholder="Personel ara... (Ad, Pozisyon, E-posta)"
      />
      <div className="p-8 space-y-6">
        {/* Page title + action */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Çalışan Listesi
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Toplam <span className="text-slate-600 dark:text-slate-300 font-semibold">{filtered.length}</span> çalışan listeleniyor
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/yeni-personel')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Yeni Çalışan Ekle
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3 transition-colors duration-300"
        >
          {/* Search inside filter bar */}
          <div className="flex-1 min-w-[220px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad, Soyad, Pozisyon..."
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Table + Quick View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-8"
          >
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-16 text-center">
                <p className="text-slate-400 dark:text-slate-500 font-medium">Eşleşen çalışan bulunamadı.</p>
                <p className="text-slate-300 dark:text-slate-600 text-sm mt-1">Farklı bir arama terimi deneyin.</p>
              </div>
            ) : (
              <EmployeeTable employees={filtered} />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <QuickView />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
