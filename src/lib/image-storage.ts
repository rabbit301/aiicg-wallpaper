/**
 * 通用图片存储服务
 * 支持多种存储后端：阿里云OSS、Cloudinary、本地存储等
 */

import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

// 存储配置接口
export interface StorageConfig {
  provider: 'oss' | 'cloudinary' | 'local' | 'nas' | 'lsky';
  config: Record<string, any>;
}

// 存储结果接口
export interface StorageResult {
  success: boolean;
  originalUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

// 图片信息接口
export interface ImageInfo {
  url: string;
  filename?: string;
  folder?: string;
  generateThumbnail?: boolean;
}

/**
 * 通用图片存储服务类
 */
export class ImageStorageService {
  private config: StorageConfig;

  constructor(config?: StorageConfig) {
    // 默认配置：优先使用Cloudinary，其次本地存储
    this.config = config || this.getDefaultConfig();
    this.initializeProvider();
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): StorageConfig {
    // 检查环境变量，确定最佳存储方案
    // 优先级：兰空图床 > Cloudinary > OSS > 本地存储
    if (process.env.LSKY_HOST && process.env.LSKY_EMAIL && process.env.LSKY_PASSWORD) {
      return {
        provider: 'lsky',
        config: {
          host: process.env.LSKY_HOST,
          email: process.env.LSKY_EMAIL,
          password: process.env.LSKY_PASSWORD,
          ssl: process.env.LSKY_SSL === 'true',
        }
      };
    }

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      return {
        provider: 'cloudinary',
        config: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        }
      };
    }

    if (process.env.ALIYUN_OSS_ACCESS_KEY_ID && process.env.ALIYUN_OSS_BUCKET) {
      return {
        provider: 'oss',
        config: {
          accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
          accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
          bucket: process.env.ALIYUN_OSS_BUCKET,
          region: process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou',
          endpoint: process.env.ALIYUN_OSS_ENDPOINT,
        }
      };
    }

