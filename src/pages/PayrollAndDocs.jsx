import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Wallet, FileText, Download, Eye, UploadCloud, Folder, 
  CheckCircle2, Clock, Landmark, Coins, FileCheck2, Search, ArrowLeft
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// format money
const formatTRY = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

export default function PayrollAndDocs() {
  const { employees } = useApp();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('bordro'); // 'bordro' | 'belge'

  // Payroll Calculations
  const { totalGross, totalOvertime, paymentRate, pieChartData } = useMemo(() => {
    let gross = 0;
    let overtime = 0;
    let paidCount = 0;
    const deptMap = {};

    employees.forEach(e => {
      const p = e.payrollData;
      if (!p) return;
      
      gross += p.gross;
      overtime += p.overtime;
      if (p.status === 'Ödendi') paidCount++;

      deptMap[e.department] = (deptMap[e.department] || 0) + p.gross;
    });

    const rate = employees.length > 0 ? Math.round((paidCount / employees.length) * 100) : 0;
    
    // Sort pie data
    const sortedPie = Object.keys(deptMap).map(k => ({
      name: k,
      value: deptMap[k]
    })).sort((a,b) => b.value - a.value);

    return { totalGross: gross, totalOvertime: overtime, paymentRate: rate, pieChartData: sortedPie };
  }, [employees]);

  // Aggregate Documents
  const allDocuments = useMemo(() => {
    const docs = [];
    employees.forEach(e => {
      if (e.documents) {
        e.documents.forEach(d => {
          docs.push({ ...d, empName: e.name, avatar: e.avatar });
        });
      }
    });
    return docs;
  }, [employees]);

  // Belge Görünüm Yönetimi
  const [folderView, setFolderView] = useState(null); // 'sozlesmeler', 'ozluk', 'isg' vb.
  const [contractSearch, setContractSearch] = useState('');

  // Mock Sözleşmeler
  const mockContracts = useMemo(() => [
    { id: 1, name: "Tedarik Sözleşmesi - ABC A.Ş.", date: "15.03.2024", size: "1.4 MB" },
    { id: 2, name: "SaaS Hizmet Sözleşmesi - XYZ Tech.", date: "02.04.2024", size: "2.1 MB" },
    { id: 3, name: "Kira Kontratı - Merkez Ofis", date: "10.01.2024", size: "4.5 MB" },
    { id: 4, name: "Gizlilik Sözleşmesi (NDA) - Global Partners", date: "22.02.2024", size: "600 KB" },
    { id: 5, name: "Danışmanlık Sözleşmesi - Ahmet Yılmaz", date: "05.04.2024", size: "850 KB" }
  ], []);

  const FOLDER_TITLES = useMemo(() => ({
    ozluk: { title: 'Özlük Dosyaları Arşivi', category: 'Özlük Dosyaları' },
    sozlesmeler: { title: 'Sözleşmeler Arşivi', category: 'Sözleşmeler' },
    isg: { title: 'İSG Belgeleri Arşivi', category: 'İSG Belgeleri' }
  }), []);

  const currentFolder = folderView ? FOLDER_TITLES[folderView] : null;

  const activeDocuments = useMemo(() => {
    if (!currentFolder) return [];
    
    // Ana personelin sahip olduğu ilgili kategorideki belgeler
    let docs = allDocuments.filter(d => d.category === currentFolder.category);
    
    // Eğer sözleşmeler ise mock kurumsal belgeleri de ekle
    if (folderView === 'sozlesmeler') {
      const mockFormatted = mockContracts.map(m => ({
        ...m,
        empName: 'Kurumsal Şirket Arşivi',
        avatar: `https://ui-avatars.com/api/?name=KŞ&background=f97316&color=fff`
      }));
      docs = [...mockFormatted, ...docs];
    }
    return docs;
  }, [folderView, currentFolder, allDocuments, mockContracts]);

  const filteredViewDocuments = activeDocuments.filter(d => 
    d.name.toLowerCase().includes(contractSearch.toLowerCase()) || 
    (d.empName && d.empName.toLowerCase().includes(contractSearch.toLowerCase()))
  );

  const COLORS = ['#ec5b13', '#f97316', '#fdba74', '#cbd5e1']; // FinTech/HRCore specialized palette
  const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = darkMode ? '#334155' : '#f1f5f9';
  const tooltipText = darkMode ? '#f8fafc' : '#1e293b';

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full px-8 py-8 space-y-8">

        {/* --- Header & Tabs --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-800 dark:text-white tracking-tight flex items-center gap-3 transition-colors duration-300">
              Mali İşler & Belgeler
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors duration-300">
              Personel özlük dosyaları, bordro işlemleri ve departman maliyet analizleri
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-1 transition-colors duration-300">
            <button 
              onClick={() => setActiveTab('bordro')}
              className={classNames(
                "px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300",
                activeTab === 'bordro' 
                  ? "bg-slate-800 dark:bg-slate-700 text-white shadow-md" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Wallet className="w-4 h-4" /> Bordro & Maaş
            </button>
            <button 
              onClick={() => setActiveTab('belge')}
              className={classNames(
                "px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300",
                activeTab === 'belge' 
                  ? "bg-slate-800 dark:bg-slate-700 text-white shadow-md" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <FileText className="w-4 h-4" /> Belge Yönetimi
            </button>
          </div>
        </div>

        {/* ------------ TAB: BORDRO ------------ */}
        {activeTab === 'bordro' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_0_15px_rgba(255,255,255,0.03)] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-300">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Toplam Maaş Gideri</p>
                  <p className="text-3xl font-black text-slate-800 dark:text-white transition-colors">{formatTRY(totalGross)}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 flex-shrink-0 transition-colors">
                  <Landmark className="w-6 h-6"/>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_0_15px_rgba(255,255,255,0.03)] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-300">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Aylık Ekstra Mesai Maliyeti</p>
                  <p className="text-3xl font-black text-slate-800 dark:text-white transition-colors">{formatTRY(totalOvertime)}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 flex-shrink-0 transition-colors">
                  <Coins className="w-6 h-6"/>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_0_20px_rgba(236,91,19,0.15)] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-300 group">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Bordro Ödeme Durumu</p>
                  <p className="text-3xl font-black text-primary dark:text-primary-400 transition-colors">%{paymentRate} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Tamamlandı</span></p>
                </div>
                <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-primary/20 border border-orange-100 dark:border-primary/20 flex items-center justify-center text-primary dark:text-primary-400 flex-shrink-0 transition-colors">
                  <CheckCircle2 className="w-6 h-6"/>
                </div>
              </div>
            </div>

            {/* Split Section: Table & Analytics */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Dynamic Payroll Table */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg transition-colors">Nisan 2026 Bordroları</h3>
                  <button className="text-sm font-bold text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Tümünü İndir</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <th className="p-4 pl-6">Personel</th>
                        <th className="p-4">Brüt Maaş</th>
                        <th className="p-4">Net Maaş</th>
                        <th className="p-4">Durum</th>
                        <th className="p-4 text-right pr-6">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm transition-colors">
                      {employees.map(emp => {
                        const p = emp.payrollData;
                        if (!p) return null;
                        const isPending = p.status === 'Bekliyor';

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="p-4 pl-6 flex items-center gap-3">
                              <img src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=ec5b13&color=fff`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</span>
                            </td>
                            <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{formatTRY(p.gross)}</td>
                            <td className="p-4 font-bold text-slate-800 dark:text-white">{formatTRY(p.net)}</td>
                            <td className="p-4">
                              <div className={classNames(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors",
                                isPending ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" : "bg-green-50 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              )}>
                                {isPending ? <Clock className="w-3.5 h-3.5"/> : <CheckCircle2 className="w-3.5 h-3.5"/>}
                                {p.status}
                              </div>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Detay"><Eye className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded text-slate-400 hover:text-primary transition-colors" title="PDF İndir"><Download className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Cost Analytics Container */}
              <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col transition-colors duration-300">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6 transition-colors">Departman Maliyet Dağılımı</h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(val) => formatTRY(val)}
                        wrapperClassName="!rounded-xl !shadow-xl !font-medium border-none !text-sm"
                        contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
                        itemStyle={{ color: tooltipText }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: darkMode ? '#94a3b8' : '#64748b' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ------------ TAB: BELGE YÖNETİMİ ------------ */}
        {activeTab === 'belge' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Quick Folders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { id: 'ozluk', title: 'Özlük Dosyaları', count: '128 Dosya', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30' },
                { id: 'sozlesmeler', title: 'Sözleşmeler', count: '45 Dosya', color: 'bg-orange-50 text-primary dark:bg-orange-900/30 dark:text-primary-400', border: 'border-orange-100 dark:border-orange-900/30' },
                { id: 'isg', title: 'İSG Belgeleri', count: '92 Dosya', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
              ].map((folder, i) => (
                <div 
                  key={i} 
                  onClick={() => setFolderView(folder.id)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5 duration-300"
                >
                  <div className={classNames("w-14 h-14 relative overflow-hidden rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105", folder.color, folder.border)}>
                    <Folder className="w-10 h-10 fill-current opacity-20 dark:opacity-40 absolute -right-3 -bottom-3 rotate-12 transition-opacity" />
                    <Folder className="w-6 h-6 relative z-10 drop-shadow-sm" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 transition-colors">{folder.title}</h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{folder.count}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* İçerik Yönetimi: Bölümler Özeli Arşiv Ekranları vs Son Yüklenenler */}
            <AnimatePresence mode="wait">
              {folderView ? (
                <motion.div 
                  key="sozlesmeler"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300"
                >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-50/30 dark:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFolderView(null)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-sm">
                        <ArrowLeft className="w-5 h-5"/>
                      </button>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg transition-colors">{currentFolder?.title}</h3>
                    </div>
                    
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Sözleşme Ara..." 
                        value={contractSearch}
                        onChange={(e) => setContractSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800/50">
                          <th className="p-4 pl-6">Personel / Birim</th>
                          <th className="p-4">Belge Adı</th>
                          <th className="p-4">Tarih</th>
                          <th className="p-4">Boyut</th>
                          <th className="p-4 text-right pr-6">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-sm">
                        {filteredViewDocuments.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 pl-6 flex items-center gap-3">
                               <img src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.empName)}&background=ec5b13&color=fff`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                               <span className="font-bold text-slate-800 dark:text-slate-200">{c.empName}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 transition-colors">
                                 <FileText className="w-5 h-5 text-primary shrink-0 drop-shadow-sm"/> {c.name}
                              </div>
                            </td>
                            <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{c.date}</td>
                            <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{c.size}</td>
                            <td className="p-4 text-right pr-6">
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-800 rounded-lg text-[13px] font-bold transition-colors ml-auto">
                                 <Eye className="w-3.5 h-3.5"/> Aç
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredViewDocuments.length === 0 && (
                          <tr>
                             <td colSpan="5" className="text-center p-8 text-slate-400 dark:text-slate-500 font-medium">Böyle bir belge bulunamadı.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="genel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300"
                >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg transition-colors">Son Yüklenen Belgeler</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                          <th className="p-4 pl-6">Personel</th>
                          <th className="p-4">Belge Adı</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4">Tarih</th>
                          <th className="p-4">Boyut</th>
                          <th className="p-4 text-right pr-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                        {allDocuments.slice(0, 5).map((doc, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 pl-6 flex items-center gap-3">
                               <img src={doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.empName)}&background=ec5b13&color=fff`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                               <span className="font-bold text-slate-800 dark:text-slate-200">{doc.empName}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                 <FileCheck2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"/> {doc.name}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[11px] font-bold tracking-widest uppercase transition-colors">
                                {doc.category}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{doc.date}</td>
                            <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{doc.size}</td>
                            <td className="p-4 text-right pr-6">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-800 rounded-lg text-[13px] font-bold transition-colors ml-auto">
                                   <Eye className="w-3.5 h-3.5"/> Görüntüle
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag & Drop Upload Zone */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-100/50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">
               <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 transition-colors">
                 <UploadCloud className="w-8 h-8" />
               </div>
               <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1 transition-colors">Yeni Belge Yükle</h4>
               <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-md transition-colors">
                 Sürükle bırak özelliğiyle birden fazla PDF, Word veya Resim dosyasını hızlıca sisteme aktarabilirsiniz. (Max 10MB)
               </p>
               <button className="mt-6 px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg transition-all">
                 Dosya Seç
               </button>
            </div>
            
          </motion.div>
        )}

      </div>
    </div>
  );
}
