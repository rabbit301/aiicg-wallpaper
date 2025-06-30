'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

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
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const newResolvedTheme = resolveTheme(newTheme);
    applyTheme(newResolvedTheme);
  };

  // 初始化主题
  useEffect(() => {
    // 获取存储的主题偏好
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'system';
    
    setThemeState(initialTheme);
    const initialResolvedTheme = resolveTheme(initialTheme);
    applyTheme(initialResolvedTheme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = getSystemTheme();
        applyTheme(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 监听主题变化，更新系统模式下的解析主题
  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      if (systemTheme !== resolvedTheme) {
        applyTheme(systemTheme);
      }
    }
  }, [theme, resolvedTheme]);

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