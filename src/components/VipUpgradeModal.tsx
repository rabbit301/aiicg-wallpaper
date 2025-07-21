'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Zap, Star, Check, CreditCard, Sparkles, Image, Wand2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { VIP_PLANS, VipService, type VipPlan } from '@/lib/vip-service';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  feature?: 'promptOptimization' | 'imageCompression' | 'aiGeneration';
  trigger?: string; // 触发升级的原因
}

export default function VipUpgradeModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  feature,
  trigger 
}: VipUpgradeModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<VipPlan | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentPlan(VipService.getUserPlan(user));
    }
  }, [user]);

  const handlePurchase = async () => {
    if (!selectedPlan || !user?.id) return;

    setIsPurchasing(true);
    try {
      const response = await fetch('/api/vip/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planId: selectedPlan,
          paymentMethod: 'demo'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`升级成功！欢迎成为${data.plan.name}！`);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(`升级失败：${data.error}`);
      }
    } catch (error) {
      console.error('升级失败:', error);
      alert('升级失败，请稍后重试');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'promptOptimization': return <Wand2 className="h-5 w-5" />;
      case 'imageCompression': return <Image className="h-5 w-5" />;
      case 'aiGeneration': return <Sparkles className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'promptOptimization': return 'AI提示词优化';
      case 'imageCompression': return 'AI图片压缩';
      case 'aiGeneration': return 'AI壁纸生成';
      default: return 'VIP功能';
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'pro': return <Crown className="h-6 w-6" />;
      case 'enterprise': return <Star className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'from-blue-500 to-cyan-500';
      case 'pro': return 'from-purple-500 to-pink-500';
      case 'enterprise': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  const availablePlans = VIP_PLANS.filter(plan => plan.id !== 'free');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="h-7 w-7 text-yellow-500 mr-2" />
              升级VIP会员
            </h2>
            {feature && trigger && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                {getFeatureIcon(feature)}
                <span className="ml-2">
                  {trigger === 'limit_reached' && `${getFeatureName(feature)}已达使用限制`}
                  {trigger === 'feature_locked' && `解锁${getFeatureName(feature)}高级功能`}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 当前状态 */}
        {currentPlan && (
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">当前计划</h3>
                <p className="text-blue-700 dark:text-blue-400">
                  {currentPlan.name} - {currentPlan.description}
                </p>
              </div>
              {currentPlan.id !== 'free' && (
                <Crown className="h-8 w-8 text-yellow-500" />
              )}
            </div>
          </div>
        )}

        {/* 套餐选择 */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 transform scale-105'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                } ${plan.popular ? 'ring-2 ring-purple-300' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* 推荐标签 */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      {plan.badge || '推荐'}
                    </span>
                  </div>
                )}

                {/* 选中标识 */}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {/* 图标 */}
                  <div className={`inline-flex p-3 rounded-full mb-4 bg-gradient-to-r ${getPlanColor(plan.id)} text-white`}>
                    {getPlanIcon(plan.id)}
                  </div>

                  {/* 套餐名称 */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  {/* 价格 */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ¥{plan.price}
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                        /{plan.period === 'monthly' ? '月' : plan.period === 'yearly' ? '年' : '永久'}
                      </span>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>

                  {/* 核心特性 */}
                  <div className="text-left space-y-2">
                    {/* 提示词优化 */}
                    <div className="flex items-center text-sm">
                      <Wand2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        提示词优化: {plan.features.promptOptimization.dailyLimit === -1 ? '无限制' : `${plan.features.promptOptimization.dailyLimit}次/日`}
                      </span>
                    </div>

                    {/* 图片压缩 */}
                    <div className="flex items-center text-sm">
                      <Image className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {plan.features.imageCompression.aiCompression ? 'AI智能压缩' : '基础压缩'}
                      </span>
                    </div>

                    {/* AI生成 */}
                    <div className="flex items-center text-sm">
                      <Sparkles className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        AI生成: {plan.features.aiGeneration.dailyLimit === -1 ? '无限制' : `${plan.features.aiGeneration.dailyLimit}次/日`}
                      </span>
                    </div>

                    {/* 云存储 */}
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        云存储: {plan.features.general.cloudStorage}GB
                      </span>
                    </div>

                    {/* 其他特性 */}
                    {plan.features.general.adFree && (
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">无广告体验</span>
                      </div>
                    )}

                    {plan.features.general.prioritySupport && (
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">优先客服支持</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>💡 升级后立即生效，享受全部VIP特权</p>
              <p>🔒 支持7天无理由退款</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPlan || isPurchasing}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPurchasing ? '处理中...' : `立即升级 ¥${VIP_PLANS.find(p => p.id === selectedPlan)?.price || 0}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
