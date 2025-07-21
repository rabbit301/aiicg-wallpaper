'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Zap, Star, Check, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Package {
  count: number;
  price: number;
  name: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PurchaseModal({ isOpen, onClose, onSuccess }: PurchaseModalProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Record<string, Package>>({});
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id);

      const response = await fetch(`/api/purchase-optimizations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.packages);
        setUserInfo(data.userInfo);
        // 默认选择中等套餐
        setSelectedPackage('medium');
      }
    } catch (error) {
      console.error('获取套餐信息失败:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !user?.id) return;

    setIsPurchasing(true);
    try {
      const response = await fetch('/api/purchase-optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          packageType: selectedPackage,
          paymentMethod: 'demo'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`购买成功！${data.message}`);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(`购买失败：${data.error}`);
      }
    } catch (error) {
      console.error('购买失败:', error);
      alert('购买失败，请稍后重试');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isOpen) return null;

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case 'small': return <Zap className="h-6 w-6" />;
      case 'medium': return <Star className="h-6 w-6" />;
      case 'large': return <Crown className="h-6 w-6" />;
      case 'unlimited': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'small': return 'border-blue-200 bg-blue-50';
      case 'medium': return 'border-purple-200 bg-purple-50';
      case 'large': return 'border-yellow-200 bg-yellow-50';
      case 'unlimited': return 'border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-r from-purple-50 to-pink-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const isRecommended = (packageType: string) => {
    return packageType === 'medium';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              购买提示词优化次数
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              选择适合您的套餐，享受AI智能提示词优化服务
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 当前状态 */}
        {userInfo && (
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">当前状态</h3>
                <p className="text-blue-700 dark:text-blue-400">
                  {userInfo.isVip 
                    ? '您是VIP用户，享受无限制优化' 
                    : `剩余购买次数：${userInfo.purchasedOptimizations || 0} 次`
                  }
                </p>
              </div>
              {userInfo.isVip && (
                <Crown className="h-8 w-8 text-yellow-500" />
              )}
            </div>
          </div>
        )}

        {/* 套餐选择 */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(packages).map(([packageType, package_]) => (
              <div
                key={packageType}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPackage === packageType
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : getPackageColor(packageType)
                } ${isRecommended(packageType) ? 'ring-2 ring-purple-300' : ''}`}
                onClick={() => setSelectedPackage(packageType)}
              >
                {/* 推荐标签 */}
                {isRecommended(packageType) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      推荐
                    </span>
                  </div>
                )}

                {/* 选中标识 */}
                {selectedPackage === packageType && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {/* 图标 */}
                  <div className={`inline-flex p-3 rounded-full mb-4 ${
                    packageType === 'unlimited' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {getPackageIcon(packageType)}
                  </div>

                  {/* 套餐名称 */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {package_.name}
                  </h3>

                  {/* 次数 */}
                  <div className="mb-4">
                    {package_.count === -1 ? (
                      <div>
                        <div className="text-3xl font-bold text-purple-600">无限制</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">VIP会员</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {package_.count}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">次优化</div>
                      </div>
                    )}
                  </div>

                  {/* 价格 */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-purple-600">
                      ¥{package_.price}
                    </div>
                    {package_.count > 0 && (
                      <div className="text-xs text-gray-500">
                        约 ¥{(package_.price / package_.count).toFixed(1)}/次
                      </div>
                    )}
                  </div>

                  {/* 特性 */}
                  <div className="text-left space-y-2">
                    {packageType === 'small' && (
                      <>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          基础优化功能
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          质量分析报告
                        </div>
                      </>
                    )}
                    {packageType === 'medium' && (
                      <>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          高级优化算法
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          详细改进建议
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          优化历史记录
                        </div>
                      </>
                    )}
                    {packageType === 'large' && (
                      <>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          专业级优化
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          批量优化支持
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          优先技术支持
                        </div>
                      </>
                    )}
                    {packageType === 'unlimited' && (
                      <>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          无限制优化
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          VIP专属功能
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          专属客服支持
                        </div>
                      </>
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
              <p>💡 提示：购买后的优化次数永久有效</p>
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
                disabled={!selectedPackage || isPurchasing}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPurchasing ? '处理中...' : `立即购买 ¥${packages[selectedPackage]?.price || 0}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
