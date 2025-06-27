import { Wallpaper } from '@/types';
import fs from 'fs/promises';
import path from 'path';

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
      return JSON.parse(data);
    } catch (error) {
      // 文件不存在时返回空数组
      return [];
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
      wallpaper.tags.includes(tag)
    );
  }

  async getPopularWallpapers(limit: number = 10): Promise<Wallpaper[]> {
    const wallpapers = await this.getAllWallpapers();
    return wallpapers
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }
}
