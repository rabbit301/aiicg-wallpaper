'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-client';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  joinedAt: string;
  isVip: boolean;
  role?: string;
  language?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth on page load
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check stored user info and token
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      const storedSessionId = localStorage.getItem('guestSessionId');

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          
          // 立即设置用户状态，避免登录状态闪烁
          setUser(userData);
          setIsLoading(false);

          // 在后台验证token，不阻塞UI渲染
          setTimeout(async () => {
            try {
              // 检查是否有refresh token，如果没有则跳过验证
              const refreshTokenValue = localStorage.getItem('refreshToken');
              if (!refreshTokenValue) {
                console.log('没有refresh token，跳过token验证');
                return;
              }
              
              await refreshToken();
              console.log('Token验证成功');
            } catch (error) {
              console.error('后台token验证失败:', error);
              
              // 只有在token确实无效时才登出
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('invalid') || 
                    errorMessage.includes('expired') || 
                    errorMessage.includes('unauthorized') ||
                    errorMessage.includes('no refresh token available')) {
                  console.log('Token无效或缺失，执行登出');
                  logout();
                } else {
                  console.log('网络错误，保持登录状态');
                }
              }
            }
          }, 500); // 延迟500ms执行，让页面先渲染
          
          return; // 提前返回，避免执行后续逻辑
        } catch (error) {
          console.error('解析用户数据失败:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      }

      // 处理guest session
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        await createGuestSession();
      }
    } catch (error) {
      console.error('初始化认证失败:', error);
      await createGuestSession();
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
      console.error('创建guest session失败:', error);
      // 即使失败也生成一个临时session ID
      const tempSessionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(tempSessionId);
      localStorage.setItem('guestSessionId', tempSessionId);
    }
  };

  const login = (userData: User, token?: string) => {
    console.log('执行登录:', userData.username);
    setUser(userData);
    setSessionId(null);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('guestSessionId');

    if (token) {
      localStorage.setItem('authToken', token);
      console.log('✅ Access token已存储');
      
      // 检查refresh token是否已经被api-client存储
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        console.log('✅ Refresh token已存储');
      } else {
        console.warn('⚠️ 警告：没有找到refresh token');
      }
    }
  };

  const logout = () => {
    console.log('执行登出');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    // Create new guest session
    createGuestSession();
  };

  const refreshToken = async () => {
    try {
      const response = await api.auth.refresh();
      
      // 检查Go后端响应格式 (data.access_token)
      if (response.access_token) {
        // 存储新的tokens
        localStorage.setItem('authToken', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }
        
        // 更新用户信息
        if (response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      }
      
      // 兼容Next.js API响应格式
      if (response.success && response.access_token) {
        localStorage.setItem('authToken', response.access_token);
        if (response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
      }
      
      throw new Error('Invalid refresh response format');
    } catch (error) {
      console.error('刷新token失败:', error);
      throw error;
    }
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
        refreshToken,
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
