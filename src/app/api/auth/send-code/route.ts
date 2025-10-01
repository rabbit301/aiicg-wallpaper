import { NextRequest, NextResponse } from 'next/server';
import { verificationService } from '@/lib/email/verification-service';
import { authStore } from '@/lib/auth-store';

/**
 * 发送邮箱验证码
 */
export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json();

    if (!email || !username) {
      return NextResponse.json({
        success: false,
        error: '请提供邮箱和用户名'
      }, { status: 400 });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: '邮箱格式不正确'
      }, { status: 400 });
    }

    // 检查邮箱是否已被注册
    const existingUser = await authStore.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: '该邮箱已被注册'
      }, { status: 400 });
    }

    // 检查用户名是否已被注册
    const existingUsername = await authStore.getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json({
        success: false,
        error: '该用户名已被注册'
      }, { status: 400 });
    }

    // 检查发送冷却时间
    const cooldown = verificationService.getSendCooldown(email);
    if (cooldown > 0) {
      return NextResponse.json({
        success: false,
        error: `请等待 ${Math.ceil(cooldown / 1000)} 秒后再试`,
        cooldown
      }, { status: 429 });
    }

    // 发送验证码
    const result = await verificationService.sendVerificationCode(email, username);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '验证码已发送到您的邮箱，请查收',
        expiresIn: 5 * 60 * 1000 // 5分钟
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        waitTime: result.waitTime
      }, { status: 400 });
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json({
      success: false,
      error: '发送验证码失败，请稍后重试'
    }, { status: 500 });
  }
}
