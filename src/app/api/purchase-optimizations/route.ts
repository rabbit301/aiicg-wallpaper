import { NextRequest, NextResponse } from 'next/server';
import { authStore } from '@/lib/auth-store';
import { userStore } from '@/lib/user-store';

// 优化次数价格配置
const OPTIMIZATION_PACKAGES = {
  small: { count: 10, price: 9.9, name: '基础包' },
  medium: { count: 30, price: 24.9, name: '标准包' },
  large: { count: 100, price: 69.9, name: '专业包' },
  unlimited: { count: -1, price: 199.9, name: 'VIP会员' } // -1表示升级为VIP
};

export async function POST(request: NextRequest) {
  try {
    const { userId, packageType, paymentMethod = 'demo' } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    if (!packageType || !OPTIMIZATION_PACKAGES[packageType as keyof typeof OPTIMIZATION_PACKAGES]) {
      return NextResponse.json(
        { error: '无效的套餐类型' },
        { status: 400 }
      );
    }

    const package_ = OPTIMIZATION_PACKAGES[packageType as keyof typeof OPTIMIZATION_PACKAGES];

    // 模拟支付处理
    const paymentResult = await processPayment(userId, package_, paymentMethod);
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || '支付失败' },
        { status: 400 }
      );
    }

    // 处理购买结果
    let success = false;

    if (packageType === 'unlimited') {
      // 升级为VIP - 使用updateUser公开方法
      success = await authStore.updateUser(userId, { isVip: true });
    } else {
      // 购买优化次数
      success = await authStore.purchaseOptimizations(userId, package_.count);
    }

    if (success) {
      // 记录购买活动
      await userStore.addUserActivity({
        type: 'purchase' as any,
        title: `购买${package_.name}`,
        details: {
          packageType,
          count: package_.count,
          price: package_.price,
          paymentMethod,
          orderId: paymentResult.orderId
        }
      });

      return NextResponse.json({
        success: true,
        message: packageType === 'unlimited' ? 'VIP升级成功' : `成功购买${package_.count}次优化`,
        package: package_,
        orderId: paymentResult.orderId
      });
    } else {
      return NextResponse.json(
        { error: '购买处理失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('购买处理失败:', error);
    return NextResponse.json(
      { error: '购买失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取套餐信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let userInfo = null;
    if (userId) {
      const user = await authStore.getUserById(userId);
      if (user) {
        userInfo = {
          isVip: user.isVip,
          purchasedOptimizations: user.optimizationSettings?.purchasedOptimizations || 0
        };
      }
    }

    return NextResponse.json({
      success: true,
      packages: OPTIMIZATION_PACKAGES,
      userInfo
    });

  } catch (error) {
    console.error('获取套餐信息失败:', error);
    return NextResponse.json(
      { error: '获取套餐信息失败' },
      { status: 500 }
    );
  }
}

// 模拟支付处理
async function processPayment(
  userId: string, 
  package_: any, 
  paymentMethod: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  // 这里应该集成真实的支付系统，如支付宝、微信支付等
  // 目前使用模拟支付
  
  if (paymentMethod === 'demo') {
    // 模拟支付成功
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 模拟支付延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      orderId
    };
  }

  // 其他支付方式的处理
  return {
    success: false,
    error: '暂不支持该支付方式'
  };
}
