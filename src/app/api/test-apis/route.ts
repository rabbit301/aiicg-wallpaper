import { NextResponse } from 'next/server';

interface TestResult {
  api: string;
  status: 'success' | 'error' | 'not_configured';
  statusCode?: number;
  message: string;
}

export async function POST() {
  try {
    const results: TestResult[] = [];

    // 测试Unsplash API
    if (process.env.UNSPLASH_API_KEY) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos?page=1&per_page=1`,
          {
            headers: {
              'Authorization': `Client-ID ${process.env.UNSPLASH_API_KEY}`,
            },
          }
        );
        
        results.push({
          api: 'Unsplash',
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          message: response.ok ? '连接成功' : `HTTP ${response.status}`,
        });
      } catch (error) {
        results.push({
          api: 'Unsplash',
          status: 'error',
          message: (error as Error).message,
        });
      }
    } else {
      results.push({
        api: 'Unsplash',
        status: 'not_configured',
        message: 'API密钥未配置',
      });
    }

    // 测试Pexels API
    if (process.env.PEXELS_API_KEY) {
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/curated?page=1&per_page=1`,
          {
            headers: {
              'Authorization': process.env.PEXELS_API_KEY,
            },
          }
        );
        
        results.push({
          api: 'Pexels',
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          message: response.ok ? '连接成功' : `HTTP ${response.status}`,
        });
      } catch (error) {
        results.push({
          api: 'Pexels',
          status: 'error',
          message: (error as Error).message,
        });
      }
    } else {
      results.push({
        api: 'Pexels',
        status: 'not_configured',
        message: 'API密钥未配置',
      });
    }

    // 测试Giphy API
    if (process.env.GIPHY_API_KEY) {
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/trending?api_key=${process.env.GIPHY_API_KEY}&limit=1&rating=g`
        );
        
        results.push({
          api: 'Giphy',
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          message: response.ok ? '连接成功' : `HTTP ${response.status}`,
        });
      } catch (error) {
        results.push({
          api: 'Giphy',
          status: 'error',
          message: (error as Error).message,
        });
      }
    } else {
      results.push({
        api: 'Giphy',
        status: 'not_configured',
        message: 'API密钥未配置',
      });
    }

    // 统计结果
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
      not_configured: results.filter(r => r.status === 'not_configured').length,
    };

    return NextResponse.json({
      success: true,
      results,
      summary,
      message: `测试完成: ${summary.success} 成功, ${summary.error} 失败, ${summary.not_configured} 未配置`
    });

  } catch (error) {
    console.error('API测试失败:', error);
    return NextResponse.json(
      { error: 'API测试失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
