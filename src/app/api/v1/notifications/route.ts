import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

// GET - 获取通知列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const types = searchParams.get('types')?.split(',') || [];
    const priorities = searchParams.get('priorities')?.split(',') || [];
    const is_read = searchParams.get('is_read');
    const is_starred = searchParams.get('is_starred');
    const page = parseInt(searchParams.get('page') || '1');
    const page_size = parseInt(searchParams.get('page_size') || '10');

    let notifications = await readNotifications();

    // 类型过滤
    if (types.length > 0) {
      notifications = notifications.filter((n: any) => types.includes(n.type));
    }

    // 优先级过滤
    if (priorities.length > 0) {
      notifications = notifications.filter((n: any) => priorities.includes(n.priority));
    }

    // 已读过滤
    if (is_read !== null && is_read !== undefined) {
      const isReadBool = is_read === 'true';
      notifications = notifications.filter((n: any) => n.is_read === isReadBool);
    }

    // 星标过滤
    if (is_starred !== null && is_starred !== undefined) {
      const isStarredBool = is_starred === 'true';
      notifications = notifications.filter((n: any) => n.is_starred === isStarredBool);
    }

    // 按创建时间倒序排序
    notifications.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || a.createdAt).getTime();
      const dateB = new Date(b.created_at || b.createdAt).getTime();
      return dateB - dateA;
    });

    // 分页
    const start = (page - 1) * page_size;
    const end = start + page_size;
    const paginatedNotifications = notifications.slice(start, end);

    return NextResponse.json({
      success: true,
      items: paginatedNotifications,
      total: notifications.length,
      page,
      page_size,
      total_pages: Math.ceil(notifications.length / page_size),
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - 初始化通知系统（用于管理员创建通知的另一个入口，如果需要）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 此路由可以用于普通用户操作，或作为占位符
    return NextResponse.json({
      success: true,
      message: 'Notification endpoint ready',
    });
  } catch (error: any) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
