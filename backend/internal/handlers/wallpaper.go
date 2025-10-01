package handlers

import (
	"net/http"
	"strconv"

	"aiicg-backend/internal/models"
	"aiicg-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type WallpaperHandler struct {
	wallpaperService *services.WallpaperService
}

func NewWallpaperHandler(wallpaperService *services.WallpaperService) *WallpaperHandler {
	return &WallpaperHandler{
		wallpaperService: wallpaperService,
	}
}

// GetWallpapers 获取壁纸列表
func (h *WallpaperHandler) GetWallpapers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	var items []models.Wallpaper
	var total int64
	q := h.wallpaperService.DB().Model(&models.Wallpaper{})
	if err := q.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := q.Order("created_at DESC").Limit(limit).Offset((page - 1) * limit).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "wallpapers": items, "meta": gin.H{"page": page, "limit": limit, "total": total}})
}

// GetWallpaper 获取单个壁纸
func (h *WallpaperHandler) GetWallpaper(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Get wallpaper endpoint",
	})
}

// CreateWallpaper 创建壁纸
func (h *WallpaperHandler) CreateWallpaper(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Create wallpaper endpoint",
	})
}

// UpdateWallpaper 更新壁纸
func (h *WallpaperHandler) UpdateWallpaper(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Update wallpaper endpoint",
	})
}

// DeleteWallpaper 删除壁纸
func (h *WallpaperHandler) DeleteWallpaper(c *gin.Context) {
	id := c.Param("id")
	result := h.wallpaperService.DB().Delete(&models.Wallpaper{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DownloadWallpaper 下载壁纸
func (h *WallpaperHandler) DownloadWallpaper(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Download wallpaper endpoint",
	})
}

// AddToFavorites 添加到收藏
func (h *WallpaperHandler) AddToFavorites(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Add to favorites endpoint",
	})
}

// RemoveFromFavorites 从收藏移除
func (h *WallpaperHandler) RemoveFromFavorites(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Remove from favorites endpoint",
	})
}
