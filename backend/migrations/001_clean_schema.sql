-- Clean database schema migration
-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS wallpapers CASCADE;
DROP TABLE IF EXISTS guest_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user',
    is_v_ip BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    v_ip_expires_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create guest sessions table
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

-- Create indexes for guest sessions table
CREATE INDEX idx_guest_sessions_session_id ON guest_sessions(session_id);
CREATE INDEX idx_guest_sessions_deleted_at ON guest_sessions(deleted_at);

-- Create wallpapers table
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
    optimized_for360 BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    generation_time FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Create indexes for wallpapers table
CREATE INDEX idx_wallpapers_user_id ON wallpapers(user_id);
CREATE INDEX idx_wallpapers_deleted_at ON wallpapers(deleted_at);
CREATE INDEX idx_wallpapers_category ON wallpapers(category);
CREATE INDEX idx_wallpapers_is_public ON wallpapers(is_public);

-- Create user activities table
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

-- Create indexes for user activities table
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Create user favorites table
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallpaper_id UUID NOT NULL REFERENCES wallpapers(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, wallpaper_id)
);

-- Create indexes for user favorites table
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_wallpaper_id ON user_favorites(wallpaper_id);

-- Insert default super admin (password: admin123)
INSERT INTO users (username, email, password_hash, role, is_v_ip, language, timezone)
VALUES ('rabbitc', 'admin@aiicg.com', '$2a$10$QWODCSyA3m0795sYHuknUO3q5KpynS0S0SKYl2EeL6FiLyh1IkLYy', 'super_admin', true, 'zh-CN', 'Asia/Shanghai');
