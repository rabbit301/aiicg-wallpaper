/**
 * 权限验证中间件
 */

import { NextRequest } from 'next/server';
import { authStore } from '@/lib/auth-store';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

/**
 * 从请求中获取用户信息
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    // 方法1：从auth_token cookie中获取（如果存在）
    const authToken = request.cookies.get('auth_token')?.value;
    if (authToken) {
      // 这里应该验证token，简化版直接检查是否为超级管理员token
      try {
        const payload = JSON.parse(Buffer.from(authToken, 'base64').toString());
        if (payload.username === 'rabbitc' && payload.role === 'super_admin') {
          return {
            id: payload.userId,
            username: payload.username,
            role: payload.role,
            permissions: ['view_wallpapers', 'generate_wallpapers', 'delete_own_wallpapers', 'delete_any_wallpapers', 'manage_users', 'system_admin']
          };
        }
      } catch {}
    }

    // 方法2：从user cookie中获取（备用）
    const userCookie = request.cookies.get('user')?.value;
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie));
      return userData;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  return user.permissions?.includes(permission) || false;
}

/**
 * 检查是否为超级管理员
 */
export function isSuperAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

/**
 * 检查是否为管理员（包括超级管理员）
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'super_admin';
}

/**
 * 权限验证装饰器
 */
export function requirePermission(permission: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(request: NextRequest, ...args: any[]) {
      const user = await getUserFromRequest(request);
      
      if (!hasPermission(user, permission)) {
        return new Response(JSON.stringify({
          success: false,
          error: '权限不足'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return originalMethod.apply(this, [request, ...args]);
    };
    
    return descriptor;
  };
}

/**
 * 超级管理员验证装饰器
 */
export function requireSuperAdmin(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(request: NextRequest, ...args: any[]) {
    const user = await getUserFromRequest(request);
    
    if (!isSuperAdmin(user)) {
      return new Response(JSON.stringify({
        success: false,
        error: '需要超级管理员权限'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return originalMethod.apply(this, [request, ...args]);
  };
  
  return descriptor;
}
