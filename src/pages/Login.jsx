import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, Lock, Mail, Rocket } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const shakeAnimation = {
  initial: { x: 0 },
  animate: { x: [0, -7, 7, -5, 5, -2, 2, 0] },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, authError, clearAuthError, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotState, setForgotState] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!authError) return undefined;

    setToastVisible(true);
    setShakeKey((prev) => prev + 1);

    const timeoutId = setTimeout(() => {
      setToastVisible(false);
      clearAuthError();
      setIsSubmitting(false);
    }, 2600);

    return () => clearTimeout(timeoutId);
  }, [authError, clearAuthError]);

  if (currentUser) {
    const redirectTarget = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTarget} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    window.setTimeout(() => {
      const result = login({ email, password, rememberMe });
      if (result.success) {
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
        return;
      }

      setIsSubmitting(false);
    }, 650);
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    const result = requestPasswordReset(forgotEmail);
    setForgotState({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 relative flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,91,19,0.14),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]" />
      <motion.div
        animate={{ scale: [1, 1.03, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-12%] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#ec5b13]/16 blur-[140px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          key={shakeKey}
          initial={{ y: 20, opacity: 0 }}
          animate={authError ? shakeAnimation.animate : { y: 0, opacity: 1, x: 0 }}
          transition={
            authError
              ? { duration: 0.4, ease: 'easeInOut' }
              : { duration: 0.45, ease: 'easeOut' }
          }
          className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_30px_90px_rgba(2,6,23,0.55)]"
        >
          <div className="p-8 sm:p-9">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/25">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">HRCore</h1>
                <p className="text-sm text-slate-400">
                  Kurumsal Operasyon ve Verimlilik Platformu
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-black tracking-tight text-white">
                Hoş Geldiniz
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Hesabınıza giriş yaparak operasyonlarınıza tek bir merkezden erişin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  E-posta
                </span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="E-posta Adresiniz"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/50 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#ec5b13]/70 focus:bg-slate-900/70 focus:ring-1 focus:ring-[#ec5b13]/40 focus:shadow-[0_0_0_1px_rgba(236,91,19,0.22),0_0_28px_rgba(236,91,19,0.16)]"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Şifre
                </span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Şifreniz"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/50 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#ec5b13]/70 focus:bg-slate-900/70 focus:ring-1 focus:ring-[#ec5b13]/40 focus:shadow-[0_0_0_1px_rgba(236,91,19,0.22),0_0_28px_rgba(236,91,19,0.16)]"
                  />
                </div>
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-[#ec5b13]"
                />
                Beni Hatırla
              </label>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(236, 91, 19, 0.28)' }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#ec5b13] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition disabled:cursor-wait disabled:opacity-90"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </span>
              </motion.button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotState({ type: '', message: '' });
                  setShowForgotModal(true);
                }}
                className="text-slate-500 transition hover:text-slate-300"
              >
                Şifremi Unuttum
              </button>
              <button
                type="button"
                className="text-slate-500 transition hover:text-slate-300"
                disabled
              >
                Destekle İletişime Geç
              </button>
            </div>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-600">
          © 2026 HRCore Industrial Solutions. Tüm hakları saklıdır.
        </p>
      </div>

      {toastVisible && authError && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-6 top-6 z-20 rounded-2xl border border-red-500/20 bg-red-500/15 px-4 py-3 text-red-100 shadow-xl shadow-red-950/40 backdrop-blur-xl"
        >
          <p className="text-sm font-semibold">
            Girdiğiniz bilgiler sistem kayıtlarıyla eşleşmedi. Lütfen tekrar deneyin.
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative z-10 w-full max-w-md rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-2xl p-7 shadow-[0_30px_90px_rgba(2,6,23,0.55)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/20">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Şifre Sıfırlama</h3>
                  <p className="text-sm text-slate-400">
                    Kayıtlı e-posta adresinizi girin, size bağlantı hazırlayalım.
                  </p>
                </div>
              </div>

              <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(event) => setForgotEmail(event.target.value)}
                      placeholder="E-posta Adresiniz"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/50 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#ec5b13]/70 focus:bg-slate-900/70 focus:ring-1 focus:ring-[#ec5b13]/40 focus:shadow-[0_0_0_1px_rgba(236,91,19,0.22),0_0_28px_rgba(236,91,19,0.16)]"
                    />
                  </div>
                </div>

                {forgotState.message && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      forgotState.type === 'success'
                        ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                        : 'border-red-400/20 bg-red-500/10 text-red-200'
                    }`}
                  >
                    {forgotState.message}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                  >
                    Kapat
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[#ec5b13] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition hover:shadow-[0_0_24px_rgba(236,91,19,0.28)]"
                  >
                    Bağlantı Gönder
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
