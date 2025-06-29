import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少 url 参数' },
        { status: 400 }
      );
    }

    // 验证URL是否来自可信来源
    const allowedDomains = [
      'images.unsplash.com',
      'media.giphy.com',
      'images.pexels.com',
      'picsum.photos',
      'source.unsplash.com',
      // 压缩服务域名
      'res.cloudinary.com',
      'cloudinary.com',
      // 本地开发
      'localhost',
      '127.0.0.1',
      // 其他常见图片CDN
      'cdn.jsdelivr.net',
      'unpkg.com',
      'i.imgur.com'
    ];

    const urlObject = new URL(imageUrl);
    const domain = urlObject.hostname;

    if (!allowedDomains.includes(domain)) {
      return NextResponse.json(
        { error: '不支持的图片来源' },
        { status: 403 }
      );
    }

    console.log(`代理请求图片: ${imageUrl}`);

    // 获取图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      next: { revalidate: 3600 } // 缓存1小时
    });

    if (!response.ok) {
      console.error(`图片加载失败: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `图片加载失败: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 缓存1年
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('图片代理错误:', error);
    return NextResponse.json(
      { error: '图片代理服务错误' },
      { status: 500 }
    );
  }
}
