import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';

const dataStore = new DataStore();

export async function GET() {
  try {
    // 获取所有壁纸（在真实应用中应该根据用户ID筛选）
    const wallpapers = await dataStore.getAllWallpapers();
    
    // 按创建时间排序，最新的在前
    wallpapers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(wallpapers);
  } catch (error) {
    console.error('获取用户壁纸失败:', error);
    return NextResponse.json({ error: '获取用户壁纸失败' }, { status: 500 });
  }
} 