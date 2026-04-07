import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

// Initial mock notifications
const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'LEAVE', title: 'İzin Talebi', message: 'Can Berk Tokay yeni bir izin talebi gönderdi.', targetId: 'lr1', targetDepartment: 'Yazılım', timestamp: '5 dk önce', isRead: false },
  { id: 'n2', type: 'PERFORMANCE', title: 'Performans Geri Bildirimi', message: 'Can Berk Tokay son görevi tamamladı.', targetId: 'Can Berk Tokay', targetRole: 'departman_muduru', targetDepartment: 'Yazılım', timestamp: '1 saat önce', isRead: false },
  { id: 'n3', type: 'SYSTEM', title: 'Sistem Güncellemesi', message: 'Nisan 2026 bordroları oluşturuldu.', targetId: null, timestamp: '3 saat önce', isRead: true },
  { id: 'n4', type: 'SAFETY', title: 'İSG Durum Raporu', message: 'İSG eğitim belgeleri yenilendi.', targetId: 'risk_1', timestamp: 'Dün', isRead: true },
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

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasUnread = preferences.leave || preferences.system ? unreadCount > 0 : false;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((params) => {
    setNotifications(prev => [{
      id: 'n' + Date.now(),
      timestamp: 'Şimdi',
      isRead: false,
      ...params,
    }, ...prev]);
  }, []);

  const addAuditLog = useCallback((text, type = 'system', meta = {}) => {
    setAuditLogs(prev => [{
      id: 'a' + Date.now(),
      text,
      time: 'Şimdi',
      type,
      meta,
    }, ...prev]);
  }, []);

  const approveAuditLog = useCallback((id) => {
    setAuditLogs(prev => prev.map(log => {
      if (log.id === id) {
        return { ...log, meta: { ...log.meta, isApproved: true } };
      }
      return log;
    }));
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
      clearAllNotifications,
      addNotification,
      addAuditLog,
      approveAuditLog,
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
