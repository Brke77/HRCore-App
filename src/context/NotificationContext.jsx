import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

// Initial mock notifications
const INITIAL_NOTIFICATIONS = [
  { id: 'n1', text: 'Yeni izin talebi geldi — Ahmet Yılmaz', time: '5 dk önce', read: false, icon: '📋' },
  { id: 'n2', text: 'Performans değerlendirme dönemi başladı', time: '1 saat önce', read: false, icon: '📊' },
  { id: 'n3', text: 'Nisan 2026 bordroları oluşturuldu', time: '3 saat önce', read: true, icon: '💰' },
  { id: 'n4', text: 'İSG eğitim belgeleri güncellendi', time: 'Dün', read: true, icon: '📄' },
];

// Initial mock audit logs
const INITIAL_AUDIT_LOGS = [
  { id: 'a1', text: 'Selin Yılmaz, Ahmet Yılmaz\'ın izin talebini onayladı', time: '10 dk önce', type: 'approve' },
  { id: 'a2', text: 'Sisteme yeni personel eklendi: Can Berk Özkan', time: '2 saat önce', type: 'add' },
  { id: 'a3', text: 'Nisan 2026 bordroları toplu oluşturuldu', time: '5 saat önce', type: 'payroll' },
  { id: 'a4', text: 'Selin Yılmaz, Zeynep Kaya\'nın rolünü Yönetici olarak güncelledi', time: 'Dün', type: 'role' },
  { id: 'a5', text: 'Performans değerlendirme dönemi Q2 başlatıldı', time: '2 gün önce', type: 'system' },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [preferences, setPreferences] = useState({
    leave: true,
    expense: false,
    system: true,
    performance: true,
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = preferences.leave || preferences.system ? unreadCount > 0 : false;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback((text, icon = '🔔') => {
    setNotifications(prev => [{
      id: 'n' + Date.now(),
      text,
      time: 'Şimdi',
      read: false,
      icon,
    }, ...prev]);
  }, []);

  const addAuditLog = useCallback((text, type = 'system') => {
    setAuditLogs(prev => [{
      id: 'a' + Date.now(),
      text,
      time: 'Şimdi',
      type,
    }, ...prev]);
  }, []);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      auditLogs,
      preferences,
      unreadCount,
      hasUnread,
      markAllRead,
      markAsRead,
      addNotification,
      addAuditLog,
      updatePreference,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
