import { NextRequest, NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';
import { rateLimiter } from '@/lib/auth/rate-limiter';
import { captchaService } from '@/lib/auth/captcha';

export async function POST(request: NextRequest) {
  try {
    const { username, password, captchaId, captchaAnswer } = await request.json();

    // 获取客户端IP
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    const identifier = `${clientIP}_${username || 'unknown'}`;

    // 检查是否被限制
    if (rateLimiter.isBlocked(identifier)) {
      const blockTime = rateLimiter.getBlockTimeRemaining(identifier);
      return NextResponse.json({
        error: `登录失败次数过多，请 ${Math.ceil(blockTime / 1000 / 60)} 分钟后再试`,
        blocked: true,
        blockTimeRemaining: blockTime
      }, { status: 429 });
    }

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: '请输入用户名或邮箱' }, { status: 400 });
    }

    // 获取剩余尝试次数，如果少于3次则需要验证码
    const remainingAttempts = rateLimiter.getRemainingAttempts(identifier);
    if (remainingAttempts <= 2) {
      if (!captchaId || captchaAnswer === undefined) {
        return NextResponse.json({
          error: '请完成验证码验证',
          requireCaptcha: true,
          remainingAttempts
        }, { status: 400 });
      }

      // 验证验证码
      if (!captchaService.verifyAnswer(captchaId, parseInt(captchaAnswer))) {
        const limitResult = rateLimiter.recordAttempt(identifier, false);
        return NextResponse.json({
          error: '验证码错误',
          requireCaptcha: true,
          remainingAttempts: limitResult.remainingAttempts,
          blocked: limitResult.blocked
        }, { status: 400 });
      }
    }

    // 支持用户名或邮箱登录
    const loginIdentifier = username.trim();
    const result = await authStore.loginUserByUsernameOrEmail(loginIdentifier, password);

    if (result.success) {
      // 登录成功，清除限制记录
      rateLimiter.recordAttempt(identifier, true);

      // 设置cookie（用于API权限验证）
      const response = NextResponse.json({
        success: true,
        user: {
          id: result.user!.id,
          username: result.user!.username,
          email: result.user!.email,
          avatar: result.user!.avatar,
          joinedAt: result.user!.joinedAt,
          isVip: result.user!.isVip,
          role: result.user!.role,
          permissions: result.user!.permissions
        }
      });

      // 为超级管理员设置特殊的auth token
      if (result.user!.role === 'super_admin') {
        const token = Buffer.from(JSON.stringify({
          userId: result.user!.id,
          username: result.user!.username,
          role: result.user!.role,
          timestamp: Date.now()
        })).toString('base64');

        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 24小时
        });
      }

      return response;
    } else {
      // 登录失败，记录尝试
      const limitResult = rateLimiter.recordAttempt(identifier, false);

      return NextResponse.json({
        error: result.error,
        remainingAttempts: limitResult.remainingAttempts,
        requireCaptcha: limitResult.remainingAttempts <= 2,
        blocked: limitResult.blocked
      }, { status: 400 });
    }
  } catch (error) {
    console.error('登录处理失败:', error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}

/**
 * 检查登录状态
 */
export async function GET(request: NextRequest) {
  try {
    // 检查auth_token cookie
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({
        success: false,
        error: '未登录'
      }, { status: 401 });
    }

    // 验证token
    try {
      const payload = JSON.parse(Buffer.from(authToken, 'base64').toString());

      // 检查token是否过期（24小时）
      if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
        return NextResponse.json({
          success: false,
          error: 'Token已过期'
        }, { status: 401 });
      }

      // 检查是否为超级管理员
      if (payload.username === 'rabbitc' && payload.role === 'super_admin') {
        return NextResponse.json({
          success: true,
          user: {
            id: payload.userId,
            username: payload.username,
            role: payload.role,
            permissions: ['view_wallpapers', 'generate_wallpapers', 'delete_own_wallpapers', 'delete_any_wallpapers', 'manage_users', 'system_admin']
          }
        });
      }
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Token无效'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: '权限不足'
    }, { status: 403 });
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '检查登录状态失败'
    }, { status: 500 });
  }
}