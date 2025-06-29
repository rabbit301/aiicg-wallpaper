import { NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';

// 检查使用限制
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    const result = await authStore.checkUsageLimit(sessionId || undefined, userId || undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error('检查使用限制失败:', error);
    return NextResponse.json({ error: '检查失败' }, { status: 500 });
  }
}

// 更新使用次数
export async function POST(request: Request) {
  try {
    const { sessionId, userId, type } = await request.json();

    if (!type || !['generate', 'compress', 'download'].includes(type)) {
      return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }

    if (userId) {
      // 更新用户使用统计
      await authStore.updateUserUsage(userId, type);
    } else if (sessionId) {
      // 更新访客使用统计
      await authStore.updateGuestUsage(sessionId, type);
    }

    // 返回最新的使用限制状态
    const result = await authStore.checkUsageLimit(sessionId || undefined, userId || undefined);
    return NextResponse.json({ success: true, usage: result });
  } catch (error) {
    console.error('更新使用统计失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
} 