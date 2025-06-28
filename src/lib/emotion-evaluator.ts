/**
 * 情绪评价和评分系统
 */

export interface EmotionEvaluation {
  score: number; // 1-10分
  emotion: string; // 情绪评价
  comment: string; // 详细评论
  emoji: string; // 表情符号
}

// 情绪评价模板
const EMOTION_TEMPLATES = {
  excellent: {
    emotions: ['太棒了！', '简直就是天才！', '完美无瑕！', '惊艳绝伦！', '艺术品级别！'],
    comments: [
      '这个效果超出了我的预期，简直是艺术品！',
      '压缩质量保持得如此完美，技术含量满分！',
      '这样的效果让人眼前一亮，绝对的专业水准！',
      '无论是色彩还是细节都处理得恰到好处！',
      '这就是我想要的效果，完美诠释了什么叫高质量！'
    ],
    emojis: ['🤩', '🎉', '✨', '🔥', '👏']
  },
  great: {
    emotions: ['非常不错！', '效果很棒！', '质量上乘！', '相当满意！', '表现优秀！'],
    comments: [
      '压缩效果很好，质量损失很小，值得推荐！',
      '色彩饱和度和清晰度都保持得不错！',
      '这个压缩比例很合理，效果令人满意！',
      '细节保留得很好，整体效果很棒！',
      '技术处理到位，达到了预期效果！'
    ],
    emojis: ['😊', '👍', '💯', '🌟', '😄']
  },
  good: {
    emotions: ['还不错！', '效果可以！', '基本满意！', '表现良好！', '符合预期！'],
    comments: [
      '压缩效果基本达到预期，还有提升空间！',
      '整体效果不错，细节处理还可以更好！',
      '质量保持得还可以，符合基本需求！',
      '压缩比例合理，效果基本满意！',
      '技术处理得当，达到了基本要求！'
    ],
    emojis: ['🙂', '👌', '✅', '😌', '🆗']
  },
  average: {
    emotions: ['一般般', '还行吧', '凑合能用', '中规中矩', '普普通通'],
    comments: [
      '效果一般，还有很大改进空间！',
      '压缩质量有待提升，细节丢失较多！',
      '基本能用，但离理想效果还有距离！',
      '技术处理一般，需要优化算法！',
      '效果平平，期待更好的表现！'
    ],
    emojis: ['😐', '🤔', '😕', '😑', '🙄']
  }
};

/**
 * 根据压缩结果生成情绪评价
 */
export function generateCompressionEvaluation(
  compressionRatio: number,
  originalSize: number,
  compressedSize: number,
  processingTime: number,
  version: 'free' | 'ai'
): EmotionEvaluation {
  let score = 5; // 基础分数
  
  // 根据压缩率评分 (30%)
  if (compressionRatio >= 80) score += 3;
  else if (compressionRatio >= 60) score += 2;
  else if (compressionRatio >= 40) score += 1;
  else if (compressionRatio >= 20) score += 0.5;
  
  // 根据文件大小评分 (20%)
  if (originalSize > 5 * 1024 * 1024) { // 大于5MB
    if (compressionRatio >= 70) score += 1.5;
    else if (compressionRatio >= 50) score += 1;
  } else if (originalSize > 1024 * 1024) { // 大于1MB
    if (compressionRatio >= 60) score += 1;
    else if (compressionRatio >= 40) score += 0.5;
  }
  
  // 根据处理时间评分 (20%)
  if (processingTime < 2000) score += 1; // 小于2秒
  else if (processingTime < 5000) score += 0.5; // 小于5秒
  else if (processingTime > 10000) score -= 0.5; // 大于10秒
  
  // AI版本加分 (10%)
  if (version === 'ai') score += 0.5;
  
  // 特殊情况加分
  if (compressionRatio >= 90 && processingTime < 3000) score += 1; // 极高压缩率且快速
  if (compressionRatio >= 95) score += 0.5; // 超高压缩率
  
  // 限制分数范围
  score = Math.max(1, Math.min(10, score));
  
  // 根据分数选择情绪模板
  let template;
  if (score >= 8.5) template = EMOTION_TEMPLATES.excellent;
  else if (score >= 7) template = EMOTION_TEMPLATES.great;
  else if (score >= 5.5) template = EMOTION_TEMPLATES.good;
  else template = EMOTION_TEMPLATES.average;
  
  // 随机选择评价内容
  const emotion = template.emotions[Math.floor(Math.random() * template.emotions.length)];
  const comment = template.comments[Math.floor(Math.random() * template.comments.length)];
  const emoji = template.emojis[Math.floor(Math.random() * template.emojis.length)];
  
  return {
    score: Math.round(score * 10) / 10, // 保留一位小数
    emotion,
    comment,
    emoji
  };
}

/**
 * 根据壁纸生成结果生成情绪评价
 */
export function generateWallpaperEvaluation(
  prompt: string,
  processingTime: number,
  imageSize: { width: number; height: number }
): EmotionEvaluation {
  let score = 6; // 基础分数
  
  // 根据提示词复杂度评分 (30%)
  const promptLength = prompt.length;
  if (promptLength > 100) score += 2;
  else if (promptLength > 50) score += 1.5;
  else if (promptLength > 20) score += 1;
  
  // 根据处理时间评分 (25%)
  if (processingTime < 10000) score += 1.5; // 小于10秒
  else if (processingTime < 20000) score += 1; // 小于20秒
  else if (processingTime < 30000) score += 0.5; // 小于30秒
  else score -= 0.5; // 超过30秒
  
  // 根据图片尺寸评分 (25%)
  const totalPixels = imageSize.width * imageSize.height;
  if (totalPixels >= 640 * 640) score += 1.5; // 高清
  else if (totalPixels >= 480 * 480) score += 1; // 标清
  else score += 0.5; // 低清
  
  // 随机创意加分 (20%)
  score += Math.random() * 1.5;
  
  // 限制分数范围
  score = Math.max(1, Math.min(10, score));
  
  // 根据分数选择情绪模板
  let template;
  if (score >= 8.5) template = EMOTION_TEMPLATES.excellent;
  else if (score >= 7) template = EMOTION_TEMPLATES.great;
  else if (score >= 5.5) template = EMOTION_TEMPLATES.good;
  else template = EMOTION_TEMPLATES.average;
  
  // 随机选择评价内容
  const emotion = template.emotions[Math.floor(Math.random() * template.emotions.length)];
  const comment = template.comments[Math.floor(Math.random() * template.comments.length)];
  const emoji = template.emojis[Math.floor(Math.random() * template.emojis.length)];
  
  return {
    score: Math.round(score * 10) / 10,
    emotion,
    comment,
    emoji
  };
}

/**
 * 生成星级评分显示
 */
export function generateStarRating(score: number): string {
  const fullStars = Math.floor(score / 2);
  const hasHalfStar = (score % 2) >= 1;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '⭐'.repeat(fullStars) + 
         (hasHalfStar ? '✨' : '') + 
         '☆'.repeat(emptyStars);
}

/**
 * 获取评分颜色类名
 */
export function getScoreColorClass(score: number): string {
  if (score >= 8.5) return 'text-green-600 dark:text-green-400';
  else if (score >= 7) return 'text-blue-600 dark:text-blue-400';
  else if (score >= 5.5) return 'text-yellow-600 dark:text-yellow-400';
  else return 'text-red-600 dark:text-red-400';
}
