import { NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';
import { verificationService } from '@/lib/email/verification-service';

export async function POST(request: Request) {
  try {
    const { username, email, password, verificationCode } = await request.json();

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: '用户名至少需要2个字符' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: '请输入邮箱地址' }, { status: 400 });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    if (password && password.length < 6) {
      return NextResponse.json({ error: '密码至少需要6个字符' }, { status: 400 });
    }

    if (!verificationCode || verificationCode.trim().length !== 6) {
      return NextResponse.json({ error: '请输入6位验证码' }, { status: 400 });
    }

    // 验证邮箱验证码
    const codeVerification = verificationService.verifyCode(email.trim(), verificationCode.trim());
    if (!codeVerification.success) {
      return NextResponse.json({ error: codeVerification.error }, { status: 400 });
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