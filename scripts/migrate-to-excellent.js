const fs = require('fs');
const path = require('path');

const WALLPAPERS_JSON = path.join(__dirname, '../data/wallpapers.json');
const WALLPAPERS_DIR = path.join(__dirname, '../public/wallpapers');
const TARGET_FOLDER_ID = 'folder_1760110951738_q830hno4v'; // 优秀作品文件夹ID
const TARGET_FOLDER_DIR = path.join(WALLPAPERS_DIR, TARGET_FOLDER_ID);

async function migrateWallpapers() {
  console.log('🚀 开始迁移壁纸到"优秀作品"文件夹...\n');

  // 读取壁纸数据
  const wallpapers = JSON.parse(fs.readFileSync(WALLPAPERS_JSON, 'utf-8'));

  // 确保目标文件夹存在
  if (!fs.existsSync(TARGET_FOLDER_DIR)) {
    fs.mkdirSync(TARGET_FOLDER_DIR, { recursive: true });
    console.log('✅ 创建目标文件夹:', TARGET_FOLDER_DIR);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const wallpaper of wallpapers) {
    // 跳过已经在文件夹中的壁纸
    if (wallpaper.folderId) {
      console.log(`⏭️  跳过: ${wallpaper.title} (已在文件夹 ${wallpaper.folderId})`);
      skipCount++;
      continue;
    }

    // 跳过外部图床的壁纸（如兰空图床）
    if (wallpaper.imageUrl.includes('http://') || wallpaper.imageUrl.includes('https://')) {
      console.log(`⏭️  跳过: ${wallpaper.title} (外部图床)`);
      // 但更新元数据，标记为优秀作品文件夹
      wallpaper.folderId = TARGET_FOLDER_ID;
      wallpaper.is_public = true;
      skipCount++;
      continue;
    }

    try {
      // 处理本地文件
      const oldPath = path.join(__dirname, '../public', wallpaper.imageUrl);

      if (!fs.existsSync(oldPath)) {
        console.log(`❌ 文件不存在: ${wallpaper.imageUrl}`);
        errorCount++;
        continue;
      }

      // 生成新文件名
      const ext = path.extname(wallpaper.imageUrl);
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const newFileName = `wallpaper_${timestamp}_${randomStr}${ext}`;
      const newPath = path.join(TARGET_FOLDER_DIR, newFileName);

      // 复制文件到新位置
      fs.copyFileSync(oldPath, newPath);

      // 更新壁纸元数据
      wallpaper.imageUrl = `/wallpapers/${TARGET_FOLDER_ID}/${newFileName}`;
      wallpaper.thumbnailUrl = `/wallpapers/${TARGET_FOLDER_ID}/${newFileName}`;
      wallpaper.folderId = TARGET_FOLDER_ID;
      wallpaper.is_public = true;

      console.log(`✅ 迁移成功: ${wallpaper.title}`);
      successCount++;

      // 删除旧文件（可选，注释掉以保留原文件）
      // fs.unlinkSync(oldPath);

    } catch (error) {
      console.error(`❌ 迁移失败: ${wallpaper.title}`, error.message);
      errorCount++;
    }
  }

  // 保存更新后的壁纸数据
  fs.writeFileSync(WALLPAPERS_JSON, JSON.stringify(wallpapers, null, 2), 'utf-8');

  console.log('\n📊 迁移统计:');
  console.log(`   ✅ 成功: ${successCount}`);
  console.log(`   ⏭️  跳过: ${skipCount}`);
  console.log(`   ❌ 失败: ${errorCount}`);
  console.log(`   📁 总计: ${wallpapers.length}`);
  console.log('\n🎉 迁移完成！');
}

migrateWallpapers().catch(console.error);
