import { NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: '用户名至少需要2个字符' }, { status: 400 });
    }

    if (password && password.length < 6) {
      return NextResponse.json({ error: '密码至少需要6个字符' }, { status: 400 });
    }

    const result = await authStore.registerUser(username.trim(), email?.trim(), password);

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
    console.error('注册处理失败:', error);
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
  }
} 