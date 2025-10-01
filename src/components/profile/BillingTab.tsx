'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Receipt,
  Plus,
  Minus,
  Check,
  X,
  AlertTriangle,
  Clock,
  Star,
  Crown,
  Zap,
  Gift,
  History,
  TrendingUp,
  Package
} from 'lucide-react';

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface Transaction {
  id: string;
  type: 'subscription' | 'purchase' | 'refund' | 'credit';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  date: string;
  invoiceUrl?: string;
}

interface BillingData {
  currentPlan: BillingPlan | null;
  availablePlans: BillingPlan[];
  balance: number;
  nextBillingDate?: string;
  transactions: Transaction[];
  usage: {
    monthlyLimit: number;
    used: number;
    remaining: number;
  };
}

export default function BillingTab() {
  const { t } = useLanguage();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // 模拟账单数据
      const mockData: BillingData = {
        currentPlan: {
          id: 'free',
          name: '免费版',
          price: 0,
          interval: 'monthly',
          features: [
            '每日10次AI生成',
            '基础图片处理',
            '标准分辨率',
            '社区支持'
          ],
          current: true
        },
        availablePlans: [
          {
            id: 'pro',
            name: '专业版',
            price: 29,
            interval: 'monthly',
            features: [
              '无限AI生成',
              '高级图片处理',
              '4K超高清分辨率',
              '优先处理',
              '专属客服',
              '批量处理'
            ],
            popular: true
          },
          {
            id: 'enterprise',
            name: '企业版',
            price: 99,
            interval: 'monthly',
            features: [
              '无限AI生成',
              '所有高级功能',
              '8K超高清分辨率',
              'API访问',
              '团队管理',
              '专属客户经理',
              '定制化服务'
            ]
          }
        ],
        balance: 0,
        nextBillingDate: '2024-04-01T00:00:00Z',
        transactions: [
          {
            id: 'txn_001',
            type: 'subscription',
            amount: 29,
            currency: 'USD',
            status: 'completed',
            description: '专业版订阅 - 2024年3月',
            date: '2024-03-01T00:00:00Z',
            invoiceUrl: '#'
          },
          {
            id: 'txn_002',
            type: 'purchase',
            amount: 5,
            currency: 'USD',
            status: 'completed',
            description: '额外生成次数包',
            date: '2024-03-15T10:30:00Z',
            invoiceUrl: '#'
          },
          {
            id: 'txn_003',
            type: 'refund',
            amount: -29,
            currency: 'USD',
            status: 'completed',
            description: '专业版订阅退款',
            date: '2024-02-28T16:45:00Z',
            invoiceUrl: '#'
          }
        ],
        usage: {
          monthlyLimit: 300,
          used: 67,
          remaining: 233
        }
      };

      setBillingData(mockData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'refunded':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      case 'refunded':
        return <Minus className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Crown className="h-4 w-4" />;
      case 'purchase':
        return <Package className="h-4 w-4" />;
      case 'refund':
        return <Minus className="h-4 w-4" />;
      case 'credit':
        return <Gift className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CreditCard className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">{t('billing.loading')}</p>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">{t('billing.noBillingInfo')}</h3>
        <p className="text-neutral-600 dark:text-neutral-400">{t('billing.noBillingInfoDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('billing.title')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{t('billing.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('billing.balance')}: ${billingData.balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('billing.currentPlan')}</h3>
            <p className="text-neutral-600 dark:text-neutral-400">{t('billing.currentPlanDesc')}</p>
          </div>
          {billingData.currentPlan?.current && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-full">
              {t('billing.currentPlanLabel')}
            </span>
          )}
        </div>

        {billingData.currentPlan && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {billingData.currentPlan.name}
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400">
                  ${billingData.currentPlan.price}/{billingData.currentPlan.interval === 'monthly' ? t('billing.month') : t('billing.year')}
                </p>
              </div>
              <div className="text-right">
                {billingData.nextBillingDate && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('billing.nextBilling')}: {new Date(billingData.nextBillingDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {billingData.currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                </div>
              ))}
            </div>

            {billingData.currentPlan.id === 'free' && (
              <button
                onClick={() => handleUpgrade('pro')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {t('billing.upgradeToPro')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('billing.usage')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {billingData.usage.used}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('billing.used')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {billingData.usage.remaining}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('billing.remaining')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {billingData.usage.monthlyLimit}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('billing.monthlyLimit')}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600 dark:text-neutral-400">{t('billing.usageProgress')}</span>
            <span className="text-neutral-900 dark:text-white">
              {Math.round((billingData.usage.used / billingData.usage.monthlyLimit) * 100)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(billingData.usage.used / billingData.usage.monthlyLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">{t('billing.availablePlans')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {billingData.availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-xl p-6 transition-all duration-300 ${
                plan.popular
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {t('billing.mostPopular')}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {plan.name}
                </h4>
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                  ${plan.price}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  /{plan.interval === 'monthly' ? t('billing.month') : t('billing.year')}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white'
                }`}
              >
                {billingData.currentPlan?.id === plan.id ? t('billing.currentPlanLabel') : t('billing.selectPlan')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('billing.transactionHistory')}</h3>
          <History className="h-5 w-5 text-neutral-400" />
        </div>

        <div className="space-y-4">
          {billingData.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-600 rounded-lg">
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">
                    {transaction.description}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`font-medium ${
                    transaction.type === 'refund' ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-white'
                  }`}>
                    {transaction.type === 'refund' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    {getStatusIcon(transaction.status)}
                    <span className={getStatusColor(transaction.status)}>
                      {transaction.status === 'completed' ? t('billing.completed') :
                       transaction.status === 'pending' ? t('billing.pending') :
                       transaction.status === 'failed' ? t('billing.failed') : t('billing.refunded')}
                    </span>
                  </div>
                </div>
                {transaction.invoiceUrl && (
                  <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    <Receipt className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {t('billing.upgradeTo')} {billingData.availablePlans.find(p => p.id === selectedPlan)?.name}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {t('billing.upgradeDesc')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2 px-4 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                {t('billing.cancel')}
              </button>
              <button
                onClick={() => {
                  // 这里应该调用实际的升级API
                  console.log('升级到计划:', selectedPlan);
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                {t('billing.confirmUpgrade')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 