'use client';

import Layout from '@/components/Layout';
import PromptOptimizer from '@/components/PromptOptimizer';
import PurchaseModal from '@/components/PurchaseModal';
import { useState } from 'react';

export default function TestOptimizerPage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handleOptimized = (result: any) => {
    console.log('优化结果:', result);
    alert(`优化完成！\n原始: ${result.original}\n优化后: ${result.optimized}`);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    alert('购买成功！');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            提示词优化器测试
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            测试AI提示词优化功能
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-6">
          <PromptOptimizer
            initialPrompt="一只可爱的小猫"
            onOptimized={handleOptimized}
          />
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            测试购买模态框
          </button>
        </div>

        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      </div>
    </Layout>
  );
}
