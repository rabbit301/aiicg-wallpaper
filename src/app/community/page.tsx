import Layout from '@/components/Layout';

export default function CommunityPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
              社群公约
            </h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                最后更新时间：2024年1月1日
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  1. 社群原则
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  我们致力于创建一个开放、友好、包容的社群环境。每位成员都应遵循相互尊重、平等交流的原则，共同维护良好的社群氛围。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  2. 行为规范
                </h2>
                <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 space-y-2">
                  <li>禁止发布违法、暴力、仇恨、歧视性内容</li>
                  <li>不得进行人身攻击、恶意诽谤或骚扰他人</li>
                  <li>禁止发布垃圾信息、广告或恶意链接</li>
                  <li>尊重他人隐私，不得泄露他人个人信息</li>
                  <li>保持讨论主题相关性，避免无意义灌水</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  3. 内容准则
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  分享的AI生成壁纸和相关内容应当积极正面，符合社会道德标准。禁止分享包含色情、暴力、政治敏感等不当内容的图像。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  4. 知识产权保护
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  尊重他人的知识产权，不得上传或分享侵犯版权的内容。鼓励原创作品的分享和交流，标注作品来源和创作者信息。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  5. 违规处理
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  对于违反社群公约的行为，我们将根据情节严重程度采取警告、限制功能、暂停账户或永久封禁等措施。严重违法行为将上报相关部门处理。
                </p>
              </section>

              <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  如需举报违规行为或有任何疑问，请联系我们：community@aiicg.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 