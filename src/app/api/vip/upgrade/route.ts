import { NextRequest, NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';
import { userStore } from '@/lib/user-store';
import { VIP_PLANS } from '@/lib/vip-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, paymentMethod = 'demo' } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const plan = VIP_PLANS.find(p => p.id === planId);
    if (!plan || plan.id === 'free') {
      return NextResponse.json(
        { error: '无效的套餐类型' },
        { status: 400 }
      );
    }

    // 模拟支付处理
    const paymentResult = await processPayment(userId, plan, paymentMethod);
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || '支付失败' },
        { status: 400 }
      );
    }

    // 更新用户VIP状态 - 使用updateUser公开方法
    const updated = await authStore.updateUser(userId, {
      isVip: true
    });

    if (!updated) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 记录升级活动
    await userStore.addUserActivity({
      type: 'vip_upgrade' as any,
      title: `升级为${plan.name}`,
      details: {
        planId,
        planName: plan.name,
        price: plan.price,
        period: plan.period,
        paymentMethod,
        orderId: paymentResult.orderId
      }
    });

    return NextResponse.json({
      success: true,
      message: `成功升级为${plan.name}`,
      plan: plan,
      orderId: paymentResult.orderId,
      expiry: getVipExpiry(plan)
    });

  } catch (error) {
    console.error('VIP升级失败:', error);
    return NextResponse.json(
      { error: '升级失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取VIP套餐信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let userInfo = null;
    if (userId) {
      const user = await authStore.getUserById(userId);
      if (user) {
        userInfo = {
          currentPlan: 'free', // 简化：默认为免费
          isVip: user.isVip || false,
          vipExpiry: undefined, // User接口中没有此字段
        };
      }
    }

    return NextResponse.json({
      success: true,
      plans: VIP_PLANS,
      userInfo
    });

  } catch (error) {
    console.error('获取VIP信息失败:', error);
    return NextResponse.json(
      { error: '获取VIP信息失败' },
      { status: 500 }
    );
  }
}

// 模拟支付处理
async function processPayment(
  userId: string, 
  plan: any, 
  paymentMethod: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  // 这里应该集成真实的支付系统
  
  if (paymentMethod === 'demo') {
    // 模拟支付成功
    const orderId = `VIP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 模拟支付延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      orderId
    };
  }

  return {
    success: false,
    error: '暂不支持该支付方式'
  };
}

// 计算VIP到期时间
function getVipExpiry(plan: any): string {
  const now = new Date();
  
  switch (plan.period) {
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'lifetime':
      now.setFullYear(now.getFullYear() + 100); // 100年后
      break;
  }
  
  return now.toISOString();
}
