package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Wallpaper 壁纸模型
type Wallpaper struct {
	ID               uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title            string         `json:"title" gorm:"not null;size:255"`
	Prompt           string         `json:"prompt" gorm:"not null;type:text"`
	ImageURL         string         `json:"image_url" gorm:"not null;size:500"`
	ThumbnailURL     string         `json:"thumbnail_url" gorm:"not null;size:500"`
	Width            int            `json:"width" gorm:"not null"`
	Height           int            `json:"height" gorm:"not null"`
	Format           string         `json:"format" gorm:"not null;size:10"`
	UserID           *uuid.UUID     `json:"user_id" gorm:"type:uuid;index"`
	DownloadCount    int            `json:"download_count" gorm:"default:0"`
	FavoriteCount    int            `json:"favorite_count" gorm:"default:0"`
	Tags             datatypes.JSON `json:"tags"`
	Category         string         `json:"category" gorm:"default:'general';size:50"`
	OptimizedFor360  bool           `json:"optimized_for_360" gorm:"default:false"`
	IsPublic         bool           `json:"is_public" gorm:"default:true"`
	GenerationTime   float64        `json:"generation_time" gorm:"default:0"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联关系 - 暂时注释掉，简化模型
	// User      *User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	// Favorites []UserFavorite  `json:"favorites,omitempty" gorm:"foreignKey:WallpaperID"`
}

// WallpaperFormat 壁纸格式枚举
type WallpaperFormat string

const (
	FormatPNG  WallpaperFormat = "png"
	FormatJPG  WallpaperFormat = "jpg"
	FormatJPEG WallpaperFormat = "jpeg"
	FormatWebP WallpaperFormat = "webp"
	FormatGIF  WallpaperFormat = "gif"
)

// ActivityType 活动类型枚举
type ActivityType string

const (
	ActivityGenerate ActivityType = "generate"
	ActivityCompress ActivityType = "compress"
	ActivityDownload ActivityType = "download"
	ActivityOptimize ActivityType = "optimize"
	ActivityVIPUpgrade ActivityType = "vip_upgrade"
)

// WallpaperResponse 壁纸响应结构
type WallpaperResponse struct {
	ID               uuid.UUID `json:"id"`
	Title            string    `json:"title"`
	Prompt           string    `json:"prompt"`
	ImageURL         string    `json:"image_url"`
	ThumbnailURL     string    `json:"thumbnail_url"`
	Width            int       `json:"width"`
	Height           int       `json:"height"`
	Format           string    `json:"format"`
	DownloadCount    int       `json:"download_count"`
	FavoriteCount    int       `json:"favorite_count"`
	Tags             []string  `json:"tags"`
	Category         string    `json:"category"`
	OptimizedFor360  bool      `json:"optimized_for_360"`
	CreatedAt        time.Time `json:"created_at"`
	Author           *UserProfile `json:"author,omitempty"`
	IsFavorited      bool      `json:"is_favorited,omitempty"`
}

// ToResponse 转换为响应结构
func (w *Wallpaper) ToResponse() *WallpaperResponse {
	resp := &WallpaperResponse{
		ID:              w.ID,
		Title:           w.Title,
		Prompt:          w.Prompt,
		ImageURL:        w.ImageURL,
		ThumbnailURL:    w.ThumbnailURL,
		Width:           w.Width,
		Height:          w.Height,
		Format:          w.Format,
		DownloadCount:   w.DownloadCount,
		FavoriteCount:   w.FavoriteCount,
		Category:        w.Category,
		OptimizedFor360: w.OptimizedFor360,
		CreatedAt:       w.CreatedAt,
	}

	// 处理标签
	if w.Tags != nil {
		var tags []string
		json.Unmarshal(w.Tags, &tags)
		resp.Tags = tags
	}

	// 处理作者信息 - 暂时注释掉，因为User字段被注释了
	// if w.User != nil {
	//	resp.Author = w.User.ToProfile()
	// }

	return resp
}

// WallpaperListResponse 壁纸列表响应
type WallpaperListResponse struct {
	Wallpapers []WallpaperResponse `json:"wallpapers"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	PageSize   int                 `json:"page_size"`
	HasMore    bool                `json:"has_more"`
}

// ActivityResponse 活动响应结构
type ActivityResponse struct {
	ID          uuid.UUID   `json:"id"`
	Action      string      `json:"action"`
	Description string      `json:"description"`
	Metadata    interface{} `json:"metadata"`
	CreatedAt   time.Time   `json:"created_at"`
}

// ToResponse 转换为响应结构
func (a *UserActivity) ToResponse() *ActivityResponse {
	resp := &ActivityResponse{
		ID:          a.ID,
		Action:      a.Action,
		Description: a.Description,
		CreatedAt:   a.CreatedAt,
	}

	// 处理元数据
	if a.Metadata != nil {
		var metadata interface{}
		json.Unmarshal(a.Metadata, &metadata)
		resp.Metadata = metadata
	}

	return resp
} 