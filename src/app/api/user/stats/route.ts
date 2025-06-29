import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';

export async function GET() {
  try {
    const stats = await userStore.getUserStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json({ error: '获取用户统计失败' }, { status: 500 });
  }
} 