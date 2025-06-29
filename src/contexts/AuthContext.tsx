'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  joinedAt: string;
  isVip: boolean;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 页面加载时检查本地存储的用户信息
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // 检查本地存储的用户信息
      const storedUser = localStorage.getItem('user');
      const storedSessionId = localStorage.getItem('guestSessionId');

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('解析用户数据失败:', error);
          localStorage.removeItem('user');
        }
      } else if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        // 创建新的访客会话
        await createGuestSession();
      }
    } catch (error) {
      console.error('初始化认证失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGuestSession = async () => {
    try {
      const response = await fetch('/api/auth/guest-session', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionId(data.sessionId);
          localStorage.setItem('guestSessionId', data.sessionId);
        }
      }
    } catch (error) {
      console.error('创建访客会话失败:', error);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setSessionId(null);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('guestSessionId');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // 创建新的访客会话
    createGuestSession();
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionId,
        isLoading,
        login,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 