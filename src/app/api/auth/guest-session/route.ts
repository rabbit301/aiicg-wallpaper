import { NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';

// 创建访客会话
export async function POST() {
  try {
    const sessionId = await authStore.createGuestSession();
    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('创建访客会话失败:', error);
    return NextResponse.json({ error: '创建会话失败' }, { status: 500 });
  }
}

// 获取访客会话信息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 });
    }

    const session = await authStore.getGuestSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('获取访客会话失败:', error);
    return NextResponse.json({ error: '获取会话失败' }, { status: 500 });
  }
} 