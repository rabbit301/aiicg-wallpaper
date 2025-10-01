package types

import "time"

// 认证相关请求
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Language string `json:"language,omitempty"`
	Timezone string `json:"timezone,omitempty"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// 用户相关请求
type UpdateProfileRequest struct {
	Username *string `json:"username,omitempty" binding:"omitempty,min=3,max=50"`
	Email    *string `json:"email,omitempty" binding:"omitempty,email"`
	Avatar   *string `json:"avatar,omitempty"`
	Bio      *string `json:"bio,omitempty"`
	Language *string `json:"language,omitempty"`
	Timezone *string `json:"timezone,omitempty"`
	Theme    *string `json:"theme,omitempty" binding:"omitempty,oneof=light dark system"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// 通知相关请求
type NotificationFilter struct {
	Types      []string `json:"types,omitempty"`
	Priorities []string `json:"priorities,omitempty"`
	IsRead     *bool    `json:"is_read,omitempty"`
	IsStarred  *bool    `json:"is_starred,omitempty"`
	DateRange  *struct {
		Start string `json:"start"`
		End   string `json:"end"`
	} `json:"date_range,omitempty"`
	Page     int `json:"page,omitempty"`
	PageSize int `json:"page_size,omitempty"`
}

type CreateNotificationRequest struct {
	Type       string                 `json:"type" binding:"required,oneof=system announcement update achievement message warning promotion"`
	Priority   string                 `json:"priority" binding:"omitempty,oneof=low normal high urgent"`
	Title      string                 `json:"title" binding:"required,max=255"`
	Content    string                 `json:"content" binding:"required"`
	Summary    *string                `json:"summary,omitempty"`
	Icon       *string                `json:"icon,omitempty"`
	Image      *string                `json:"image,omitempty"`
	ActionURL  *string                `json:"action_url,omitempty"`
	ActionText *string                `json:"action_text,omitempty"`
	ExpiresAt  *time.Time             `json:"expires_at,omitempty"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}

// 壁纸相关请求
type GenerateWallpaperRequest struct {
	Prompt    string `json:"prompt" binding:"required,min=10,max=1000"`
	Width     int    `json:"width,omitempty"`
	Height    int    `json:"height,omitempty"`
	Style     string `json:"style,omitempty"`
	Provider  string `json:"provider,omitempty"`
	Seed      *int64 `json:"seed,omitempty"`
	NumImages int    `json:"num_images,omitempty"`
}

type WallpaperSearchRequest struct {
	Query    string `form:"q,omitempty"`
	Category string `form:"category,omitempty"`
	Sort     string `form:"sort,omitempty"`
	Page     int    `form:"page,omitempty"`
	Limit    int    `form:"limit,omitempty"`
}

type AddToFavoritesRequest struct {
	WallpaperID string `json:"wallpaper_id" binding:"required,uuid"`
}

// 管理员相关请求
type AdminUserSearchRequest struct {
	Query string `form:"q,omitempty"`
	Role  string `form:"role,omitempty"`
	IsVIP *bool  `form:"is_vip,omitempty"`
	Page  int    `form:"page,omitempty"`
	Limit int    `form:"limit,omitempty"`
}

type UpdateUserRequest struct {
	Username *string `json:"username,omitempty"`
	Email    *string `json:"email,omitempty"`
	Role     *string `json:"role,omitempty"`
	IsVIP    *bool   `json:"is_vip,omitempty"`
	Status   *string `json:"status,omitempty"`
}

// 管理员 - 壁纸创建请求
type CreateWallpaperRequest struct {
	Title        string   `json:"title" binding:"required"`
	Prompt       string   `json:"prompt" binding:"required"`
	ImageURL     string   `json:"image_url" binding:"required,url"`
	ThumbnailURL string   `json:"thumbnail_url" binding:"required,url"`
	Width        int      `json:"width" binding:"required"`
	Height       int      `json:"height" binding:"required"`
	Format       string   `json:"format" binding:"required"`
	Tags         []string `json:"tags"`
	Category     string   `json:"category"`
	IsPublic     bool     `json:"is_public"`
}

// 管理员 - 壁纸更新请求
type UpdateWallpaperRequest struct {
	Title    *string   `json:"title,omitempty"`
	Tags     *[]string `json:"tags,omitempty"`
	Category *string   `json:"category,omitempty"`
	IsPublic *bool     `json:"is_public,omitempty"`
}

// 管理员 - 通知更新请求
type UpdateNotificationRequest struct {
	Type       *string                `json:"type,omitempty"`
	Priority   *string                `json:"priority,omitempty"`
	Title      *string                `json:"title,omitempty"`
	Content    *string                `json:"content,omitempty"`
	Summary    *string                `json:"summary,omitempty"`
	Icon       *string                `json:"icon,omitempty"`
	Image      *string                `json:"image,omitempty"`
	ActionURL  *string                `json:"action_url,omitempty"`
	ActionText *string                `json:"action_text,omitempty"`
	ExpiresAt  *time.Time             `json:"expires_at,omitempty"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}

// 管理员 - 系统设置（保存任意键值）
type AdminSettings map[string]interface{}

// 其他请求
type ContactRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required,min=10"`
}

type ReportRequest struct {
	WallpaperID string `json:"wallpaper_id" binding:"required,uuid"`
	Reason      string `json:"reason" binding:"required"`
	Description string `json:"description,omitempty"`
}
