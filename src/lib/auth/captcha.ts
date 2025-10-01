/**
 * 简单的数学验证码生成器
 */

export interface CaptchaChallenge {
  id: string;
  question: string;
  answer: number;
  expiresAt: number;
}

class CaptchaService {
  private challenges: Map<string, CaptchaChallenge> = new Map();
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5分钟过期

  /**
   * 生成验证码挑战
   */
  generateChallenge(): CaptchaChallenge {
    const id = Math.random().toString(36).substring(2, 15);
    
    // 生成简单的数学题
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let question: string;
    let answer: number;
    
    switch (operator) {
      case '+':
        question = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
        break;
      case '-':
        // 确保结果为正数
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller} = ?`;
        answer = larger - smaller;
        break;
      case '×':
        // 使用较小的数字避免结果过大
        const small1 = Math.floor(Math.random() * 10) + 1;
        const small2 = Math.floor(Math.random() * 10) + 1;
        question = `${small1} × ${small2} = ?`;
        answer = small1 * small2;
        break;
      default:
        question = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
    }

    const challenge: CaptchaChallenge = {
      id,
      question,
      answer,
      expiresAt: Date.now() + this.EXPIRY_TIME
    };

    this.challenges.set(id, challenge);
    
    // 清理过期的挑战
    this.cleanup();
    
    return challenge;
  }

  /**
   * 验证答案
   */
  verifyAnswer(challengeId: string, userAnswer: number): boolean {
    const challenge = this.challenges.get(challengeId);
    
    if (!challenge) {
      return false; // 挑战不存在
    }

    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      return false; // 已过期
    }

    const isCorrect = challenge.answer === userAnswer;
    
    // 验证后删除挑战（一次性使用）
    this.challenges.delete(challengeId);
    
    return isCorrect;
  }

  /**
   * 清理过期的挑战
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(id);
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): { activeChallenges: number } {
    this.cleanup();
    return { activeChallenges: this.challenges.size };
  }
}

// 导出单例
export const captchaService = new CaptchaService();

// 定期清理过期挑战
setInterval(() => {
  captchaService['cleanup']();
}, 2 * 60 * 1000); // 每2分钟清理一次
