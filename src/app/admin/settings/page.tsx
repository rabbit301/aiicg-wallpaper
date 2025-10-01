'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [provider, setProvider] = useState<'fastgpt' | 'siliconflow' | 'fal'>('fastgpt');
  const [apiKey, setApiKey] = useState('');
  const [rateLimit, setRateLimit] = useState(60);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      // TODO: 调用后端保存设置的API（建议新增 /api/v1/admin/settings）
      setMessage(t('pages.admin.settings.saved'));
    } catch (e) {
      setMessage(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('pages.admin.settings.title')}</h1>
      <form onSubmit={handleSave} className="space-y-4 max-w-xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 md:p-6">
        <div>
          <label className="block text-sm mb-2">{t('pages.admin.settings.provider')}</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
          >
            <option value="fastgpt">FastGPT</option>
            <option value="siliconflow">SiliconFlow</option>
            <option value="fal">FAL</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-2">API Key</label>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            placeholder="sk-..."
          />
        </div>
        <div>
          <label className="block text-sm mb-2">{t('pages.admin.settings.rateLimit')}</label>
          <input
            type="number"
            value={rateLimit}
            onChange={(e) => setRateLimit(parseInt(e.target.value || '0', 10))}
            className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
          />
        </div>
        <div>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60">
            {saving ? t('common.save') + '...' : t('common.save')}
          </button>
        </div>
      </form>
      {message && <div className="mt-4 text-sm opacity-80">{message}</div>}
    </div>
  );
}


