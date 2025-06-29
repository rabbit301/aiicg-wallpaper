import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';

export async function GET() {
  try {
    const profile = await userStore.getUserProfile();
    return NextResponse.json(profile.privacySettings || {
      saveGeneratedImages: true,
      saveCompressedImages: false,
      showInHomepage: true,
      maxHomepageImages: 6,
      allowPublicView: true
    });
  } catch (error) {
    console.error('获取隐私设置失败:', error);
    return NextResponse.json({ error: '获取隐私设置失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const privacySettings = await request.json();
    
    // 验证设置参数
    if (typeof privacySettings.maxHomepageImages === 'number') {
      privacySettings.maxHomepageImages = Math.max(1, Math.min(12, privacySettings.maxHomepageImages));
    }
    
    await userStore.updateUserProfile({ privacySettings });
    return NextResponse.json({ 
      success: true, 
      message: '隐私设置已保存',
      privacySettings 
    });
  } catch (error) {
    console.error('更新隐私设置失败:', error);
    return NextResponse.json({ error: '更新隐私设置失败' }, { status: 500 });
  }
} 