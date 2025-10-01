package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"aiicg-backend/internal/models"
	"aiicg-backend/internal/services"
	"aiicg-backend/pkg/types"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

type AdminHandler struct {
	adminService *services.AdminService
}

func NewAdminHandler(adminService *services.AdminService) *AdminHandler {
	return &AdminHandler{
		adminService: adminService,
	}
}

// GetDashboard 获取管理员仪表板
func (h *AdminHandler) GetDashboard(c *gin.Context) {
	// 获取用户统计
	var userCount int64
	if err := h.adminService.DB().Model(&models.User{}).Count(&userCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user count"})
		return
	}

	// 获取壁纸统计
	var wallpaperCount int64
	if err := h.adminService.DB().Model(&models.Wallpaper{}).Count(&wallpaperCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get wallpaper count"})
		return
	}

	// 获取今日生成数量（简化：假设有created_at字段）
	var todayCount int64
	today := time.Now().Format("2006-01-02")
	if err := h.adminService.DB().Model(&models.Wallpaper{}).
		Where("DATE(created_at) = ?", today).
		Count(&todayCount).Error; err != nil {
		// 如果查询失败，设置为0
		todayCount = 0
	}

	// 计算存储使用率（简化：固定值，实际应该计算真实存储）
	storageUsed := 75.6

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalUsers":       userCount,
			"totalWallpapers":  wallpaperCount,
			"todayGenerations": todayCount,
			"storageUsed":      storageUsed,
			"onlineUsers":      5, // 简化：固定值
			"apiCalls":        1000, // 简化：固定值
			"systemStatus":    "healthy",
		},
	})
}

// GetUsers 获取用户列表
func (h *AdminHandler) GetUsers(c *gin.Context) {
	q := c.Query("q")
	role := c.Query("role")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	users, total, err := h.adminService.GetUsers(q, role, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"users":   users,
		"meta":    gin.H{"page": page, "limit": limit, "total": total},
	})
}

// GetUser 获取单个用户
func (h *AdminHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := h.adminService.GetUser(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "user": user})
}

// UpdateUser 更新用户
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req types.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	user, err := h.adminService.UpdateUser(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "user": user})
}

// DeleteUser 删除用户
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.adminService.DeleteUser(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetAllWallpapers 获取所有壁纸
func (h *AdminHandler) GetAllWallpapers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	items, total, err := h.adminService.GetAllWallpapers(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "wallpapers": items, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

// DeleteWallpaper 删除壁纸
func (h *AdminHandler) DeleteWallpaper(c *gin.Context) {
	id := c.Param("id")
	if err := h.adminService.DeleteWallpaper(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// CreateWallpaper 管理员创建壁纸（预留）
func (h *AdminHandler) CreateWallpaper(c *gin.Context) {
	var req types.CreateWallpaperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	// 简化：直接写入数据库
	type W = models.Wallpaper
	w := W{
		Title:        req.Title,
		Prompt:       req.Prompt,
		ImageURL:     req.ImageURL,
		ThumbnailURL: req.ThumbnailURL,
		Width:        req.Width,
		Height:       req.Height,
		Format:       req.Format,
		Category:     req.Category,
		IsPublic:     req.IsPublic,
	}
	if req.Tags != nil {
		b, _ := json.Marshal(req.Tags)
		w.Tags = datatypes.JSON(b)
	}
	if err := h.adminService.DB().Create(&w).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "wallpaper": w})
}

// UpdateWallpaper 管理员更新壁纸（预留）
func (h *AdminHandler) UpdateWallpaper(c *gin.Context) {
	id := c.Param("id")
	var req types.UpdateWallpaperRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	updates := map[string]interface{}{}
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Category != nil {
		updates["category"] = *req.Category
	}
	if req.IsPublic != nil {
		updates["is_public"] = *req.IsPublic
	}
	if req.Tags != nil {
		b, _ := json.Marshal(*req.Tags)
		updates["tags"] = datatypes.JSON(b)
	}
	if err := h.adminService.DB().Model(&models.Wallpaper{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetSettings 获取系统设置（预留）
func (h *AdminHandler) GetSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "settings": gin.H{}})
}

// UpdateSettings 更新系统设置（预留）
func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var req types.AdminSettings
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	// TODO: 持久化保存到数据库或配置表
	c.JSON(http.StatusOK, gin.H{"success": true})
}
