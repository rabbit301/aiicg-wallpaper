import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

// 读取通知数据
async function readNotifications() {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 写入通知数据
async function writeNotifications(notifications: any[]) {
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
}

// POST - 创建新通知（管理员）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.type || !body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, title, content' },
        { status: 400 }
      );
    }

    const notifications = await readNotifications();

    // 创建新通知
    const newNotification = {
      id: randomUUID(),
      type: body.type,
      priority: body.priority || 'normal',
      title: body.title,
      content: body.content,
      summary: body.summary || '',
      icon: body.icon || '',
      image: body.image || '',
      action_url: body.action_url || '',
      action_text: body.action_text || '',
      expires_at: body.expires_at || null,
      metadata: body.metadata || null,
      is_read: false,
      is_starred: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    notifications.push(newNotification);
    await writeNotifications(notifications);

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: newNotification,
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// GET - 获取所有通知（管理员）
export async function GET(request: NextRequest) {
  try {
    const notifications = await readNotifications();

    // 按创建时间倒序排序
    notifications.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || a.createdAt).getTime();
      const dateB = new Date(b.created_at || b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      items: notifications,
      total: notifications.length,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
