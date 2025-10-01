package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aiicg-backend/internal/services"
	"aiicg-backend/pkg/types"
)

type NotificationHandler struct {
	notificationService *services.NotificationService
}

func NewNotificationHandler(notificationService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
	}
}

// GetNotifications 获取用户通知列表
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	// 解析查询参数
	var filter types.NotificationFilter

	// 类型过滤
	if types := c.QueryArray("types"); len(types) > 0 {
		filter.Types = types
	}

	// 优先级过滤
	if priorities := c.QueryArray("priorities"); len(priorities) > 0 {
		filter.Priorities = priorities
	}

	// 已读状态过滤
	if isReadStr := c.Query("is_read"); isReadStr != "" {
		if isRead, err := strconv.ParseBool(isReadStr); err == nil {
			filter.IsRead = &isRead
		}
	}

	// 收藏状态过滤
	if isStarredStr := c.Query("is_starred"); isStarredStr != "" {
		if isStarred, err := strconv.ParseBool(isStarredStr); err == nil {
			filter.IsStarred = &isStarred
		}
	}

	// 分页参数
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filter.Page = page
		}
	}

	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if pageSize, err := strconv.Atoi(pageSizeStr); err == nil && pageSize > 0 && pageSize <= 100 {
			filter.PageSize = pageSize
		}
	}

	// 日期范围过滤
	if startDate := c.Query("start_date"); startDate != "" {
		if endDate := c.Query("end_date"); endDate != "" {
			filter.DateRange = &struct {
				Start string `json:"start"`
				End   string `json:"end"`
			}{
				Start: startDate,
				End:   endDate,
			}
		}
	}

	notifications, err := h.notificationService.GetUserNotifications(uid, &filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
			"code":  "FETCH_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notifications retrieved successfully",
		"data":    notifications,
	})
}

// GetNotificationStats 获取通知统计信息
func (h *NotificationHandler) GetNotificationStats(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	stats, err := h.notificationService.GetUserNotificationStats(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
			"code":  "STATS_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification stats retrieved successfully",
		"data":    stats,
	})
}

// MarkAsRead 标记通知为已读
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	notificationIDStr := c.Param("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid notification ID",
			"code":  "INVALID_NOTIFICATION_ID",
		})
		return
	}

	if err := h.notificationService.MarkAsRead(uid, notificationID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
			"code":  "MARK_READ_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification marked as read successfully",
	})
}

// MarkAllAsRead 标记所有通知为已读
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	if err := h.notificationService.MarkAllAsRead(uid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
			"code":  "MARK_ALL_READ_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "All notifications marked as read successfully",
	})
}

// ToggleStar 切换通知收藏状态
func (h *NotificationHandler) ToggleStar(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	notificationIDStr := c.Param("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid notification ID",
			"code":  "INVALID_NOTIFICATION_ID",
		})
		return
	}

	if err := h.notificationService.ToggleStar(uid, notificationID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
			"code":  "TOGGLE_STAR_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification star status toggled successfully",
	})
}

// DeleteNotification 删除通知
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	notificationIDStr := c.Param("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid notification ID",
			"code":  "INVALID_NOTIFICATION_ID",
		})
		return
	}

	if err := h.notificationService.DeleteUserNotification(uid, notificationID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
			"code":  "DELETE_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification deleted successfully",
	})
}

// CreateNotification 创建全局通知（管理员功能）
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	// 这里应该检查管理员权限
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	var req types.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	if err := h.notificationService.CreateNotificationForAllUsers(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
			"code":  "CREATE_FAILED",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Notification created successfully",
	})
}

// UpdateNotification 管理员更新通知（预留）
func (h *NotificationHandler) UpdateNotification(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// DeleteNotificationAdmin 管理员删除通知（预留）
func (h *NotificationHandler) DeleteNotificationAdmin(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// InitUserNotifications 为用户初始化通知状态（临时API）
func (h *NotificationHandler) InitUserNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
			"code":  "UNAUTHORIZED",
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	if err := h.notificationService.InitUserNotifications(uid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
			"code":  "INIT_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User notifications initialized successfully",
	})
}
