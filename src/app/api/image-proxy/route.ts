import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少图片URL参数' },
        { status: 400 }
      );
    }
    
    // 验证URL是否为允许的域名
    const allowedDomains = [
      'res.cloudinary.com',
      'localhost',
      '127.0.0.1',
      '198.18.0.1'
    ];
    
    const urlObj = new URL(imageUrl);
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: '不允许的图片域名' },
        { status: 403 }
      );
    }
    
    // 获取图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIICG-Wallpaper/1.0)',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: '获取图片失败' },
        { status: response.status }
      );
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // 返回图片
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
    
  } catch (error) {
    console.error('图片代理失败:', error);
    return NextResponse.json(
      { error: '图片代理失败' },
      { status: 500 }
    );
  }
}
