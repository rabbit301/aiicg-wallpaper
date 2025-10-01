-- 创建通知相关表

-- 通知表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    priority VARCHAR(10) DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    content TEXT,
    summary VARCHAR(500),
    icon VARCHAR(100),
    image VARCHAR(500),
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 用户通知状态表（多对多关系）
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_id)
);

-- 通知模板表
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    priority VARCHAR(10) DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    content TEXT,
    summary VARCHAR(500),
    icon VARCHAR(100),
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX idx_notifications_deleted_at ON notifications(deleted_at);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_notification_id ON user_notifications(notification_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_is_starred ON user_notifications(is_starred);

CREATE INDEX idx_notification_templates_name ON notification_templates(name);
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);
CREATE INDEX idx_notification_templates_deleted_at ON notification_templates(deleted_at);

-- 插入示例通知
INSERT INTO notifications (type, priority, title, content, summary, action_url, action_text) VALUES
('system', 'high', '系统维护通知', '系统将于今晚23:00-01:00进行维护升级，期间服务可能暂时中断。感谢您的理解与支持。', '系统将于今晚23:00-01:00进行维护升级', NULL, NULL),
('announcement', 'normal', '新功能发布：AI壁纸增强', '我们很高兴地宣布推出全新的AI壁纸增强功能！现在您可以使用更先进的AI模型来生成更高质量的壁纸。', '全新的AI壁纸增强功能已发布', '/features/ai-enhance', '立即体验'),
('achievement', 'normal', '恭喜获得成就：创作达人', '您已成功生成100张AI壁纸！继续创作，解锁更多精彩成就。', '获得成就：创作达人', NULL, NULL),
('promotion', 'low', 'VIP会员限时优惠', '升级VIP会员享受无限制AI生成、高清下载等特权。限时8折优惠，仅限本周！', 'VIP会员限时8折优惠', '/pricing', '立即升级'),
('message', 'normal', '欢迎加入AIICG壁纸平台！', '感谢您注册AIICG壁纸平台！您现在可以开始创作属于自己的AI壁纸了。如有任何问题，请随时联系我们的客服团队。', '欢迎加入AIICG壁纸平台！', NULL, NULL);

-- 为默认用户创建通知状态（假设存在用户ID）
-- 这部分在实际应用中应该通过应用程序逻辑来处理
