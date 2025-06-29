import { NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: '请输入用户名' }, { status: 400 });
    }

    const result = await authStore.loginUser(username.trim(), password);

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: {
          id: result.user!.id,
          username: result.user!.username,
          email: result.user!.email,
          avatar: result.user!.avatar,
          joinedAt: result.user!.joinedAt,
          isVip: result.user!.isVip
        }
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('登录处理失败:', error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
} 