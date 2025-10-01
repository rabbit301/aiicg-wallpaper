-- 为现有用户初始化通知状态的迁移脚本
-- 此脚本会为所有还没有通知状态的用户创建通知记录

INSERT INTO user_notifications (id, user_id, notification_id, is_read, is_starred, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    u.id,
    n.id,
    false,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
CROSS JOIN notifications n
WHERE n.deleted_at IS NULL
AND NOT EXISTS (
    SELECT 1 FROM user_notifications un 
    WHERE un.user_id = u.id AND un.notification_id = n.id
);

-- 显示迁移结果统计
SELECT 
    COUNT(*) as total_user_notifications_created
FROM user_notifications 
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute';

-- 显示用户通知覆盖情况
SELECT 
    u.username,
    COUNT(un.id) as notification_count
FROM users u
LEFT JOIN user_notifications un ON u.id = un.user_id
GROUP BY u.id, u.username
ORDER BY notification_count DESC;



