export const sendWelcomeEmail = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[MAIL SERVICE] E-posta Gönderildi: ${email} adresine geçici şifre iletildi.`);
      resolve(true);
    }, 800);
  });
};
