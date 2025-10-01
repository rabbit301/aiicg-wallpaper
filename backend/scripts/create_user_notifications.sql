-- 为所有现有用户创建通知状态
INSERT INTO user_notifications (user_id, notification_id, is_read, is_starred)
SELECT 
    u.id as user_id,
    n.id as notification_id,
    false as is_read,
    false as is_starred
FROM users u
CROSS JOIN notifications n
WHERE NOT EXISTS (
    SELECT 1 FROM user_notifications un 
    WHERE un.user_id = u.id AND un.notification_id = n.id
);
