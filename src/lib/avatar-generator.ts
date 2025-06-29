import { generateImage } from '@/lib/fal-client';

// 预设头像特征模板
export const AVATAR_PRESETS = [
  {
    id: 'cute-girl',
    name: '可爱女孩',
    prompt: 'cute anime girl, beautiful face, big eyes, pink hair, soft lighting, portrait style, clean background',
    thumbnail: '/avatars/previews/cute-girl.jpg'
  },
  {
    id: 'cool-boy',
    name: '酷帅男孩',
    prompt: 'handsome anime boy, cool expression, blue hair, stylish, portrait style, clean background',
    thumbnail: '/avatars/previews/cool-boy.jpg'
  },
  {
    id: 'mystery-witch',
    name: '神秘女巫',
    prompt: 'mysterious witch girl, purple hair, magical eyes, elegant, fantasy style, portrait, clean background',
    thumbnail: '/avatars/previews/mystery-witch.jpg'
  },
  {
    id: 'cyber-punk',
    name: '赛博朋克',
    prompt: 'cyberpunk character, neon colors, futuristic style, cool expression, portrait, clean background',
    thumbnail: '/avatars/previews/cyber-punk.jpg'
  },
  {
    id: 'cat-girl',
    name: '猫耳少女',
    prompt: 'cute cat girl, cat ears, gentle smile, anime style, adorable, portrait, clean background',
    thumbnail: '/avatars/previews/cat-girl.jpg'
  },
  {
    id: 'warrior',
    name: '勇敢战士',
    prompt: 'brave warrior, determined expression, armor details, heroic style, portrait, clean background',
    thumbnail: '/avatars/previews/warrior.jpg'
  },
  {
    id: 'gentle-scholar',
    name: '温和学者',
    prompt: 'gentle scholar, glasses, warm smile, intellectual appearance, soft lighting, portrait, clean background',
    thumbnail: '/avatars/previews/gentle-scholar.jpg'
  },
  {
    id: 'fairy-princess',
    name: '精灵公主',
    prompt: 'fairy princess, ethereal beauty, flowing hair, magical aura, fantasy style, portrait, clean background',
    thumbnail: '/avatars/previews/fairy-princess.jpg'
  },
  {
    id: 'robot-android',
    name: '机器人',
    prompt: 'friendly android, metallic features, glowing eyes, futuristic design, portrait, clean background',
    thumbnail: '/avatars/previews/robot-android.jpg'
  },
  {
    id: 'nature-spirit',
    name: '自然精灵',
    prompt: 'nature spirit, green hair, flower decorations, peaceful expression, natural style, portrait, clean background',
    thumbnail: '/avatars/previews/nature-spirit.jpg'
  },
  {
    id: 'space-explorer',
    name: '太空探索者',
    prompt: 'space explorer, astronaut helmet, cosmic background, adventure spirit, sci-fi style, portrait',
    thumbnail: '/avatars/previews/space-explorer.jpg'
  },
  {
    id: 'magical-mage',
    name: '魔法师',
    prompt: 'powerful mage, magical staff, mystical robes, wise expression, fantasy style, portrait, clean background',
    thumbnail: '/avatars/previews/magical-mage.jpg'
  }
];

// 简单的预设头像（用渐变色生成）
export const SIMPLE_AVATARS = AVATAR_PRESETS.map((preset, index) => ({
  id: preset.id,
  name: preset.name,
  url: `/avatars/presets/${preset.id}.svg`,
  style: {
    background: `linear-gradient(135deg, 
      hsl(${(index * 30) % 360}, 70%, 60%), 
      hsl(${(index * 30 + 60) % 360}, 70%, 70%))`
  }
}));

export interface AvatarGenerationOptions {
  presetId: string;
  customPrompt?: string;
  style?: 'anime' | 'realistic' | 'cartoon';
  size?: number;
}

export class AvatarGenerator {
  
  // 生成AI头像
  async generateAIAvatar(options: AvatarGenerationOptions): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const preset = AVATAR_PRESETS.find(p => p.id === options.presetId);
      if (!preset) {
        return { success: false, error: '未找到预设模板' };
      }

      // 构建提示词
      let prompt = options.customPrompt || preset.prompt;
      
      // 添加样式修饰
      switch (options.style) {
        case 'anime':
          prompt += ', anime style, detailed anime art';
          break;
        case 'realistic':
          prompt += ', photorealistic, detailed portrait';
          break;
        case 'cartoon':
          prompt += ', cartoon style, cute illustration';
          break;
        default:
          prompt += ', high quality digital art';
      }

      // 添加头像特定的修饰
      prompt += ', profile picture, avatar, centered composition, high resolution';

      console.log('生成头像，提示词:', prompt);

      // 调用图像生成API
      const result = await generateImage({
        prompt: prompt,
        image_size: 'square_hd',
        num_inference_steps: 4,
        num_images: 1
      });

      if (result.success && result.data) {
        // 从返回数据中提取图片URL
        const imageUrl = (result.data as any)?.images?.[0]?.url;
        if (imageUrl) {
          return {
            success: true,
            url: imageUrl
          };
        }
      }
      
      return {
        success: false,
        error: result.error || '头像生成失败'
      };
    } catch (error) {
      console.error('AI头像生成失败:', error);
      return {
        success: false,
        error: '头像生成失败，请稍后重试'
      };
    }
  }

  // 获取预设列表
  getAvatarPresets() {
    return AVATAR_PRESETS;
  }

  // 获取简单头像列表
  getSimpleAvatars() {
    return SIMPLE_AVATARS;
  }

  // 创建SVG头像（用于预设显示）
  createSVGAvatar(preset: typeof AVATAR_PRESETS[0], index: number): string {
    const colors = [
      ['#FF6B6B', '#FF8E8E'],
      ['#4ECDC4', '#44A08D'], 
      ['#45B7D1', '#2196F3'],
      ['#96CEB4', '#4CAF50'],
      ['#FFEAA7', '#FFA726'],
      ['#DDA0DD', '#9C27B0'],
      ['#FF9FF3', '#E91E63'],
      ['#54A0FF', '#3742FA'],
      ['#5F27CD', '#341F97'],
      ['#00D2D3', '#00B8B9'],
      ['#FF9F43', '#FF6348'],
      ['#48CAE4', '#0077B6']
    ];

    const [color1, color2] = colors[index % colors.length];
    
    return `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="12" fill="url(#grad${index})" />
        <text x="32" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">${preset.name.charAt(0)}</text>
      </svg>
    `;
  }
}

export const avatarGenerator = new AvatarGenerator(); 