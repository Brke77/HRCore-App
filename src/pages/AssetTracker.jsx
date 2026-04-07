import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { Package, Plus, Target, CheckCircle, PackageOpen, Monitor, Smartphone, Wrench, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';

const STOCK_ITEMS = [
  { name: 'Laptop', stock: 18 },
  { name: 'Telefon', stock: 12 },
  { name: 'Koruyucu Gozluk', stock: 31 },
  { name: 'Olcum Cihazi', stock: 9 },
];

export default function AssetTracker() {
  const { activeUser } = useUser();
  const { employees } = useApp();
  const { addNotification } = useNotifications();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', kind: 'Elektronik', assignee: '' });
  
  // Aggregate assets from employees
  const allAssets = employees.flatMap(emp => 
    (emp.assets || []).map(asset => ({ ...asset, ownerId: emp.id, ownerName: emp.name }))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.name || !formData.assignee) return;
    
    // As context is mock, we trigger addNotification to simulate assignment
    addNotification({
       type: 'SYSTEM',
       title: 'Yeni Demirbaş Zimmeti',
       message: `${formData.assignee} isimli personele ${formData.name} demirbaşı zimmetlenmiştir.`,
       targetRole: 'ik_muduru',
    });
    
    // In a real app we would call an AppContext method like `assignAsset`.
    setShowAddModal(false);
    setFormData({ name: '', kind: 'Elektronik', assignee: '' });
  };

  const getIcon = (kind) => {
    switch(kind) {
      case 'Elektronik': return <Monitor className="w-5 h-5 text-blue-500" />;
      case 'Mobil': return <Smartphone className="w-5 h-5 text-emerald-500" />;
      case 'Ekipman': return <Wrench className="w-5 h-5 text-amber-500" />;
      default: return <Package className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative">
      <Header />
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Demirbaş Takibi</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Şirket envanteri ve zimmetli materyallerin listesi.</p>
          </motion.div>
          
          {(activeUser?.role === 'ik_muduru' || activeUser?.role === 'admin' || activeUser?.isSuperAdmin) && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" /> Yeni Demirbaş Zimmetle
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {STOCK_ITEMS.map((item) => (
             <div key={item.name} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                   <p className="text-xs text-slate-500">Stokta: {item.stock} Adet</p>
                </div>
             </div>
           ))}
        </div>

        {allAssets.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-slate-800/20 backdrop-blur border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <PackageOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Zimmetli varlık bulunamadı.</p>
           </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Envanter Adı</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Sahibi</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allAssets.map((asset, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-sm text-slate-800 dark:text-wrap flex items-center gap-3">
                      {getIcon(asset.kind)} {asset.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{asset.kind}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{asset.ownerName}</td>
                    <td className="py-4 px-6 text-right">
                       <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" /> Kullanımda
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                 <div>
                   <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                     <Package className="w-5 h-5 text-primary" /> Yeni Zimmet Ekle
                   </h2>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 rounded-full transition-colors">
                   <X className="w-4 h-4" />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Demirbaş Adı</label>
                   <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Örn: Macbook Pro M2" className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary px-4 py-3 outline-none dark:text-white" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                   <select value={formData.kind} onChange={e=>setFormData({...formData, kind: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary px-4 py-3 outline-none dark:text-white">
                     <option>Elektronik</option>
                     <option>Mobil</option>
                     <option>Ekipman</option>
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase">Zimmetlenecek Personel</label>
                   <select required value={formData.assignee} onChange={e=>setFormData({...formData, assignee: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary px-4 py-3 outline-none dark:text-white">
                     <option value="">Personel Seçin</option>
                     {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                   </select>
                 </div>
                 <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                      Demirbaşı Ata
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
