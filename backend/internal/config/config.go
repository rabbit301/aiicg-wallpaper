package config

import (
	"os"
	"strconv"
)

// Config application configuration structure
type Config struct {
	Environment   string
	Port          string
	DatabaseURL   string
	RedisURL      string
	JWTSecret     string
	FrontendURL   string
	CloudinaryURL string
	FalAPIKey     string
	FastGPTKey    string
	UnsplashKey   string
	PexelsKey     string
	GiphyKey      string
	ResendAPIKey  string
	EmailFrom     string
	EmailSMTP     EmailConfig
}

// EmailConfig email configuration
type EmailConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

// Load load configuration
func Load() *Config {
	return &Config{
		Environment:   getEnv("ENVIRONMENT", "development"),
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://user:password@localhost/aiicg?sslmode=disable"),
		RedisURL:      getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		FrontendURL:   getEnv("FRONTEND_URL", "http://localhost:3000"),
		CloudinaryURL: getEnv("CLOUDINARY_URL", ""),
		FalAPIKey:     getEnv("FAL_API_KEY", ""),
		FastGPTKey:    getEnv("FASTGPT_KEY", ""),
		UnsplashKey:   getEnv("UNSPLASH_API_KEY", ""),
		PexelsKey:     getEnv("PEXELS_API_KEY", ""),
		GiphyKey:      getEnv("GIPHY_API_KEY", ""),
		ResendAPIKey:  getEnv("RESEND_API_KEY", ""),
		EmailFrom:     getEnv("EMAIL_FROM", "noreply@aiicg.com"),
		EmailSMTP: EmailConfig{
			Host:     getEnv("SMTP_HOST", "smtp.gmail.com"),
			Port:     getEnvAsInt("SMTP_PORT", 587),
			Username: getEnv("SMTP_USERNAME", ""),
			Password: getEnv("SMTP_PASSWORD", ""),
			From:     getEnv("SMTP_FROM", "noreply@aiicg.com"),
		},
	}
}

// getEnv get environment variable, return default value if not exists
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt get environment variable and convert to integer
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvAsBool get environment variable and convert to boolean
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

// IsDevelopment check if development environment
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction check if production environment
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}
