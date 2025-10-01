/**
 * 邮箱验证码服务
 */

import { emailService } from './email-service';

interface VerificationCode {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

class VerificationService {
  private codes: Map<string, VerificationCode> = new Map();
  private readonly CODE_LENGTH = 6;
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5分钟
  private readonly MAX_ATTEMPTS = 3; // 最大验证次数
  private readonly RATE_LIMIT = 60 * 1000; // 1分钟内只能发送一次

  /**
   * 生成验证码
   */
  private generateCode(): string {
    return Math.random().toString().slice(2, 2 + this.CODE_LENGTH);
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string, username: string): Promise<{ success: boolean; error?: string; waitTime?: number }> {
    try {
      // 检查邮箱格式
      if (!this.isValidEmail(email)) {
        return { success: false, error: '邮箱格式不正确' };
      }

      // 检查发送频率限制
      const existing = this.codes.get(email);
      if (existing && Date.now() - existing.createdAt < this.RATE_LIMIT) {
        const waitTime = this.RATE_LIMIT - (Date.now() - existing.createdAt);
        return { 
          success: false, 
          error: `请等待 ${Math.ceil(waitTime / 1000)} 秒后再试`,
          waitTime 
        };
      }

      // 生成新的验证码
      const code = this.generateCode();
      const verificationCode: VerificationCode = {
        email,
        code,
        expiresAt: Date.now() + this.EXPIRY_TIME,
        attempts: 0,
        createdAt: Date.now()
      };

      // 发送邮件
      const emailTemplate = emailService.generateVerificationEmail(code, username);
      const emailResult = await emailService.sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      if (!emailResult.success) {
        return { success: false, error: emailResult.error || '发送邮件失败' };
      }

      // 保存验证码
      this.codes.set(email, verificationCode);

      console.log(`📧 验证码已发送到 ${email}: ${code}`);

      // 清理过期的验证码
      this.cleanup();

      return { success: true };
    } catch (error) {
      console.error('发送验证码失败:', error);
      return { success: false, error: '发送验证码失败，请稍后重试' };
    }
  }

  /**
   * 验证验证码
   */
  verifyCode(email: string, inputCode: string): { success: boolean; error?: string } {
    const verification = this.codes.get(email);

    if (!verification) {
      return { success: false, error: '验证码不存在或已过期' };
    }

    // 检查是否过期
    if (Date.now() > verification.expiresAt) {
      this.codes.delete(email);
      return { success: false, error: '验证码已过期，请重新获取' };
    }

    // 检查尝试次数
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      this.codes.delete(email);
      return { success: false, error: '验证次数过多，请重新获取验证码' };
    }

    // 增加尝试次数
    verification.attempts++;

    // 验证码码
    if (verification.code !== inputCode.trim()) {
      this.codes.set(email, verification);
      const remainingAttempts = this.MAX_ATTEMPTS - verification.attempts;
      return { 
        success: false, 
        error: `验证码错误，还可尝试 ${remainingAttempts} 次` 
      };
    }

    // 验证成功，删除验证码
    this.codes.delete(email);
    console.log(`✅ 邮箱验证成功: ${email}`);

    return { success: true };
  }

  /**
   * 检查邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 清理过期的验证码
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [email, verification] of this.codes.entries()) {
      if (now > verification.expiresAt) {
        this.codes.delete(email);
      }
    }
  }

  /**
   * 获取验证码剩余时间
   */
  getCodeInfo(email: string): { exists: boolean; expiresIn?: number; attemptsLeft?: number } {
    const verification = this.codes.get(email);
    
    if (!verification) {
      return { exists: false };
    }

    const now = Date.now();
    if (now > verification.expiresAt) {
      this.codes.delete(email);
      return { exists: false };
    }

    return {
      exists: true,
      expiresIn: verification.expiresAt - now,
      attemptsLeft: this.MAX_ATTEMPTS - verification.attempts
    };
  }

  /**
   * 获取发送冷却时间
   */
  getSendCooldown(email: string): number {
    const verification = this.codes.get(email);
    if (!verification) return 0;

    const cooldownEnd = verification.createdAt + this.RATE_LIMIT;
    const remaining = cooldownEnd - Date.now();
    
    return Math.max(0, remaining);
  }

  /**
   * 获取统计信息
   */
  getStats(): { activeCodes: number; totalSent: number } {
    this.cleanup();
    return {
      activeCodes: this.codes.size,
      totalSent: 0 // 这里可以添加持久化统计
    };
  }

  /**
   * 强制清除验证码（管理员功能）
   */
  clearCode(email: string): boolean {
    return this.codes.delete(email);
  }
}

// 导出单例
export const verificationService = new VerificationService();

// 定期清理过期验证码
setInterval(() => {
  verificationService['cleanup']();
}, 2 * 60 * 1000); // 每2分钟清理一次
