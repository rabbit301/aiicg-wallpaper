'use client';

import { ReactNode } from 'react';
import SideNav from '@/components/SideNav';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <SideNav />
      <main className={`ml-16 ${className}`}>
        {children}
      </main>
    </div>
  );
}
