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

// PUT - 标记所有通知为已读
export async function PUT(request: NextRequest) {
  try {
    const notifications = await readNotifications();

    // 标记所有通知为已读
    const updatedNotifications = notifications.map((n: any) => ({
      ...n,
      is_read: true,
      read_at: new Date().toISOString(),
    }));

    await writeNotifications(updatedNotifications);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      data: { updated: updatedNotifications.length },
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
