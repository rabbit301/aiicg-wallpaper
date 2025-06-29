import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';

export async function GET() {
  try {
    const profile = await userStore.getUserProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    return NextResponse.json({ error: '获取用户资料失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    await userStore.updateUserProfile(updates);
    const updatedProfile = await userStore.getUserProfile();
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return NextResponse.json({ error: '更新用户资料失败' }, { status: 500 });
  }
} 