const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const WALLPAPERS_JSON = path.join(__dirname, '../data/wallpapers.json');
const TARGET_FOLDER_ID = 'folder_1760110951738_q830hno4v'; // 优秀作品
const TARGET_FOLDER_DIR = path.join(__dirname, '../public/wallpapers', TARGET_FOLDER_ID);

// Unsplash API配置（使用公开的demo access key）
const UNSPLASH_ACCESS_KEY = 'N_rT5enge6EtvOKW4FCL-w6h09NJWB3wUWUj2jVkUwY';

// 壁纸主题关键词
const KEYWORDS = [
  'nature landscape',
  'mountain scenery',
  'ocean sunset',
  'forest path',
  'city skyline',
  'abstract art',
  'space galaxy',
  'minimalist design',
  'anime scenery',
  'cyberpunk city'
];

// 下载图片
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        file.close();
        fs.unlinkSync(filepath);
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`下载失败: ${response.statusCode}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });

      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// 从Unsplash获取图片
async function fetchFromUnsplash(keyword, count = 3) {
  return new Promise((resolve, reject) => {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=${count}&orientation=landscape`;

    https.get(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    }, (response) => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// 主函数
async function fetchWallpapers() {
  console.log('🚀 开始爬取优质壁纸...\n');

  // 确保目标文件夹存在
  if (!fs.existsSync(TARGET_FOLDER_DIR)) {
    fs.mkdirSync(TARGET_FOLDER_DIR, { recursive: true });
  }

  // 读取现有壁纸数据
  const wallpapers = JSON.parse(fs.readFileSync(WALLPAPERS_JSON, 'utf-8'));

  let totalDownloaded = 0;
  let totalFailed = 0;

  // 从每个关键词获取壁纸
  for (const keyword of KEYWORDS) {
    console.log(`\n📸 搜索主题: ${keyword}`);

    try {
      const images = await fetchFromUnsplash(keyword, 2); // 每个主题2张

      for (const image of images) {
        try {
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 11);
          const filename = `wallpaper_${timestamp}_${randomStr}.jpg`;
          const filepath = path.join(TARGET_FOLDER_DIR, filename);

          // 下载原图（使用regular尺寸，平衡质量和大小）
          console.log(`  ⬇️  下载: ${image.description || image.alt_description || keyword}...`);
          await downloadImage(image.urls.regular, filepath);

          // 创建壁纸元数据
          const wallpaper = {
            id: `wallpaper_${timestamp}_${randomStr}`,
            title: image.description || image.alt_description || `${keyword} wallpaper`,
            prompt: image.description || image.alt_description || keyword,
            imageUrl: `/wallpapers/${TARGET_FOLDER_ID}/${filename}`,
            thumbnailUrl: `/wallpapers/${TARGET_FOLDER_ID}/${filename}`,
            width: image.width || 1920,
            height: image.height || 1080,
            format: 'jpg',
            folderId: TARGET_FOLDER_ID,
            tags: ['精选壁纸', keyword.split(' ')[0]],
            is_public: true,
            createdAt: new Date().toISOString(),
            downloads: 0,
            views: 0,
            likes: 0,
            source: 'Unsplash',
            photographer: image.user.name,
            photographerUrl: image.user.links.html
          };

          wallpapers.push(wallpaper);
          totalDownloaded++;
          console.log(`  ✅ 下载成功: ${wallpaper.title}`);

          // 延迟避免API限流
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
          console.error(`  ❌ 下载失败:`, err.message);
          totalFailed++;
        }
      }

    } catch (err) {
      console.error(`❌ 搜索失败: ${keyword}`, err.message);
    }
  }

  // 保存更新后的壁纸数据
  fs.writeFileSync(WALLPAPERS_JSON, JSON.stringify(wallpapers, null, 2), 'utf-8');

  console.log('\n\n📊 爬取统计:');
  console.log(`   ✅ 成功: ${totalDownloaded}`);
  console.log(`   ❌ 失败: ${totalFailed}`);
  console.log(`   📁 总计: ${wallpapers.length} 张壁纸`);
  console.log('\n🎉 爬取完成！');
}

fetchWallpapers().catch(console.error);
