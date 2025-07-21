/**
 * 提示词优化服务
 * 提供AI驱动的提示词质量分析和优化建议
 */

export interface PromptAnalysis {
  score: number; // 0-100分
  strengths: string[]; // 优点
  weaknesses: string[]; // 不足
  suggestions: string[]; // 改进建议
  categories: {
    clarity: number; // 清晰度 0-100
    detail: number; // 细节度 0-100
    creativity: number; // 创意度 0-100
    technical: number; // 技术性 0-100
  };
}

export interface OptimizedPrompt {
  original: string;
  optimized: string;
  analysis: PromptAnalysis;
  improvements: string[]; // 具体改进点
  timestamp: string;
}

export interface OptimizationUsage {
  userId?: string;
  sessionId?: string;
  dailyCount: number;
  totalCount: number;
  lastOptimizedAt: string;
  isVip: boolean;
}

// 提示词优化规则库
const OPTIMIZATION_RULES = {
  // 质量提升关键词
  qualityKeywords: [
    'high quality', 'detailed', 'masterpiece', '8k resolution',
    'professional', 'stunning', 'beautiful', 'intricate details',
    'sharp focus', 'vibrant colors', 'perfect composition'
  ],
  
  // 风格关键词
  styleKeywords: [
    'photorealistic', 'digital art', 'oil painting', 'watercolor',
    'anime style', 'cartoon', 'minimalist', 'abstract',
    'cinematic', 'dramatic lighting', 'soft lighting'
  ],
  
  // 技术参数
  technicalKeywords: [
    'depth of field', 'bokeh', 'HDR', 'ray tracing',
    'global illumination', 'subsurface scattering',
    'volumetric lighting', 'ambient occlusion'
  ],
  
  // 负面提示词
  negativeKeywords: [
    'blurry', 'low quality', 'pixelated', 'distorted',
    'ugly', 'deformed', 'bad anatomy', 'worst quality'
  ]
};

// 提示词分析器
export class PromptAnalyzer {
  /**
   * 分析提示词质量
   */
  analyzePrompt(prompt: string): PromptAnalysis {
    const words = prompt.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    // 计算各项指标
    const clarity = this.calculateClarity(prompt, words);
    const detail = this.calculateDetail(prompt, words, wordCount);
    const creativity = this.calculateCreativity(prompt, words);
    const technical = this.calculateTechnical(prompt, words);
    
    // 计算总分
    const score = Math.round((clarity + detail + creativity + technical) / 4);
    
    // 生成优缺点和建议
    const strengths = this.identifyStrengths(prompt, { clarity, detail, creativity, technical });
    const weaknesses = this.identifyWeaknesses(prompt, { clarity, detail, creativity, technical });
    const suggestions = this.generateSuggestions(prompt, { clarity, detail, creativity, technical });
    
    return {
      score,
      strengths,
      weaknesses,
      suggestions,
      categories: { clarity, detail, creativity, technical }
    };
  }
  
