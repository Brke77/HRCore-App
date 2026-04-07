export const sendWelcomeEmail = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[MAIL SERVICE] E-posta Gönderildi: ${email} | Giriş Şifren: ${password}`);
      resolve(true);
    }, 800);
  });
};
