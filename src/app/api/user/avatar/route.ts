import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件格式，请上传 JPG、PNG 或 WebP 格式' }, { status: 400 });
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 });
    }

    // 转换文件为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 确保头像目录存在
    const avatarDir = path.join(process.cwd(), 'public', 'avatars');
    await fs.mkdir(avatarDir, { recursive: true });

    // 生成文件名
    const fileName = `avatar_${Date.now()}.webp`;
    const filePath = path.join(avatarDir, fileName);

    // 使用Sharp处理图片：调整大小、转换格式、压缩
    await sharp(buffer)
      .resize(200, 200, { fit: 'cover' }) // 裁剪为正方形
      .webp({ quality: 85 }) // 转换为WebP格式并压缩
      .toFile(filePath);

    // 更新用户头像信息
    const avatarUrl = `/avatars/${fileName}`;
    await userStore.updateUserProfile({ avatar: avatarUrl });

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: '头像更新成功'
    });

  } catch (error) {
    console.error('头像上传失败:', error);
    return NextResponse.json({ error: '头像上传失败' }, { status: 500 });
  }
} 