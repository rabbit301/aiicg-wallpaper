/**
 * 用户管理服务
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, UserRole, LoginCredentials, AuthResult, ROLE_PERMISSIONS } from './types';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export class UserService {
  
  /**
   * 确保数据目录存在
   */
  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(USERS_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      // 目录已存在，忽略错误
    }
  }

  /**
   * 获取所有用户
   */
  async getAllUsers(): Promise<User[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      // 文件不存在时返回默认超级管理员
      return await this.createDefaultSuperAdmin();
    }
  }

  /**
   * 创建默认超级管理员
   */
  private async createDefaultSuperAdmin(): Promise<User[]> {
    const superAdmin: User = {
      id: 'super_admin_001',
      username: 'rabbitc',
      role: 'super_admin',
      permissions: ROLE_PERMISSIONS.super_admin,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const users = [superAdmin];
    await this.saveUsers(users);
    console.log('✅ 创建默认超级管理员账号: rabbitc');
    return users;
  }

  /**
   * 保存用户数据
   */
  private async saveUsers(users: User[]): Promise<void> {
    await this.ensureDataDirectory();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  /**
   * 根据用户名获取用户
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.username === username) || null;
  }

  /**
   * 验证密码（简单的硬编码验证）
   */
  private validatePassword(username: string, password: string): boolean {
    // 硬编码的超级管理员密码
    if (username === 'rabbitc' && password === 'Wxh736533?') {
      return true;
    }
    
    // 这里可以扩展其他用户的密码验证
    return false;
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const user = await this.getUserByUsername(credentials.username);
      
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          error: '账号已被禁用'
        };
      }

      if (!this.validatePassword(credentials.username, credentials.password)) {
        return {
          success: false,
          error: '密码错误'
        };
      }

      // 更新最后登录时间
      user.lastLoginAt = new Date().toISOString();
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex >= 0) {
        users[userIndex] = user;
        await this.saveUsers(users);
      }

      // 生成简单的token（实际项目中应该使用JWT）
      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: '登录失败，请稍后重试'
      };
    }
  }

  /**
   * 生成token
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      timestamp: Date.now()
    };
    
    // 简单的base64编码（实际项目中应该使用JWT）
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * 验证token
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // 检查token是否过期（24小时）
      if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
        return null;
      }

      const user = await this.getUserByUsername(payload.username);
      return user && user.isActive ? user : null;
    } catch {
      return null;
    }
  }

  /**
   * 检查用户权限
   */
  hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission as any);
  }

  /**
   * 检查是否为超级管理员
   */
  isSuperAdmin(user: User): boolean {
    return user.role === 'super_admin';
  }
}

// 导出单例
export const userService = new UserService();
