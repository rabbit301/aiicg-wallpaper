/**
 * 提示词翻译工具
 * 将中文提示词转换为英文，提高AI生成准确性
 */

// 常用词汇映射表
const PROMPT_TRANSLATION_MAP: Record<string, string> = {
  // 角色相关
  '魔法少女': 'magical girl',
  '可爱的猫咪女孩': 'cute cat girl',
  '动漫风格': 'anime style',
  '二次元': 'anime',
  '萝莉': 'loli',
  '御姐': 'mature woman',
  '机甲少女': 'mecha girl',
  
  // 场景描述
  '变身场景': 'transformation scene',
  '城市夜景': 'city night view',
  '神社': 'shrine',
  '学校': 'school',
  '咖啡厅': 'cafe',
  '屋顶': 'rooftop',
  '樱花季': 'cherry blossom season',
  '江南水乡': 'Jiangnan water town',
  
  // 自然风光
  '夕阳': 'sunset',
  '日出': 'sunrise',
  '薰衣草田': 'lavender field',
  '雪山': 'snow mountain',
  '湖面': 'lake surface',
  '春日': 'spring day',
  '森林': 'forest',
  '草原': 'grassland',
  '星空': 'starry sky',
  '银河': 'milky way',
  '海边': 'seaside',
  
  // 色彩描述
  '粉色头发': 'pink hair',
  '蓝色调': 'blue tone',
  '冷色系': 'cool color palette',
  '暖色调': 'warm tone',
  '金黄色': 'golden yellow',
  '深蓝夜色': 'deep blue night',
  '橙红色天空': 'orange-red sky',
  '梦幻色彩': 'dreamy colors',
  '彩虹色彩': 'rainbow colors',
  
  // 氛围形容
  '星光闪闪': 'sparkling starlight',
  '清新可爱': 'fresh and cute',
  '温暖的光线': 'warm lighting',
  '浪漫唯美': 'romantic and beautiful',
  '温柔梦幻': 'gentle and dreamy',
  '霓虹灯闪烁': 'neon lights flashing',
  '未来感': 'futuristic',
  '科技感': 'technological',
  '奢华质感': 'luxurious texture',
  
  // 艺术风格
  '流体艺术': 'fluid art',
  '赛博朋克': 'cyberpunk',
  '水彩晕染': 'watercolor blend',
  '几何图形': 'geometric shapes',
  '粒子效果': 'particle effects',
  '大理石纹理': 'marble texture',
  '极简主义': 'minimalist',
  '现代简约': 'modern minimalist',
  
  // 游戏风格
  '像素艺术': 'pixel art',
  '魔幻王国': 'fantasy kingdom',
  '太空战舰': 'space battleship',
  '中世纪': 'medieval',
  '机甲战斗': 'mecha battle',
  
  // 都市生活
  '天际线': 'skyline',
  '雨后': 'after rain',
  '倒影': 'reflection',
  '地铁站': 'subway station',
  '花园': 'garden',
  '商业街': 'shopping street',
  
  // 质量描述
  '高清': 'high definition',
  '精美': 'exquisite',
  '细节丰富': 'rich details',
  '超真实': 'ultra realistic',
  '电影感': 'cinematic',
  '专业摄影': 'professional photography',
};

/**
 * 检测文本是否包含中文字符
 */
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * 基于词典的简单翻译
 */
function dictionaryTranslate(text: string): string {
  let translated = text;
  
  // 按词汇长度排序，优先匹配长词汇
  const sortedKeys = Object.keys(PROMPT_TRANSLATION_MAP).sort((a, b) => b.length - a.length);
  
  for (const chineseWord of sortedKeys) {
    const englishWord = PROMPT_TRANSLATION_MAP[chineseWord];
    translated = translated.replace(new RegExp(chineseWord, 'g'), englishWord);
  }
  
  return translated;
}

/**
 * 使用免费翻译API进行翻译
 */
async function apiTranslate(text: string): Promise<string> {
  try {
    // 创建AbortController，设置较短的超时时间（5秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // 使用Google Translate API (免费版本)
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=en&dt=t&q=${encodeURIComponent(text)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
  } catch (error) {
    console.warn('API翻译失败或超时，使用词典翻译:', error);
  }
  
  return dictionaryTranslate(text);
}

/**
 * 主翻译函数
 */
export async function translatePrompt(prompt: string): Promise<{
  original: string;
  translated: string;
  hasTranslation: boolean;
}> {
  const trimmedPrompt = prompt.trim();
  
  // 如果不包含中文，直接返回
  if (!containsChinese(trimmedPrompt)) {
    return {
      original: trimmedPrompt,
      translated: trimmedPrompt,
      hasTranslation: false
    };
  }
  
  console.log('🌏 检测到中文提示词，开始翻译...');
  console.log('📝 原文:', trimmedPrompt);
  
  // 优先使用词典翻译（速度快）
  let translated = dictionaryTranslate(trimmedPrompt);
  console.log('📚 词典翻译结果:', translated);
  
  // 如果词典翻译覆盖率较低（还有很多中文），尝试API翻译
  const chineseCharsAfterDict = (translated.match(/[\u4e00-\u9fff]/g) || []).length;
  const originalChineseChars = (trimmedPrompt.match(/[\u4e00-\u9fff]/g) || []).length;
  const coverageRate = 1 - (chineseCharsAfterDict / originalChineseChars);
  
  console.log(`📊 词典翻译覆盖率: ${Math.round(coverageRate * 100)}%`);
  
  // 如果覆盖率低于70%，尝试API翻译
  if (coverageRate < 0.7 && containsChinese(translated)) {
    console.log('🔄 词典翻译覆盖率不足，尝试API翻译...');
    try {
      const apiResult = await Promise.race([
        apiTranslate(trimmedPrompt),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('API翻译超时')), 3000)
        )
      ]);
      translated = apiResult;
      console.log('🌐 API翻译结果:', translated);
    } catch (error) {
      console.log('⚠️ API翻译失败，保持词典翻译结果');
    }
  }
  
  // 清理翻译结果
  translated = translated
    .replace(/[，。！？；：]/g, ', ') // 替换中文标点
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/,\s*,/g, ',') // 移除重复逗号
    .trim();
  
  console.log('✅ 最终翻译结果:', translated);
  
  return {
    original: trimmedPrompt,
    translated,
    hasTranslation: true
  };
}

/**
 * 添加英文质量提升关键词
 */
export function enhanceEnglishPrompt(prompt: string): string {
  const qualityKeywords = [
    'high quality',
    'detailed',
    'beautiful',
    'masterpiece',
    '8k resolution'
  ];
  
  // 如果提示词太短，添加质量关键词
  if (prompt.length < 50) {
    return `${prompt}, ${qualityKeywords.join(', ')}`;
  }
  
  return prompt;
} 