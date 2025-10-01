import Layout from '@/components/Layout';

export default function CookiesPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
              Cookie政策
            </h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                最后更新时间：2024年1月1日
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  1. 什么是Cookie
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  Cookie是当您访问网站时存储在您设备上的小型文本文件。它们被广泛用于使网站正常工作，提高效率，并为网站所有者提供报告信息。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  2. 我们如何使用Cookie
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  AIICG壁纸站使用Cookie来：
                </p>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>保持您的登录状态和用户偏好设置</li>
                  <li>记住您的语言和主题选择</li>
                  <li>分析网站使用情况以改进我们的服务</li>
                  <li>提供个性化的用户体验</li>
                  <li>确保网站的安全性和防止欺诈</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  3. Cookie类型
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      必要Cookie
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      这些Cookie对于网站的正常运行是必需的，无法在我们的系统中关闭。它们通常在您进行登录、填写表单等操作时设置。
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      功能Cookie
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      这些Cookie使网站能够提供增强的功能和个性化服务，如记住您的偏好设置、选择的语言等。
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                      分析Cookie
                    </h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                      这些Cookie帮助我们了解访问者如何与网站互动，通过匿名收集和报告信息来帮助我们改进网站。
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  4. 第三方Cookie
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  我们可能使用第三方服务提供商的Cookie，包括：
                </p>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>Google Analytics - 用于网站分析</li>
                  <li>CDN服务 - 用于提高网站加载速度</li>
                  <li>安全服务 - 用于防护和监控</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  5. 管理Cookie
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  您可以通过以下方式管理Cookie：
                </p>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>通过浏览器设置删除或阻止Cookie</li>
                  <li>在我们的隐私设置中调整Cookie偏好</li>
                  <li>使用浏览器的隐私模式浏览</li>
                </ul>
                <p className="text-neutral-700 dark:text-neutral-300 mt-4">
                  请注意，禁用某些Cookie可能会影响网站的功能和您的用户体验。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  6. Cookie存储时间
                </h2>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>会话Cookie：在您关闭浏览器时自动删除</li>
                  <li>持久Cookie：根据设定的到期时间存储，通常为1-24个月</li>
                  <li>您可以随时通过浏览器设置手动删除所有Cookie</li>
                </ul>
              </section>

              <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Cookie设置
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  您可以在账户设置中管理Cookie偏好，或联系我们获取更多信息。
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  联系邮箱：privacy@aiicg.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 