// API Client - Unified API management for frontend and backend
// Supports switching between Next.js API routes and Go backend API

// API Configuration
const API_CONFIG = {
  GO_BACKEND_URL: process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080',
  NEXTJS_API_URL: process.env.NEXT_PUBLIC_NEXTJS_API_URL || '',
  USE_GO_BACKEND: process.env.NEXT_PUBLIC_USE_GO_BACKEND === 'true',
  // 开发环境使用代理，生产环境直接访问后端
  USE_PROXY: process.env.NODE_ENV === 'development',
};

// API routes mapping - define which APIs use Go backend
const GO_BACKEND_ROUTES = new Set([
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/user/profile',
  '/api/v1/user/stats',
  '/api/v1/user/wallpapers',
  '/api/v1/user/favorites',
  '/api/v1/wallpapers',
  '/api/v1/generate/wallpaper',
  '/api/v1/admin/dashboard',
  '/api/v1/admin/users',
  '/api/v1/admin/wallpapers',
]);

// Next.js API routes to Go backend API routes mapping
const ROUTE_MAPPING: Record<string, string> = {
  '/api/auth/register': '/api/v1/auth/register',
  '/api/auth/login': '/api/v1/auth/login',
  '/api/auth/refresh': '/api/v1/auth/refresh',
  '/api/user/profile': '/api/v1/user/profile',
  '/api/user/stats': '/api/v1/user/stats',
  '/api/user/wallpapers': '/api/v1/user/wallpapers',
  '/api/user/favorites': '/api/v1/user/favorites',
  '/api/wallpapers': '/api/v1/wallpapers',
  '/api/generate': '/api/v1/generate/wallpaper',
  '/api/auth/send-code': '/api/v1/auth/send-verification',
  '/api/auth/verify-code': '/api/v1/auth/verify-code',
  '/api/auth/verification-status': '/api/v1/auth/verification-status',
  '/api/admin/wallpapers': '/api/v1/admin/wallpapers',
  '/api/admin/users': '/api/v1/admin/users',
  '/api/admin/dashboard': '/api/v1/admin/dashboard',
  '/api/admin/folders': '/api/v1/admin/folders',
  '/api/admin/audit-logs': '/api/v1/admin/audit-logs',
  '/api/admin/settings': '/api/v1/admin/settings',
  '/api/admin/upload': '/api/v1/admin/upload',
  '/api/wallpapers/public': '/api/v1/wallpapers/public',
  '/api/wallpapers/folders': '/api/v1/wallpapers/folders',
  '/api/notifications': '/api/v1/notifications',
};

// Unified API Client
class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private getApiUrl(path: string): string {
    // 支持带查询字符串的路径进行正确映射
    const hasQuery = path.includes('?');
    const [pathname, query] = hasQuery ? path.split('?') : [path, ''];

    // 如果路径已经是 Go backend 格式（/api/v1/），直接使用
    const isGoBackendPath = pathname.startsWith('/api/v1/');

    // 从映射表查找对应的 Go backend 路径
    const goBackendPath = isGoBackendPath ? pathname : ROUTE_MAPPING[pathname];

    // 判断是否应该使用 Go backend
    const shouldUseGoBackend = API_CONFIG.USE_GO_BACKEND ||
                              isGoBackendPath ||
                              (goBackendPath && GO_BACKEND_ROUTES.has(goBackendPath));

    if (shouldUseGoBackend && goBackendPath) {
      // 开发环境使用代理，避免跨域问题
      if (API_CONFIG.USE_PROXY) {
        return hasQuery ? `${goBackendPath}?${query}` : goBackendPath; // 使用相对路径，通过Next.js代理
      }
      const base = `${API_CONFIG.GO_BACKEND_URL}${goBackendPath}`;
      return hasQuery ? `${base}?${query}` : base;
    }

    const localBase = `${API_CONFIG.NEXTJS_API_URL}${pathname}`;
    return hasQuery ? `${localBase}?${query}` : localBase;
  }

  async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const url = this.getApiUrl(path);

    // 检测是否是 FormData，如果是则不设置 Content-Type（让浏览器自动设置）
    const isFormData = options.body instanceof FormData;
    const headers = isFormData
      ? this.getHeaders({ 'Content-Type': '' }) // 清空 Content-Type
      : this.getHeaders(options.headers as Record<string, string>);

    // 如果是 FormData，移除 Content-Type header 让浏览器自动设置
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle Go backend response format
      if (data.data !== undefined) {
        // Store tokens for login responses
        if (data.data.access_token && (path.includes('/auth/login') || path.includes('/auth/register'))) {
          localStorage.setItem('authToken', data.data.access_token);
          if (data.data.refresh_token) {
            localStorage.setItem('refreshToken', data.data.refresh_token);
          }
        }
        // Store tokens for refresh responses
        if (data.data.access_token && path.includes('/auth/refresh')) {
          localStorage.setItem('authToken', data.data.access_token);
          if (data.data.refresh_token) {
            localStorage.setItem('refreshToken', data.data.refresh_token);
          }
        }
        return data.data;
      } else if (data.success !== undefined) {
        // Handle Next.js API response format
        if (data.success && data.access_token) {
          localStorage.setItem('authToken', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('refreshToken', data.refresh_token);
          }
        }
        return data;
      } else {
        return data;
      }
    } catch (error) {
      console.error(`API request failed [${options.method || 'GET'}] ${url}:`, error);
      throw error;
    }
  }

  async get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(path: string, data?: any): Promise<T> {
    // 检测是否是 FormData，如果是就直接传递，不要 JSON.stringify
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);

    return this.request<T>(path, {
      method: 'POST',
      body,
    });
  }

  async put<T = any>(path: string, data?: any): Promise<T> {
    // 同样处理 PUT 方法
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined);

    return this.request<T>(path, {
      method: 'PUT',
      body,
    });
  }

  async delete<T = any>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export configuration for other modules
