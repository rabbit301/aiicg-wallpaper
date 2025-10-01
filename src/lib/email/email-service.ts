/**
 * 邮件服务 - 支持多种邮件提供商
 */

interface EmailConfig {
  provider: 'smtp' | 'resend' | 'sendgrid' | 'mock';
  config: Record<string, any>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    // 根据环境变量选择邮件提供商
    this.config = this.getEmailConfig();
  }

  private getEmailConfig(): EmailConfig {
    // 优先级：Resend > SendGrid > SMTP > Mock
    if (process.env.RESEND_API_KEY) {
      console.log('📧 使用Resend邮件服务');
      return {
        provider: 'resend',
        config: {
          apiKey: process.env.RESEND_API_KEY,
          from: process.env.EMAIL_FROM || 'noreply@aiicg.com'
        }
      };
    }

    if (process.env.SENDGRID_API_KEY) {
      return {
        provider: 'sendgrid',
        config: {
          apiKey: process.env.SENDGRID_API_KEY,
          from: process.env.EMAIL_FROM || 'noreply@aiicg.com'
        }
      };
    }

    if (process.env.SMTP_HOST) {
      return {
        provider: 'smtp',
        config: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          from: process.env.EMAIL_FROM || 'noreply@aiicg.com'
        }
      };
    }

    // 默认使用模拟邮件服务（开发环境）
    console.log('📧 使用Mock邮件服务（开发环境）');
    return {
      provider: 'mock',
      config: {
        from: 'noreply@aiicg.com'
      }
    };
  }

  /**
   * 发送邮件
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 发送邮件 [${this.config.provider}]: ${options.to} - ${options.subject}`);

      switch (this.config.provider) {
        case 'resend':
          return await this.sendWithResend(options);
        case 'sendgrid':
          return await this.sendWithSendGrid(options);
        case 'smtp':
          return await this.sendWithSMTP(options);
        case 'mock':
          return await this.sendWithMock(options);
        default:
          throw new Error(`不支持的邮件提供商: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('发送邮件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送邮件失败'
      };
    }
  }

  /**
   * 使用Resend发送邮件
   */
  private async sendWithResend(options: SendEmailOptions) {
    try {
      console.log(`📧 正在通过Resend发送邮件到: ${options.to}`);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.config.config.from,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Resend API错误:', responseData);
        throw new Error(`Resend API错误: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      console.log('✅ 邮件发送成功:', responseData);
      return { success: true };
    } catch (error) {
      console.error('❌ Resend邮件发送失败:', error);
      throw error;
    }
  }

  /**
   * 使用SendGrid发送邮件
   */
  private async sendWithSendGrid(options: SendEmailOptions) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }]
        }],
        from: { email: this.config.config.from },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API错误: ${response.status} - ${error}`);
    }

    return { success: true };
  }

  /**
   * 使用SMTP发送邮件
   */
  private async sendWithSMTP(options: SendEmailOptions) {
    // 这里需要使用nodemailer或类似的SMTP客户端
    // 为了简化，暂时返回成功（实际项目中需要实现）
    console.log('📧 SMTP邮件发送（模拟）:', options);
    return { success: true };
  }

  /**
   * 模拟邮件发送（开发环境）
   */
  private async sendWithMock(options: SendEmailOptions) {
    console.log('\n📧 ===== 模拟邮件发送 =====');
    console.log(`📮 收件人: ${options.to}`);
    console.log(`📝 主题: ${options.subject}`);
    console.log('📄 邮件内容:');

    // 从HTML中提取验证码
    const codeMatch = options.html.match(/<div class="code">(\d+)<\/div>/);
    if (codeMatch) {
      console.log(`\n🔑 验证码: ${codeMatch[1]}`);
      console.log(`⏰ 有效期: 5分钟`);
    }

    console.log('\n💡 提示: 这是开发环境的模拟邮件，验证码已在上方显示');
    console.log('========================\n');

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
  }

  /**
   * 生成验证码邮件模板
   */
  generateVerificationEmail(code: string, username: string): EmailTemplate {
    const subject = 'AIICG壁纸站 - 邮箱验证码';

    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>邮箱验证码</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 2px solid #4F46E5;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #6B7280;
            font-size: 16px;
          }
          .content {
            padding: 0 20px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1F2937;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 6px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .code-label {
            color: #E5E7EB;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .warning {
            background-color: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400E;
          }
          .footer {
            text-align: center;
            padding: 30px 0 20px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
            margin-top: 40px;
          }
          .footer p {
            margin: 5px 0;
          }
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
              padding: 15px;
            }
            .code {
              font-size: 28px;
              letter-spacing: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎨 AIICG壁纸站</div>
            <div class="subtitle">AI智能壁纸生成器</div>
          </div>

          <div class="content">
            <div class="greeting">亲爱的 ${username}，</div>
            <p>感谢您注册AIICG壁纸站！为了确保账户安全，请使用以下验证码完成邮箱验证：</p>

            <div class="code-box">
              <div class="code-label">验证码</div>
              <div class="code">${code}</div>
            </div>

            <div class="warning">
              <strong>⚠️ 重要提醒：</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>验证码有效期：<strong>5分钟</strong></li>
                <li>请勿将验证码告诉他人</li>
                <li>如果您没有注册AIICG壁纸站，请忽略此邮件</li>
              </ul>
            </div>

            <p>完成验证后，您将可以：</p>
            <ul style="color: #4F46E5; padding-left: 20px;">
              <li>🎨 无限制AI壁纸生成</li>
              <li>💾 保存和管理您的作品</li>
              <li>⭐ 收藏喜欢的壁纸</li>
              <li>🎁 获得精美随机头像</li>
            </ul>
          </div>

          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>© 2024 AIICG壁纸站 - 让AI为您创造美丽</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
AIICG壁纸站 - 邮箱验证码

亲爱的 ${username}，

感谢您注册AIICG壁纸站！请使用以下验证码完成邮箱验证：

验证码：${code}

验证码有效期：5分钟

如果您没有注册AIICG壁纸站，请忽略此邮件。

此邮件由系统自动发送，请勿回复
© 2024 AIICG壁纸站 - AI智能壁纸生成器
    `;

    return { subject, html, text };
  }

  /**
   * 检查邮件服务是否可用
   */
  async isAvailable(): Promise<boolean> {
    return this.config.provider !== 'mock' || process.env.NODE_ENV === 'development';
  }

  /**
   * 获取当前邮件提供商
   */
  getProvider(): string {
    return this.config.provider;
  }
}

// 导出单例
export const emailService = new EmailService();
