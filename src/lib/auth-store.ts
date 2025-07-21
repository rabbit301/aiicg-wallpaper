import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

interface User {
  id: string;
  username: string;
  email?: string;
  password?: string; // 简化版，生产环境需要加密
  avatar: string;
  joinedAt: string;
  isVip: boolean;
  language: string;
  timezone: string;
  privacySettings: {
    saveGeneratedImages: boolean;
    saveCompressedImages: boolean;
    showInHomepage: boolean;
    maxHomepageImages: number;
    allowPublicView: boolean;
  };
  favorites: string[];
  usageStats: {
    generateCount: number;
    compressCount: number;
    downloadCount: number;
    optimizeCount: number; // 新增：提示词优化次数
  };
  // 新增：优化相关设置
  optimizationSettings?: {
    dailyOptimizeLimit: number; // 每日优化限制
    totalOptimizeCount: number; // 总优化次数
    lastOptimizeDate: string; // 最后优化日期
    purchasedOptimizations: number; // 购买的优化次数
  };
}

interface GuestSession {
  id: string;
  generateCount: number;
  compressCount: number;
  downloadCount: number;
  optimizeCount: number; // 新增：提示词优化次数
  createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const GUEST_SESSIONS_FILE = path.join(process.cwd(), 'data', 'guest-sessions.json');

// 预设头像列表
export const PRESET_AVATARS = [
  '/avatars/presets/avatar-1.svg',
  '/avatars/presets/avatar-2.svg', 
  '/avatars/presets/avatar-3.svg',
  '/avatars/presets/avatar-4.svg',
  '/avatars/presets/avatar-5.svg',
  '/avatars/presets/avatar-6.svg',
  '/avatars/presets/avatar-7.svg',
  '/avatars/presets/avatar-8.svg',
  '/avatars/presets/avatar-9.svg',
  '/avatars/presets/avatar-10.svg',
  '/avatars/presets/avatar-11.svg',
  '/avatars/presets/avatar-12.svg',
];

export class AuthStore {
  private async ensureDataDirectory() {
    const dataDir = path.dirname(USERS_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error('创建用户数据目录失败:', error);
    }
  }

  // 获取所有用户
  private async getAllUsers(): Promise<User[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // 保存用户数据
  private async saveUsers(users: User[]): Promise<void> {
    await this.ensureDataDirectory();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  }

  // 获取访客会话
  private async getGuestSessions(): Promise<GuestSession[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(GUEST_SESSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // 保存访客会话
  private async saveGuestSessions(sessions: GuestSession[]): Promise<void> {
    await this.ensureDataDirectory();
    await fs.writeFile(GUEST_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  }

  // 注册新用户
  async registerUser(username: string, email?: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await this.getAllUsers();
      
      // 检查用户名是否已存在
      if (users.find(u => u.username === username)) {
        return { success: false, error: '用户名已存在' };
      }

      // 检查邮箱是否已存在
      if (email && users.find(u => u.email === email)) {
        return { success: false, error: '邮箱已被使用' };
      }

      // 创建新用户
      const newUser: User = {
        id: nanoid(),
        username,
        email,
        password,
        avatar: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)], // 随机分配预设头像
        joinedAt: new Date().toISOString(),
        isVip: false,
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        privacySettings: {
          saveGeneratedImages: true,
          saveCompressedImages: false,
          showInHomepage: true,
          maxHomepageImages: 6,
          allowPublicView: true
        },
        favorites: [],
        usageStats: {
          generateCount: 0,
          compressCount: 0,
          downloadCount: 0,
          optimizeCount: 0
        },
        optimizationSettings: {
          dailyOptimizeLimit: 3, // 普通用户每日3次
          totalOptimizeCount: 0,
          lastOptimizeDate: new Date().toISOString().split('T')[0],
          purchasedOptimizations: 0
        }
      };

      users.push(newUser);
      await this.saveUsers(users);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('用户注册失败:', error);
      return { success: false, error: '注册失败，请稍后重试' };
    }
  }

  // 用户登录
  async loginUser(username: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        return { success: false, error: '用户不存在' };
      }

      // 简化版密码验证（生产环境需要加密比较）
      if (password && user.password !== password) {
        return { success: false, error: '密码错误' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('用户登录失败:', error);
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }

  // 获取用户信息
  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  // 更新用户信息
  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex] = { ...users[userIndex], ...updates };
      await this.saveUsers(users);
      return true;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return false;
    }
  }

  // 创建访客会话
  async createGuestSession(): Promise<string> {
    try {
      const sessions = await this.getGuestSessions();
      const guestSession: GuestSession = {
        id: nanoid(),
        generateCount: 0,
        compressCount: 0,
        downloadCount: 0,
        optimizeCount: 0,
        createdAt: new Date().toISOString()
      };

      sessions.push(guestSession);
      await this.saveGuestSessions(sessions);
      return guestSession.id;
    } catch (error) {
      console.error('创建访客会话失败:', error);
      return '';
    }
  }

