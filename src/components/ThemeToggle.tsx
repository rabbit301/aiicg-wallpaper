'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  const themes = [
    { key: 'light' as const, label: t('theme.light'), icon: Sun },
    { key: 'dark' as const, label: t('theme.dark'), icon: Moon },
    { key: 'system' as const, label: t('theme.system'), icon: Monitor },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取当前主题的图标
  const getCurrentIcon = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? Moon : Sun;
    }
    const currentTheme = themes.find(t => t.key === theme);
    return currentTheme?.icon || Sun;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 切换按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
        title="切换主题"
      >
        <CurrentIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.key;
            
            return (
              <button
                key={themeOption.key}
                onClick={() => {
                  setTheme(themeOption.key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{themeOption.label}</span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            );
          })}
          
          {/* 分隔线和当前状态提示 */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 mt-1 pt-2 px-4 pb-2">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              当前: {resolvedTheme === 'dark' ? t('theme.dark') : t('theme.light')}
              {theme === 'system' && (
                <span className="ml-1">(系统)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 