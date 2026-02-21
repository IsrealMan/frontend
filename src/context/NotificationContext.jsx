import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

const NotificationContext = createContext({
  unreadCount: 0,
  notifications: [],
  refresh: () => {},
  fetchList: () => {},
  markRead: () => {},
  markAllRead: () => {},
});

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [notifications,  setNotifications]  = useState([]);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch { /* leave previous count */ }
  }, [isAuthenticated]);

  const fetchList = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.notifications ?? []);
    } catch { /* leave previous list */ }
  }, [isAuthenticated]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Real-time: update count + refresh list
  const handleWsMessage = useCallback((msg) => {
    if (msg.type === 'notifications:count') {
      const count = msg.data?.unreadCount;
      setUnreadCount(typeof count === 'number' ? count : 0);
    }
  }, []);

  useWebSocket(handleWsMessage);

  const markRead = useCallback(async (id) => {
    // Optimistic local update
    setNotifications(prev => prev.map(n => (n.id ?? n._id) === id ? { ...n, read: true } : n));
    try {
      const res = await api.patch(`/api/notifications/${id}/read`);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      fetchCount();
      fetchList();
    }
  }, [fetchCount, fetchList]);

  const markAllRead = useCallback(async () => {
    // Optimistic local update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch('/api/notifications/read-all');
    } catch {
      fetchCount();
      fetchList();
    }
  }, [fetchCount, fetchList]);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      refresh: fetchCount,
      fetchList,
      markRead,
      markAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
