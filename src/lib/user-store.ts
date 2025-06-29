import { Wallpaper } from '@/types';
import fs from 'fs/promises';
import path from 'path';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  isVip: boolean;
  language: string;
  timezone: string;
  // 隐私设置
  privacySettings?: {
    saveGeneratedImages: boolean;     // 是否保存生成的图片
    saveCompressedImages: boolean;    // 是否保存压缩的图片
    showInHomepage: boolean;          // 是否在首页展示
    maxHomepageImages: number;        // 首页最多展示几张图片
    allowPublicView: boolean;         // 是否允许公开查看作品
  };
  favorites?: string[];
}

interface UserStats {
  generatedWallpapers: number;
  downloads: number;
  compressedImages: number;
  daysActive: number;
}

interface UserActivity {
  id: string;
  type: 'generate' | 'download' | 'compress';
  title: string;
  timestamp: string;
  details?: any;
}

const USER_DATA_FILE = path.join(process.cwd(), 'data', 'user-data.json');
const USER_ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'user-activities.json');

export class UserStore {
  private async ensureDataDirectory() {
    const dataDir = path.dirname(USER_DATA_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error('创建用户数据目录失败:', error);
    }
  }

  // 获取默认用户信息
  private getDefaultUser(): UserProfile {
    return {
      id: 'demo-user',
      username: '演示用户',
      email: 'demo@aiicg.com',
      avatar: '',
      bio: '欢迎来到AIICG壁纸站！',
      joinedAt: '2024-01-01',
      isVip: true,
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      privacySettings: {
        saveGeneratedImages: true,
        saveCompressedImages: false,
        showInHomepage: true,
        maxHomepageImages: 6,
        allowPublicView: true
      },
      favorites: []
    };
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(USER_DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // 文件不存在时返回默认用户
      return this.getDefaultUser();
    }
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile();
      const updatedProfile = { ...currentProfile, ...profile };
      
      await this.ensureDataDirectory();
      await fs.writeFile(USER_DATA_FILE, JSON.stringify(updatedProfile, null, 2));
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      // 从壁纸数据和活动记录中计算统计信息
      const wallpapersFile = path.join(process.cwd(), 'data', 'wallpapers.json');
      const activitiesFile = USER_ACTIVITIES_FILE;
      
      let generatedWallpapers = 0;
      let totalDownloads = 0;
      let compressedImages = 0;
      
      // 计算生成的壁纸数量和下载次数
      try {
        const wallpapersData = await fs.readFile(wallpapersFile, 'utf-8');
        const wallpapers: Wallpaper[] = JSON.parse(wallpapersData);
        generatedWallpapers = wallpapers.length;
        totalDownloads = wallpapers.reduce((total, w) => total + w.downloads, 0);
      } catch (error) {
        // 文件不存在时保持默认值
      }
      
      // 计算压缩图片数量
      try {
        const activitiesData = await fs.readFile(activitiesFile, 'utf-8');
        const activities: UserActivity[] = JSON.parse(activitiesData);
        compressedImages = activities.filter(a => a.type === 'compress').length;
      } catch (error) {
        // 文件不存在时保持默认值
      }
      
      // 计算活跃天数（简化为从加入日期到现在的天数）
      const profile = await this.getUserProfile();
      const joinDate = new Date(profile.joinedAt);
      const now = new Date();
      const daysActive = Math.ceil((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        generatedWallpapers,
        downloads: totalDownloads,
        compressedImages,
        daysActive: Math.max(1, daysActive)
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return {
        generatedWallpapers: 0,
        downloads: 0,
        compressedImages: 0,
        daysActive: 1
      };
    }
  }

  async addUserActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const activities = await this.getUserActivities();
      const newActivity: UserActivity = {
        ...activity,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      activities.unshift(newActivity);
      
      // 保留最近100条记录
      if (activities.length > 100) {
        activities.splice(100);
      }
      
      await this.ensureDataDirectory();
      await fs.writeFile(USER_ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
    } catch (error) {
      console.error('添加用户活动失败:', error);
    }
  }

  async getUserActivities(limit: number = 20): Promise<UserActivity[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(USER_ACTIVITIES_FILE, 'utf-8');
      const activities: UserActivity[] = JSON.parse(data);
      return activities.slice(0, limit);
    } catch (error) {
      // 文件不存在时返回空数组
      return [];
    }
  }

  // 获取用户收藏的壁纸
  async getUserFavorites(): Promise<string[]> {
    try {
      const profile = await this.getUserProfile();
      return (profile as any).favorites || [];
    } catch (error) {
      return [];
    }
  }

  // 添加/移除收藏
  async toggleFavorite(wallpaperId: string): Promise<boolean> {
    try {
      const favorites = await this.getUserFavorites();
      const index = favorites.indexOf(wallpaperId);
      
      if (index > -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push(wallpaperId);
      }
      
      await this.updateUserProfile({ favorites } as any);
      return index === -1; // 返回是否已添加到收藏
    } catch (error) {
      console.error('切换收藏状态失败:', error);
      return false;
    }
  }
}

export const userStore = new UserStore(); 