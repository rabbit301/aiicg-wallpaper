'use client';

import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, TrendingUp, AlertCircle, Crown, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PromptAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  categories: {
    clarity: number;
    detail: number;
    creativity: number;
    technical: number;
  };
}

interface OptimizationResult {
  original: string;
  optimized: string;
  analysis: PromptAnalysis;
  improvements: string[];
  timestamp: string;
}

interface LimitInfo {
  canOptimize: boolean;
  dailyUsed: number;
  dailyLimit: number;
  totalUsed: number;
  isVip: boolean;
  needsPurchase: boolean;
}

interface PromptOptimizerProps {
  initialPrompt?: string;
  onOptimized?: (result: OptimizationResult) => void;
  className?: string;
}

export default function PromptOptimizer({ 
  initialPrompt = '', 
  onOptimized,
  className = '' 
}: PromptOptimizerProps) {
  const { user, sessionId } = useAuth();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // 获取限制信息
  useEffect(() => {
    fetchLimitInfo();
  }, [user, sessionId]);

  const fetchLimitInfo = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id);
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`/api/optimize-prompt?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLimitInfo(data.limitInfo);
      }
    } catch (error) {
      console.error('获取限制信息失败:', error);
    }
  };

  // 分析提示词
  const analyzePrompt = async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          action: 'analyze',
          userId: user?.id,
          sessionId
        })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 优化提示词
  const optimizePrompt = async () => {
    if (!prompt.trim()) return;

    // 检查限制
    if (limitInfo && !limitInfo.canOptimize) {
      if (limitInfo.needsPurchase) {
        setShowPurchaseModal(true);
        return;
      }
    }

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          action: 'optimize',
          userId: user?.id,
          sessionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOptimizationResult(data.result);
        setAnalysis(data.result.analysis);
        setLimitInfo(prev => prev ? { ...prev, dailyUsed: data.limitInfo.dailyUsed } : null);
        
        if (onOptimized) {
          onOptimized(data.result);
        }
      } else {
        if (data.limitInfo?.needsPurchase) {
          setShowPurchaseModal(true);
        }
        console.error('优化失败:', data.error);
      }
    } catch (error) {
      console.error('优化失败:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // 使用优化后的提示词
  const useOptimizedPrompt = () => {
    if (optimizationResult) {
      setPrompt(optimizationResult.optimized);
      setOptimizationResult(null);
    }
  };

  // 渲染分析结果
  const renderAnalysis = () => {
    if (!analysis) return null;

    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
      if (score >= 80) return 'bg-green-100';
      if (score >= 60) return 'bg-yellow-100';
      return 'bg-red-100';
    };

    return (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          提示词分析结果
        </h3>
        
        {/* 总分 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">总体评分</span>
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getScoreBg(analysis.score)}`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>

        {/* 分类评分 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(analysis.categories).map(([key, score]) => (
            <div key={key} className="text-center">
              <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {key === 'clarity' && '清晰度'}
                {key === 'detail' && '细节度'}
                {key === 'creativity' && '创意度'}
                {key === 'technical' && '技术性'}
              </div>
            </div>
          ))}
        </div>

        {/* 优点和建议 */}
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">优点</h4>
              <ul className="text-sm space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">改进建议</h4>
              <ul className="text-sm space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染优化结果
  const renderOptimizationResult = () => {
    if (!optimizationResult) return null;

    return (
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-700 dark:text-purple-300">
          <Sparkles className="h-5 w-5 mr-2" />
          优化结果
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              优化后的提示词
            </label>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
              {optimizationResult.optimized}
            </div>
          </div>
          
          {optimizationResult.improvements.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                改进点
              </label>
              <ul className="text-sm space-y-1">
                {optimizationResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✨</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={useOptimizedPrompt}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              使用优化后的提示词
            </button>
            <button
              onClick={() => setOptimizationResult(null)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 输入区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          提示词
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入您的提示词，我们将为您分析和优化..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          rows={4}
        />
      </div>

      {/* 限制信息 */}
      {limitInfo && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center">
            {limitInfo.isVip ? (
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            )}
            <span className="text-sm">
              {limitInfo.isVip 
                ? 'VIP用户，无限制优化' 
                : `今日已使用 ${limitInfo.dailyUsed}/${limitInfo.dailyLimit} 次`
              }
            </span>
          </div>
          {!limitInfo.isVip && limitInfo.needsPurchase && (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              购买次数
            </button>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={analyzePrompt}
          disabled={!prompt.trim() || isAnalyzing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {isAnalyzing ? '分析中...' : '分析提示词'}
        </button>
        
        <button
          onClick={optimizePrompt}
          disabled={!prompt.trim() || isOptimizing || (limitInfo && !limitInfo.canOptimize && !limitInfo.isVip)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {isOptimizing ? '优化中...' : '智能优化'}
        </button>
      </div>

      {/* 分析结果 */}
      {renderAnalysis()}

      {/* 优化结果 */}
      {renderOptimizationResult()}
    </div>
  );
}
