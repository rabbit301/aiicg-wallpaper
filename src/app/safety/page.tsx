import Layout from '@/components/Layout';

export default function SafetyPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
              使用者安全指南
            </h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                最后更新时间：2024年1月1日
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  1. 账户安全
                </h2>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>设置强密码，包含大小写字母、数字和特殊字符</li>
                  <li>不要与他人分享您的账户信息和密码</li>
                  <li>定期更换密码，建议每3-6个月更换一次</li>
                  <li>发现账户异常活动时立即联系客服</li>
                  <li>退出登录时确保完全退出，特别是在公共设备上</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  2. 内容安全
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  在使用AI生成和分享内容时，请注意以下安全事项：
                </p>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>避免生成包含个人敏感信息的图像</li>
                  <li>不要上传包含他人肖像的照片用于AI训练</li>
                  <li>谨慎分享可能涉及版权争议的内容</li>
                  <li>举报发现的不当或违法内容</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  3. 隐私保护
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  保护个人隐私是我们共同的责任：
                </p>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>不要在公开内容中包含个人身份信息</li>
                  <li>谨慎设置个人资料的公开范围</li>
                  <li>了解并合理使用隐私设置功能</li>
                  <li>定期检查和管理您的数据使用授权</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  4. 网络安全
                </h2>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>使用安全的网络连接，避免在公共WiFi下进行敏感操作</li>
                  <li>保持浏览器和操作系统的最新更新</li>
                  <li>警惕钓鱼邮件和虚假链接</li>
                  <li>不要点击来源不明的下载链接</li>
                  <li>使用官方渠道访问我们的服务</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  5. 紧急情况处理
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  如遇到以下情况，请立即采取行动：
                </p>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>账户被盗用或出现异常登录</li>
                  <li>收到威胁或骚扰信息</li>
                  <li>发现安全漏洞或技术问题</li>
                  <li>遭遇诈骗或恶意攻击</li>
                </ul>
              </section>

              <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  紧急联系方式
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  安全事件举报：security@aiicg.com<br/>
                  24小时客服热线：400-XXX-XXXX<br/>
                  在线客服：通过官方网站联系
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 