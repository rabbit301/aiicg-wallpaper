package services

import (
	"context"

	"aiicg-backend/internal/config"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// ServiceContainer service container
type ServiceContainer struct {
	// Database connections
	DB  *gorm.DB
	RDB *redis.Client
	Cfg *config.Config

	// Business services
	UserService         *UserService
	WallpaperService    *WallpaperService
	AdminService        *AdminService
	ImageService        *ImageService
	EmailService        *EmailServiceOptimized
	NotificationService *NotificationService
}

// NewServiceContainer create new service container
func NewServiceContainer(db *gorm.DB, rdb *redis.Client, cfg *config.Config) *ServiceContainer {
	container := &ServiceContainer{
		DB:  db,
		RDB: rdb,
		Cfg: cfg,
	}

	// Initialize services (注意依赖顺序)
	container.NotificationService = NewNotificationService(db)
	container.UserService = NewUserService(db, cfg, container.NotificationService)
	container.WallpaperService = NewWallpaperService(db, rdb, cfg)
	container.AdminService = NewAdminService(db, rdb, cfg)
	container.ImageService = NewImageService(cfg)
	container.EmailService = NewEmailServiceOptimized(cfg.ResendAPIKey, cfg.EmailFrom, rdb)

	return container
}

// HealthCheck health check methods
func (c *ServiceContainer) HealthCheck() map[string]string {
	status := make(map[string]string)

	// Check database connection
	if sqlDB, err := c.DB.DB(); err != nil {
		status["database"] = "error"
	} else if err := sqlDB.Ping(); err != nil {
		status["database"] = "error"
	} else {
		status["database"] = "healthy"
	}

	// Check Redis connection
	ctx := context.Background()
	if err := c.RDB.Ping(ctx).Err(); err != nil {
		status["redis"] = "error"
	} else {
		status["redis"] = "healthy"
	}

	return status
}
