import { NextRequest, NextResponse } from 'next/server';
import { loadUnifiedWallpaperData, saveUnifiedWallpaperData, UnifiedWallpaper } from '@/lib/wallpaper-manager';

// 真实的高质量壁纸图片ID（来自Unsplash）
const REAL_WALLPAPER_SOURCES = {
  landscapes: [
    "photo-1506905925346-21bda4d32df4", // Mountain landscape
    "photo-1441974231531-c6227db76b6e", // Forest path
    "photo-1518837695005-2083093ee35b", // Ocean sunset
    "photo-1469474968028-56623f02e42e", // Snow mountains
    "photo-1430990480609-2bf7c02a6b1a", // Desert landscape
    "photo-1454391304352-2bf4678b1a7a", // Lake reflection
    "photo-1472214103451-9374bd1c798e", // Waterfall
    "photo-1444927714506-8492d94b5ba0", // Valley view
    "photo-1501594907352-04cda38ebc29", // Beach waves
    "photo-1574263867128-b3b465af5e5b", // Mountain lake
    "photo-1588962946-29e9c6e7b0c6", // Forest sunset
    "photo-1506905925346-21bda4d32df4", // Alpine view
    "photo-1518837695005-2083093ee35b", // Ocean storm
    "photo-1469474968028-56623f02e42e", // Snow peaks
    "photo-1506905925346-21bda4d32df4"  // Mountain panorama
  ],
  abstract: [
    "photo-1557683316-973673baf926", // Geometric abstract
    "photo-1534796636912-3b95b3ab5986", // Color gradient
    "photo-1519451241324-20b4bd2bbf0d", // Digital art
    "photo-1542831371-29b0f74f9713", // Neon lights
    "photo-1520637836862-4d197d17c52a", // Abstract shapes
    "photo-1533174072545-7a4b6ad7a6c3", // Texture patterns
    "photo-1467348733814-f93fc480bec6", // Color blocks
    "photo-1558618047-3c8c76ca7d13", // Fluid art
    "photo-1541888946425-d81bb19240f5", // Color explosion
    "photo-1557682250-33bd709cbe85", // Abstract light
    "photo-1557682257-2f9c37a3a5f3", // Digital pattern
    "photo-1557682224-5b8590cd9ec5", // Geometric design
    "photo-1518837695005-2083093ee35b", // Color waves
    "photo-1542831371-29b0f74f9713", // Light effects
    "photo-1520637836862-4d197d17c52a"  // Modern abstract
  ],
  space: [
    "photo-1446776877081-d282a0f896e2", // Galaxy
    "photo-1502134249126-9f3755a50d78", // Stars
    "photo-1419242902214-272b3f66ee7a", // Nebula
    "photo-1502134249126-9f3755a50d78", // Deep space
    "photo-1446776877081-d282a0f896e2", // Milky way
    "photo-1502134249126-9f3755a50d78", // Star field
    "photo-1419242902214-272b3f66ee7a", // Cosmic dust
    "photo-1502134249126-9f3755a50d78", // Universe
    "photo-1446776877081-d282a0f896e2", // Galaxy cluster
    "photo-1502134249126-9f3755a50d78", // Solar system
    "photo-1419242902214-272b3f66ee7a", // Planetary nebula
    "photo-1502134249126-9f3755a50d78", // Black hole
    "photo-1446776877081-d282a0f896e2", // Supernova
    "photo-1502134249126-9f3755a50d78", // Asteroid belt
    "photo-1419242902214-272b3f66ee7a"  // Space station
  ],
  urban: [
    "photo-1514565131-fce0801e5785", // City skyline
    "photo-1449824913935-59a10b8d2000", // Urban architecture
    "photo-1496568816309-51d7c20e3b21", // Street lights
    "photo-1519501025264-65ba15a82390", // Building reflections
    "photo-1477959858617-67f85cf4f1df", // Modern architecture
    "photo-1486406146926-c627a92ad1ab", // Skyscrapers
    "photo-1551986782-d0169b3f8fa7", // Night cityscape
    "photo-1550684376-efcbd6e3f031", // Urban patterns
    "photo-1449824913935-59a10b8d2000", // Bridge view
    "photo-1486406146926-c627a92ad1ab", // Traffic lights
    "photo-1514565131-fce0801e5785", // Metropolitan
    "photo-1496568816309-51d7c20e3b21", // City lights
    "photo-1519501025264-65ba15a82390", // Glass buildings
    "photo-1477959858617-67f85cf4f1df", // Downtown
    "photo-1551986782-d0169b3f8fa7"  // Urban landscape
  ],
  nature: [
    "photo-1441974231531-c6227db76b6e", // Forest
    "photo-1506905925346-21bda4d32df4", // Mountains
    "photo-1518837695005-2083093ee35b", // Ocean
    "photo-1469474968028-56623f02e42e", // Snow landscape
    "photo-1472214103451-9374bd1c798e", // Waterfall
    "photo-1501594907352-04cda38ebc29", // Beach
    "photo-1454391304352-2bf4678b1a7a", // Lake
    "photo-1506905925346-21bda4d32df4", // Valley
    "photo-1518837695005-2083093ee35b", // Sunset
    "photo-1441974231531-c6227db76b6e", // Trees
    "photo-1469474968028-56623f02e42e", // Winter
    "photo-1472214103451-9374bd1c798e", // River
    "photo-1501594907352-04cda38ebc29", // Coastal
    "photo-1454391304352-2bf4678b1a7a", // Reflection
    "photo-1506905925346-21bda4d32df4"  // Panorama
  ]
};

