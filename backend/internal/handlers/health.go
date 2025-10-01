package handlers

import (
	"net/http"

	"aiicg-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	services *services.ServiceContainer
}

func NewHealthHandler(services *services.ServiceContainer) *HealthHandler {
	return &HealthHandler{
		services: services,
	}
}

// Health 健康检查端点
func (h *HealthHandler) Health(c *gin.Context) {
	status := h.services.HealthCheck()
	
	// 检查所有服务是否健康
	allHealthy := true
	for _, s := range status {
		if s != "healthy" {
			allHealthy = false
			break
		}
	}

	httpStatus := http.StatusOK
	if !allHealthy {
		httpStatus = http.StatusServiceUnavailable
	}

	c.JSON(httpStatus, gin.H{
		"status":   status,
		"healthy":  allHealthy,
		"service":  "aiicg-backend",
		"version":  "1.0.0",
	})
}

// Ping 简单ping检查
func (h *HealthHandler) Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
		"service": "aiicg-backend",
	})
} 