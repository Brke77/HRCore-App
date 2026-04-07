import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { accounts, currentUser, logout } = useAuth();

  const value = useMemo(
    () => ({
      activeUser: currentUser,
      switchUser: () => {},
      MOCK_USERS: accounts,
      logout,
    }),
    [accounts, currentUser, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
