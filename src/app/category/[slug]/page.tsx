import Layout from '@/components/Layout';
import CategoryDetailView from '@/components/CategoryDetailView';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: PageProps) {
  return (
    <Layout>
      <CategoryDetailView category={params.slug} />
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