export { API_CONFIG, ROUTE_MAPPING, GO_BACKEND_ROUTES };

// Convenient API call functions
export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      apiClient.post('/api/auth/register', data),
    login: (data: { username: string; password: string }) =>
      apiClient.post('/api/auth/login', data),
    refresh: () => {
      if (typeof window === 'undefined') {
        throw new Error('No refresh token available');
      }
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return apiClient.post('/api/auth/refresh', { refresh_token: refreshToken });
    },
  },
  
  generate: {
    wallpaper: (data: { prompt: string; title?: string; preset?: string }) =>
      apiClient.post('/api/generate', data),
  },

  user: {
    getProfile: () => apiClient.get('/api/user/profile'),
    updateProfile: (data: any) => apiClient.put('/api/user/profile', data),
    getStats: () => apiClient.get('/api/user/stats'),
    getWallpapers: (params?: any) => apiClient.get('/api/user/wallpapers', params),
    getFavorites: (params?: any) => apiClient.get('/api/user/favorites', params),
  },
  
  wallpapers: {
    getList: (params?: any) => apiClient.get('/api/wallpapers', params),
    getById: (id: string) => apiClient.get(`/api/wallpapers/${id}`),
    create: (data: any) => apiClient.post('/api/wallpapers', data),
    update: (id: string, data: any) => apiClient.put(`/api/wallpapers/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/wallpapers/${id}`),
    addToFavorites: (id: string) => apiClient.post(`/api/wallpapers/${id}/favorite`),
    removeFromFavorites: (id: string) => apiClient.delete(`/api/wallpapers/${id}/favorite`),

    // 公开壁纸接口（从文件夹系统获取）
    getPublic: (params?: { folder?: string; tags?: string[]; page?: number; limit?: number; nsfw?: boolean }) =>
      apiClient.get('/api/v1/wallpapers/public', params),
    getFolders: () => apiClient.get('/api/v1/wallpapers/folders'),
  },
  
  admin: {
    getDashboard: () => apiClient.get('/api/admin/dashboard'),
    getUsers: (params?: any) => apiClient.get('/api/admin/users', params),
    getUser: (id: string) => apiClient.get(`/api/admin/users/${id}`),
    updateUser: (id: string, data: any) => apiClient.put(`/api/admin/users/${id}`, data),
    deleteUser: (id: string) => apiClient.delete(`/api/admin/users/${id}`),
    getWallpapers: (params?: any) => apiClient.get('/api/admin/wallpapers', params),
    createWallpaper: (data: any) => apiClient.post('/api/v1/admin/wallpapers', data),
    updateWallpaper: (id: string, data: any) => apiClient.put(`/api/v1/admin/wallpapers/${id}`, data),
    notifications: {
      create: (data: any) => apiClient.post('/api/v1/admin/notifications', data),
    },
    deleteWallpaper: (id: string) => apiClient.delete(`/api/v1/admin/wallpapers/${id}`),
    uploadFromUrl: (payload: { url: string; filename?: string }) => apiClient.post('/api/admin/upload', payload),
    getAuditLogs: (params?: any) => apiClient.get('/api/v1/admin/audit-logs', params),
    getSettings: () => apiClient.get('/api/v1/admin/settings'),
    updateSettings: (data: any) => apiClient.put('/api/v1/admin/settings', data),

    // 文件夹管理
    getFolders: () => apiClient.get('/api/v1/admin/folders'),
    createFolder: (data: { name: string }) => apiClient.post('/api/v1/admin/folders', data),
    updateFolder: (id: string, data: { name: string }) => apiClient.put(`/api/v1/admin/folders/${id}`, data),
    deleteFolder: (id: string) => apiClient.delete(`/api/v1/admin/folders/${id}`),
    getWallpapersByFolder: (folderId: string, params?: any) => apiClient.get(`/api/v1/admin/folders/${folderId}/wallpapers`, params),

    // 壁纸上传和管理
    uploadWallpaper: (formData: FormData) => apiClient.post('/api/v1/admin/wallpapers/upload', formData),
    moveWallpapers: (wallpaperIds: string[], targetFolderId: string) =>
      apiClient.post('/api/v1/admin/wallpapers/move', { wallpaperIds, targetFolderId }),
  },

  notifications: {
    getList: (params?: any) => apiClient.get('/api/v1/notifications', params),
    getStats: () => apiClient.get('/api/v1/notifications/stats'),
    markAsRead: (id: string) => apiClient.put(`/api/v1/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put('/api/v1/notifications/read-all'),
    toggleStar: (id: string) => apiClient.put(`/api/v1/notifications/${id}/star`),
    delete: (id: string) => apiClient.delete(`/api/v1/notifications/${id}`),
    init: () => apiClient.post('/api/v1/notifications/init'),
  },
};
