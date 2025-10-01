'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/NotificationPanel';

import {
  Home,
  Wand2,
  Image,
  User,
  Sparkles,
  Settings,
  Bell,
  Grid3X3,
  Zap,
  Globe,
  LogOut,
  FileText,
  Check,
  ChevronRight,
  Folder,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';

export default function SideNav() {
  const { t, locale, setLocale } = useLanguage();
  const { user, isLoggedIn, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { stats } = useNotifications();
  const pathname = usePathname();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLButtonElement>(null);

  // 主要导航菜单项 - 图标+文字布局
  const navigation = [
    { 
      name: t('explore'), 
      href: '/', 
      icon: Home
    },
    { 
      name: t('create'), 
      href: '/generate', 
      icon: Wand2
    },
    {
      name: t('material'),
              href: '/wallpaper', 
      icon: Grid3X3
    },
    { 
      name: t('compress'), 
      href: '/compress', 
      icon: Image
    }
  ];

  // 语言选项 - 只保留中英文
  const languages = [
    { code: 'zh-CN', name: t('settings.language.chinese'), nativeName: '简体中文' },
    { code: 'en', name: t('settings.language.english'), nativeName: 'English' }
  ];

  // 主题选项
  const themes = [
    { key: 'light' as const, label: t('theme.light'), icon: Sun },
    { key: 'dark' as const, label: t('theme.dark'), icon: Moon },
    { key: 'system' as const, label: t('theme.system'), icon: Monitor },
  ];

  // 资源菜单项
  const resourceLinks = [
    { href: '/terms', name: t('termsOfService') },
    { href: '/privacy', name: t('privacyPolicy') },
    { href: '/community', name: t('communityGuidelines') },
    { href: '/safety', name: t('userSafetyGuide') },
    { href: '/cookies', name: t('cookiePolicy') }
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === locale) || languages[0];
  };

  // 获取当前主题的图标和名称
  const getCurrentTheme = () => {
    if (theme === 'system') {
      return {
        icon: resolvedTheme === 'dark' ? Moon : Sun,
        label: t('theme.system'),
        key: 'system' as const
      };
    }
    const currentTheme = themes.find(t => t.key === theme);
    return currentTheme || themes[0];
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setShowResourcesMenu(false);
      }
      // 通知面板的关闭逻辑由NotificationPanel自己处理
      // 这里不需要处理，避免冲突
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* 侧边栏 - 图标+文字垂直布局，参考即梦AI */}
      <div className="fixed left-0 top-0 h-full w-16 bg-white/80 dark:bg-neutral-900/90 backdrop-blur-md z-50 flex flex-col">
        
        {/* 顶部Logo区域 */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <Link href="/" className="group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        {/* 主导航菜单 - 垂直居中布局 */}
        <nav className="flex-1 flex items-center">
          <div className="w-full px-1">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-primary-100/80 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium leading-none">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* 底部功能区 */}
        <div className="pb-6 px-1 space-y-1">
          
          {/* 使用次数显示 */}
          <div className="flex flex-col items-center py-2 px-2">
            <Zap className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </div>

          {/* 通知 - 只有登录用户才显示 */}
          {isLoggedIn && (
            <button
              ref={notificationRef}
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className="relative w-full flex flex-col items-center py-3 px-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white transition-all duration-200"
            >
              <Bell className="h-5 w-5" />
              {/* 未读通知数量徽章 */}
              {stats.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {stats.unread > 99 ? '99+' : stats.unread}
                </span>
              )}
            </button>
          )}

          {/* 用户中心/登录 */}
          {isLoggedIn && user ? (
            <Link
              href="/profile"
              className="w-full flex flex-col items-center py-3 px-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white transition-all duration-200"
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-full flex flex-col items-center py-3 px-2 rounded-xl bg-primary-600/90 text-white hover:bg-primary-700 transition-all duration-200 shadow-lg backdrop-blur-sm"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          {/* 设置 - 级联菜单 */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`w-full flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200 ${
                showSettingsMenu 
                  ? 'bg-primary-100/80 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* 设置级联菜单 */}
            {showSettingsMenu && (
              <div className="absolute left-full ml-2 bottom-0 w-48 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 py-2 z-50">
                
                {/* 资源子菜单 */}
                <div className="relative" ref={resourcesRef}>
                  <button
                    onClick={() => setShowResourcesMenu(!showResourcesMenu)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors"
                  >
                    <div className="flex items-center">
                      <Folder className="h-4 w-4 mr-3" />
{t('menuResources')}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* 资源选择子菜单 */}
                  {showResourcesMenu && (
                    <div className="absolute left-full top-0 ml-1 w-48 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 py-2 z-50">
                      {resourceLinks.map((resource) => (
                        <Link
                          key={resource.href}
                          href={resource.href}
                          onClick={() => {
                            setShowResourcesMenu(false);
                            setShowSettingsMenu(false);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-3" />
                          {resource.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 分割线 */}
                <div className="my-2 mx-3 h-px bg-neutral-200/50 dark:bg-neutral-700/50"></div>

                {/* 主题切换 */}
                <div className="relative" ref={themeRef}>
                  <button
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors"
                  >
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-3" />
                      {t('theme.title')}: {getCurrentTheme().label}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* 主题选择子菜单 */}
                  {showThemeMenu && (
                    <div className="absolute left-full top-0 ml-1 w-44 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 py-2 z-50">
                      {themes.map((themeOption) => {
                        const Icon = themeOption.icon;
                        const isActive = theme === themeOption.key;

                        return (
                          <button
                            key={themeOption.key}
                            onClick={() => {
                              setTheme(themeOption.key);
                              setShowThemeMenu(false);
                              setShowSettingsMenu(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors"
                          >
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-3" />
                              <span>{themeOption.label}</span>
                            </div>
                            {isActive && (
                              <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            )}
                          </button>
                        );
                      })}

                      {/* 当前状态提示 */}
                      <div className="border-t border-neutral-200/50 dark:border-neutral-700/50 mt-2 pt-2 px-4 pb-1">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {t('theme.current')}: {resolvedTheme === 'dark' ? t('theme.dark') : t('theme.light')}
                          {theme === 'system' && (
                            <span className="ml-1">({t('theme.system')})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 语言切换 */}
                <div className="relative" ref={languageRef}>
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors"
                  >
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-3" />
{t('menuLanguage')}: {getCurrentLanguage().nativeName}
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* 语言选择子菜单 */}
                  {showLanguageMenu && (
                    <div className="absolute left-full top-0 ml-1 w-40 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 py-2 z-50">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            setLocale(language.code as 'zh-CN' | 'en');
                            setShowLanguageMenu(false);
                            setShowSettingsMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors"
                        >
                          <span>{language.nativeName}</span>
                          {locale === language.code && (
                            <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 分割线 */}
                <div className="my-2 mx-3 h-px bg-neutral-200/50 dark:bg-neutral-700/50"></div>

                {/* 登入/登出 */}
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      logout();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
{t('logout')}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-colors"
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
{t('login')}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 通知面板 - 只有登录用户才显示 */}
      {isLoggedIn && (
        <NotificationPanel
          isOpen={showNotificationPanel}
          onClose={() => setShowNotificationPanel(false)}
          anchorRef={notificationRef}
        />
      )}
    </>
  );
}