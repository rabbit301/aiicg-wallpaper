package handlers

import (
	"aiicg-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes setup all API routes
func SetupRoutes(r *gin.Engine, handlers *HandlerContainer) {
	// Global middleware
	r.Use(middleware.RequestLogger())
	r.Use(middleware.ErrorHandler())
	r.Use(gin.Recovery())

	// Health check routes (no auth required)
	r.GET("/health", handlers.HealthHandler.Health)
	r.GET("/ping", handlers.HealthHandler.Ping)

	// Email test route (development environment)

	// API v1 route group
	v1 := r.Group("/api/v1")
	{
		// Authentication routes (no auth required)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.UserHandler.Register)
			auth.POST("/login", handlers.UserHandler.Login)
			auth.POST("/refresh", handlers.UserHandler.RefreshToken)

			// Email verification for registration
			auth.POST("/send-verification", handlers.EmailVerificationHandler.SendVerificationCode)
			auth.POST("/verify-code", handlers.EmailVerificationHandler.VerifyCode)
			auth.GET("/verification-status", handlers.EmailVerificationHandler.GetVerificationStatus)
		}

		// User routes (auth required)
		user := v1.Group("/user")
		user.Use(middleware.Auth())
		{
			user.GET("/profile", handlers.UserHandler.GetProfile)
			user.PUT("/profile", handlers.UserHandler.UpdateProfile)
			user.GET("/stats", handlers.UserHandler.GetUserStats)
			user.GET("/wallpapers", handlers.UserHandler.GetUserWallpapers)
			user.GET("/favorites", handlers.UserHandler.GetUserFavorites)
		}

		// Notification routes (auth required)
		notifications := v1.Group("/notifications")
		notifications.Use(middleware.Auth())
		{
			notifications.GET("", handlers.NotificationHandler.GetNotifications)
			notifications.GET("/stats", handlers.NotificationHandler.GetNotificationStats)
			notifications.PUT("/:id/read", handlers.NotificationHandler.MarkAsRead)
			notifications.PUT("/read-all", handlers.NotificationHandler.MarkAllAsRead)
			notifications.PUT("/:id/star", handlers.NotificationHandler.ToggleStar)
			notifications.DELETE("/:id", handlers.NotificationHandler.DeleteNotification)
			// notifications.POST("/init", handlers.NotificationHandler.InitUserNotifications) // 已废弃：现在用户注册时自动初始化
		}

		// Wallpaper generation routes (auth required)
		generation := v1.Group("/generate")
		generation.Use(middleware.Auth())
		{
			generation.POST("/wallpaper", handlers.GenerationHandler.GenerateWallpaper)
		}

		// Wallpaper routes
		wallpapers := v1.Group("/wallpapers")
		{
			// Public routes
			wallpapers.GET("", handlers.WallpaperHandler.GetWallpapers)
			wallpapers.GET("/:id", handlers.WallpaperHandler.GetWallpaper)
			wallpapers.GET("/:id/download", handlers.WallpaperHandler.DownloadWallpaper)

			// Auth required routes
			protected := wallpapers.Group("")
			protected.Use(middleware.Auth())
			{
				protected.POST("", handlers.WallpaperHandler.CreateWallpaper)
				protected.PUT("/:id", handlers.WallpaperHandler.UpdateWallpaper)
				protected.DELETE("/:id", handlers.WallpaperHandler.DeleteWallpaper)
				protected.POST("/:id/favorite", handlers.WallpaperHandler.AddToFavorites)
				protected.DELETE("/:id/favorite", handlers.WallpaperHandler.RemoveFromFavorites)
			}
		}

		// Admin routes (admin role required)
		admin := v1.Group("/admin")
		admin.Use(middleware.Auth())
		admin.Use(middleware.RequireRole("admin", "super_admin"))
		{
			admin.GET("/dashboard", handlers.AdminHandler.GetDashboard)
			admin.GET("/users", handlers.AdminHandler.GetUsers)
			admin.GET("/users/:id", handlers.AdminHandler.GetUser)
			admin.PUT("/users/:id", handlers.AdminHandler.UpdateUser)
			admin.DELETE("/users/:id", handlers.AdminHandler.DeleteUser)
			admin.GET("/wallpapers", handlers.AdminHandler.GetAllWallpapers)
			admin.POST("/wallpapers", handlers.AdminHandler.CreateWallpaper)
			admin.PUT("/wallpapers/:id", handlers.AdminHandler.UpdateWallpaper)
			admin.DELETE("/wallpapers/:id", handlers.AdminHandler.DeleteWallpaper)

			// Admin notification management
			admin.POST("/notifications", handlers.NotificationHandler.CreateNotification)
			admin.PUT("/notifications/:id", handlers.NotificationHandler.UpdateNotification)
			admin.DELETE("/notifications/:id", handlers.NotificationHandler.DeleteNotificationAdmin)

			// Settings
			admin.GET("/settings", handlers.AdminHandler.GetSettings)
			admin.PUT("/settings", handlers.AdminHandler.UpdateSettings)
		}
	}
}
