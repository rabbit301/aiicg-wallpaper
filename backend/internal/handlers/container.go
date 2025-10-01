package handlers

import (
	"aiicg-backend/internal/services"
)

// HandlerContainer handler container
type HandlerContainer struct {
	Services *services.ServiceContainer

	// Handlers
	UserHandler       *UserHandler
	WallpaperHandler  *WallpaperHandler
	AdminHandler      *AdminHandler
	HealthHandler     *HealthHandler
	GenerationHandler   *GenerationHandler
	EmailVerificationHandler *EmailVerificationOptimizedHandler
	NotificationHandler *NotificationHandler
	
}

// NewHandlerContainer create new handler container
func NewHandlerContainer(services *services.ServiceContainer) *HandlerContainer {
	return &HandlerContainer{
		Services:          services,
		UserHandler:       NewUserHandler(services.UserService),
		WallpaperHandler:  NewWallpaperHandler(services.WallpaperService),
		AdminHandler:      NewAdminHandler(services.AdminService),
		HealthHandler:     NewHealthHandler(services),
		GenerationHandler:   NewGenerationHandler(services),
		EmailVerificationHandler: NewEmailVerificationOptimizedHandler(services),
		NotificationHandler: NewNotificationHandler(services.NotificationService),
		
	}
}
