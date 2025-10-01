'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function DebugTheme() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<string>('unknown');
  const [storedTheme, setStoredTheme] = useState<string>('unknown');

  useEffect(() => {
    // 检查系统主题
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // 检查存储的主题
    const stored = localStorage.getItem('theme');
    setStoredTheme(stored || 'null');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">
          主题调试页面
        </h1>

        <div className="space-y-4">
          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-2">
              当前状态
            </h2>
            <div className="space-y-2 text-sm">
              <div>主题设置: <span className="font-mono">{theme}</span></div>
              <div>解析主题: <span className="font-mono">{resolvedTheme}</span></div>
              <div>系统主题: <span className="font-mono">{systemTheme}</span></div>
              <div>存储主题: <span className="font-mono">{storedTheme}</span></div>
            </div>
          </div>

          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-2">
              DOM 状态
            </h2>
            <div className="space-y-2 text-sm">
              <div>HTML classes: <span className="font-mono">{typeof window !== 'undefined' ? document.documentElement.className : 'N/A'}</span></div>
              <div>Body classes: <span className="font-mono">{typeof window !== 'undefined' ? document.body.className : 'N/A'}</span></div>
            </div>
          </div>

          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-2">
              主题切换
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTheme('light')}
                className="px-4 py-2 bg-white border border-neutral-300 rounded hover:bg-neutral-50"
              >
                浅色
              </button>
              <button
                onClick={() => setTheme('dark')}
                className="px-4 py-2 bg-neutral-800 text-white border border-neutral-600 rounded hover:bg-neutral-700"
              >
                深色
              </button>
              <button
                onClick={() => setTheme('system')}
                className="px-4 py-2 bg-blue-500 text-white border border-blue-600 rounded hover:bg-blue-600"
              >
                跟随系统
              </button>
            </div>
          </div>

          <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-2">
              清除存储
            </h2>
            <button
              onClick={() => {
                localStorage.removeItem('theme');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white border border-red-600 rounded hover:bg-red-600"
            >
              清除主题设置并刷新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
