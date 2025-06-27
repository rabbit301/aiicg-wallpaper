import sharp from 'sharp';
import { ImageProcessOptions } from '@/types';
import path from 'path';
import fs from 'fs/promises';

export class ImageProcessor {
  private uploadDir: string;
  private wallpaperDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.wallpaperDir = path.join(process.cwd(), 'public', 'wallpapers');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.wallpaperDir, { recursive: true });
    } catch (error) {
      console.error('创建目录失败:', error);
    }
  }

  async processImage(
    inputBuffer: Buffer,
    filename: string,
    options: ImageProcessOptions
  ): Promise<{ originalPath: string; thumbnailPath: string }> {
    const timestamp = Date.now();
    const baseName = `${timestamp}_${filename.replace(/\.[^/.]+$/, "")}`;
    
    // 原图处理
    const originalFilename = `${baseName}.${options.format}`;
    const originalPath = path.join(this.wallpaperDir, originalFilename);
    
    let sharpInstance = sharp(inputBuffer);
    
    // 360水冷屏幕优化
    if (options.optimize360) {
      sharpInstance = sharpInstance
        .resize(options.width, options.height, {
          fit: 'cover',
          position: 'center'
        })
        .sharpen() // 增强锐度，适合小屏幕显示
        .modulate({
          brightness: 1.1, // 稍微增加亮度
          saturation: 1.2, // 增加饱和度
          hue: 0
        });
    } else {
      sharpInstance = sharpInstance.resize(options.width, options.height, {
        fit: 'cover',
        position: 'center'
      });
    }

    // 根据格式设置质量
    switch (options.format) {
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: options.quality || 85,
          progressive: true 
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: options.quality || 80,
          effort: 6 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          compressionLevel: 6,
          progressive: true 
        });
        break;
    }

    await sharpInstance.toFile(originalPath);

    // 生成缩略图
    const thumbnailFilename = `${baseName}_thumb.webp`;
    const thumbnailPath = path.join(this.wallpaperDir, thumbnailFilename);
    
    await sharp(inputBuffer)
      .resize(300, 200, { fit: 'cover', position: 'center' })
      .webp({ quality: 70 })
      .toFile(thumbnailPath);

    return {
      originalPath: `/wallpapers/${originalFilename}`,
      thumbnailPath: `/wallpapers/${thumbnailFilename}`
    };
  }

  async downloadAndProcess(
    imageUrl: string,
    filename: string,
    options: ImageProcessOptions
  ): Promise<{ originalPath: string; thumbnailPath: string }> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.statusText}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      return await this.processImage(buffer, filename, options);
    } catch (error) {
      console.error('下载并处理图片失败:', error);
      throw error;
    }
  }
}
