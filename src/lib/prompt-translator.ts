/**
 * 提示词翻译工具
 * 将中文提示词转换为英文，提高AI生成准确性
 */

// 常用词汇映射表
const PROMPT_TRANSLATION_MAP: Record<string, string> = {
  // 角色相关
  '魔法少女': 'magical girl',
  '可爱的猫咪女孩': 'cute cat girl',
  '温柔可爱的猫耳少女': 'cute cat girl with cat ears',
  '动漫风格': 'anime style',
  '二次元': 'anime',
  '萝莉': 'loli',
  '御姐': 'mature woman',
  '机甲少女': 'mecha girl',
  '银发飘逸的美丽动漫少女': 'beautiful anime girl with flowing silver hair',
  '神秘而美丽的女剑士': 'mysterious and beautiful female swordsman',
  '赛博朋克风格的未来少女': 'cyberpunk style futuristic girl',
  '古风仙女': 'ancient style fairy',
  '粉色双马尾': 'pink twin ponytails',
  
  // 场景描述
  '变身场景': 'transformation scene',
  '魔法少女变身场景': 'magical girl transformation scene',
  '魔法光效环绕': 'magical light effects surrounding',
  '城市夜景': 'city night view',
  '神社': 'shrine',
  '学校': 'school',
  '咖啡厅': 'cafe',
  '屋顶': 'rooftop',
  '樱花季': 'cherry blossom season',
  '樱花背景': 'cherry blossom background',
  '江南水乡': 'Jiangnan water town',
  '云端飞舞': 'dancing in the clouds',
  '仙气缭绕': 'ethereal mist surrounding',
  '星空背景': 'starry sky background',
  '霓虹灯街道': 'neon street',
  '全息显示屏': 'holographic display',
  '银翼杀手风格的城市景观': 'Blade Runner style cityscape',
  '现代城市黄昏时分的屋顶视角': 'rooftop view of modern city at dusk',
  '温馨咖啡店内景': 'cozy coffee shop interior',
  '夜晚空旷的地铁站台': 'empty subway platform at night',
  '色彩斑斓壁画的街头艺术小巷': 'colorful mural street art alley',
  '繁忙十字路口': 'busy intersection',
  
  // 自然风光
  '夕阳': 'sunset',
  '日出': 'sunrise',
  '薰衣草田': 'lavender field',
  '薰衣草田在夕阳下的紫色海洋': 'purple ocean of lavender field at sunset',
  '雪山': 'snow mountain',
  '雪峰': 'snow-capped mountains',
  '湖面': 'lake surface',
  '春日': 'spring day',
  '森林': 'forest',
  '古老红木森林': 'ancient redwood forest',
  '茂密雨林': 'dense rainforest',
  '草原': 'grassland',
  '星空': 'starry sky',
  '银河': 'milky way',
  '海边': 'seaside',
  '金色黄昏时分的壮丽山景': 'magnificent mountain landscape at golden dusk',
  '薄雾缭绕的山谷': 'misty valleys',
  '樱花花瓣飘落的宁静日式庭院': 'serene Japanese garden with falling cherry blossom petals',
  '雄伟瀑布从茂密雨林中倾泻而下': 'majestic waterfall cascading through dense rainforest',
  '北极光在雪峰上空舞动': 'northern lights dancing over snow-capped peaks',
  '古老红木森林中的神秘小径': 'mysterious path in ancient redwood forest',
  '阳光透过树冠': 'sunlight through canopy',
  
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
  '彩虹色反射': 'rainbow reflections',
  '渐变色彩': 'gradient colors',
  '霓虹色彩': 'neon colors',
  '绚烂极光色彩': 'brilliant aurora colors',
  '翡翠绿植被': 'emerald green vegetation',
  '柔和粉色光线': 'soft pink lighting',
  '温暖金色光线': 'warm golden lighting',
  '车流光轨': 'traffic light trails',
  
  // 氛围形容
  '星光闪闪': 'sparkling starlight',
  '清新可爱': 'fresh and cute',
  '萌系动漫风格': 'moe anime style',
  '温暖的光线': 'warm lighting',
  '浪漫唯美': 'romantic and beautiful',
  '浪漫唯美画面': 'romantic and beautiful scene',
  '温柔梦幻': 'gentle and dreamy',
  '梦幻动漫风格': 'dreamy anime style',
  '霓虹灯闪烁': 'neon lights flashing',
  '霓虹灯在湿润街道上反射': 'neon lights reflecting on wet streets',
  '未来感': 'futuristic',
  '科技感': 'technological',
  '科幻动漫': 'sci-fi anime',
  '奢华质感': 'luxurious texture',
  '戏剧性光影': 'dramatic lighting',
  '戏剧性自然光线': 'dramatic natural lighting',
  '戏剧性人工照明': 'dramatic artificial lighting',
  '戏剧性照明效果': 'dramatic lighting effects',
  '超现实8K分辨率': 'ultra-realistic 8K resolution',
  '超细节8K画质': 'ultra-detailed 8K quality',
  '8K超高清摄影质量': '8K ultra-high definition photography quality',
  '空灵氛围': 'ethereal atmosphere',
  '奇幻森林氛围': 'fantasy forest atmosphere',
  '电影风格': 'cinematic style',
  '都市孤独感': 'urban solitude',
  '都市活力': 'urban vitality',
  '航拍视角': 'aerial perspective',
  '从上往下俯视': 'bird\'s eye view',
  '温暖环境光线': 'warm ambient lighting',
  '杯中蒸汽': 'steam from cup',
  '窗外散焦灯光': 'bokeh lights outside window',
  '都市文化': 'urban culture',
  
  // 艺术风格
  '流体艺术': 'fluid art',
  '流动的液体金属纹理': 'flowing liquid metal texture',
  '赛博朋克': 'cyberpunk',
  '赛博朋克美学': 'cyberpunk aesthetic',
  '水彩晕染': 'watercolor blend',
  '水彩颜料在水中扩散': 'watercolor paint spreading in water',
  '几何图形': 'geometric shapes',
  '几何形状的梦幻组合': 'dreamy combination of geometric shapes',
  '粒子效果': 'particle effects',
  '粒子爆炸的能量波纹': 'energy ripples from particle explosion',
  '大理石纹理': 'marble texture',
  '极简主义': 'minimalist',
  '现代简约': 'modern minimalist',
  '抽象3D艺术': 'abstract 3D art',
  '现代抽象设计': 'modern abstract design',
  '有机流动形态': 'organic flowing forms',
  '艺术家级水彩画': 'artist-grade watercolor painting',
  '镜面反射的无限空间': 'infinite space with mirror reflections',
  '光线折射': 'light refraction',
  '超现实主义艺术风格': 'surrealist art style',
  '电子音乐可视化效果': 'electronic music visualization',
  '频谱波形': 'spectrum waveform',
  '数字艺术': 'digital art',
  '日式浮世绘风格': 'Japanese ukiyo-e style',
  '中国古典美学': 'Chinese classical aesthetics',
  
  // 游戏风格
  '像素艺术': 'pixel art',
  '魔幻王国': 'fantasy kingdom',
  '闪闪发光的史诗级幻想骑士': 'shining epic fantasy knight',
  '传奇宝剑': 'legendary sword',
  '英雄战斗姿态': 'heroic battle pose',
  '魔兽风格': 'World of Warcraft style',
  '霓虹小巷中的赛博朋克黑客': 'cyberpunk hacker in neon alley',
  '未来科技界面': 'futuristic tech interface',
  '雨夜街道': 'rainy night street',
  '强化盔甲的太空陆战队': 'power armor space marines',
  '外星战场': 'alien battlefield',
  '等离子武器': 'plasma weapons',
  '光环游戏风格': 'Halo game style',
  '蒸汽朋克飞艇船长': 'steampunk airship captain',
  '黄铜机械装置': 'brass mechanical devices',
  '维多利亚时代美学': 'Victorian era aesthetics',
  '云层背景': 'cloud background',
  '末日废土幸存者': 'post-apocalyptic survivor',
  '破旧装备': 'weathered equipment',
  '荒凉废土': 'desolate wasteland',
  '戏剧性日落': 'dramatic sunset',
  '辐射风格': 'Fallout style',
  '中世纪城堡攻城战': 'medieval castle siege',
  '史诗战斗场面': 'epic battle scene',
  '投石机和战士': 'catapults and warriors',
  '戏剧性天空': 'dramatic sky',
  '太空战舰': 'space battleship',
  '中世纪': 'medieval',
  '机甲战斗': 'mecha battle',
  
  // 极简风格
  '极简几何构图': 'minimalist geometric composition',
  '干净线条和形状': 'clean lines and shapes',
  '柔和渐变背景': 'soft gradient background',
  '完美对称': 'perfect symmetry',
  '单一浮动球体在渐变背景上': 'single floating sphere on gradient background',
  '完美照明': 'perfect lighting',
  '微妙阴影': 'subtle shadows',
  '陶瓷材质': 'ceramic material',
  '抽象山峰轮廓': 'abstract mountain silhouette',
  '单色调色板': 'monochrome color palette',
  '渐变天空': 'gradient sky',
  '极简风景设计': 'minimalist landscape design',
  '禅意花园中的单块石头': 'single stone in zen garden',
  '完美沙纹': 'perfect sand patterns',
  '极简元素': 'minimalist elements',
  '冥想氛围': 'meditative atmosphere',
  '悬浮几何水晶': 'floating geometric crystal',
  '干净工作室照明': 'clean studio lighting',
  '单色配色': 'monochromatic color scheme',
  '当代雕塑': 'contemporary sculpture',
  '地平线上的孤独大树': 'lone tree on horizon',
  '极简风景': 'minimalist landscape',
  '柔和色彩渐变': 'soft color gradation',
  '艺术摄影': 'art photography',
  
  // 都市生活
  '天际线': 'skyline',
  '雨后': 'after rain',
  '倒影': 'reflection',
  '地铁站': 'subway station',
  '花园': 'garden',
  '商业街': 'shopping street',
  '玻璃摩天大楼': 'glass skyscrapers',
  '温暖夕阳光线': 'warm sunset lighting',
  
  // 独立提示词
  '电影级戏剧性照明': 'cinematic dramatic lighting',
  '柔和自然光线': 'soft natural lighting',
  '霓虹灯光效果': 'neon light effects',
  '黄金时刻光线': 'golden hour lighting',
  '体积光雾效果': 'volumetric fog effects',
  '背光轮廓光': 'backlit rim lighting',
  '神秘梦幻氛围': 'mysterious dreamy atmosphere',
  '温馨舒适感觉': 'warm and cozy feeling',
  '史诗磅礴气势': 'epic magnificent momentum',
  '宁静禅意境界': 'serene zen state',
  '活力动感节奏': 'vibrant dynamic rhythm',
  '忧郁诗意情调': 'melancholic poetic mood',
  '超现实主义': 'surrealism',
  '印象派画风': 'impressionist style',
  '蒸汽朋克美学': 'steampunk aesthetic',
  '现代简约风': 'modern minimalist style',
  '8K超高清画质': '8K ultra-high definition quality',
  '电影级渲染质量': 'cinematic rendering quality',
  '超细节纹理': 'ultra-detailed textures',
  '专业摄影水准': 'professional photography quality',
  '艺术大师级作品': 'master artist level artwork',
  '博物馆展览品质': 'museum exhibition quality',
  
  // 质量描述
  '高清': 'high definition',
  '精美': 'exquisite',
  '细节丰富': 'rich details',
  '超真实': 'ultra realistic',
  '电影感': 'cinematic',
  '专业摄影': 'professional photography',
  '详细眼睛和长睫毛': 'detailed eyes with long lashes',
  '传统和服': 'traditional kimono',
  '手持传世宝剑': 'holding legendary sword',
  '英雄姿态': 'heroic pose',
  '飘逸长发': 'flowing long hair',
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