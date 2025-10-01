-- 删除现有表（如果存在）
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS wallpapers CASCADE;
DROP TABLE IF EXISTS guest_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user',
    is_vip BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    vip_expires_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 创建访客会话表
CREATE TABLE guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_guest_sessions_session_id ON guest_sessions(session_id);
CREATE INDEX idx_guest_sessions_deleted_at ON guest_sessions(deleted_at);

-- 创建壁纸表
CREATE TABLE wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    format VARCHAR(10) NOT NULL,
    user_id UUID REFERENCES users(id),
    download_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    tags JSONB,
    category VARCHAR(50) DEFAULT 'general',
    optimized_for_360 BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    generation_time FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_wallpapers_user_id ON wallpapers(user_id);
CREATE INDEX idx_wallpapers_deleted_at ON wallpapers(deleted_at);
CREATE INDEX idx_wallpapers_category ON wallpapers(category);
CREATE INDEX idx_wallpapers_is_public ON wallpapers(is_public);

-- 创建用户活动表
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- 创建用户收藏表
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, wallpaper_id)
);

-- 创建索引
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_wallpaper_id ON user_favorites(wallpaper_id);

-- 插入默认超级管理员
INSERT INTO users (username, email, password_hash, role, is_vip, language, timezone)
VALUES ('rabbitc', 'admin@aiicg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', true, 'zh-CN', 'Asia/Shanghai');
