import { NextRequest, NextResponse } from 'next/server';
import { imageStorage } from '@/lib/image-storage';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // 简化：当前仅支持 JSON { url, filename }
    if (contentType.includes('application/json')) {
      const { url, filename } = await request.json();
      if (!url || typeof url !== 'string') {
        return NextResponse.json({ success: false, error: 'url required' }, { status: 400 });
      }
      const result = await imageStorage.storeImage({ url, filename, folder: 'wallpapers', generateThumbnail: true });
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error || 'upload failed' }, { status: 500 });
      }
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Unsupported content-type' }, { status: 415 });
  } catch (error) {
    console.error('Admin upload failed:', error);
    return NextResponse.json({ success: false, error: 'upload failed' }, { status: 500 });
  }
}


