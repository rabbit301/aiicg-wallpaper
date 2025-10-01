/**
 * 登录速率限制器 - 防暴力破解
 */

interface LoginAttempt {
  ip: string;
  username: string;
  timestamp: number;
  success: boolean;
}

interface RateLimitInfo {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitInfo> = new Map();
  private readonly MAX_ATTEMPTS = 5; // 最大尝试次数
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15分钟封禁
  private readonly WINDOW_DURATION = 5 * 60 * 1000; // 5分钟窗口期

  /**
   * 检查是否被限制
   */
  isBlocked(identifier: string): boolean {
    const info = this.attempts.get(identifier);
    if (!info) return false;

    const now = Date.now();
    
    // 检查是否在封禁期内
    if (info.blockedUntil && now < info.blockedUntil) {
      return true;
    }

    // 清理过期的封禁
    if (info.blockedUntil && now >= info.blockedUntil) {
      this.attempts.delete(identifier);
      return false;
    }

    return false;
  }

  /**
   * 记录登录尝试
   */
  recordAttempt(identifier: string, success: boolean): { blocked: boolean; remainingAttempts: number; blockDuration?: number } {
    const now = Date.now();
    let info = this.attempts.get(identifier);

    if (!info) {
      info = { attempts: 0, lastAttempt: now };
    }

    // 如果距离上次尝试超过窗口期，重置计数
    if (now - info.lastAttempt > this.WINDOW_DURATION) {
      info.attempts = 0;
    }

    // 成功登录，清除记录
    if (success) {
      this.attempts.delete(identifier);
      return { blocked: false, remainingAttempts: this.MAX_ATTEMPTS };
    }

    // 失败登录，增加计数
    info.attempts++;
    info.lastAttempt = now;

    // 检查是否需要封禁
    if (info.attempts >= this.MAX_ATTEMPTS) {
      info.blockedUntil = now + this.BLOCK_DURATION;
      this.attempts.set(identifier, info);
      
      console.warn(`🚫 IP ${identifier} 因多次登录失败被封禁 ${this.BLOCK_DURATION / 1000 / 60} 分钟`);
      
      return { 
        blocked: true, 
        remainingAttempts: 0,
        blockDuration: this.BLOCK_DURATION 
      };
    }

    this.attempts.set(identifier, info);
    return { 
      blocked: false, 
      remainingAttempts: this.MAX_ATTEMPTS - info.attempts 
    };
  }

  /**
   * 获取剩余尝试次数
   */
  getRemainingAttempts(identifier: string): number {
    const info = this.attempts.get(identifier);
    if (!info) return this.MAX_ATTEMPTS;

    const now = Date.now();
    
    // 如果超过窗口期，重置
    if (now - info.lastAttempt > this.WINDOW_DURATION) {
      return this.MAX_ATTEMPTS;
    }

    return Math.max(0, this.MAX_ATTEMPTS - info.attempts);
  }

  /**
   * 获取封禁剩余时间（毫秒）
   */
  getBlockTimeRemaining(identifier: string): number {
    const info = this.attempts.get(identifier);
    if (!info || !info.blockedUntil) return 0;

    const remaining = info.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * 清理过期记录
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.attempts.entries()) {
      // 清理过期的窗口期记录
      if (now - info.lastAttempt > this.WINDOW_DURATION && !info.blockedUntil) {
        this.attempts.delete(key);
      }
      // 清理过期的封禁记录
      else if (info.blockedUntil && now >= info.blockedUntil) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): { totalAttempts: number; blockedIPs: number } {
    let totalAttempts = 0;
    let blockedIPs = 0;
    const now = Date.now();

    for (const info of this.attempts.values()) {
      totalAttempts += info.attempts;
      if (info.blockedUntil && now < info.blockedUntil) {
        blockedIPs++;
      }
    }

    return { totalAttempts, blockedIPs };
  }
}

// 导出单例
export const rateLimiter = new RateLimiter();

// 定期清理过期记录
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000); // 每5分钟清理一次
