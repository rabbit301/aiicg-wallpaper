'use client';

import Layout from '@/components/Layout';
import WallpaperGeneratorNew from '@/components/WallpaperGeneratorNew';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GeneratePage() {
  return (
    <Layout>
      <WallpaperGeneratorNew />
    </Layout>
  );
}
