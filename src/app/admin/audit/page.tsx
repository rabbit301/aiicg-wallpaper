'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';

// 审计日志数据结构
interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  created_at: string;
}

// 操作类型映射
const ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  GENERATE: 'generate',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  VIEW: 'view',
};

// 资源类型映射
const RESOURCE_TYPES = {
  USER: 'user',
  WALLPAPER: 'wallpaper',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
  SYSTEM: 'system',
};

export default function AdminAuditPage() {
  const { t } = useLanguage();

  // 数据状态
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  // 筛选和分页状态
  const [filters, setFilters] = useState({
    action: 'all',
    resourceType: 'all',
    userId: '',
    startDate: '',
    endDate: '',
    query: '',
    page: 1,
    pageSize: 20,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // 详情弹窗状态
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // 防抖搜索（使用 useRef 而不是 state）
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  // 加载审计日志
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page: filters.page,
        page_size: filters.pageSize,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };

      if (filters.action !== 'all') params.action = filters.action;
      if (filters.resourceType !== 'all') params.resource_type = filters.resourceType;
      if (filters.userId) params.user_id = filters.userId;
      if (filters.query) params.q = filters.query;
      if (filters.startDate) params.start_date = new Date(filters.startDate).toISOString();
      if (filters.endDate) params.end_date = new Date(filters.endDate).toISOString();

      const res: any = await api.admin.getAuditLogs(params);
      const data = res?.data || res;

      setLogs(data?.logs || data?.items || []);
      setTotal(data?.total || data?.meta?.total || 0);
    } catch (e: any) {
      setError(e?.message || t('pages.admin.audit.errors.loadFailed'));
      // 如果是权限错误，显示空状态而不是错误
      if (e?.message?.includes('403') || e?.message?.includes('401')) {
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  // 初始加载
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // 当筛选条件变化时，带防抖刷新
  useEffect(() => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    const timer = setTimeout(() => {
      fetchAuditLogs();
    }, 300);
    typingTimer.current = timer;
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, [filters.page, filters.pageSize, filters.action, filters.resourceType, filters.userId, filters.query, filters.startDate, filters.endDate, filters.sortBy, filters.sortOrder, fetchAuditLogs]);

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      action: 'all',
      resourceType: 'all',
      userId: '',
      startDate: '',
      endDate: '',
      query: '',
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  // 格式化操作类型
  const formatAction = (action: string) => {
    return t(`pages.admin.audit.actions.${action}`) || action;
  };

  // 格式化资源类型
  const formatResourceType = (type: string) => {
    return t(`pages.admin.audit.resources.${type}`) || type;
  };

  // 获取操作图标
  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      logout: '🚪',
      register: '📝',
      generate: '✨',
      upload: '⬆️',
      download: '⬇️',
      view: '👁️',
    };
    return icons[action.toLowerCase()] || '📋';
  };

  // 获取操作颜色
  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'text-green-600 dark:text-green-400',
      update: 'text-blue-600 dark:text-blue-400',
      delete: 'text-red-600 dark:text-red-400',
      login: 'text-purple-600 dark:text-purple-400',
      logout: 'text-gray-600 dark:text-gray-400',
      register: 'text-indigo-600 dark:text-indigo-400',
      generate: 'text-yellow-600 dark:text-yellow-400',
      upload: 'text-cyan-600 dark:text-cyan-400',
      download: 'text-teal-600 dark:text-teal-400',
      view: 'text-orange-600 dark:text-orange-400',
    };
    return colors[action.toLowerCase()] || 'text-gray-600 dark:text-gray-400';
  };

  // 总页数
  const totalPages = Math.ceil(total / filters.pageSize);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('pages.admin.audit.title')}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('pages.admin.audit.description')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
          {error}
        </div>
      )}

      {/* 筛选工具栏 */}
      <div className="mb-4 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* 搜索框 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.search')}</label>
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value, page: 1 })}
              placeholder={t('pages.admin.audit.filters.searchPlaceholder')}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          {/* 操作类型筛选 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.action')}</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="all">{t('pages.admin.audit.filters.allActions')}</option>
              {Object.values(ACTION_TYPES).map(action => (
                <option key={action} value={action}>{formatAction(action)}</option>
              ))}
            </select>
          </div>

          {/* 资源类型筛选 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.resourceType')}</label>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="all">{t('pages.admin.audit.filters.allResources')}</option>
              {Object.values(RESOURCE_TYPES).map(type => (
                <option key={type} value={type}>{formatResourceType(type)}</option>
              ))}
            </select>
          </div>

          {/* 用户ID筛选 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.userId')}</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value, page: 1 })}
              placeholder={t('pages.admin.audit.filters.userIdPlaceholder')}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          {/* 开始日期 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.startDate')}</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.endDate')}</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            />
          </div>

          {/* 排序方式 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="created_at">{t('pages.admin.audit.filters.sortByTime')}</option>
              <option value="action">{t('pages.admin.audit.filters.sortByAction')}</option>
              <option value="username">{t('pages.admin.audit.filters.sortByUser')}</option>
            </select>
          </div>

          {/* 排序顺序 */}
          <div>
            <label className="block text-xs mb-1 opacity-70">{t('pages.admin.audit.filters.sortOrder')}</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="desc">{t('pages.admin.audit.filters.descending')}</option>
              <option value="asc">{t('pages.admin.audit.filters.ascending')}</option>
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('pages.admin.audit.filters.reset')}
          </button>
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? t('common.loading') : t('pages.admin.audit.filters.apply')}
          </button>
          <div className="ml-auto text-xs opacity-70">
            {t('pages.admin.audit.totalLogs')}: {total}
          </div>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center opacity-70">{t('common.loading')}</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center opacity-70">{t('pages.admin.audit.empty')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{t('pages.admin.audit.columns.time')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('pages.admin.audit.columns.user')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('pages.admin.audit.columns.action')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('pages.admin.audit.columns.resource')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('pages.admin.audit.columns.ip')}</th>
                  <th className="text-right px-4 py-3 font-medium">{t('pages.admin.audit.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{log.username}</div>
                      <div className="text-xs opacity-70 font-mono">{log.user_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-2 ${getActionColor(log.action)}`}>
                        <span>{getActionIcon(log.action)}</span>
                        <span className="font-medium">{formatAction(log.action)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatResourceType(log.resource_type)}</div>
                      {log.resource_id && (
                        <div className="text-xs opacity-70 font-mono">{log.resource_id.slice(0, 12)}...</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs opacity-70">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2 py-1 text-xs rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                      >
                        {t('pages.admin.audit.actions.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm opacity-70">
            {t('pages.admin.audit.pagination.showing')} {((filters.page - 1) * filters.pageSize) + 1} - {Math.min(filters.page * filters.pageSize, total)} {t('pages.admin.audit.pagination.of')} {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: 1 })}
              disabled={filters.page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {t('pages.admin.audit.pagination.first')}
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {t('pages.admin.audit.pagination.prev')}
            </button>
            <span className="px-3 py-1.5 text-sm">
              {t('pages.admin.audit.pagination.page')} {filters.page} / {totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
              disabled={filters.page >= totalPages}
              className="px-3 py-1.5 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {t('pages.admin.audit.pagination.next')}
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: totalPages })}
              disabled={filters.page >= totalPages}
              className="px-3 py-1.5 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {t('pages.admin.audit.pagination.last')}
            </button>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">{t('pages.admin.audit.detailsTitle')}</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-2xl leading-none opacity-70 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.id')}</div>
                  <div className="font-mono text-sm">{selectedLog.id}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.time')}</div>
                  <div className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.user')}</div>
                  <div className="text-sm">{selectedLog.username}</div>
                  <div className="text-xs opacity-70 font-mono">{selectedLog.user_id}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.action')}</div>
                  <div className={`text-sm font-medium ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)} {formatAction(selectedLog.action)}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.resource')}</div>
                  <div className="text-sm">{formatResourceType(selectedLog.resource_type)}</div>
                  {selectedLog.resource_id && (
                    <div className="text-xs opacity-70 font-mono">{selectedLog.resource_id}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.ip')}</div>
                  <div className="text-sm font-mono">{selectedLog.ip_address || '-'}</div>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.userAgent')}</div>
                  <div className="text-sm font-mono break-all">{selectedLog.user_agent}</div>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <div className="text-xs opacity-70 mb-1">{t('pages.admin.audit.details.details')}</div>
                  <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
