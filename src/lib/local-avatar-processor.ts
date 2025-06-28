/**
 * 本地头像资源处理器
 * 用于处理本地静态头像文件
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

interface LocalAvatar {
  id: string;
  title: string;
  url: string;
  webp_url: string;
  width: number;
  height: number;
  category: 'avatar';
  tags: string[];
  rating: string;
  fileSize: number;
  fileName: string;
  localPath: string;
}

class LocalAvatarProcessor {
  private sourceDir: string;
  private targetDir: string;

  constructor(sourceDir: string = 'C:\\workSpace\\AI\\claw\\downloads\\头像') {
    this.sourceDir = sourceDir;
    this.targetDir = path.join(process.cwd(), 'public', 'avatars');
  }

  /**
   * 扫描本地头像文件
   */
  async scanLocalAvatars(): Promise<LocalAvatar[]> {
    try {
      // 确保目标目录存在
      await fs.mkdir(this.targetDir, { recursive: true });

      // 检查源目录是否存在
      try {
        await fs.access(this.sourceDir);
      } catch {
        console.warn(`源目录不存在: ${this.sourceDir}`);
        return [];
      }

      const files = await fs.readdir(this.sourceDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)
      );

      console.log(`找到 ${imageFiles.length} 个头像文件`);

      const avatars: LocalAvatar[] = [];

      for (const fileName of imageFiles) {
        try {
          const sourcePath = path.join(this.sourceDir, fileName);
          const stats = await fs.stat(sourcePath);
          
          // 生成唯一ID
          const id = this.generateId(fileName);
          
          // 复制文件到public目录
          const targetFileName = `${id}_${fileName}`;
          const targetPath = path.join(this.targetDir, targetFileName);
          
          await fs.copyFile(sourcePath, targetPath);
          
          // 获取图片尺寸（简单估算，实际项目中可以使用sharp等库）
          const dimensions = await this.getImageDimensions(targetPath);
          
          const avatar: LocalAvatar = {
            id,
            title: this.generateTitle(fileName),
            url: `/avatars/${targetFileName}`,
            webp_url: `/avatars/${targetFileName}`,
            width: dimensions.width,
            height: dimensions.height,
            category: 'avatar',
            tags: this.extractTags(fileName),
            rating: 'g',
            fileSize: stats.size,
            fileName: targetFileName,
            localPath: targetPath
          };

          avatars.push(avatar);
          
        } catch (error) {
          console.error(`处理文件失败 ${fileName}:`, error);
        }
      }

      console.log(`成功处理 ${avatars.length} 个头像文件`);
      return avatars;

    } catch (error) {
      console.error('扫描本地头像失败:', error);
      return [];
    }
  }

  /**
   * 生成文件ID
   */
  private generateId(fileName: string): string {
    const hash = createHash('md5').update(fileName + Date.now()).digest('hex');
    return `local_${hash.substring(0, 8)}`;
  }

  /**
   * 生成标题
   */
  private generateTitle(fileName: string): string {
    const nameWithoutExt = path.parse(fileName).name;
    // 简单的标题生成逻辑
    return nameWithoutExt
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim() || 'Local Avatar';
  }

  /**
   * 提取标签
   */
  private extractTags(fileName: string): string[] {
    const nameWithoutExt = path.parse(fileName).name.toLowerCase();
    const tags = ['local', 'avatar'];
    
    // 根据文件名添加标签
    if (nameWithoutExt.includes('anime')) tags.push('anime');
    if (nameWithoutExt.includes('cute')) tags.push('cute');
    if (nameWithoutExt.includes('girl')) tags.push('girl');
    if (nameWithoutExt.includes('boy')) tags.push('boy');
    if (nameWithoutExt.includes('cat')) tags.push('cat');
    if (nameWithoutExt.includes('dog')) tags.push('dog');
    if (nameWithoutExt.includes('cartoon')) tags.push('cartoon');
    
    return tags;
  }

  /**
   * 获取图片尺寸（简单实现）
   */
  private async getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
    try {
      // 如果安装了sharp，可以使用更精确的方法
      const sharp = await import('sharp').catch(() => null);
      if (sharp) {
        const metadata = await sharp.default(filePath).metadata();
        return {
          width: metadata.width || 200,
          height: metadata.height || 200
        };
      }
    } catch (error) {
      console.warn('无法获取图片尺寸，使用默认值:', error);
    }
    
    // 默认尺寸
    return { width: 200, height: 200 };
  }

  /**
   * 清理目标目录
   */
  async cleanTargetDir(): Promise<void> {
    try {
      const files = await fs.readdir(this.targetDir);
      for (const file of files) {
        if (file.startsWith('local_')) {
          await fs.unlink(path.join(this.targetDir, file));
        }
      }
      console.log('清理目标目录完成');
    } catch (error) {
      console.error('清理目标目录失败:', error);
    }
  }
}

/**
 * 合并本地头像和Giphy头像数据
 */
export async function mergeAvatarData(giphyAvatars: any[] = []): Promise<any[]> {
  const processor = new LocalAvatarProcessor();
  const localAvatars = await processor.scanLocalAvatars();
  
  console.log(`合并数据: ${localAvatars.length} 个本地头像 + ${giphyAvatars.length} 个Giphy头像`);
  
  return [...localAvatars, ...giphyAvatars];
}

export { LocalAvatarProcessor, type LocalAvatar };
