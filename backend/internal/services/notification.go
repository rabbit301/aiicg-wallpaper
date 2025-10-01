package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"aiicg-backend/internal/models"
	"aiicg-backend/pkg/types"
)

type NotificationService struct {
	db *gorm.DB
}

func NewNotificationService(db *gorm.DB) *NotificationService {
	return &NotificationService{db: db}
}

// GetUserNotifications 获取用户通知列表
func (s *NotificationService) GetUserNotifications(userID uuid.UUID, filter *types.NotificationFilter) (*types.PaginatedNotifications, error) {
	var userNotifications []models.UserNotification
	var total int64

	query := s.db.Model(&models.UserNotification{}).
		Preload("Notification").
		Where("user_id = ?", userID)

	// 应用过滤条件
	if filter != nil {
		if filter.IsRead != nil {
			query = query.Where("is_read = ?", *filter.IsRead)
		}
		if filter.IsStarred != nil {
			query = query.Where("is_starred = ?", *filter.IsStarred)
		}
		if len(filter.Types) > 0 {
			query = query.Joins("JOIN notifications ON notifications.id = user_notifications.notification_id").
				Where("notifications.type IN ?", filter.Types)
		}
		if len(filter.Priorities) > 0 {
			query = query.Joins("JOIN notifications ON notifications.id = user_notifications.notification_id").
				Where("notifications.priority IN ?", filter.Priorities)
		}
		if filter.DateRange != nil {
			startTime, _ := time.Parse(time.RFC3339, filter.DateRange.Start)
			endTime, _ := time.Parse(time.RFC3339, filter.DateRange.End)
			query = query.Where("user_notifications.created_at BETWEEN ? AND ?", startTime, endTime)
		}
	}

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("计算通知总数失败: %w", err)
	}

	// 分页和排序
	page := 1
	pageSize := 20
	if filter != nil && filter.Page > 0 {
		page = filter.Page
	}
	if filter != nil && filter.PageSize > 0 {
		pageSize = filter.PageSize
	}

	offset := (page - 1) * pageSize
	if err := query.Order("user_notifications.created_at DESC").
		Limit(pageSize).Offset(offset).
		Find(&userNotifications).Error; err != nil {
		return nil, fmt.Errorf("获取通知列表失败: %w", err)
	}

	// 转换为响应格式
	notifications := make([]types.NotificationResponse, len(userNotifications))
	for i, un := range userNotifications {
		notifications[i] = s.convertToNotificationResponse(&un)
	}

	return &types.PaginatedNotifications{
		Items: notifications,
		Meta: types.Meta{
			Page:      page,
			Limit:     pageSize,
			Total:     int(total),
			TotalPage: int((total + int64(pageSize) - 1) / int64(pageSize)),
		},
	}, nil
}

// GetUserNotificationStats 获取用户通知统计
func (s *NotificationService) GetUserNotificationStats(userID uuid.UUID) (*types.NotificationStats, error) {
	var stats types.NotificationStats

	// 总数
	if err := s.db.Model(&models.UserNotification{}).
		Where("user_id = ?", userID).
		Count(&stats.Total).Error; err != nil {
		return nil, fmt.Errorf("获取通知总数失败: %w", err)
	}

	// 未读数
	if err := s.db.Model(&models.UserNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&stats.Unread).Error; err != nil {
		return nil, fmt.Errorf("获取未读通知数失败: %w", err)
	}

	// 收藏数
	if err := s.db.Model(&models.UserNotification{}).
		Where("user_id = ? AND is_starred = ?", userID, true).
		Count(&stats.Starred).Error; err != nil {
		return nil, fmt.Errorf("获取收藏通知数失败: %w", err)
	}

	// 按类型统计
	var typeStats []struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}

	if err := s.db.Model(&models.UserNotification{}).
		Select("notifications.type, COUNT(*) as count").
		Joins("JOIN notifications ON notifications.id = user_notifications.notification_id").
		Where("user_notifications.user_id = ?", userID).
		Group("notifications.type").
		Scan(&typeStats).Error; err != nil {
		return nil, fmt.Errorf("获取类型统计失败: %w", err)
	}

	stats.ByType = make(map[string]int64)
	for _, ts := range typeStats {
		stats.ByType[ts.Type] = ts.Count
	}

	return &stats, nil
}

// MarkAsRead 标记通知为已读
func (s *NotificationService) MarkAsRead(userID, notificationID uuid.UUID) error {
	now := time.Now()
	result := s.db.Model(&models.UserNotification{}).
		Where("user_id = ? AND notification_id = ?", userID, notificationID).
		Updates(map[string]interface{}{
			"is_read":    true,
			"read_at":    &now,
			"updated_at": now,
		})

	if result.Error != nil {
		return fmt.Errorf("标记通知已读失败: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return errors.New("通知不存在或已处理")
	}

	return nil
}

// MarkAllAsRead 标记所有通知为已读
func (s *NotificationService) MarkAllAsRead(userID uuid.UUID) error {
	now := time.Now()
	if err := s.db.Model(&models.UserNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read":    true,
			"read_at":    &now,
			"updated_at": now,
		}).Error; err != nil {
		return fmt.Errorf("批量标记已读失败: %w", err)
	}

	return nil
}