  // 获取访客会话
  async getGuestSession(sessionId: string): Promise<GuestSession | null> {
    const sessions = await this.getGuestSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // 更新访客使用统计
  async updateGuestUsage(sessionId: string, type: 'generate' | 'compress' | 'download' | 'optimize'): Promise<GuestSession | null> {
    try {
      const sessions = await this.getGuestSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return null;

      const session = sessions[sessionIndex];
      switch (type) {
        case 'generate':
          session.generateCount++;
          break;
        case 'compress':
          session.compressCount++;
          break;
        case 'download':
          session.downloadCount++;
          break;
        case 'optimize':
          session.optimizeCount++;
          break;
      }

      sessions[sessionIndex] = session;
      await this.saveGuestSessions(sessions);
      return session;
    } catch (error) {
      console.error('更新访客使用统计失败:', error);
      return null;
    }
  }

  // 更新用户使用统计
  async updateUserUsage(userId: string, type: 'generate' | 'compress' | 'download' | 'optimize'): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      const user = users[userIndex];
      switch (type) {
        case 'generate':
          user.usageStats.generateCount++;
          break;
        case 'compress':
          user.usageStats.compressCount++;
          break;
        case 'download':
          user.usageStats.downloadCount++;
          break;
        case 'optimize':
          user.usageStats.optimizeCount++;
          // 更新优化设置
          if (user.optimizationSettings) {
            user.optimizationSettings.totalOptimizeCount++;
            user.optimizationSettings.lastOptimizeDate = new Date().toISOString().split('T')[0];
          }
          break;
      }

      users[userIndex] = user;
      await this.saveUsers(users);
      return true;
    } catch (error) {
      console.error('更新用户使用统计失败:', error);
      return false;
    }
  }

  // 检查使用限制
  async checkUsageLimit(sessionId?: string, userId?: string): Promise<{ canUse: boolean; totalUsage: number; limit: number }> {
    const limit = 10;

    if (userId) {
      // 注册用户没有限制
      return { canUse: true, totalUsage: 0, limit: 0 };
    }

    if (sessionId) {
      const session = await this.getGuestSession(sessionId);
      if (!session) {
        return { canUse: true, totalUsage: 0, limit };
      }

      const totalUsage = session.generateCount + session.compressCount + session.downloadCount;
      return { canUse: totalUsage < limit, totalUsage, limit };
    }

    return { canUse: false, totalUsage: 0, limit };
  }

  // 检查提示词优化限制
  async checkOptimizationLimit(sessionId?: string, userId?: string): Promise<{
    canOptimize: boolean;
    dailyUsed: number;
    dailyLimit: number;
    totalUsed: number;
    isVip: boolean;
    needsPurchase: boolean;
  }> {
    if (userId) {
      // 注册用户
      const users = await this.getAllUsers();
      const user = users.find(u => u.id === userId);

      if (!user) {
        return { canOptimize: false, dailyUsed: 0, dailyLimit: 0, totalUsed: 0, isVip: false, needsPurchase: false };
      }

      // VIP用户无限制
      if (user.isVip) {
        return {
          canOptimize: true,
          dailyUsed: 0,
          dailyLimit: -1, // -1表示无限制
          totalUsed: user.optimizationSettings?.totalOptimizeCount || 0,
          isVip: true,
          needsPurchase: false
        };
      }

      // 普通用户检查每日限制
      const today = new Date().toISOString().split('T')[0];
      const settings = user.optimizationSettings;

      if (!settings) {
        return { canOptimize: false, dailyUsed: 0, dailyLimit: 3, totalUsed: 0, isVip: false, needsPurchase: true };
      }

      // 检查是否是新的一天
      const lastOptimizeDate = settings.lastOptimizeDate;
      let dailyUsed = 0;

      if (lastOptimizeDate === today) {
        // 同一天，计算今日使用次数
        const activities = await this.getUserTodayActivities(userId, 'optimize');
        dailyUsed = activities.length;
      }

      const dailyLimit = settings.dailyOptimizeLimit;
      const purchasedOptimizations = settings.purchasedOptimizations || 0;

      // 可以使用：未达到每日限制 或 有购买的次数
      const canOptimize = dailyUsed < dailyLimit || purchasedOptimizations > 0;
      const needsPurchase = dailyUsed >= dailyLimit && purchasedOptimizations === 0;

      return {
        canOptimize,
        dailyUsed,
        dailyLimit,
        totalUsed: settings.totalOptimizeCount,
        isVip: false,
        needsPurchase
      };
    }

    if (sessionId) {
      // 访客用户 - 每日限制1次
      const session = await this.getGuestSession(sessionId);
      const dailyLimit = 1;
      const dailyUsed = session?.optimizeCount || 0;

      return {
        canOptimize: dailyUsed < dailyLimit,
        dailyUsed,
        dailyLimit,
        totalUsed: dailyUsed,
        isVip: false,
        needsPurchase: dailyUsed >= dailyLimit
      };
    }

    return { canOptimize: false, dailyUsed: 0, dailyLimit: 0, totalUsed: 0, isVip: false, needsPurchase: false };
  }

  // 获取用户今日活动记录
  private async getUserTodayActivities(userId: string, type: string): Promise<any[]> {
    try {
      // 这里应该从用户活动记录中获取今日的活动
      // 简化实现，返回空数组
      return [];
    } catch {
      return [];
    }
  }

  // 购买优化次数
  async purchaseOptimizations(userId: string, count: number): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      const user = users[userIndex];
      if (!user.optimizationSettings) {
        user.optimizationSettings = {
          dailyOptimizeLimit: 3,
          totalOptimizeCount: 0,
          lastOptimizeDate: new Date().toISOString().split('T')[0],
          purchasedOptimizations: 0
        };
      }

      user.optimizationSettings.purchasedOptimizations += count;
      users[userIndex] = user;
      await this.saveUsers(users);

      return true;
    } catch (error) {
      console.error('购买优化次数失败:', error);
      return false;
    }
  }

  // 消费购买的优化次数
  async consumePurchasedOptimization(userId: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      const user = users[userIndex];
      if (!user.optimizationSettings || user.optimizationSettings.purchasedOptimizations <= 0) {
        return false;
      }

      user.optimizationSettings.purchasedOptimizations--;
      users[userIndex] = user;
      await this.saveUsers(users);

      return true;
    } catch (error) {
      console.error('消费购买的优化次数失败:', error);
      return false;
    }
  }
}

export const authStore = new AuthStore(); 