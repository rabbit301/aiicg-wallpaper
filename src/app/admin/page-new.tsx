'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Download, Play, CheckCircle, XCircle, Loader2, Key, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [testingApis, setTestingApis] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await fetch('/api/api-status');
      const data = await response.json();
      
      if (data.success) {
        setApiStatus(data);
      }
    } catch (err) {
      console.error('获取API状态失败:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const testApis = async () => {
    try {
      setTestingApis(true);
      setTestResults(null);
      
      const response = await fetch('/api/test-apis', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResults(data);
      } else {
        setError(data.error || 'API测试失败');
      }
    } catch (err) {
      setError('网络错误: ' + (err as Error).message);
    } finally {
      setTestingApis(false);
    }
  };

  const startScraping = async () => {
    try {
      setScraping(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/scrape-giphy', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || '爬取失败');
      }
    } catch (err) {
      setError('网络错误: ' + (err as Error).message);
    } finally {
      setScraping(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            管理面板
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            管理网站内容和数据
          </p>
        </div>

        {/* API Status Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                API配置状态
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                检查各个API密钥的配置状态
              </p>
            </div>
          </div>

          {loadingStatus ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400 mr-2" />
              <span className="text-neutral-600 dark:text-neutral-400">检查API状态中...</span>
            </div>
          ) : apiStatus ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    配置状态
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apiStatus.summary.ready 
                      ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                      : 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300'
                  }`}>
                    {apiStatus.summary.ready ? '就绪' : '未就绪'}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {apiStatus.summary.configured} / {apiStatus.summary.total} 个API已配置
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(apiStatus.apis).map(([key, api]: [string, any]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 ${
                      api.configured
                        ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {api.name}
                      </h3>
                      {api.configured ? (
                        <CheckCircle className="h-5 w-5 text-success-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {api.description}
                    </p>
                    <div className="text-xs text-neutral-500 dark:text-neutral-500">
                      优先级: {api.priority}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={testApis}
                  disabled={testingApis || !apiStatus.summary.ready}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {testingApis ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      测试API连接
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-error-400 mx-auto mb-4" />
              <p className="text-error-600 dark:text-error-400">
                无法获取API状态
              </p>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
              API测试结果
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {testResults.message}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testResults.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === 'success'
                      ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20'
                      : result.status === 'error'
                      ? 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {result.api}
                    </h3>
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-success-600" />
                    ) : result.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-error-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scraping Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                内容爬取
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                从多个来源获取壁纸和头像内容
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                爬取说明
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>• 头像分类：本地头像 + Giphy头像</li>
                <li>• 壁纸分类：Unsplash + Pexels高质量壁纸</li>
                <li>• 动画分类：示例动画内容</li>
                <li>• 直播分类：示例直播元素</li>
                <li>• 支持多个API来源，自动检测可用密钥</li>
              </ul>
            </div>

            <button
              onClick={startScraping}
              disabled={scraping || (apiStatus && !apiStatus.summary.ready)}
              className={`w-full flex items-center justify-center px-6 py-4 font-semibold rounded-xl transition-colors duration-200 ${
                apiStatus && !apiStatus.summary.ready
                  ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {scraping ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  正在爬取中...
                </>
              ) : apiStatus && !apiStatus.summary.ready ? (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  请先配置API密钥
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  开始爬取
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-success-600 mr-2" />
              <h3 className="text-lg font-semibold text-success-800 dark:text-success-200">
                爬取完成
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-success-700 dark:text-success-300">
                  {result.totalImages}
                </div>
                <div className="text-success-600 dark:text-success-400 text-sm">
                  总图片数量
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-700 dark:text-success-300">
                  {result.stats?.length || 0}
                </div>
                <div className="text-success-600 dark:text-success-400 text-sm">
                  分类数量
                </div>
              </div>
            </div>

            {result.stats && (
              <div className="space-y-2">
                <h4 className="font-semibold text-success-800 dark:text-success-200">
                  分类统计：
                </h4>
                {result.stats.map((stat: any) => (
                  <div key={stat.category} className="flex justify-between items-center bg-success-100 dark:bg-success-900/30 rounded-lg px-4 py-2">
                    <span className="text-success-700 dark:text-success-300 capitalize">
                      {stat.category === 'avatar' ? '头像' : 
                       stat.category === 'wallpaper' ? '壁纸' :
                       stat.category === 'animation' ? '动画' : '直播'}
                    </span>
                    <span className="font-semibold text-success-800 dark:text-success-200">
                      {stat.count} 张
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <XCircle className="h-6 w-6 text-error-600 mr-2" />
              <h3 className="text-lg font-semibold text-error-800 dark:text-error-200">
                操作失败
              </h3>
            </div>
            <p className="text-error-700 dark:text-error-300">
              {error}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