  private calculateClarity(prompt: string, words: string[]): number {
    let score = 50; // 基础分
    
    // 长度适中加分
    if (words.length >= 5 && words.length <= 30) score += 20;
    else if (words.length < 5) score -= 20;
    else if (words.length > 50) score -= 10;
    
    // 结构清晰加分
    if (prompt.includes(',') || prompt.includes('，')) score += 10;
    
    // 避免重复词汇
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    score += Math.round(repetitionRatio * 20);
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateDetail(prompt: string, words: string[], wordCount: number): number {
    let score = 30; // 基础分
    
    // 词汇数量
    if (wordCount >= 10) score += 30;
    else if (wordCount >= 5) score += 15;
    
    // 描述性词汇
    const descriptiveWords = ['beautiful', 'stunning', 'detailed', 'intricate', 'elaborate', 'complex'];
    const descriptiveCount = words.filter(word => 
      descriptiveWords.some(desc => word.includes(desc))
    ).length;
    score += descriptiveCount * 10;
    
    // 具体细节
    const detailWords = ['texture', 'material', 'surface', 'pattern', 'color', 'light', 'shadow'];
    const detailCount = words.filter(word => 
      detailWords.some(detail => word.includes(detail))
    ).length;
    score += detailCount * 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateCreativity(prompt: string, words: string[]): number {
    let score = 40; // 基础分
    
    // 创意词汇
    const creativeWords = ['fantasy', 'magical', 'surreal', 'dreamlike', 'ethereal', 'mystical'];
    const creativeCount = words.filter(word => 
      creativeWords.some(creative => word.includes(creative))
    ).length;
    score += creativeCount * 15;
    
    // 独特组合
    if (prompt.includes('in the style of') || prompt.includes('inspired by')) score += 20;
    
    // 情感词汇
    const emotionalWords = ['peaceful', 'dramatic', 'mysterious', 'joyful', 'melancholic'];
    const emotionalCount = words.filter(word => 
      emotionalWords.some(emotion => word.includes(emotion))
    ).length;
    score += emotionalCount * 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateTechnical(prompt: string, words: string[]): number {
    let score = 20; // 基础分
    
    // 质量关键词
    const qualityCount = words.filter(word => 
      OPTIMIZATION_RULES.qualityKeywords.some(quality => word.includes(quality.replace(/\s+/g, '')))
    ).length;
    score += qualityCount * 15;
    
    // 技术参数
    const techCount = words.filter(word => 
      OPTIMIZATION_RULES.technicalKeywords.some(tech => word.includes(tech.replace(/\s+/g, '')))
    ).length;
    score += techCount * 20;
    
    // 分辨率/格式
    if (prompt.includes('4k') || prompt.includes('8k') || prompt.includes('hd')) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private identifyStrengths(prompt: string, scores: any): string[] {
    const strengths: string[] = [];
    
    if (scores.clarity >= 70) strengths.push('提示词结构清晰，表达明确');
    if (scores.detail >= 70) strengths.push('描述详细，包含丰富的细节信息');
    if (scores.creativity >= 70) strengths.push('富有创意，具有独特的艺术表达');
    if (scores.technical >= 70) strengths.push('技术参数完善，质量要求明确');
    
    if (prompt.length > 50) strengths.push('提示词内容丰富，信息量充足');
    
    return strengths;
  }
  
  private identifyWeaknesses(prompt: string, scores: any): string[] {
    const weaknesses: string[] = [];
    
    if (scores.clarity < 50) weaknesses.push('表达不够清晰，建议重新组织语言');
    if (scores.detail < 50) weaknesses.push('缺乏具体细节，描述过于简单');
    if (scores.creativity < 50) weaknesses.push('创意性不足，可以添加更多艺术元素');
    if (scores.technical < 50) weaknesses.push('缺少技术参数，影响生成质量');
    
    if (prompt.length < 20) weaknesses.push('提示词过短，信息量不足');
    if (prompt.length > 200) weaknesses.push('提示词过长，可能影响AI理解');
    
    return weaknesses;
  }
  
  private generateSuggestions(prompt: string, scores: any): string[] {
    const suggestions: string[] = [];
    
    if (scores.clarity < 70) {
      suggestions.push('使用逗号分隔不同的描述要素，提高可读性');
      suggestions.push('避免重复词汇，使用同义词丰富表达');
    }
    
    if (scores.detail < 70) {
      suggestions.push('添加更多描述性形容词，如"精致的"、"华丽的"');
      suggestions.push('指定材质、纹理、颜色等具体细节');
    }
    
    if (scores.creativity < 70) {
      suggestions.push('尝试添加艺术风格，如"油画风格"、"水彩画"');
      suggestions.push('加入情感色彩，如"神秘的"、"宁静的"');
    }
    
    if (scores.technical < 70) {
      suggestions.push('添加质量关键词：high quality, detailed, masterpiece');
      suggestions.push('指定分辨率：4K, 8K resolution');
      suggestions.push('添加光影效果：dramatic lighting, soft lighting');
    }
    
    return suggestions;
  }
}

// 提示词优化器
export class PromptOptimizer {
  private analyzer = new PromptAnalyzer();
  
  /**
   * 优化提示词
   */
  optimizePrompt(originalPrompt: string): OptimizedPrompt {
    const analysis = this.analyzer.analyzePrompt(originalPrompt);
    const optimized = this.generateOptimizedPrompt(originalPrompt, analysis);
    const improvements = this.identifyImprovements(originalPrompt, optimized);
    
    return {
      original: originalPrompt,
      optimized,
      analysis,
      improvements,
      timestamp: new Date().toISOString()
    };
  }
  
  private generateOptimizedPrompt(original: string, analysis: PromptAnalysis): string {
    let optimized = original.trim();
    
    // 基于分析结果进行优化
    if (analysis.categories.technical < 70) {
      // 添加质量关键词
      const qualityBoost = 'high quality, detailed, masterpiece';
      optimized = `${optimized}, ${qualityBoost}`;
    }
    
    if (analysis.categories.detail < 70) {
      // 添加细节描述
      const detailBoost = 'intricate details, sharp focus';
      optimized = `${optimized}, ${detailBoost}`;
    }
    
    if (analysis.categories.creativity < 70) {
      // 添加艺术风格
      const styleBoost = 'beautiful composition, stunning visual';
      optimized = `${optimized}, ${styleBoost}`;
    }
    
    // 添加通用质量提升
    if (!optimized.includes('8k') && !optimized.includes('4k')) {
      optimized = `${optimized}, 8k resolution`;
    }
    
    // 清理格式
    optimized = optimized
      .replace(/,\s*,/g, ',') // 移除重复逗号
      .replace(/\s+/g, ' ') // 合并空格
      .trim();
    
    return optimized;
  }
  
  private identifyImprovements(original: string, optimized: string): string[] {
    const improvements: string[] = [];
    
    if (optimized.includes('high quality') && !original.includes('high quality')) {
      improvements.push('添加了高质量关键词');
    }
    
    if (optimized.includes('detailed') && !original.includes('detailed')) {
      improvements.push('增强了细节描述');
    }
    
    if (optimized.includes('8k resolution') && !original.includes('8k')) {
      improvements.push('指定了高分辨率输出');
    }
    
    if (optimized.includes('masterpiece') && !original.includes('masterpiece')) {
      improvements.push('添加了艺术品质要求');
    }
    
    return improvements;
  }
}

// 导出实例
export const promptOptimizer = new PromptOptimizer();
export const promptAnalyzer = new PromptAnalyzer();
