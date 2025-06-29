import Layout from '@/components/Layout';
import CategoryDetailView from '@/components/CategoryDetailView';
import { Suspense } from 'react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-neutral-600 dark:text-neutral-400">
            加载中...
          </div>
        </div>
      }>
        <CategoryDetailView category={slug} />
      </Suspense>
    </Layout>
  );
}

// 生成静态路径
export async function generateStaticParams() {
  return [
    { slug: 'avatar' },
    { slug: 'wallpaper' },
    { slug: 'animation' },
    { slug: 'live' },
  ];
}
