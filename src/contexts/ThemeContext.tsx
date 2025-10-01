'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // 获取系统主题偏好
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 解析主题
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // 应用主题到 DOM
  const applyTheme = (newResolvedTheme: ResolvedTheme) => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // 移除旧的主题类
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // 添加新的主题类
    root.classList.add(newResolvedTheme);
    body.classList.add(newResolvedTheme);
    
    console.log('🎨 主题已切换:', newResolvedTheme);
    console.log('📱 HTML classes:', root.className);
    console.log('📄 Body classes:', body.className);
    
    setResolvedTheme(newResolvedTheme);
  };

  // 设置主题
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    const newResolvedTheme = resolveTheme(newTheme);
    applyTheme(newResolvedTheme);

    // 如果用户已登录，同时更新用户设置到服务器
    if (isLoggedIn && user) {
      try {
        console.log('💾 保存主题设置到用户账户:', newTheme);
        const { api } = await import('@/lib/api-client');
        await api.user.updateProfile({ theme: newTheme });
        console.log('✅ 主题设置已保存到用户账户');
      } catch (error) {
        console.error('❌ 保存主题设置失败:', error);
        // 即使保存失败，本地设置仍然有效
      }
    }
  };

  // 获取主题偏好的优先级：用户设置 > localStorage > 默认浅色
  const getInitialTheme = (): Theme => {
    // 1. 如果用户已登录且有主题设置，使用用户设置
    if (isLoggedIn && user?.theme) {
      return user.theme;
    }

    // 2. 否则使用localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }

    // 3. 默认使用浅色模式
    return 'light';
  };

  // 初始化主题
  useEffect(() => {
    setMounted(true);

    const initialTheme = getInitialTheme();

    console.log('🔧 初始化主题:', {
      userTheme: user?.theme,
      storedTheme: localStorage.getItem('theme'),
      initialTheme,
      isLoggedIn
    });

    setThemeState(initialTheme);
    const initialResolvedTheme = resolveTheme(initialTheme);

    console.log('🎯 解析后主题:', initialResolvedTheme);
    console.log('💻 系统主题:', getSystemTheme());

    applyTheme(initialResolvedTheme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // 使用当前的theme状态，而不是闭包中的旧值
      const currentTheme = localStorage.getItem('theme') as Theme | null || 'system';
      if (currentTheme === 'system') {
        const newResolvedTheme = getSystemTheme();
        console.log('🔄 系统主题变化:', newResolvedTheme);
        applyTheme(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 监听用户登录状态变化，同步用户的主题设置
  useEffect(() => {
    if (mounted && isLoggedIn && user?.theme) {
      const userTheme = user.theme;
      console.log('👤 用户登录，同步主题设置:', userTheme);

      // 如果用户的主题设置与当前不同，则更新
      if (userTheme !== theme) {
        setThemeState(userTheme);
        const newResolvedTheme = resolveTheme(userTheme);
        applyTheme(newResolvedTheme);

        // 同时更新localStorage
        localStorage.setItem('theme', userTheme);
      }
    }
  }, [isLoggedIn, user?.theme, mounted]);

  // 监听主题变化，更新系统模式下的解析主题
  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      if (systemTheme !== resolvedTheme) {
        applyTheme(systemTheme);
      }
    }
  }, [theme, resolvedTheme]);

  // 防止服务端渲染不匹配
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'system', resolvedTheme: 'light', setTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 