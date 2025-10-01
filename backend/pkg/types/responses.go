package types

import (
	"time"

	"github.com/google/uuid"
)

// 通用响应结构
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

type Meta struct {
	Page      int `json:"page,omitempty"`
	Limit     int `json:"limit,omitempty"`
	Total     int `json:"total,omitempty"`
	TotalPage int `json:"total_page,omitempty"`
}

// 认证响应
type AuthResponse struct {
	User         *UserProfile `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int64        `json:"expires_in"`
	TokenType    string       `json:"token_type"`
}

// 用户相关响应
type UserProfile struct {
	ID           uuid.UUID  `json:"id"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	Avatar       *string    `json:"avatar"`
	Bio          *string    `json:"bio"`
	Role         string     `json:"role"`
	IsVIP        bool       `json:"is_vip"`
	Language     string     `json:"language"`
	Timezone     string     `json:"timezone"`
	Theme        string     `json:"theme"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	VIPExpiresAt *time.Time `json:"vip_expires_at"`
}

type UserStats struct {
	WallpapersGenerated  int `json:"wallpapers_generated"`
	WallpapersDownloaded int `json:"wallpapers_downloaded"`
	FavoritesCount       int `json:"favorites_count"`
	TotalUsageTime       int `json:"total_usage_time"` // 分钟
	VIPStatus            bool `json:"vip_status"`
}

type UserActivity struct {
	ID          uuid.UUID `json:"id"`
	Action      string    `json:"action"`
	Description string    `json:"description"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	CreatedAt   time.Time `json:"created_at"`
}

// 壁纸相关响应
type WallpaperResponse struct {
	ID             uuid.UUID  `json:"id"`
	Title          string     `json:"title"`
	Prompt         string     `json:"prompt"`
	ImageURL       string     `json:"image_url"`
	ThumbnailURL   string     `json:"thumbnail_url"`
	Width          int        `json:"width"`
	Height         int        `json:"height"`
	Format         string     `json:"format"`
	UserID         *uuid.UUID `json:"user_id"`
	Username       *string    `json:"username"`
	DownloadCount  int        `json:"download_count"`
	FavoriteCount  int        `json:"favorite_count"`
	Tags           []string   `json:"tags"`
	Category       string     `json:"category"`
	IsPublic       bool       `json:"is_public"`
	IsFavorite     bool       `json:"is_favorite,omitempty"` // 当前用户是否收藏
	GenerationTime float64    `json:"generation_time"`      // 生成时间（秒）
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type GenerationStatus struct {
	ID           uuid.UUID `json:"id"`
	Status       string    `json:"status"` // pending, generating, completed, failed
	Progress     int       `json:"progress"` // 0-100
	ImageURL     *string   `json:"image_url,omitempty"`
	ThumbnailURL *string   `json:"thumbnail_url,omitempty"`
	Error        *string   `json:"error,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	CompletedAt  *time.Time `json:"completed_at,omitempty"`
}

// 分页响应
type PaginatedWallpapers struct {
	Items []WallpaperResponse `json:"items"`
	Meta  Meta                `json:"meta"`
}

type PaginatedUsers struct {
	Items []UserProfile `json:"items"`
	Meta  Meta          `json:"meta"`
}

// 通知相关响应
type NotificationResponse struct {
	ID         uuid.UUID              `json:"id"`
	Type       string                 `json:"type"`
	Priority   string                 `json:"priority"`
	Title      string                 `json:"title"`
	Content    string                 `json:"content"`
	Summary    *string                `json:"summary"`
	Icon       *string                `json:"icon"`
	Image      *string                `json:"image"`
	ActionURL  *string                `json:"action_url"`
	ActionText *string                `json:"action_text"`
	IsRead     bool                   `json:"is_read"`
	IsStarred  bool                   `json:"is_starred"`
	ReadAt     *time.Time             `json:"read_at"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
	ExpiresAt  *time.Time             `json:"expires_at"`
	Metadata   map[string]interface{} `json:"metadata"`
}

type NotificationStats struct {
	Total    int64            `json:"total"`
	Unread   int64            `json:"unread"`
	Starred  int64            `json:"starred"`
	ByType   map[string]int64 `json:"by_type"`
}

type PaginatedNotifications struct {
	Items []NotificationResponse `json:"items"`
	Meta  Meta                   `json:"meta"`
}

// 管理员相关响应
type AdminDashboard struct {
	TotalUsers      int `json:"total_users"`
	ActiveUsers     int `json:"active_users"`
	VIPUsers        int `json:"vip_users"`
	TotalWallpapers int `json:"total_wallpapers"`
	TodayGenerated  int `json:"today_generated"`
	TodayDownloads  int `json:"today_downloads"`
	StorageUsed     int `json:"storage_used"` // MB
	SystemHealth    SystemHealth `json:"system_health"`
}

type SystemHealth struct {
	DatabaseStatus string  `json:"database_status"`
	RedisStatus    string  `json:"redis_status"`
	APIStatus      string  `json:"api_status"`
	CPUUsage       float64 `json:"cpu_usage"`
	MemoryUsage    float64 `json:"memory_usage"`
	DiskUsage      float64 `json:"disk_usage"`
}

// 统计相关响应
type PopularWallpaper struct {
	WallpaperResponse
	ViewCount int `json:"view_count"`
	Rank      int `json:"rank"`
}

type TrendingResponse struct {
	Daily   []PopularWallpaper `json:"daily"`
	Weekly  []PopularWallpaper `json:"weekly"`
	Monthly []PopularWallpaper `json:"monthly"`
}

// 搜索建议响应
type SearchSuggestion struct {
	Query string `json:"query"`
	Count int    `json:"count"`
	Type  string `json:"type"` // tag, category, prompt
} 