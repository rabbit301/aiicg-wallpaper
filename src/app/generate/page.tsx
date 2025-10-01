'use client';

import Layout from '@/components/Layout';
import WallpaperGenerator from '@/components/WallpaperGenerator';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GeneratePage() {
  return (
    <Layout>
      <WallpaperGenerator />
    </Layout>
  );
}
