import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Pencil, User, Network, ChevronDown, Mail, Phone, Calendar, Save, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { sendWelcomeEmail } from '../utils/mailService';

export default function YeniCalisan() {
  const navigate = useNavigate();
  const { addEmployee } = useApp();
  const { activeUser } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    email: '',
    phone: '',
    startDate: '',
  });
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Güvenlik: Kullanıcı yoksa veya yetkisiz ise null dön/yetki hatası ver
  if (!activeUser) return null;
  if (activeUser.role !== 'ik_muduru' && activeUser.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400 font-bold">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.department || !formData.email) {
      setError('Lütfen Ad Soyad, Departman ve E-posta alanlarını doldurun.');
      return;
    }

    const createdEmployee = addEmployee({
      name: formData.name,
      title: 'Yeni Çalışan',
      department: formData.department,
      email: formData.email,
      phone: formData.phone || '+90 XXX XXX XX XX',
      startDate: formData.startDate || new Date().toLocaleDateString('tr-TR'),
      location: 'İstanbul',
      avatar: null,
    });

    if (!createdEmployee) {
      setError('Personel olusturulurken beklenmeyen bir sorun olustu.');
      return;
    }

    setSuccessToast(`Personel başarıyla oluşturuldu. Geçici Şifre: ${createdEmployee.password}`);

    if (sendEmail) {
      await sendWelcomeEmail(createdEmployee.email, createdEmployee.password);
    }

    setTimeout(() => {
      navigate('/personel-listesi');
    }, 2600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col flex-1 min-w-0 overflow-auto bg-slate-50/50 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto w-full px-12 py-10">
        {/* Page Header */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: -10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.3 }}
           className="mb-10 flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold font-headline text-form-on-surface tracking-tight">Yeni Çalışan Kaydı</h2>
            <p className="text-form-secondary font-body mt-2">Sisteme yeni bir ekip üyesi eklemek için aşağıdaki formu doldurun.</p>
          </div>
          <div className="flex gap-2">
            <AnimatePresence>
              {successToast && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {successToast}
                </motion.div>
              )}
            </AnimatePresence>
            {!successToast && <span className="px-3 py-1 bg-form-primary-fixed text-form-on-primary-fixed rounded-full text-xs font-bold tracking-widest uppercase items-center flex">Taslak</span>}
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-form-surface-lowest rounded-2xl p-10 shadow-[0_10px_30px_rgba(25,28,30,0.04),0_2px_8px_rgba(25,28,30,0.02)] border border-white"
        >
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-form-error-container text-form-error rounded-xl text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-form-error"></span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section 1: Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-form-surface-low border-2 border-dashed border-form-outline/40 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-form-primary-fixed hover:border-form-primary">
                  <Camera className="w-8 h-8 text-form-secondary mb-1" />
                  <span className="text-[10px] font-bold text-form-secondary uppercase tracking-widest">Fotoğraf Seç</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-form-primary w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <Pencil className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-form-secondary mt-4 font-medium uppercase tracking-widest">Drag & Drop or Click to Upload</p>
            </div>

            {/* Section 2: Personal Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-form-surface-low">
                <User className="w-5 h-5 text-form-primary" />
                <h3 className="text-lg font-semibold font-headline text-form-on-surface">Kişisel Bilgiler</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ad Soyad */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-form-secondary uppercase tracking-widest ml-1">Ad Soyad</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 text-form-secondary w-5 h-5" />
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-form-surface-highest border-none rounded-xl focus:ring-2 focus:ring-form-primary/20 font-body text-form-on-surface outline-none transition-all placeholder:text-form-secondary/50" placeholder="Örn: Selin Demir" type="text" />
                  </div>
                </div>

                {/* Departman */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-form-secondary uppercase tracking-widest ml-1">Departman</label>
                  <div className="relative flex items-center">
                    <Network className="absolute left-4 text-form-secondary w-5 h-5" />
                    <select name="department" value={formData.department} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-form-surface-highest border-none rounded-xl focus:ring-2 focus:ring-form-primary/20 font-body text-form-on-surface appearance-none outline-none transition-all">
                      <option value="">Departman Seçiniz</option>
                      <option value="Yazılım">Yazılım</option>
                      <option value="Pazarlama">Pazarlama</option>
                      <option value="İK">İK</option>
                      <option value="Finans">Finans</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-form-secondary pointer-events-none w-5 h-5" />
                  </div>
                </div>

                {/* E-posta */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-form-secondary uppercase tracking-widest ml-1">E-posta</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-form-secondary w-5 h-5" />
                    <input name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-form-surface-highest border-none rounded-xl focus:ring-2 focus:ring-form-primary/20 font-body text-form-on-surface outline-none transition-all placeholder:text-form-secondary/50" placeholder="selin.demir@hrcore.com" type="email" />
                  </div>
                </div>

                {/* Telefon */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-form-secondary uppercase tracking-widest ml-1">Telefon</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 text-form-secondary w-5 h-5" />
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-form-surface-highest border-none rounded-xl focus:ring-2 focus:ring-form-primary/20 font-body text-form-on-surface outline-none transition-all placeholder:text-form-secondary/50" placeholder="+90 5XX XXX XX XX" type="tel" />
                  </div>
                </div>

                {/* İşe Başlama Tarihi */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-form-secondary uppercase tracking-widest ml-1">İşe Başlama Tarihi</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-4 text-form-secondary w-5 h-5" />
                    <input name="startDate" value={formData.startDate} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-form-surface-highest border-none rounded-xl focus:ring-2 focus:ring-form-primary/20 font-body text-form-on-surface outline-none transition-all" type="date" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-form-surface-low">
              <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="w-5 h-5 rounded outline-none border-form-outline focus:ring-2 focus:ring-form-primary/20 accent-form-primary" />
              <label htmlFor="sendEmail" className="text-sm font-semibold text-form-on-surface cursor-pointer select-none">
                Kullanıcıya giriş bilgilerini e-posta ile gönder
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-6 pt-10 border-t border-form-surface-low">
              <button type="button" onClick={() => navigate('/personel-listesi')} className="px-8 py-3.5 text-form-secondary font-bold font-body hover:bg-form-surface-highest rounded-xl transition-all duration-200 active:scale-95">
                İptal
              </button>
              <button type="submit" className="px-10 py-3.5 bg-gradient-to-r from-[#ec5b13] to-form-primary-container text-white font-bold font-body rounded-2xl shadow-lg shadow-form-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center gap-2">
                <Save className="w-5 h-5" />
                Kaydet
              </button>
            </div>
          </form>
        </motion.div>
        
        {/* Footer Meta */}
        <div className="mt-8 text-center pb-8">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">HRCore v2.4 — Human Capital Management System</p>
        </div>
      </div>
    </motion.div>
  );
}
