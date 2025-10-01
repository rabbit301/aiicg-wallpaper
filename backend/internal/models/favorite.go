package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserFavorite 用户收藏模型
type UserFavorite struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	WallpaperID uuid.UUID `json:"wallpaper_id" gorm:"type:uuid;not null;index"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`

	// 关联关系 - 暂时注释掉，简化模型
	// User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	// Wallpaper *Wallpaper `json:"wallpaper,omitempty" gorm:"foreignKey:WallpaperID"`
}

// BeforeCreate GORM钩子：创建前设置默认值
func (uf *UserFavorite) BeforeCreate(tx *gorm.DB) error {
	if uf.ID == uuid.Nil {
		uf.ID = uuid.New()
	}
	if uf.CreatedAt.IsZero() {
		uf.CreatedAt = time.Now()
	}
	return nil
}

// TableName 设置表名
func (UserFavorite) TableName() string {
	return "user_favorites"
} 