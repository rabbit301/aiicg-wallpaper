package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// UserActivity 用户活动记录模型
type UserActivity struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	Action      string         `json:"action" gorm:"not null;size:50"`
	Description string         `json:"description" gorm:"type:text"`
	IPAddress   string         `json:"ip_address" gorm:"type:inet"`
	UserAgent   string         `json:"user_agent" gorm:"type:text"`
	Metadata    datatypes.JSON `json:"metadata" gorm:"type:jsonb;default:'{}'"`
	CreatedAt   time.Time      `json:"created_at" gorm:"not null"`

	// 关联关系 - 暂时注释掉，避免循环引用
	// User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate GORM钩子：创建前设置默认值
func (ua *UserActivity) BeforeCreate(tx *gorm.DB) error {
	if ua.ID == uuid.Nil {
		ua.ID = uuid.New()
	}
	if ua.CreatedAt.IsZero() {
		ua.CreatedAt = time.Now()
	}
	return nil
}

// TableName 设置表名
func (UserActivity) TableName() string {
	return "user_activities"
}
