'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';
import AdminToolbar from '@/components/admin/AdminToolbar';

interface AdminWallpaperRow {
  id: string;
  title?: string;
  imageUrl: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

export default function AdminWallpapersPage() {
  const { t } = useLanguage();
  const [list, setList] = useState<AdminWallpaperRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');

  const fetchWallpapers = async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await api.admin.getWallpapers();
      const items = res?.data?.wallpapers || res?.wallpapers || [];
      setList(items);
    } catch (e: any) {
      setError(e?.message || '');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteWallpaper(id);
      await fetchWallpapers();
    } catch (e) {}
  };

  const handleCreateFromUrl = async () => {
    if (!newUrl) return;
    setCreating(true);
    setError('');
    try {
      // 1) 上传到存储，拿到正式URL与缩略图
      const up: any = await api.admin.uploadFromUrl({ url: newUrl });
      if (!up?.success) throw new Error(up?.error || 'upload failed');
      const data = up.data;
      // 2) 创建壁纸记录（最简：必填字段）
      await api.admin.createWallpaper({
        title: newTitle || 'Untitled',
        prompt: 'admin-import',
        image_url: data.originalUrl,
        thumbnail_url: data.thumbnailUrl || data.originalUrl,
        width: data.metadata?.width || 0,
        height: data.metadata?.height || 0,
        format: data.metadata?.format || 'webp',
        tags: [],
        category: 'general',
        is_public: true,
      });
      setNewUrl('');
      setNewTitle('');
      await fetchWallpapers();
    } catch (e: any) {
      setError(e?.message || 'create failed');
    } finally {
      setCreating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedIds = useMemo(() => Object.keys(selected).filter(k => selected[k]), [selected]);

  const applyPublish = async (ids: string[], isPublic: boolean) => {
    for (const id of ids) {
      await api.admin.updateWallpaper(id, { is_public: isPublic });
    }
    await fetchWallpapers();
    setSelected({});
  };

  const applyDelete = async (ids: string[]) => {
    if (!window.confirm(t('common.delete') + ' ?')) return;
    for (const id of ids) {
      await api.admin.deleteWallpaper(id);
    }
    await fetchWallpapers();
    setSelected({});
  };

  const openEdit = (w: AdminWallpaperRow) => {
    setEditingId(w.id);
    setEditTitle(w.title || '');
    setEditCategory('');
    setEditTags('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const payload: any = {};
    if (editTitle) payload.title = editTitle;
    if (editCategory) payload.category = editCategory;
    if (editTags) payload.tags = editTags.split(',').map(s => s.trim()).filter(Boolean);
    await api.admin.updateWallpaper(editingId, payload);
    setEditingId(null);
    await fetchWallpapers();
  };

  const filtered = useMemo(() => {
    let items = list;
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(w => (w.title || '').toLowerCase().includes(q) || w.id.toLowerCase().includes(q));
    }
    if (visibility !== 'all') {
      const want = visibility === 'public';
      // 后端字段为 is_public（此处后端返回可能为 is_public 或 IsPublic，做兼容）
      items = items.filter((w: any) => (typeof w.is_public === 'boolean' ? w.is_public : w.isPublic) === want);
    }
    return items;
  }, [list, query, visibility]);

  useEffect(() => {
    fetchWallpapers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('pages.admin.wallpapers.title')}</h1>
      {error && <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">{error}</div>}
      <AdminToolbar
        left={
          <>
            <button onClick={() => setShowImport(s => !s)} className="px-3 py-2 rounded-lg bg-primary-600 text-white">{t('pages.admin.wallpapers.actions.importUrl')}</button>
            <button disabled className="px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800">{t('pages.admin.wallpapers.actions.upload')} (TODO)</button>
          </>
        }
        right={
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('categoryPage.searchPlaceholder')} className="w-64 px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800" />
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <option value="all">{t('pages.admin.wallpapers.filters.all')}</option>
              <option value="public">{t('pages.admin.wallpapers.filters.public')}</option>
              <option value="private">{t('pages.admin.wallpapers.filters.private')}</option>
            </select>
          </>
        }
      />

      {showImport && (
        <div className="mb-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">{t('pages.admin.wallpapers.fields.imageUrl')}</label>
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800" placeholder="https://..." />
          </div>
          <div className="w-60">
            <label className="block text-sm mb-1">{t('pages.admin.wallpapers.fields.title')}</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800" placeholder="Title" />
          </div>
          <button onClick={handleCreateFromUrl} disabled={creating || !newUrl} className="px-3 py-2 rounded-lg bg-primary-600 text-white">{creating ? t('common.save') + '...' : t('common.save')}</button>
        </div>
      )}

      {/* 批量操作条 */}
      {selectedIds.length > 0 && (
        <div className="mb-3 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex items-center gap-2">
          <div className="text-sm opacity-80">{selectedIds.length} selected</div>
          <button onClick={() => applyPublish(selectedIds, true)} className="px-2 py-1 rounded bg-primary-600 text-white text-xs">{t('pages.admin.wallpapers.actions.publish')}</button>
          <button onClick={() => applyPublish(selectedIds, false)} className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-xs">{t('pages.admin.wallpapers.actions.unpublish')}</button>
          <button onClick={() => applyDelete(selectedIds)} className="ml-auto px-2 py-1 rounded bg-red-600 text-white text-xs">{t('common.delete')}</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="opacity-70">{t('common.loading')}</div>
        ) : list.length === 0 ? (
          <div className="opacity-70">{t('categoryPage.noContent')}</div>
        ) : (
          filtered.map((w: any) => (
            <div key={w.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md overflow-hidden">
              <div className="aspect-video bg-neutral-100 dark:bg-neutral-800">
                <img src={w.imageUrl} alt={w.title || w.id} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={!!selected[w.id]} onChange={() => toggleSelect(w.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{w.title || w.id}</div>
                    <div className="text-xs opacity-70">{w.width}×{w.height} · {w.createdAt ? new Date(w.createdAt).toLocaleString() : '-'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(w)} className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs">{t('pages.admin.wallpapers.actions.edit')}</button>
                    {((typeof w.is_public === 'boolean' ? w.is_public : w.isPublic) ? (
                      <button onClick={() => applyPublish([w.id], false)} className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs">{t('pages.admin.wallpapers.actions.unpublish')}</button>
                    ) : (
                      <button onClick={() => applyPublish([w.id], true)} className="px-2 py-1 rounded-lg bg-primary-600 text-white text-xs">{t('pages.admin.wallpapers.actions.publish')}</button>
                    ))}
                    <a href={w.imageUrl} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs">{t('actions.viewDetails')}</a>
                    <button onClick={() => handleDelete(w.id)} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs">{t('common.delete')}</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 编辑弹层（简化版） */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="text-lg font-semibold mb-3">{t('pages.admin.wallpapers.actions.edit')}</div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('pages.admin.wallpapers.fields.title')}</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('pages.admin.wallpapers.fields.category')}</label>
                <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('pages.admin.wallpapers.fields.tags')}</label>
                <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800" placeholder="tag1, tag2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800">{t('common.cancel')}</button>
                <button onClick={saveEdit} className="px-3 py-2 rounded-lg bg-primary-600 text-white">{t('common.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


