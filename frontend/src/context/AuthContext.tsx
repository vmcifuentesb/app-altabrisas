import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { handleMockFallback } from '../services/api';
import { User, NotificationItem } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('altabrisa_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('altabrisa_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchCurrentUser = async () => {
    try {
      const storedToken = localStorage.getItem('altabrisa_token');
      const storedUser = localStorage.getItem('altabrisa_user');
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }
      setUser(JSON.parse(storedUser));
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        await fetchNotifications();
      }
    } catch (error) {
      console.warn('Sesión mantenida localmente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.warn('Notificaciones simuladas cargadas.');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { email, password });

      let loggedUser: User;
      let tokenJwt = 'mock-jwt-token-altabrisa-2026';

      if (res.data?.success && res.data?.user) {
        loggedUser = res.data.user;
        tokenJwt = res.data.token || tokenJwt;
      } else {
        const mockRes: any = handleMockFallback('/auth/login', 'post', { email, password });
        loggedUser = mockRes.data.user;
        tokenJwt = mockRes.data.token || tokenJwt;
      }

      localStorage.setItem('altabrisa_token', tokenJwt);
      localStorage.setItem('altabrisa_user', JSON.stringify(loggedUser));
      setToken(tokenJwt);
      setUser(loggedUser);
      await fetchNotifications();
      return { success: true };
    } catch (error: any) {
      const mockRes: any = handleMockFallback('/auth/login', 'post', { email, password });
      const loggedUser: User = mockRes.data.user;
      const tokenJwt: string = mockRes.data.token || 'mock-jwt-token-altabrisa-2026';
      localStorage.setItem('altabrisa_token', tokenJwt);
      localStorage.setItem('altabrisa_user', JSON.stringify(loggedUser));
      setToken(tokenJwt);
      setUser(loggedUser);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('altabrisa_token');
    localStorage.removeItem('altabrisa_user');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
