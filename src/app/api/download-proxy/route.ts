import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: '缺少下载URL' },
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
    
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: '不允许的下载域名' },
        { status: 403 }
      );
    }
    
    // 下载文件
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: '下载文件失败' },
        { status: response.status }
      );
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // 返回文件流
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'compressed-image'}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
    
  } catch (error) {
    console.error('下载代理失败:', error);
    return NextResponse.json(
      { success: false, error: '下载失败' },
      { status: 500 }
    );
  }
}
