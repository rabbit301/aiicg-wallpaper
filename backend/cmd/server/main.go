package main

import (
	"log"
	

	"aiicg-backend/internal/config"
	"aiicg-backend/internal/database"
	"aiicg-backend/internal/handlers"
	"aiicg-backend/internal/middleware"
	"aiicg-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(".env"); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	// Load configuration
	cfg := config.Load()
	log.Printf("Configuration loaded: Environment=%s, Port=%s", cfg.Environment, cfg.Port)

	// Initialize database
	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Redis
	rdb := database.InitRedis(cfg.RedisURL)

	// Run database migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Create router
	router := gin.Default()

	// Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.FrontendURL, "http://localhost:3000", "http://localhost:3001", "http://localhost:3004"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With"}
	router.Use(cors.New(corsConfig))

	// Add middleware
	router.Use(middleware.RequestLogger())
	router.Use(middleware.ErrorHandler())

	// Initialize services
	serviceContainer := services.NewServiceContainer(db, rdb, cfg)

	// Initialize handlers
	handlerContainer := handlers.NewHandlerContainer(serviceContainer)

	// Setup routes
	handlers.SetupRoutes(router, handlerContainer)

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Frontend URL: %s", cfg.FrontendURL)
	log.Printf("Environment: %s", cfg.Environment)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
