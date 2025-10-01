package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GuestSession 游客会话模型
type GuestSession struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SessionID  string    `json:"session_id" gorm:"unique;not null;size:255;index"`
	IPAddress  string    `json:"ip_address" gorm:"type:inet"`
	UserAgent  string    `json:"user_agent" gorm:"type:text"`
	UsageCount int       `json:"usage_count" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"not null"`
	ExpiresAt  time.Time `json:"expires_at" gorm:"not null;index"`
}

// BeforeCreate GORM钩子：创建前设置默认值
func (gs *GuestSession) BeforeCreate(tx *gorm.DB) error {
	if gs.ID == uuid.Nil {
		gs.ID = uuid.New()
	}
	if gs.CreatedAt.IsZero() {
		gs.CreatedAt = time.Now()
	}
	if gs.UpdatedAt.IsZero() {
		gs.UpdatedAt = time.Now()
	}
	// 默认7天过期
	if gs.ExpiresAt.IsZero() {
		gs.ExpiresAt = time.Now().Add(7 * 24 * time.Hour)
	}
	return nil
}

// BeforeUpdate GORM钩子：更新前设置更新时间
func (gs *GuestSession) BeforeUpdate(tx *gorm.DB) error {
	gs.UpdatedAt = time.Now()
	return nil
}

// TableName 设置表名
func (GuestSession) TableName() string {
	return "guest_sessions"
}

// IsExpired 检查会话是否过期
func (gs *GuestSession) IsExpired() bool {
	return time.Now().After(gs.ExpiresAt)
} 