// ToggleStar 切换通知收藏状态
func (s *NotificationService) ToggleStar(userID, notificationID uuid.UUID) error {
	var userNotification models.UserNotification
	if err := s.db.Where("user_id = ? AND notification_id = ?", userID, notificationID).
		First(&userNotification).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("通知不存在")
		}
		return fmt.Errorf("查询通知失败: %w", err)
	}

	userNotification.IsStarred = !userNotification.IsStarred
	userNotification.UpdatedAt = time.Now()

	if err := s.db.Save(&userNotification).Error; err != nil {
		return fmt.Errorf("更新收藏状态失败: %w", err)
	}

	return nil
}

// DeleteUserNotification 删除用户通知
func (s *NotificationService) DeleteUserNotification(userID, notificationID uuid.UUID) error {
	result := s.db.Where("user_id = ? AND notification_id = ?", userID, notificationID).
		Delete(&models.UserNotification{})

	if result.Error != nil {
		return fmt.Errorf("删除通知失败: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return errors.New("通知不存在")
	}

	return nil
}

// CreateNotificationForAllUsers 为所有用户创建通知
func (s *NotificationService) CreateNotificationForAllUsers(req *types.CreateNotificationRequest) error {
	// 创建通知
	notification := models.Notification{
		Type:       models.NotificationType(req.Type),
		Priority:   models.NotificationPriority(req.Priority),
		Title:      req.Title,
		Content:    req.Content,
		Summary:    req.Summary,
		Icon:       req.Icon,
		Image:      req.Image,
		ActionURL:  req.ActionURL,
		ActionText: req.ActionText,
		ExpiresAt:  req.ExpiresAt,
	}

	if req.Metadata != nil {
		metadataJSON, _ := json.Marshal(req.Metadata)
		metadataStr := string(metadataJSON)
		notification.Metadata = &metadataStr
	}

	if err := s.db.Create(&notification).Error; err != nil {
		return fmt.Errorf("创建通知失败: %w", err)
	}

	// 为所有用户创建通知状态
	var users []models.User
	if err := s.db.Find(&users).Error; err != nil {
		return fmt.Errorf("获取用户列表失败: %w", err)
	}

	userNotifications := make([]models.UserNotification, len(users))
	for i, user := range users {
		userNotifications[i] = models.UserNotification{
			UserID:         user.ID,
			NotificationID: notification.ID,
			IsRead:         false,
			IsStarred:      false,
		}
	}

	if err := s.db.CreateInBatches(userNotifications, 100).Error; err != nil {
		return fmt.Errorf("创建用户通知状态失败: %w", err)
	}

	return nil
}

// InitUserNotifications 为用户初始化通知状态
func (s *NotificationService) InitUserNotifications(userID uuid.UUID) error {
	// 使用高效的单一SQL语句批量插入，避免N+1查询问题
	sql := `
		INSERT INTO user_notifications (id, user_id, notification_id, is_read, is_starred, created_at, updated_at)
		SELECT 
			gen_random_uuid(),
			$1,
			n.id,
			false,
			false,
			CURRENT_TIMESTAMP,
			CURRENT_TIMESTAMP
		FROM notifications n
		WHERE n.deleted_at IS NULL
		AND NOT EXISTS (
			SELECT 1 FROM user_notifications un 
			WHERE un.user_id = $1 AND un.notification_id = n.id
		)`

	if err := s.db.Exec(sql, userID).Error; err != nil {
		return fmt.Errorf("初始化用户通知状态失败: %w", err)
	}

	return nil
}

// 辅助方法：转换为响应格式
func (s *NotificationService) convertToNotificationResponse(un *models.UserNotification) types.NotificationResponse {
	var metadata map[string]interface{}
	if un.Notification.Metadata != nil {
		json.Unmarshal([]byte(*un.Notification.Metadata), &metadata)
	}

	return types.NotificationResponse{
		ID:         un.Notification.ID,
		Type:       string(un.Notification.Type),
		Priority:   string(un.Notification.Priority),
		Title:      un.Notification.Title,
		Content:    un.Notification.Content,
		Summary:    un.Notification.Summary,
		Icon:       un.Notification.Icon,
		Image:      un.Notification.Image,
		ActionURL:  un.Notification.ActionURL,
		ActionText: un.Notification.ActionText,
		IsRead:     un.IsRead,
		IsStarred:  un.IsStarred,
		ReadAt:     un.ReadAt,
		CreatedAt:  un.Notification.CreatedAt,
		UpdatedAt:  un.UpdatedAt,
		ExpiresAt:  un.Notification.ExpiresAt,
		Metadata:   metadata,
	}
}
