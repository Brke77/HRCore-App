import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { 
  User, Monitor, Bell, Database, ShieldCheck, 
  Camera, Lock, Globe, Moon, Sun, Mail, Download, 
  FileTerminal, History, CheckCircle, UserPlus, DollarSign, Settings2
} from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Custom Switch Component
const CustomSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    className={classNames(
      checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600',
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none'
    )}
    onClick={() => onChange(!checked)}
  >
    <span
      className={classNames(
        checked ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
      )}
    />
  </button>
);

const AUDIT_ICONS = {
  approve: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  reject: { icon: History, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
  add: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  payroll: { icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  role: { icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  system: { icon: Settings2, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-700/30' },
};

export default function Settings() {
  const { employees } = useApp();
  const { darkMode, setDarkMode } = useTheme();
  const { preferences, updatePreference, auditLogs, addNotification, addAuditLog } = useNotifications();
  const { currentUser, changePassword } = useAuth();
  const { activeUser } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [language, setLanguage] = useState('tr');
  const [showLogs, setShowLogs] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    nextPassword: '',
    confirmPassword: '',
  });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  const TABS = [
    { id: 'profile', label: 'Profil Ayarları', icon: User },
    { id: 'system', label: 'Sistem & Görünüm', icon: Monitor },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'data', label: 'Veri Yönetimi', icon: Database },
    { id: 'roles', label: 'Rol Yönetimi', icon: ShieldCheck }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Kişisel Bilgiler</h3>
              <div className="flex items-start gap-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGPSVUyjrtwjpS-5YwLe2VOFnGamVdLBt8zJj0EEUzKwR0laaNwcAAzkJMTF-OdR-4TTjJXvYHb__KxKB_pr_fcIeeYjrwwLr6NAHCfN0jBlLKtx3Py5yfH33u0JToSgP5px_8q5OsEltEn9Av2bmlRSJFI4VqaYWk1eagUMqOJEiwjYl5Mbfw4KD-abHsCilHqWE_tyzS_3EIRr9783xPi_Gjy0bmmNWL2PmEB7OzLNLqV0EEE_WLF5xe3RUFPc5wGsyoy4xpaM-h" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Ad Soyad</label>
                      <input type="text" value={currentUser?.name || ''} readOnly className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">E-posta</label>
                      <input type="email" value={currentUser?.email || ''} readOnly className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Rol</label>
                      <input type="text" value={currentUser?.roleLabel || '-'} readOnly className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Departman</label>
                      <input type="text" value={currentUser?.department || '-'} readOnly className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-slate-400 dark:text-slate-500"/> Şifre Güncelleme</h3>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const result = changePassword(passwordForm);
                  setPasswordFeedback({
                    type: result.success ? 'success' : 'error',
                    message: result.message,
                  });

                  if (!result.success) return;

                  setPasswordForm({
                    currentPassword: '',
                    nextPassword: '',
                    confirmPassword: '',
                  });
                  addAuditLog(`${activeUser?.name || 'Kullanıcı'} hesap şifresini güncelledi.`, 'system');
                  addNotification({
                    type: 'SYSTEM',
                    title: 'Şifre Güncellendi',
                    message: 'Şifreniz başarıyla değiştirildi.',
                    targetId: activeUser?.id,
                  });
                }}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Mevcut Şifre</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Yeni Şifre</label>
                  <input type="password" value={passwordForm.nextPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, nextPassword: event.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Yeni Şifre Tekrar</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                {passwordFeedback.message && (
                  <div className={classNames(
                    'rounded-xl border px-4 py-3 text-sm font-medium',
                    passwordFeedback.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                  )}>
                    {passwordFeedback.message}
                  </div>
                )}
                <button type="submit" className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 mt-2">
                  Şifreyi Güncelle
                </button>
              </form>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-8 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tema Tercihi</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Uygulama arayüzünü kendi göz zevkinize göre özelleştirin.</p>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(false)} className={classNames("flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all", !darkMode ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500")}>
                  <Sun className={classNames("w-5 h-5", !darkMode ? "text-primary" : "text-slate-400 dark:text-slate-500")} />
                  <span className={classNames("font-bold", !darkMode ? "text-primary" : "text-slate-600 dark:text-slate-400")}>Gündüz Modu</span>
                </button>
                <button onClick={() => setDarkMode(true)} className={classNames("flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all", darkMode ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500")}>
                  <Moon className={classNames("w-5 h-5", darkMode ? "text-primary" : "text-slate-400 dark:text-slate-500")} />
                  <span className={classNames("font-bold", darkMode ? "text-primary" : "text-slate-600 dark:text-slate-400")}>Karanlık Mod</span>
                </button>
              </div>
            </div>

            <div className="block h-px w-full bg-slate-100 dark:bg-slate-700"></div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dil (Language)</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Arayüzde kullanılacak varsayılan dili seçin.</p>
              
              <div className="relative max-w-sm">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="tr">Türkçe (TR)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">E-posta Bildirimleri</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Hangi durumlarda sistemin size bilgilendirme maili atacağını seçin.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-primary"><Mail className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">İzin Talepleri</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Personellerinizden yeni izin talebi geldiğinde</p>
                  </div>
                </div>
                <CustomSwitch checked={preferences.leave} onChange={(val) => updatePreference('leave', val)} />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500"><DollarSign className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Masraf & Avans</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Onay bekleyen masraf formu olduğunda</p>
                  </div>
                </div>
                <CustomSwitch checked={preferences.expense} onChange={(val) => updatePreference('expense', val)} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500"><Monitor className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Sistem Uyarıları</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Kritik güvenlik ve giriş logları hakkında</p>
                  </div>
                </div>
                <CustomSwitch checked={preferences.system} onChange={(val) => updatePreference('system', val)} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500"><History className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Performans Dönemleri</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Yeni performans dönemi başladığında</p>
                  </div>
                </div>
                <CustomSwitch checked={preferences.performance} onChange={(val) => updatePreference('performance', val)} />
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-4">
                  <Download className="w-8 h-8"/>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Verileri Dışa Aktar</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Sistemdeki tüm personel metriklerini, bordroları ve raporları Excel (.xlsx) veya CSV formatında indirebilirsiniz.</p>
                <div className="mt-auto flex gap-3 w-full">
                  <button className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-600 transition-colors">.CSV İndir</button>
                  <button className="flex-1 py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold text-sm rounded-xl border border-blue-200 dark:border-blue-800/30 transition-colors">.EXCEL İndir</button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
                <div className="w-16 h-16 rounded-full bg-slate-800 dark:bg-slate-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-black/10">
                  <FileTerminal className="w-8 h-8"/>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Sistem Logları</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Yöneticilerin veya personellerin platform üzerindeki tüm tarihsel giriş ve işlem denetim kayıtlarını inceleyin.</p>
                <button 
                  onClick={() => setShowLogs(prev => !prev)}
                  className="mt-auto w-full py-2.5 bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 dark:hover:bg-slate-500 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                >
                  {showLogs ? 'Logları Gizle' : 'Logları Görüntüle'}
                </button>
              </div>
            </div>

            {/* Audit Logs Inline */}
            <AnimatePresence>
              {showLogs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors"
                >
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <History className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Son Sistem İşlemleri</h3>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50 max-h-96 overflow-y-auto scrollbar-thin">
                    {auditLogs.map((log, i) => {
                      const config = AUDIT_ICONS[log.type] || AUDIT_ICONS.system;
                      const IconComp = config.icon;
                      return (
                        <div key={log.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                          <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                            <IconComp className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{log.text}</p>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">{log.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'roles':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personel Rol Yönetimi</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sistem üzerindeki yetkilendirmeleri yönetin.</p>
            </div>
            <div className="p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700">
                    <th className="p-4 pl-6">Personel</th>
                    <th className="p-4">Departman</th>
                    <th className="p-4 text-right pr-6">Atanan Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50 text-sm">
                  {employees.map(emp => {
                    // Mock roles
                    let role = "Personel";
                    if (emp.title.toLowerCase().includes('lider')) role = "Yönetici";
                    if (emp.id === 3) role = "Admin";

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <img src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=ec5b13&color=fff`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 object-cover" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</span>
                        </td>
                        <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{emp.department}</td>
                        <td className="p-4 text-right pr-6">
                          <select 
                            defaultValue={role}
                            className={classNames(
                              "pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer appearance-none border",
                              role === 'Admin' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/30" :
                              role === 'Yönetici' ? "bg-orange-50 dark:bg-orange-900/30 text-primary dark:text-orange-400 border-orange-200 dark:border-orange-800/30" :
                              "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                            )}>
                            <option value="Admin">Admin</option>
                            <option value="Yönetici">Yönetici</option>
                            <option value="Personel">Personel</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-slate-50/50 dark:bg-transparent">
      <div className="max-w-7xl mx-auto w-full px-8 py-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-headline text-slate-800 dark:text-white tracking-tight">Ayarlar</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Sistem modülleri, kişisel ve yapılandırma ayarları</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Vertical Tabs Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={classNames(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all relative overflow-hidden",
                  activeTab === tab.id 
                    ? "text-primary bg-orange-50/80 dark:bg-primary/15 shadow-sm border border-orange-100/50 dark:border-primary/20" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div layoutId="settingsTab" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
                <tab.icon className="w-5 h-5 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Ground */}
          <div className="flex-1 w-full min-w-0 min-h-[500px]">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
             </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
