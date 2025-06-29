import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const activities = await userStore.getUserActivities(limit);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('获取用户活动失败:', error);
    return NextResponse.json({ error: '获取用户活动失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const activity = await request.json();
    await userStore.addUserActivity(activity);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('添加用户活动失败:', error);
    return NextResponse.json({ error: '添加用户活动失败' }, { status: 500 });
  }
} 