    // 默认使用本地存储
    return {
      provider: 'local',
      config: {
        baseDir: 'public/wallpapers',
        baseUrl: '/wallpapers'
      }
    };
  }

  /**
   * 初始化存储提供商
   */
  private initializeProvider() {
    switch (this.config.provider) {
      case 'cloudinary':
        cloudinary.config(this.config.config);
        break;
      case 'oss':
        // OSS初始化将在使用时进行
        break;
      case 'local':
        // 本地存储无需初始化
        break;
    }
  }

  /**
   * 存储图片
   */
  async storeImage(imageInfo: ImageInfo): Promise<StorageResult> {
    try {
      console.log(`📁 开始存储图片: ${imageInfo.url}`);
      console.log(`🔧 使用存储提供商: ${this.config.provider}`);

      switch (this.config.provider) {
        case 'lsky':
          return await this.storeToLsky(imageInfo);
        case 'cloudinary':
          return await this.storeToCloudinary(imageInfo);
        case 'oss':
          return await this.storeToOSS(imageInfo);
        case 'local':
          return await this.storeToLocal(imageInfo);
        default:
          throw new Error(`不支持的存储提供商: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('图片存储失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '存储失败'
      };
    }
  }

  /**
   * 存储到兰空图床
   */
  private async storeToLsky(imageInfo: ImageInfo): Promise<StorageResult> {
    try {
      const { host, email, password, ssl = false } = this.config.config;
      const protocol = ssl ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;

      console.log(`🔑 获取兰空图床Token: ${baseUrl}`);

      // 1. 获取Token
      const tokenResponse = await fetch(`${baseUrl}/api/v1/tokens`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`获取Token失败: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.data?.token;

      if (!token) {
        throw new Error('未获取到有效Token');
      }

      console.log('✅ 兰空图床Token获取成功');

      // 2. 下载图片（添加重试机制和更好的错误处理）
      let imageResponse;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 尝试下载图片 (${retryCount + 1}/${maxRetries}): ${imageInfo.url}`);
          // 使用AbortController实现超时
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          imageResponse = await fetch(imageInfo.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': 'https://sc-maas.oss-cn-shanghai.aliyuncs.com/',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (imageResponse.ok) {
            console.log('✅ 图片下载成功');
            break;
          } else {
            console.warn(`⚠️ 图片下载失败 (${retryCount + 1}/${maxRetries}): ${imageResponse.status} ${imageResponse.statusText}`);
            if (retryCount === maxRetries - 1) {
              throw new Error(`下载图片失败: ${imageResponse.status} ${imageResponse.statusText}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ 图片下载异常 (${retryCount + 1}/${maxRetries}):`, error);
          if (retryCount === maxRetries - 1) {
            throw error;
          }
        }

        retryCount++;
        // 等待1秒后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!imageResponse) {
        throw new Error('图片下载失败：无法获取响应');
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const filename = imageInfo.filename || `wallpaper_${nanoid()}`;

      // 3. 上传图片
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      formData.append('file', blob, `${filename}.jpg`);

      const uploadResponse = await fetch(`${baseUrl}/api/v1/upload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`上传图片失败: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.status || !uploadData.data) {
        throw new Error(`上传失败: ${uploadData.message || '未知错误'}`);
      }

      const imageUrl = uploadData.data.links.url;
      console.log('✅ 兰空图床上传成功:', imageUrl);

      // 兰空图床通常会自动生成缩略图，这里使用相同URL
      // 如果需要特定尺寸的缩略图，可以根据兰空图床的缩略图规则生成
      const thumbnailUrl = imageUrl;

      return {
        success: true,
        originalUrl: imageUrl,
        thumbnailUrl,
        metadata: {
          width: uploadData.data.width || 0,
          height: uploadData.data.height || 0,
          format: uploadData.data.extension || 'jpg',
          size: uploadData.data.size || 0
        }
      };
    } catch (error) {
      console.error('兰空图床存储失败:', error);
      throw error;
    }
  }

  /**
   * 存储到Cloudinary
   */
  private async storeToCloudinary(imageInfo: ImageInfo): Promise<StorageResult> {
    try {
      const filename = imageInfo.filename || `wallpaper_${nanoid()}`;
      const folder = imageInfo.folder || 'ai-wallpapers';

      // 上传原图
      const uploadResult = await cloudinary.uploader.upload(imageInfo.url, {
        public_id: `${folder}/${filename}`,
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto',
      });

      console.log('✅ Cloudinary上传成功:', uploadResult.secure_url);

      // 生成缩略图URL
      const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
        width: 400,
        height: 300,
        crop: 'fill',
        quality: 'auto:low',
        format: 'webp'
      });

      return {
        success: true,
        originalUrl: uploadResult.secure_url,
        thumbnailUrl,
        metadata: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.bytes
        }
      };
    } catch (error) {
      console.error('Cloudinary存储失败:', error);
      throw error;
    }
  }

  /**
   * 存储到阿里云OSS
   */
  private async storeToOSS(imageInfo: ImageInfo): Promise<StorageResult> {
    try {
      // 动态导入OSS SDK
      const OSS = (await import('ali-oss')).default;
      
      const client = new OSS(this.config.config);
      const filename = imageInfo.filename || `wallpaper_${nanoid()}.webp`;
      const folder = imageInfo.folder || 'ai-wallpapers';
      const objectName = `${folder}/${filename}`;

      // 下载原图
      const response = await fetch(imageInfo.url);
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // 上传到OSS
      const result = await client.put(objectName, buffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000', // 1年缓存
        }
      });

      console.log('✅ OSS上传成功:', result.url);

      // 生成缩略图（使用OSS图片处理）
      const thumbnailUrl = `${result.url}?x-oss-process=image/resize,w_400,h_300,m_fill/format,webp/quality,q_70`;

      // 获取图片信息
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(buffer).metadata();

      return {
        success: true,
        originalUrl: result.url,
        thumbnailUrl,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'webp',
          size: buffer.length
        }
      };
    } catch (error) {
      console.error('OSS存储失败:', error);
      throw error;
    }
  }

  /**
   * 存储到本地
   */
  private async storeToLocal(imageInfo: ImageInfo): Promise<StorageResult> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const sharp = (await import('sharp')).default;

      const filename = imageInfo.filename || `wallpaper_${nanoid()}`;
      const baseDir = this.config.config.baseDir;
      const baseUrl = this.config.config.baseUrl;

      // 确保目录存在
      const fullDir = path.join(process.cwd(), baseDir);
      await fs.mkdir(fullDir, { recursive: true });

      // 下载原图
      const response = await fetch(imageInfo.url);
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // 处理并保存原图
      const originalFilename = `${filename}.webp`;
      const originalPath = path.join(fullDir, originalFilename);
      
      const processedBuffer = await sharp(buffer)
        .webp({ quality: 85 })
        .toBuffer();
      
      await fs.writeFile(originalPath, processedBuffer);

      // 生成缩略图
      const thumbnailFilename = `${filename}_thumb.webp`;
      const thumbnailPath = path.join(fullDir, thumbnailFilename);
      
      await sharp(buffer)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .webp({ quality: 70 })
        .toFile(thumbnailPath);

      // 获取图片信息
      const metadata = await sharp(buffer).metadata();

      const originalUrl = `${baseUrl}/${originalFilename}`;
      const thumbnailUrl = `${baseUrl}/${thumbnailFilename}`;

      console.log('✅ 本地存储成功:', originalUrl);

      return {
        success: true,
        originalUrl,
        thumbnailUrl,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'webp',
          size: buffer.length
        }
      };
    } catch (error) {
      console.error('本地存储失败:', error);
      throw error;
    }
  }

  /**
   * 批量存储图片
   */
  async storeImages(images: ImageInfo[]): Promise<StorageResult[]> {
    const results: StorageResult[] = [];
    
    for (const image of images) {
      const result = await this.storeImage(image);
      results.push(result);
      
      // 添加延迟避免API限制
      if (this.config.provider === 'cloudinary') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * 获取当前配置信息
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }

  /**
   * 检查存储服务是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'lsky':
          // 兰空图床健康检查 - 尝试获取Token
          const { host, email, password, ssl = false } = this.config.config;
          const protocol = ssl ? 'https' : 'http';
          const baseUrl = `${protocol}://${host}`;

          const response = await fetch(`${baseUrl}/api/v1/tokens`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          return response.ok;
        case 'cloudinary':
          // 简单的ping测试
          await cloudinary.api.ping();
          return true;
        case 'oss':
          // OSS健康检查
          try {
            const OSS = (await import('ali-oss')).default;
            const client = new OSS(this.config.config);
            await client.listBuckets();
            return true;
          } catch {
            return false; // OSS SDK不可用时返回false
          }
        case 'local':
          // 检查本地目录是否可写
          const fs = await import('fs/promises');
          const path = await import('path');
          const testDir = path.join(process.cwd(), this.config.config.baseDir);
          await fs.mkdir(testDir, { recursive: true });
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('存储服务健康检查失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const imageStorage = new ImageStorageService();

// 导出便捷函数
export async function storeWallpaper(
  imageUrl: string, 
  filename?: string
): Promise<StorageResult> {
  return await imageStorage.storeImage({
    url: imageUrl,
    filename,
    folder: 'wallpapers',
    generateThumbnail: true
  });
}

export async function storeAvatar(
  imageUrl: string, 
  filename?: string
): Promise<StorageResult> {
  return await imageStorage.storeImage({
    url: imageUrl,
    filename,
    folder: 'avatars',
    generateThumbnail: true
  });
}
