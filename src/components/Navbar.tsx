'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  Home, 
  Wand2, 
  Image, 
  User, 
  Menu, 
  X, 
  Sparkles,
  Settings,
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const { t, locale } = useLanguage();
  
  // 滚动隐藏导航栏状态
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 滚动监听逻辑
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // 向下滚动超过100px时隐藏导航栏
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // 节流优化性能
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlNavbar();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  // 使用函数形式确保每次渲染都获取最新翻译
  const getNavigation = () => [
    { name: t('home_nav'), href: '/', icon: Home },
    { name: t('generate'), href: '/generate', icon: Wand2 },
    { name: t('compress'), href: '/compress', icon: Image },
  ];
  
  const navigation = getNavigation();

  const getUserNavigation = () => [
    { name: t('profile'), href: '/profile', icon: User },
    { name: t('settings'), href: '/settings', icon: Settings },
  ];
  
  const userNavigation = getUserNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, logout, login } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleAuthSuccess = (userData: any) => {
    login(userData);
  };

  return (
    <>
      <nav className={`bg-white/95 dark:bg-neutral-900/95 sticky top-0 z-50 backdrop-blur-xl shadow-lg shadow-neutral-200/20 dark:shadow-neutral-900/40 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  AIICG壁纸站
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Toggle */}
              <LanguageToggle />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200">
                    {/* 用户头像 */}
                    <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      {user?.avatar && !user.avatar.includes('/avatars/presets/') ? (
                        <img 
                          src={user.avatar} 
                          alt="用户头像" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{user?.username}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {userNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                      <hr className="my-1 border-neutral-200/30 dark:border-neutral-700/30" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 font-medium rounded-lg border border-primary-200 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('login')}
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Language Toggle */}
              <LanguageToggle />
              
              {/* Mobile Theme Toggle */}
              <ThemeToggle />
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <hr className="my-3 border-neutral-200/30 dark:border-neutral-700/30" />
              
              {isLoggedIn ? (
                <>
                  {/* 用户信息 */}
                  <div className="flex items-center space-x-3 px-3 py-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      {user?.avatar && !user.avatar.includes('/avatars/presets/') ? (
                        <img 
                          src={user.avatar} 
                          alt="用户头像" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      {user?.username}
                    </span>
                  </div>

                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-3 py-3 rounded-lg text-base font-medium bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  {t('loginRegister')}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
