import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearRememberPreference,
  getAuthAccounts,
  getCurrentAuthUser,
  mergeAccountsWithSeed,
  requestPasswordReset as requestPasswordResetFromApi,
  saveAuthAccounts,
  saveCurrentAuthUser,
  setRememberPreference,
  updateAccountPassword,
  upsertAccount,
} from '../services/api';

const AuthContext = createContext(null);

function buildEmployeeRoleProfile(employee) {
  return {
    id: `emp_${employee.id}`,
    name: employee.name,
    email: employee.email,
    password: employee.password,
    role: 'personel',
    roleLabel: 'Employee',
    department: employee.department,
    isSuperAdmin: false,
    avatar: employee.avatar || null,
    color: 'slate',
    canViewPerformance: false,
    canCommentPerformance: false,
    canViewPayroll: false,
    canCommentPayroll: false,
  };
}

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => getAuthAccounts());
  const [currentUser, setCurrentUser] = useState(() => getCurrentAuthUser());
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    saveAuthAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    setAccounts((prev) => mergeAccountsWithSeed(prev));
  }, []);

  useEffect(() => {
    saveCurrentAuthUser(currentUser);
  }, [currentUser]);

  const login = ({ email, password, rememberMe }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = accounts.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail &&
        account.password === password
    );

    console.log('[Auth] Login attempt', {
      emailInput: email,
      normalizedEmail,
      passwordLength: password.length,
      availableAccounts: accounts.map((account) => account.email),
      matchedUser,
    });

    if (!matchedUser) {
      setAuthError('Hatali giris bilgileri!');
      return { success: false, message: 'Hatali giris bilgileri!' };
    }

    setCurrentUser(matchedUser);
    setRememberPreference(rememberMe);
    setAuthError('');
    return { success: true, user: matchedUser };
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthError('');
    clearRememberPreference();
  };

  const registerEmployeeAccount = (employee) => {
    const provisionedUser = buildEmployeeRoleProfile(employee);
    setAccounts((prev) => upsertAccount(provisionedUser, prev));

    return provisionedUser;
  };

  const requestPasswordReset = (email) => requestPasswordResetFromApi(email, accounts);

  const changePassword = ({ currentPassword, nextPassword, confirmPassword }) => {
    if (!currentUser?.id) {
      return { success: false, message: 'Aktif kullanıcı bulunamadı.' };
    }

    if (nextPassword !== confirmPassword) {
      return { success: false, message: 'Yeni şifreler eşleşmiyor!' };
    }

    const result = updateAccountPassword({
      userId: currentUser.id,
      email: currentUser.email,
      currentPassword,
      nextPassword,
      accounts,
      currentUser,
    });

    if (!result.success) {
      return result;
    }

    setAccounts(result.accounts);
    setCurrentUser(result.currentUser);
    return result;
  };

  const clearAuthError = () => setAuthError('');

  const value = useMemo(
    () => ({
      accounts,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      authError,
      login,
      logout,
      registerEmployeeAccount,
      requestPasswordReset,
      changePassword,
      clearAuthError,
    }),
    [accounts, authError, currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
