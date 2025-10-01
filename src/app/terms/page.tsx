import Layout from '@/components/Layout';

export default function TermsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
              服务条款
            </h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                最后更新时间：2024年1月1日
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  1. 服务说明
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  AIICG壁纸站是一个提供AI生成壁纸、图片压缩和格式转换服务的平台。我们致力于为用户提供高质量的图像处理和生成服务。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  2. 用户责任
                </h2>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>用户需为其上传的内容负责，确保不侵犯他人版权</li>
                  <li>禁止上传违法、有害或不当的内容</li>
                  <li>合理使用服务，不得恶意攻击或滥用系统资源</li>
                  <li>保护个人账户安全，不得与他人共享账户信息</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  3. 知识产权
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  用户通过本平台生成的AI壁纸归用户所有。本平台保留对服务技术、界面设计等的知识产权。用户不得复制、修改或分发本平台的技术和设计。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  4. 服务限制
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  我们保留随时修改、暂停或终止服务的权利。对于免费用户，我们可能设置使用频率和功能限制。VIP用户享有更多权限和优先服务。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  5. 免责声明
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  本平台不对用户生成内容的准确性、合法性或适用性承担责任。用户使用本服务所产生的任何后果由用户自行承担。
                </p>
              </section>

              <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  如有疑问，请联系我们：support@aiicg.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 