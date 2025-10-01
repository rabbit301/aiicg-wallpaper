package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NotificationType 通知类型
type NotificationType string

const (
	NotificationTypeSystem       NotificationType = "system"
	NotificationTypeAnnouncement NotificationType = "announcement"
	NotificationTypeUpdate       NotificationType = "update"
	NotificationTypeAchievement  NotificationType = "achievement"
	NotificationTypeMessage      NotificationType = "message"
	NotificationTypeWarning      NotificationType = "warning"
	NotificationTypePromotion    NotificationType = "promotion"
)

// NotificationPriority 通知优先级
type NotificationPriority string

const (
	NotificationPriorityLow    NotificationPriority = "low"
	NotificationPriorityNormal NotificationPriority = "normal"
	NotificationPriorityHigh   NotificationPriority = "high"
	NotificationPriorityUrgent NotificationPriority = "urgent"
)

// Notification 通知模型
type Notification struct {
	ID          uuid.UUID            `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Type        NotificationType     `json:"type" gorm:"not null;size:20"`
	Priority    NotificationPriority `json:"priority" gorm:"default:'normal';size:10"`
	Title       string               `json:"title" gorm:"not null;size:255"`
	Content     string               `json:"content" gorm:"type:text"`
	Summary     *string              `json:"summary" gorm:"size:500"`
	Icon        *string              `json:"icon" gorm:"size:100"`
	Image       *string              `json:"image" gorm:"size:500"`
	ActionURL   *string              `json:"action_url" gorm:"size:500"`
	ActionText  *string              `json:"action_text" gorm:"size:100"`
	ExpiresAt   *time.Time           `json:"expires_at"`
	Metadata    *string              `json:"metadata" gorm:"type:jsonb"` // PostgreSQL JSONB
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
	DeletedAt   gorm.DeletedAt       `json:"-" gorm:"index"`

	// 关联的用户通知状态
	UserNotifications []UserNotification `json:"user_notifications,omitempty" gorm:"foreignKey:NotificationID"`
}

// UserNotification 用户通知状态（用户与通知的多对多关系）
type UserNotification struct {
	ID             uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID         uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	NotificationID uuid.UUID `json:"notification_id" gorm:"type:uuid;not null;index"`
	IsRead         bool      `json:"is_read" gorm:"default:false"`
	IsStarred      bool      `json:"is_starred" gorm:"default:false"`
	ReadAt         *time.Time `json:"read_at"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	// 关联
	User         User         `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Notification Notification `json:"notification,omitempty" gorm:"foreignKey:NotificationID"`
}

// NotificationTemplate 通知模板（用于系统自动发送通知）
type NotificationTemplate struct {
	ID          uuid.UUID            `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string               `json:"name" gorm:"unique;not null;size:100"`
	Type        NotificationType     `json:"type" gorm:"not null;size:20"`
	Priority    NotificationPriority `json:"priority" gorm:"default:'normal';size:10"`
	Title       string               `json:"title" gorm:"not null;size:255"`
	Content     string               `json:"content" gorm:"type:text"`
	Summary     *string              `json:"summary" gorm:"size:500"`
	Icon        *string              `json:"icon" gorm:"size:100"`
	ActionURL   *string              `json:"action_url" gorm:"size:500"`
	ActionText  *string              `json:"action_text" gorm:"size:100"`
	IsActive    bool                 `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
	DeletedAt   gorm.DeletedAt       `json:"-" gorm:"index"`
}
