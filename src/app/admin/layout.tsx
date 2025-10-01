'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    { href: '/admin', label: t('nav.admin.dashboard') },
    { href: '/admin/users', label: t('pages.admin.users.title') },
    { href: '/admin/wallpapers', label: t('pages.admin.wallpapers.title') },
    { href: '/admin/notifications', label: t('pages.admin.notifications.title') },
    { href: '/admin/settings', label: t('pages.admin.settings.title') },
    { href: '/admin/audit', label: t('pages.admin.audit.title') },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
      {/* Admin 顶栏（不引入网站侧边栏） */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500" />
            <span className="font-semibold">{t('nav.admin.dashboard')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm opacity-80">
            <span>{user?.username}</span>
          </div>
        </div>
        <div className="border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-2 overflow-x-auto py-2">
              {tabs.map(tab => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm transition-colors ${active ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}


