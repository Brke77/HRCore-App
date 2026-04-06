import { createContext, useContext, useState } from 'react';

// Kullanıcı Profilleri
export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Selin Yılmaz',
    role: 'ik_muduru',
    roleLabel: 'İK Müdürü',
    department: 'Global',
    isSuperAdmin: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGPSVUyjrtwjpS-5YwLe2VOFnGamVdLBt8zJj0EEUzKwR0laaNwcAAzkJMTF-OdR-4TTjJXvYHb__KxKB_pr_fcIeeYjrwwLr6NAHCfN0jBlLKtx3Py5yfH33u0JToSgP5px_8q5OsEltEn9Av2bmlRSJFI4VqaYWk1eagUMqOJEiwjYl5Mbfw4KD-abHsCilHqWE_tyzS_3EIRr9783xPi_Gjy0bmmNWL2PmEB7OzLNLqV0EEE_WLF5xe3RUFPc5wGsyoy4xpaM-h',
    color: 'emerald',
    canViewPerformance: true,
    canCommentPerformance: true,
    canViewPayroll: true,
    canCommentPayroll: true,
  },
  {
    id: 'u2',
    name: 'Kaan Yıldız',
    role: 'departman_muduru',
    roleLabel: 'Yazılım Müdürü',
    department: 'Yazılım',
    isSuperAdmin: false,
    avatar: null,
    color: 'blue',
    canViewPerformance: true,
    canCommentPerformance: true,
    canViewPayroll: false,
    canCommentPayroll: false,
  },
  {
    id: 'u3',
    name: 'Ayşe Kaya',
    role: 'departman_muduru',
    roleLabel: 'Pazarlama Müdürü',
    department: 'Pazarlama',
    isSuperAdmin: false,
    avatar: null,
    color: 'purple',
    canViewPerformance: true,
    canCommentPerformance: true,
    canViewPayroll: false,
    canCommentPayroll: false,
  },
  {
    id: 'u4',
    name: 'Admin',
    role: 'admin',
    roleLabel: 'Sistem Yöneticisi',
    department: 'Global',
    isSuperAdmin: true,
    avatar: null,
    color: 'primary',
    canViewPerformance: true,
    canCommentPerformance: true,
    canViewPayroll: true,
    canCommentPayroll: true,
  },
  {
    id: 'u5',
    name: 'Ahmet Yılmaz',
    role: 'personel',
    roleLabel: 'Personel',
    department: 'Yazılım',
    isSuperAdmin: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXzHXr0Hk3NdUZ9RUC8JkAh5VY7A16V7puXG2gdw2rb1R7HVxKMhMkLedTpNH6uxH2mB19L9eIb3sn9OFR1JYyIWIDTKzQDDdYiawVlGyolddM6dYXErc3HC8g4tV49QmukzbmZcg0EmKZ9uEOuC2mHcVjIO-I4Nz2Bm2ABTW3aGkS0A_nENx0aAUcr4dJX_NITlXemdwtdF4k9FIpUfll7S8XedqyxvrilTL7YtmHMalG52F7-ATTnX32wlBWVN0SEB0nfgvZHiEz',
    color: 'slate',
    canViewPerformance: false,
    canCommentPerformance: false,
    canViewPayroll: false,
    canCommentPayroll: false,
  },
];

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [activeUser, setActiveUser] = useState(MOCK_USERS[0]); // Varsayılan: Selin Yılmaz

  const switchUser = (userId) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) setActiveUser(user);
  };

  return (
    <UserContext.Provider value={{ activeUser, switchUser, MOCK_USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
