import { Wallpaper } from '@/types';
import fs from 'fs/promises';
import path from 'path';
import { sanitizeWallpapers, createDefaultWallpapers } from './image-utils';

const DATA_FILE = path.join(process.cwd(), 'data', 'wallpapers.json');

export class DataStore {
  private async ensureDataDirectory() {
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error('创建数据目录失败:', error);
    }
  }

  async getAllWallpapers(): Promise<Wallpaper[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      const wallpapers = JSON.parse(data);
      
      // 验证和清理图片链接
      const sanitizedWallpapers = sanitizeWallpapers(wallpapers);
      
      // 如果所有壁纸都无效，返回默认壁纸
      if (sanitizedWallpapers.length === 0) {
        console.log('📷 没有有效壁纸，返回默认壁纸');
        return createDefaultWallpapers();
      }
      
      return sanitizedWallpapers;
    } catch (error) {
      console.log('📷 读取壁纸文件失败，返回默认壁纸');
      // 文件不存在或解析失败时返回默认壁纸
      return createDefaultWallpapers();
    }
  }

  async saveWallpaper(wallpaper: Wallpaper): Promise<void> {
    try {
      const wallpapers = await this.getAllWallpapers();
      wallpapers.unshift(wallpaper); // 新的壁纸放在最前面

      await this.ensureDataDirectory();
      await fs.writeFile(DATA_FILE, JSON.stringify(wallpapers, null, 2));
    } catch (error) {
      console.error('保存壁纸数据失败:', error);
      throw error;
    }
  }

  async getWallpaperById(id: string): Promise<Wallpaper | null> {
    const wallpapers = await this.getAllWallpapers();
    return wallpapers.find(w => w.id === id) || null;
  }

  /**
   * 删除壁纸
   */
  async deleteWallpaper(id: string): Promise<boolean> {
    try {
      const wallpapers = await this.getAllWallpapers();
      const index = wallpapers.findIndex(w => w.id === id);

      if (index === -1) {
        return false; // 壁纸不存在
      }

      // 删除壁纸
      wallpapers.splice(index, 1);

      // 保存更新后的数据
      await this.ensureDataDirectory();
      await fs.writeFile(DATA_FILE, JSON.stringify(wallpapers, null, 2));

      console.log(`🗑️ 壁纸删除成功: ${id}`);
      return true;
    } catch (error) {
      console.error('删除壁纸失败:', error);
      return false;
    }
  }

  async updateWallpaperDownloads(id: string): Promise<void> {
    try {
      const wallpapers = await this.getAllWallpapers();
      const wallpaper = wallpapers.find(w => w.id === id);

      if (wallpaper) {
        wallpaper.downloads += 1;
        await fs.writeFile(DATA_FILE, JSON.stringify(wallpapers, null, 2));
      }
    } catch (error) {
      console.error('更新下载次数失败:', error);
    }
  }

  async searchWallpapers(query: string): Promise<Wallpaper[]> {
    const wallpapers = await this.getAllWallpapers();
    const lowerQuery = query.toLowerCase();

    return wallpapers.filter(wallpaper =>
      wallpaper.title.toLowerCase().includes(lowerQuery) ||
      wallpaper.prompt.toLowerCase().includes(lowerQuery) ||
      wallpaper.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getWallpapersByTag(tag: string): Promise<Wallpaper[]> {
    const wallpapers = await this.getAllWallpapers();
    return wallpapers.filter(wallpaper =>
      wallpaper.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  async getPopularWallpapers(limit: number = 20): Promise<Wallpaper[]> {
    const wallpapers = await this.getAllWallpapers();
    return wallpapers
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  async getRecentWallpapers(limit: number = 20): Promise<Wallpaper[]> {
    const wallpapers = await this.getAllWallpapers();
    return wallpapers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * 清理和修复数据文件中的无效图片链接
   */
  async cleanupInvalidImages(): Promise<void> {
    try {
      console.log('🧹 开始清理无效图片链接...');
      
      const wallpapers = await this.getAllWallpapers();
      const cleanedWallpapers = sanitizeWallpapers(wallpapers);
      
      // 保存清理后的数据
      await this.ensureDataDirectory();
      await fs.writeFile(DATA_FILE, JSON.stringify(cleanedWallpapers, null, 2));
      
      console.log(`✅ 图片链接清理完成，处理了 ${wallpapers.length} 个壁纸`);
    } catch (error) {
      console.error('清理图片链接失败:', error);
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    total: number;
    totalDownloads: number;
    popularTags: Array<{ tag: string; count: number }>;
  }> {
    const wallpapers = await this.getAllWallpapers();
    
    const totalDownloads = wallpapers.reduce((sum, w) => sum + w.downloads, 0);
    
    // 统计标签
    const tagCounts: Record<string, number> = {};
    wallpapers.forEach(w => {
      w.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: wallpapers.length,
      totalDownloads,
      popularTags
    };
  }
}
