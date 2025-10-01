/**
 * 用户权限系统类型定义
 */

// 用户角色
export type UserRole = 'guest' | 'user' | 'admin' | 'super_admin';

// 权限
export type Permission = 
  | 'view_wallpapers'
  | 'generate_wallpapers'
  | 'delete_own_wallpapers'
  | 'delete_any_wallpapers'
  | 'manage_users'
  | 'system_admin';

// 用户信息
export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

// 登录凭据
export interface LoginCredentials {
  username: string;
  password: string;
}

// 认证结果
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: ['view_wallpapers'],
  user: ['view_wallpapers', 'generate_wallpapers', 'delete_own_wallpapers'],
  admin: ['view_wallpapers', 'generate_wallpapers', 'delete_own_wallpapers', 'delete_any_wallpapers'],
  super_admin: ['view_wallpapers', 'generate_wallpapers', 'delete_own_wallpapers', 'delete_any_wallpapers', 'manage_users', 'system_admin']
};

// 角色显示名称
export const ROLE_NAMES: Record<UserRole, string> = {
  guest: '访客',
  user: '普通用户',
  admin: '管理员',
  super_admin: '超级管理员'
};
