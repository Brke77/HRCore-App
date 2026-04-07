import { DEMO_AUTH_USERS } from '../data/mockData';

const AUTH_USER_STORAGE_KEY = 'hrcore.auth.currentUser';
const AUTH_ACCOUNTS_STORAGE_KEY = 'hrcore.auth.accounts';
const AUTH_REMEMBER_STORAGE_KEY = 'hrcore.auth.rememberMe';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function readJson(key, fallbackValue) {
  if (!canUseStorage()) return fallbackValue;

  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeJson(key, value) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
  if (!canUseStorage()) return;
  localStorage.removeItem(key);
}

export function getAppState(key, fallbackValue) {
  return readJson(key, fallbackValue);
}

export function setAppState(key, value) {
  writeJson(key, value);
}

export function mergeAccountsWithSeed(storedAccounts = []) {
  const normalizedStoredAccounts = Array.isArray(storedAccounts) ? storedAccounts : [];
  const accountMap = new Map();

  [...normalizedStoredAccounts, ...DEMO_AUTH_USERS].forEach((account) => {
    if (!account?.email) return;
    accountMap.set(account.email.toLowerCase(), account);
  });

  return Array.from(accountMap.values());
}

export function getAuthAccounts() {
  return mergeAccountsWithSeed(readJson(AUTH_ACCOUNTS_STORAGE_KEY, DEMO_AUTH_USERS));
}

export function saveAuthAccounts(accounts) {
  writeJson(AUTH_ACCOUNTS_STORAGE_KEY, mergeAccountsWithSeed(accounts));
}

export function getCurrentAuthUser() {
  return readJson(AUTH_USER_STORAGE_KEY, null);
}

export function saveCurrentAuthUser(user) {
  if (!user) {
    removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }

  writeJson(AUTH_USER_STORAGE_KEY, user);
}

export function setRememberPreference(value) {
  writeJson(AUTH_REMEMBER_STORAGE_KEY, Boolean(value));
}

export function clearRememberPreference() {
  removeItem(AUTH_REMEMBER_STORAGE_KEY);
}

export function findAccountByEmail(email, accounts = getAuthAccounts()) {
  const normalizedEmail = email?.trim()?.toLowerCase();
  if (!normalizedEmail) return null;

  return (
    accounts.find((account) => account?.email?.toLowerCase() === normalizedEmail) || null
  );
}

export function requestPasswordReset(email, accounts = getAuthAccounts()) {
  const matchedAccount = findAccountByEmail(email, accounts);
  if (!matchedAccount) {
    return {
      success: false,
      message: 'Bu e-posta adresi için kayıt bulunamadı.',
    };
  }

  const resetLink = `https://mock.hrcore/reset-password?email=${encodeURIComponent(
    matchedAccount.email
  )}&token=${Date.now()}`;

  console.log(`[Mock Reset Link] ${matchedAccount.email}: ${resetLink}`);

  return {
    success: true,
    message: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.',
    resetLink,
  };
}

export function updateAccountPassword({
  userId,
  email,
  currentPassword,
  nextPassword,
  accounts = getAuthAccounts(),
  currentUser = getCurrentAuthUser(),
}) {
  const matchedAccount =
    accounts.find((account) => account.id === userId) ||
    findAccountByEmail(email, accounts);

  if (!matchedAccount) {
    return { success: false, message: 'Hesap bulunamadı.' };
  }

  if (matchedAccount.password !== currentPassword) {
    return { success: false, message: 'Mevcut şifre hatalı!' };
  }

  const nextAccounts = accounts.map((account) =>
    account.id === matchedAccount.id ? { ...account, password: nextPassword } : account
  );
  const nextCurrentUser =
    currentUser?.id === matchedAccount.id
      ? { ...currentUser, password: nextPassword }
      : currentUser;

  saveAuthAccounts(nextAccounts);
  saveCurrentAuthUser(nextCurrentUser);

  return {
    success: true,
    accounts: nextAccounts,
    currentUser: nextCurrentUser,
    message: 'Şifreniz başarıyla değiştirildi.',
  };
}

export function upsertAccount(account, accounts = getAuthAccounts()) {
  const normalizedAccounts = Array.isArray(accounts) ? accounts : [];
  const withoutSameEmail = normalizedAccounts.filter(
    (item) => item?.email?.toLowerCase() !== account?.email?.toLowerCase()
  );
  const nextAccounts = [...withoutSameEmail, account];
  saveAuthAccounts(nextAccounts);
  return nextAccounts;
}

export const storageKeys = {
  authUser: AUTH_USER_STORAGE_KEY,
  authAccounts: AUTH_ACCOUNTS_STORAGE_KEY,
  authRemember: AUTH_REMEMBER_STORAGE_KEY,
};
