'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';

interface AdminUserRow {
  id: string;
  username: string;
  email?: string;
  role: string;
  is_vip?: boolean;
  created_at?: string;
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [list, setList] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [typingTimer, setTypingTimer] = useState<any>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = Object.keys(selected).filter(k => selected[k]);
  const isAllSelected = list.length > 0 && selectedIds.length === list.length;
  const isPartialSelected = selectedIds.length > 0 && selectedIds.length < list.length;

  // 切换全选
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected({});
    } else {
      const newSelected: Record<string, boolean> = {};
      list.forEach(user => {
        newSelected[user.id] = true;
      });
      setSelected(newSelected);
    }
  };

  // 切换单个选择
  const toggleSelect = (id: string) => {
    setSelected(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 批量删除用户
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(t('pages.admin.users.actions.confirmBatchDelete').replace('{count}', selectedIds.length.toString()))) return;

    try {
      for (const id of selectedIds) {
        await api.admin.deleteUser(id);
      }
      setSelected({});
      await fetchUsers();
    } catch (error: any) {
      setError(error?.message || t('pages.admin.users.actions.batchDeleteFailed'));
    }
  };

  // 批量修改角色
  const handleBatchRoleChange = async (newRole: string) => {
    if (selectedIds.length === 0) return;

    const roleText = newRole === 'user' ? t('pages.admin.users.roles.user') :
                    newRole === 'admin' ? t('pages.admin.users.roles.admin') :
                    t('pages.admin.users.roles.superAdmin');

    if (!window.confirm(
      t('pages.admin.users.actions.confirmBatchRoleChange')
        .replace('{count}', selectedIds.length.toString())
        .replace('{role}', roleText)
    )) return;

    try {
      for (const id of selectedIds) {
        await api.admin.updateUser(id, { role: newRole });
      }
      setSelected({});
      await fetchUsers();
    } catch (error: any) {
      setError(error?.message || t('pages.admin.users.actions.batchRoleChangeFailed'));
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (query) params.q = query;
      if (roleFilter !== 'all') params.role = roleFilter;
      const res: any = await api.admin.getUsers(params);
      const items = res?.data?.users || res?.users || [];
      setList(items);
    } catch (e: any) {
      setError(e?.message || '');
    } finally {
      setLoading(false);
    }
  }, [query, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 当筛选条件变化时自动刷新（输入搜索做防抖）
  useEffect(() => {
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    const t = setTimeout(() => {
      fetchUsers();
    }, 300);
    setTypingTimer(t);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, roleFilter]);

  const filtered = useMemo(() => list, [list]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('pages.admin.users.title')}</h1>
      {error && <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">{error}</div>}
      <div className="mb-3 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('pages.admin.users.searchPlaceholder')}
          className="w-64 px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800"
        >
          <option value="all">{t('pages.admin.users.roles.all')}</option>
          <option value="user">{t('pages.admin.users.roles.user')}</option>
          <option value="admin">{t('pages.admin.users.roles.admin')}</option>
          <option value="super_admin">{t('pages.admin.users.roles.superAdmin')}</option>
        </select>
        <button type="button" onClick={fetchUsers} className="px-3 py-2 rounded-lg bg-primary-600 text-white">{t('pages.admin.users.actions.apply')}</button>
      </div>

      {/* 批量操作条 */}
      {selectedIds.length > 0 && (
        <div className="mb-3 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex items-center gap-3">
          <div className="text-sm opacity-80">
            {t('pages.admin.users.actions.selectedCount').replace('{count}', selectedIds.length.toString())}
          </div>
          <div className="flex gap-2">
            <select
              onChange={(e) => e.target.value && handleBatchRoleChange(e.target.value)}
              className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-xs"
              defaultValue=""
            >
              <option value="">{t('pages.admin.users.actions.batchRoleChange')}</option>
              <option value="user">{t('pages.admin.users.actions.setToUser')}</option>
              <option value="admin">{t('pages.admin.users.actions.setToAdmin')}</option>
              <option value="super_admin">{t('pages.admin.users.actions.setToSuperAdmin')}</option>
            </select>
            <button
              onClick={handleBatchDelete}
              className="px-2 py-1 rounded bg-red-600 text-white text-xs ml-auto"
            >
              {t('pages.admin.users.actions.batchDelete')}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800/60">
            <tr>
              <th className="text-left px-3 py-2">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartialSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">{t('pages.admin.users.columns.username')}</th>
              <th className="text-left px-3 py-2">{t('pages.admin.users.columns.email')}</th>
              <th className="text-left px-3 py-2">{t('pages.admin.users.columns.role')}</th>
              <th className="text-left px-3 py-2">{t('pages.admin.users.columns.createdAt')}</th>
              <th className="text-right px-3 py-2">{t('pages.admin.users.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={6}>{t('common.loading')}</td></tr>
            ) : list.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={6}>{t('pages.admin.users.empty')}</td></tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!selected[u.id]}
                      onChange={() => toggleSelect(u.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs opacity-70">{u.id}</td>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.email || '-'}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2">{u.created_at ? new Date(u.created_at).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => api.admin.updateUser(u.id, { role: u.role === 'user' ? 'admin' : 'user' }).then(fetchUsers)} className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-xs">{t('common.save')}</button>
                      <button onClick={() => api.admin.deleteUser(u.id).then(fetchUsers)} className="px-2 py-1 rounded bg-red-600 text-white text-xs">{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


