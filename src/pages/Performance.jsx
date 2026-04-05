import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Search, TrendingUp, Target, MessageSquare, AlertCircle, Quote, ChevronDown } from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Performance() {
  const { employees } = useApp();
  const { darkMode } = useTheme();
  
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('Tüm Departmanlar');
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || null);

  // Filter List
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchDep = department === 'Tüm Departmanlar' || emp.department === department;
      const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase());
      return matchDep && matchSearch;
    });
  }, [employees, search, department]);

  // Overall calculations based on filter
  const { avgPerformance, avgGoal, totalFeedback } = useMemo(() => {
    if (filteredEmployees.length === 0) return { avgPerformance: 0, avgGoal: 0, totalFeedback: 0 };
    
    let perfTotal = 0;
    let kpiCount = 0;
    let kpiTotalPercentage = 0;
    let feedbackTotal = 0;

    filteredEmployees.forEach(e => {
      const p = e.performanceData;
      if (!p) return;
      perfTotal += p.averageScore || 0;
      feedbackTotal += p.feedbacks ? p.feedbacks.length : 0;
      
      p.kpis?.forEach(kpi => {
        kpiCount++;
        let pct = 0;
        if (kpi.type === '%') {
          pct = (kpi.current / kpi.target) * 100;
        } else if (kpi.max) {
          pct = (kpi.current / kpi.max) * 100;
        }
        kpiTotalPercentage += pct;
      });
    });

    return {
      avgPerformance: Math.round(perfTotal / filteredEmployees.length),
      avgGoal: kpiCount > 0 ? Math.round(kpiTotalPercentage / kpiCount) : 0,
      totalFeedback: feedbackTotal
    };
  }, [filteredEmployees]);

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || filteredEmployees[0];
  const perfData = selectedEmp?.performanceData;
  const isNeedsImprovement = perfData && perfData.averageScore < 70;

  const axisColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#f1f5f9';
  const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = darkMode ? '#334155' : '#f1f5f9';
  const tooltipText = darkMode ? '#f8fafc' : '#1e293b';

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full px-8 py-8 space-y-8">

        {/* --- Header & Top Stats --- */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-800 dark:text-white tracking-tight transition-colors duration-300">Performans Yönetimi</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors duration-300">Sistem üzerinden KPIs, yetkinlik matrisi ve veri bazlı gelişim trendleri</p>
          </div>

          {/* Top Stat Cards */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between w-48 transition-colors duration-300">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ortalama Performans</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">%{avgPerformance}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-400">
                <TrendingUp className="w-5 h-5"/>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between w-48 transition-colors duration-300">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hedef Gerçekleşme</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">%{avgGoal}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <Target className="w-5 h-5"/>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between w-48 transition-colors duration-300">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Geri Bildirimler</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{totalFeedback}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 dark:text-purple-400">
                <MessageSquare className="w-5 h-5"/>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Split --- */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Selection Bar */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-50 dark:border-slate-800 space-y-4 transition-colors duration-300">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Çalışan Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="Tüm Departmanlar">Tüm Departmanlar</option>
                  <option value="Yazılım">Yazılım</option>
                  <option value="Pazarlama">Pazarlama</option>
                  <option value="İK">İnsan Kaynakları</option>
                  <option value="Finans">Finans</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 flex-1 min-h-[400px] max-h-[600px] overflow-y-auto rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-50 dark:border-slate-800 p-2 space-y-1 transition-colors duration-300 scrollbar-thin">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={classNames(
                    'w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all',
                    selectedEmpId === emp.id 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <img 
                    src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=ec5b13&color=fff`} 
                    alt={emp.name} 
                    className={classNames(
                      "w-10 h-10 rounded-full object-cover border-2",
                      selectedEmpId === emp.id ? "border-white/30" : "border-slate-100 dark:border-slate-700"
                    )}
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate">{emp.name}</p>
                    <p className={classNames(
                      "text-xs truncate font-medium",
                      selectedEmpId === emp.id ? "text-primary-100" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {emp.department} • {emp.performanceData?.averageScore} Puan
                    </p>
                  </div>
                </button>
              ))}
              {filteredEmployees.length === 0 && (
                <p className="p-4 text-center text-slate-400 text-sm font-medium">Sonuç bulunamadı.</p>
              )}
            </div>
          </div>

          {/* Right Detailed Panel */}
          {selectedEmp && perfData ? (
            <motion.div 
              key={selectedEmp.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <img src={selectedEmp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmp.name)}&background=ec5b13&color=fff`} className="w-16 h-16 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm object-cover"/>
                  <div>
                    <h3 className="text-2xl font-bold font-headline text-slate-800 dark:text-white transition-colors duration-300">{selectedEmp.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">{selectedEmp.title} • {selectedEmp.department}</p>
                  </div>
                </div>
                {isNeedsImprovement && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/30 shadow-sm animate-pulse transition-colors duration-300">
                    <AlertCircle className="w-5 h-5"/>
                    <span className="text-sm font-bold tracking-wide">Gelişim Planı Gerekiyor</span>
                  </div>
                )}
                {!isNeedsImprovement && (
                  <div className="bg-green-50 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-100 dark:border-emerald-900/30 shadow-sm transition-colors duration-300">
                    <span className="text-sm font-bold tracking-wide">Beklentiyi Karşılıyor</span>
                  </div>
                )}
              </div>

              {/* Data Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Radar Chart (Yetkinlik Matrisi) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors duration-300">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Yetkinlik Matrisi</h4>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={perfData.radarData}>
                        <PolarGrid stroke={gridColor} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Skor" dataKey="score" stroke="#ec5b13" strokeWidth={2} fill="#ec5b13" fillOpacity={0.2} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '0.75rem', fontWeight: 600 }}
                          itemStyle={{ color: '#ec5b13' }}
                          cursor={{ fill: 'transparent' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart (Verimlilik Trendi) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors duration-300">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">6 Aylık Performans Trendi</h4>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={perfData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.1} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} domain={[0, 100]} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '0.75rem', fontWeight: 600 }}
                           itemStyle={{ color: '#ec5b13' }}
                           cursor={{ stroke: gridColor, strokeWidth: 2 }} 
                        />
                        <Line type="monotone" dataKey="score" stroke="#ec5b13" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: darkMode ? '#1e293b' : '#fff' }} activeDot={{ r: 6, fill: '#ec5b13', stroke: darkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                
                {/* KPIs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6 transition-colors duration-300">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Temel Performans Göstergeleri (KPI)</h4>
                  <div className="space-y-5">
                    {perfData.kpis?.map((kpi, idx) => {
                      const isPercentage = kpi.type === '%';
                      let percent = isPercentage ? (kpi.current / kpi.target) * 100 : (kpi.current / kpi.max) * 100;
                      if (percent > 100) percent = 100;

                      return (
                        <div key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-colors">
                          <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 transition-colors">
                            <span>{kpi.name}</span>
                            <span>{kpi.current} {kpi.type || ''} <span className="text-slate-400 dark:text-slate-500 font-medium">/ {kpi.target || kpi.max}</span></span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={classNames(
                                "h-full rounded-full transition-colors duration-300",
                                percent < 50 ? "bg-red-400 dark:bg-red-500" : percent < 80 ? "bg-orange-400 dark:bg-orange-500" : "bg-green-500 dark:bg-emerald-500"
                              )}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 360 Feedback Quotes */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4 transition-colors duration-300">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">360° Geri Bildirim</h4>
                  <div className="space-y-4 overflow-y-auto pr-2 max-h-[220px] scrollbar-thin">
                    {perfData.feedbacks?.map((fb, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Quote className="w-8 h-8 text-slate-200 dark:text-slate-700 absolute top-3 right-3 rotate-180 transition-colors" />
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm italic pr-8 relative z-10 leading-relaxed transition-colors">
                          "{fb.text}"
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
                            {fb.author.charAt(0)}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors">{fb.author}</span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase transition-colors">• {fb.role}</span>
                        </div>
                      </div>
                    ))}
                    {(!perfData.feedbacks || perfData.feedbacks.length === 0) && (
                      <p className="text-slate-400 dark:text-slate-500 text-sm italic py-4">Henüz bir geri bildirim bulunmuyor.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] transition-colors duration-300">
              <Target className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4 transition-colors" />
              <p className="text-lg font-bold text-slate-400 dark:text-slate-500 transition-colors">Performans detaylarını görmek için bir çalışan seçin.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
