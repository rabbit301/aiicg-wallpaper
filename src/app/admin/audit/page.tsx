'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminAuditPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<Array<{ id: string; action: string; user: string; time: string }>>([]);

  useEffect(() => {
    // TODO: 调用后端审计日志接口，填充 logs
    setLogs([]);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('pages.admin.audit.title')}</h1>
      {logs.length === 0 ? (
        <div className="opacity-70">{t('pages.admin.audit.empty')}</div>
      ) : (
        <div className="space-y-2">
          {logs.map(l => (
            <div key={l.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md">
              <div className="text-sm">{l.action}</div>
              <div className="text-xs opacity-70">{l.user} · {new Date(l.time).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


