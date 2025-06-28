import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 检查各个API密钥的配置状态
    const apiStatus = {
      unsplash: {
        configured: !!process.env.UNSPLASH_API_KEY,
        name: 'Unsplash',
        description: '高质量摄影壁纸',
        priority: 1,
        url: 'https://unsplash.com/developers'
      },
      pexels: {
        configured: !!process.env.PEXELS_API_KEY,
        name: 'Pexels',
        description: '图片和视频壁纸',
        priority: 2,
        url: 'https://www.pexels.com/api/'
      },
      giphy: {
        configured: !!process.env.GIPHY_API_KEY,
        name: 'Giphy',
        description: '头像和动画内容',
        priority: 3,
        url: 'https://developers.giphy.com/'
      }
    };

    // 统计配置状态
    const configuredCount = Object.values(apiStatus).filter(api => api.configured).length;
    const totalCount = Object.keys(apiStatus).length;

    return NextResponse.json({
      success: true,
      apis: apiStatus,
      summary: {
        configured: configuredCount,
        total: totalCount,
        ready: configuredCount > 0,
        recommendations: generateRecommendations(apiStatus)
      }
    });

  } catch (error) {
    console.error('获取API状态失败:', error);
    return NextResponse.json(
      { error: '获取API状态失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

function generateRecommendations(apiStatus: any): string[] {
  const recommendations: string[] = [];
  
  if (!apiStatus.unsplash.configured) {
    recommendations.push('建议配置Unsplash API密钥以获取高质量摄影壁纸');
  }
  
  if (!apiStatus.pexels.configured) {
    recommendations.push('建议配置Pexels API密钥以获取更多壁纸资源');
  }
  
  if (!apiStatus.giphy.configured) {
    recommendations.push('建议配置Giphy API密钥以获取头像和动画内容');
  }
  
  const configuredCount = Object.values(apiStatus).filter((api: any) => api.configured).length;
  
  if (configuredCount === 0) {
    recommendations.push('至少需要配置一个API密钥才能开始爬取');
  } else if (configuredCount === 1) {
    recommendations.push('配置更多API密钥可以获得更丰富的内容');
  } else if (configuredCount === 3) {
    recommendations.push('所有API密钥已配置，可以获得最佳的内容体验');
  }
  
  return recommendations;
}