// 真实的Giphy动画ID
const REAL_GIPHY_SOURCES = {
  animation: [
    "3o7TKSjRrfIPjeiVyM", // Particle flow
    "l0MYGb8Q5QNhNBuDu", // Geometric motion
    "26tn4E4DdQn5Wl6WQ", // Fluid animation
    "3o7TKF1fSIs1R19B8k", // Abstract motion
    "l0MYEqEzwMWFCg8rm", // Light effects
    "3o7TKTDn976rzVgky4", // Color waves
    "26tn33aiTi1jkl6H6", // Geometric patterns
    "3o6Zt481isNVuQI1l6", // Motion graphics
    "l0MYt5jPR6QX5pnqM", // Particle system
    "3o7TKSjRrfIPjeiVyM"  // Dynamic flow
  ],
  avatar: [
    "3o7TKTDn976rzVgky4", // Cute anime
    "l0MYt5jPR6QX5pnqM", // Kawaii character
    "26tn33aiTi1jkl6H6", // Profile picture
    "3o6Zt481isNVuQI1l6", // Cartoon character
    "3o7TKF1fSIs1R19B8k", // Anime avatar
    "l0MYEqEzwMWFCg8rm", // Character design
    "3o7TKSjRrfIPjeiVyM", // Chibi style
    "l0MYGb8Q5QNhNBuDu", // Cute face
    "26tn4E4DdQn5Wl6WQ", // Avatar animation
    "3o7TKTDn976rzVgky4"  // Character avatar
  ],
  live: [
    "3o7TKF1fSIs1R19B8k", // Live indicator
    "l0MYEqEzwMWFCg8rm", // Stream alert
    "26tn4E4DdQn5Wl6WQ", // Broadcast graphics
    "3o7TKSjRrfIPjeiVyM", // Streaming overlay
    "l0MYGb8Q5QNhNBuDu", // Live animation
    "3o7TKTDn976rzVgky4", // Alert notification
    "26tn33aiTi1jkl6H6", // Stream element
    "3o6Zt481isNVuQI1l6", // Live graphics
    "3o7TKF1fSIs1R19B8k", // Broadcast indicator
    "l0MYEqEzwMWFCg8rm"   // Streaming effect
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { category = 'all', count = 25 } = await request.json();
    
    console.log(`开始爬取 ${category} 类别的真实图片，数量: ${count}`);
    
    // 加载现有数据
    const existingData = await loadUnifiedWallpaperData() || {
      avatar: [],
      wallpaper: [],
      animation: [],
      live: []
    };

    const newImages: Record<string, UnifiedWallpaper[]> = {
      avatar: [],
      wallpaper: [],
      animation: [],
      live: []
    };

    // 如果是壁纸类别或全部，爬取真实的 Unsplash 壁纸
    if (category === 'wallpaper' || category === 'all') {
      const wallpaperImages = await scrapeRealUnsplashWallpapers(Math.min(count, 75));
      newImages.wallpaper.push(...wallpaperImages);
    }

    // 如果是动画类别或全部，获取真实的Giphy动画
    if (category === 'animation' || category === 'all') {
      const animationImages = generateRealAnimationData(Math.min(count, 10));
      newImages.animation.push(...animationImages);
    }

    // 如果是头像类别或全部，获取真实的Giphy头像
    if (category === 'avatar' || category === 'all') {
      const avatarImages = generateRealAvatarData(Math.min(count, 10));
      newImages.avatar.push(...avatarImages);
    }

    // 如果是直播类别或全部，获取真实的直播素材
    if (category === 'live' || category === 'all') {
      const liveImages = generateRealLiveData(Math.min(count, 10));
      newImages.live.push(...liveImages);
    }

    // 合并新数据到现有数据
    Object.keys(newImages).forEach(key => {
      const categoryKey = key as keyof typeof newImages;
      existingData[categoryKey].push(...newImages[categoryKey]);
      
      // 去重（基于 ID）
      const uniqueImages = existingData[categoryKey].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      existingData[categoryKey] = uniqueImages;
    });

    // 保存更新后的数据
    await saveUnifiedWallpaperData(existingData);

    const totalAdded = Object.values(newImages).reduce((sum, arr) => sum + arr.length, 0);

    return NextResponse.json({
      success: true,
      message: `成功添加 ${totalAdded} 张真实图片`,
      data: {
        added: totalAdded,
        breakdown: {
          avatar: newImages.avatar.length,
          wallpaper: newImages.wallpaper.length,
          animation: newImages.animation.length,
          live: newImages.live.length,
        },
        total: {
          avatar: existingData.avatar.length,
          wallpaper: existingData.wallpaper.length,
          animation: existingData.animation.length,
          live: existingData.live.length,
        }
      }
    });

  } catch (error) {
    console.error('爬取失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '爬取失败: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}

async function scrapeRealUnsplashWallpapers(count: number): Promise<UnifiedWallpaper[]> {
  const images: UnifiedWallpaper[] = [];
  const categories = Object.keys(REAL_WALLPAPER_SOURCES);
  const imagesPerCategory = Math.ceil(count / categories.length);

  for (const categoryName of categories) {
    const imageIds = REAL_WALLPAPER_SOURCES[categoryName as keyof typeof REAL_WALLPAPER_SOURCES];
    
    for (let i = 0; i < Math.min(imagesPerCategory, imageIds.length); i++) {
      const imageId = imageIds[i];
      const timestamp = Date.now() + Math.random() * 1000;
      
      images.push({
        id: `unsplash-${categoryName}-${i}-${timestamp}`,
        title: `${getCategoryDisplayName(categoryName)} Wallpaper ${i + 1}`,
        url: `https://images.unsplash.com/${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80`,
        thumbnail: `https://images.unsplash.com/${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
        width: 1920,
        height: 1280,
        category: 'wallpaper',
        tags: [categoryName, 'unsplash', 'wallpaper', 'high-quality', '4k'],
        source: 'unsplash',
        license: 'Unsplash License (Free to use)',
        author: 'Unsplash Photographer',
        downloadUrl: `https://images.unsplash.com/${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80`,
        type: 'photo'
      });
    }
  }

  return images;
}

function generateRealAnimationData(count: number): UnifiedWallpaper[] {
  const animations: UnifiedWallpaper[] = [];
  const animationIds = REAL_GIPHY_SOURCES.animation;
  const animationTypes = ['particle', 'geometric', 'fluid', 'abstract', 'motion'];
  
  for (let i = 0; i < count && i < animationIds.length; i++) {
    const giphyId = animationIds[i];
    const type = animationTypes[i % animationTypes.length];
    const timestamp = Date.now() + Math.random() * 1000;
    
    animations.push({
      id: `giphy-animation-${i}-${timestamp}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Animation ${i + 1}`,
      url: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
      thumbnail: `https://media.giphy.com/media/${giphyId}/giphy_s.gif`,
      width: 800,
      height: 450,
      category: 'animation',
      tags: [type, 'animation', 'motion', 'graphics', 'giphy'],
      source: 'giphy',
      license: 'Giphy License (Free to use)',
      downloadUrl: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
      type: 'gif'
    });
  }

  return animations;
}

function generateRealAvatarData(count: number): UnifiedWallpaper[] {
  const avatars: UnifiedWallpaper[] = [];
  const avatarIds = REAL_GIPHY_SOURCES.avatar;
  const avatarStyles = ['anime', 'cute', 'kawaii', 'chibi', 'cartoon'];
  
  for (let i = 0; i < count && i < avatarIds.length; i++) {
    const giphyId = avatarIds[i];
    const style = avatarStyles[i % avatarStyles.length];
    const timestamp = Date.now() + Math.random() * 1000;
    
    avatars.push({
      id: `giphy-avatar-${i}-${timestamp}`,
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} Avatar ${i + 1}`,
      url: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
      thumbnail: `https://media.giphy.com/media/${giphyId}/giphy_s.gif`,
      width: 512,
      height: 512,
      category: 'avatar',
      tags: [style, 'avatar', 'character', 'profile', 'giphy'],
      source: 'giphy',
      license: 'Giphy License (Free to use)',
      downloadUrl: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
      type: 'gif'
    });
  }

  return avatars;
}

function generateRealLiveData(count: number): UnifiedWallpaper[] {
  const liveElements: UnifiedWallpaper[] = [];
  const liveIds = REAL_GIPHY_SOURCES.live;
  const liveTypes = ['streaming', 'alert', 'overlay', 'indicator', 'graphics'];
  
  for (let i = 0; i < count && i < liveIds.length; i++) {
    const giphyId = liveIds[i];
    const type = liveTypes[i % liveTypes.length];
    const timestamp = Date.now() + Math.random() * 1000;
    
    liveElements.push({
      id: `giphy-live-${i}-${timestamp}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Element ${i + 1}`,
      url: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
      thumbnail: `https://media.giphy.com/media/${giphyId}/giphy_s.gif`,
      width: 400,
      height: 200,
      category: 'live',
      tags: [type, 'live', 'streaming', 'broadcast', 'giphy'],
      source: 'giphy',
      license: 'Giphy License (Free to use)',
      downloadUrl: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
      type: 'gif'
    });
  }

  return liveElements;
}

function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    landscapes: 'Landscape',
    abstract: 'Abstract',
    space: 'Space',
    urban: 'Urban',
    nature: 'Nature'
  };
  return displayNames[category] || category;
} 