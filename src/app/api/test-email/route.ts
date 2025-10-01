import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';

/**
 * 测试邮件发送功能
 */
export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: '请提供邮箱地址'
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

    // 生成测试验证码
    const testCode = '123456';
    const testUsername = username || '测试用户';

    // 生成邮件模板
    const emailTemplate = emailService.generateVerificationEmail(testCode, testUsername);

    // 发送测试邮件
    const result = await emailService.sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '测试邮件发送成功！请检查您的邮箱',
        provider: emailService.getProvider(),
        testCode: testCode
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '邮件发送失败'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('测试邮件发送失败:', error);
    return NextResponse.json({
      success: false,
      error: '邮件发送失败，请检查配置'
    }, { status: 500 });
  }
}

/**
 * 获取邮件服务状态
 */
export async function GET() {
  try {
    const isAvailable = await emailService.isAvailable();
    const provider = emailService.getProvider();

    return NextResponse.json({
      success: true,
      provider,
      available: isAvailable,
      config: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        emailFrom: process.env.EMAIL_FROM || 'noreply@aiicg.com'
      }
    });
  } catch (error) {
    console.error('获取邮件服务状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取邮件服务状态失败'
    }, { status: 500 });
  }
}
