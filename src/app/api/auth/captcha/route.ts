import { NextResponse } from 'next/server';
import { captchaService } from '@/lib/auth/captcha';

/**
 * 获取验证码挑战
 */
export async function GET() {
  try {
    const challenge = captchaService.generateChallenge();
    
    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge.id,
        question: challenge.question
        // 不返回答案
      }
    });
  } catch (error) {
    console.error('生成验证码失败:', error);
    return NextResponse.json({
      success: false,
      error: '生成验证码失败'
    }, { status: 500 });
  }
}
