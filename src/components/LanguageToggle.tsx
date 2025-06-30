'use client';

import { useState, useEffect } from 'react';
import { useLanguage, type Locale } from '@/contexts/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';

const languageNames = {
  'zh-CN': '简体中文',
  'en': 'English'
} as const;

const languageIcons = {
  'zh-CN': '🇨🇳',
  'en': '🇺🇸'
} as const;

const supportedLocales: Locale[] = ['zh-CN', 'en'];

export default function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useLanguage();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-toggle]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // 切换语言
  const changeLanguage = (newLocale: Locale) => {
    setIsOpen(false);
    setLocale(newLocale);
  };

  // 获取当前语言显示信息
  const currentLanguage = {
    name: languageNames[locale],
    icon: languageIcons[locale]
  };

  return (
    <div className="relative" data-language-toggle>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
        aria-label="选择语言"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.icon}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
          {supportedLocales.map((lang) => {
            const isActive = lang === locale;
            return (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full text-left flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <span className="text-lg">{languageIcons[lang]}</span>
                <span>{languageNames[lang]}</span>
                {isActive && (
                  <span className="ml-auto text-primary-600 dark:text-primary-400">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 