import { NextResponse } from 'next/server';
import { avatarGenerator } from '@/lib/avatar-generator';

export async function POST(request: Request) {
  try {
    const { presetId, style = 'anime', customPrompt } = await request.json();

    if (!presetId) {
      return NextResponse.json({ error: '请选择头像预设' }, { status: 400 });
    }

    // 生成AI头像
    const result = await avatarGenerator.generateAIAvatar({
      presetId,
      style,
      customPrompt
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        avatarUrl: result.url,
        message: '头像生成成功'
      });
    } else {
      return NextResponse.json({ 
        error: result.error || '头像生成失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('AI头像生成失败:', error);
    return NextResponse.json({ error: '头像生成失败' }, { status: 500 });
  }
} 