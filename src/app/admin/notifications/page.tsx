'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';

type NotificationType = 'system' | 'announcement' | 'update' | 'achievement' | 'message' | 'warning' | 'promotion';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface CreateNotificationForm {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  summary: string;
  icon: string;
  image: string;
  actionURL: string;
  actionText: string;
  expiresAt: string; // ISO string
  metadata: string; // JSON string
}

interface ListFilters {
  types: NotificationType[];
  priorities: NotificationPriority[];
  is_read?: boolean;
  is_starred?: boolean;
  page: number;
  page_size: number;
}

export default function AdminNotificationsPage() {
  const { t } = useLanguage();

  const [form, setForm] = useState<CreateNotificationForm>({
    type: 'system',
    priority: 'normal',
    title: '',
    content: '',
    summary: '',
    icon: '',
    image: '',
    actionURL: '',
    actionText: '',
    expiresAt: '',
    metadata: ''
  });

  const [filters, setFilters] = useState<ListFilters>({
    types: [],
    priorities: [],
    page: 1,
    page_size: 10,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [permissionError, setPermissionError] = useState<string>('');

  const typeOptions: Array<{ value: NotificationType; label: string }> = useMemo(() => ([
    { value: 'system', label: t('pages.admin.notifications.type.system') },
    { value: 'announcement', label: t('pages.admin.notifications.type.announcement') },
    { value: 'update', label: t('pages.admin.notifications.type.update') },
    { value: 'achievement', label: t('pages.admin.notifications.type.achievement') },
    { value: 'message', label: t('pages.admin.notifications.type.message') },
    { value: 'warning', label: t('pages.admin.notifications.type.warning') },
    { value: 'promotion', label: t('pages.admin.notifications.type.promotion') },
  ]), [t]);

  const priorityOptions: Array<{ value: NotificationPriority; label: string }> = useMemo(() => ([
    { value: 'low', label: t('pages.admin.notifications.priority.low') },
    { value: 'normal', label: t('pages.admin.notifications.priority.normal') },
    { value: 'high', label: t('pages.admin.notifications.priority.high') },
    { value: 'urgent', label: t('pages.admin.notifications.priority.urgent') },
  ]), [t]);

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filters.types.length) params.types = filters.types;
      if (filters.priorities.length) params.priorities = filters.priorities;
      if (filters.is_read !== undefined) params.is_read = filters.is_read;
      if (filters.is_starred !== undefined) params.is_starred = filters.is_starred;
      params.page = filters.page;
      params.page_size = filters.page_size;

      const res: any = await api.notifications.getList(params);
      if (res && res.items) {
        setList(res.items);
        setTotal(res.meta?.total || res.items.length);
      } else if (res && res.data && res.data.items) {
        setList(res.data.items);
        setTotal(res.data.meta?.total || res.data.items.length);
      } else {
        setList([]);
        setTotal(0);
      }
    } catch (e: any) {
      setError(e?.message || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filters.page, filters.page_size]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPermissionError('');
    setError('');
    try {
      let metadataObj: any = undefined;
      if (form.metadata && form.metadata.trim().length > 0) {
        try {
          metadataObj = JSON.parse(form.metadata);
        } catch {
          setError(t('pages.admin.notifications.errors.invalidMetadata'));
          setSubmitting(false);
          return;
        }
      }

      const payload: any = {
        type: form.type,
        priority: form.priority,
        title: form.title,
        content: form.content,
        summary: form.summary || undefined,
        icon: form.icon || undefined,
        image: form.image || undefined,
        action_url: form.actionURL || undefined,
        action_text: form.actionText || undefined,
        expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        metadata: metadataObj,
      };

      await api.admin.notifications.create(payload);

      // 创建成功后，刷新列表并清空表单标题/内容
      await fetchList();
      setForm((prev) => ({
        ...prev,
        title: '',
        content: '',
        summary: '',
        icon: '',
        image: '',
        actionURL: '',
        actionText: '',
        expiresAt: '',
        metadata: ''
      }));
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('403')) {
        setPermissionError(t('pages.admin.notifications.errors.forbidden'));
      } else if (msg.includes('401')) {
        setPermissionError(t('pages.admin.notifications.errors.unauthorized'));
      } else {
        setError(msg || t('pages.admin.notifications.errors.createFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('pages.admin.notifications.title')}</h1>

        {permissionError && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            {permissionError}
          </div>
        )}
        {error && !permissionError && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 md:p-6">
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.type')}</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.priority')}</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as NotificationPriority })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.title')}</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
              placeholder={t('pages.admin.notifications.placeholders.title')}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.content')}</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 h-28 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
              placeholder={t('pages.admin.notifications.placeholders.content')}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.summary')}</label>
            <input
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.icon')}</label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.image')}</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.actionURL')}</label>
            <input
              value={form.actionURL}
              onChange={(e) => setForm({ ...form, actionURL: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.actionText')}</label>
            <input
              value={form.actionText}
              onChange={(e) => setForm({ ...form, actionText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.expiresAt')}</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-2">{t('pages.admin.notifications.fields.metadata')}</label>
            <textarea
              value={form.metadata}
              onChange={(e) => setForm({ ...form, metadata: e.target.value })}
              className="w-full px-3 py-2 h-24 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 font-mono text-sm"
              placeholder='{"key":"value"}'
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
            >
              {submitting ? t('pages.admin.notifications.actions.submitting') : t('pages.admin.notifications.actions.create')}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{t('pages.admin.notifications.listTitle')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page <= 1 || loading}
              className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50"
            >
              {t('pages.admin.notifications.pagination.prev')}
            </button>
            <span className="text-sm opacity-80">{t('pages.admin.notifications.pagination.page')} {filters.page}</span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={loading || (list.length < filters.page_size)}
              className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50"
            >
              {t('pages.admin.notifications.pagination.next')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="opacity-70">{t('common.loading')}</div>
          ) : list.length === 0 ? (
            <div className="opacity-70">{t('pages.admin.notifications.empty')}</div>
          ) : (
            list.map((n) => (
              <div key={n.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md">
                <div className="text-sm opacity-70 mb-1">{n.type} · {n.priority}</div>
                <div className="font-semibold mb-1">{n.title}</div>
                <div className="text-sm opacity-90 mb-2 line-clamp-3">{n.content}</div>
                <div className="text-xs opacity-70">{new Date(n.createdAt || n.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


