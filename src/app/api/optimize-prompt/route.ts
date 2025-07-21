import { NextRequest, NextResponse } from 'next/server';
import { promptOptimizer, promptAnalyzer } from '@/lib/prompt-optimizer';
import { authStore } from '@/lib/auth-store';
import { userStore } from '@/lib/user-store';

export async function POST(request: NextRequest) {
  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      return NextResponse.json(
        { error: '请求格式错误' },
        { status: 400 }
      );
    }

    const { prompt, userId, sessionId, action = 'optimize' } = requestBody;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入有效的提示词' },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();

    // 如果只是分析，不需要检查限制
    if (action === 'analyze') {
      const analysis = promptAnalyzer.analyzePrompt(trimmedPrompt);
      return NextResponse.json({
        success: true,
        analysis,
        action: 'analyze'
      });
    }

    // 检查优化限制
    const limitCheck = await authStore.checkOptimizationLimit(sessionId, userId);
    
    if (!limitCheck.canOptimize) {
      return NextResponse.json({
        success: false,
        error: '已达到每日优化限制',
        limitInfo: {
          dailyUsed: limitCheck.dailyUsed,
          dailyLimit: limitCheck.dailyLimit,
          isVip: limitCheck.isVip,
          needsPurchase: limitCheck.needsPurchase
        }
      }, { status: 429 });
    }

    // 执行优化
    console.log('🔧 开始优化提示词...');
    console.log('📝 原始提示词:', trimmedPrompt);
    
    const optimizationStartTime = Date.now();
    const result = promptOptimizer.optimizePrompt(trimmedPrompt);
    const optimizationTime = Date.now() - optimizationStartTime;
    
    console.log('✅ 优化完成:', result.optimized);
    console.log(`⏱️ 优化耗时: ${optimizationTime}ms`);

    // 更新使用统计
    if (userId) {
      // 检查是否需要消费购买的次数
      const todayUsed = limitCheck.dailyUsed;
      if (todayUsed >= limitCheck.dailyLimit && !limitCheck.isVip) {
        // 消费购买的优化次数
        await authStore.consumePurchasedOptimization(userId);
      }
      
      await authStore.updateUserUsage(userId, 'optimize');
      
      // 记录用户活动
      await userStore.addUserActivity({
        type: 'optimize' as any,
        title: '提示词优化',
        details: {
          originalPrompt: trimmedPrompt,
          optimizedPrompt: result.optimized,
          score: result.analysis.score,
          improvements: result.improvements
        }
      });
    } else if (sessionId) {
      await authStore.updateGuestUsage(sessionId, 'optimize' as any);
    }

    // 返回优化结果
    return NextResponse.json({
      success: true,
      result: {
        original: result.original,
        optimized: result.optimized,
        analysis: result.analysis,
        improvements: result.improvements,
        timestamp: result.timestamp
      },
      timing: {
        optimizationTime
      },
      limitInfo: {
        dailyUsed: limitCheck.dailyUsed + 1,
        dailyLimit: limitCheck.dailyLimit,
        isVip: limitCheck.isVip
      }
    });

  } catch (error) {
    console.error('提示词优化失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '优化失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}

// 获取优化历史和统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    // 获取限制信息
    const limitCheck = await authStore.checkOptimizationLimit(sessionId || undefined, userId || undefined);

    // 获取用户活动历史（优化记录）
    let optimizationHistory: any[] = [];
    if (userId) {
      const activities = await userStore.getUserActivities(50);
      optimizationHistory = activities
        .filter(activity => activity.type === 'optimize')
        .map(activity => ({
          id: activity.id,
          timestamp: activity.timestamp,
          originalPrompt: activity.details?.originalPrompt || '',
          optimizedPrompt: activity.details?.optimizedPrompt || '',
          score: activity.details?.score || 0,
          improvements: activity.details?.improvements || []
        }));
    }

    return NextResponse.json({
      success: true,
      limitInfo: {
        canOptimize: limitCheck.canOptimize,
        dailyUsed: limitCheck.dailyUsed,
        dailyLimit: limitCheck.dailyLimit,
        totalUsed: limitCheck.totalUsed,
        isVip: limitCheck.isVip,
        needsPurchase: limitCheck.needsPurchase
      },
      history: optimizationHistory
    });

  } catch (error) {
    console.error('获取优化信息失败:', error);
    return NextResponse.json(
      { error: '获取信息失败' },
      { status: 500 }
    );
  }
}
