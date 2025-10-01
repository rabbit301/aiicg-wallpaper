package database

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// InitDB initialize database connection
func InitDB(databaseURL string) (*gorm.DB, error) {
	// Configure GORM logger
	newLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Connect to database
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool parameters
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("database connection test failed: %w", err)
	}

	log.Println("Database connection successful")
	return db, nil
}

// InitRedis initialize Redis connection
func InitRedis(redisURL string) *redis.Client {
	// Parse Redis URL
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("Redis URL parsing failed: %v, using default config", err)
		opt = &redis.Options{
			Addr:     "localhost:6379",
			Password: "",
			DB:       0,
		}
	}

	// Create Redis client
	rdb := redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("Redis connection failed: %v", err)
		return nil
	}

	log.Println("Redis connection successful")
	return rdb
}

// RunMigrations run database migrations
func RunMigrations(db *gorm.DB) error {
	log.Println("Starting database migration...")

	// Use manual SQL migration to rebuild table structure
	err := runSQLMigration(db)
	if err != nil {
		return fmt.Errorf("SQL migration failed: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

// runSQLMigration execute SQL migration script
func runSQLMigration(db *gorm.DB) error {
	// Migration files to execute in order
	migrationFiles := []string{
		"001_clean_schema.sql",
		"002_add_user_theme.sql",
		"003_create_notifications.sql",
	}

	for _, filename := range migrationFiles {
		migrationPath := filepath.Join("migrations", filename)

		// Check if file exists
		if _, err := os.Stat(migrationPath); os.IsNotExist(err) {
			log.Printf("Migration file %s not found, skipping", filename)
			continue
		}

		// Read SQL migration file
		sqlContent, err := ioutil.ReadFile(migrationPath)
		if err != nil {
			log.Printf("Failed to read migration file %s: %v", filename, err)
			continue
		}

		// Execute SQL
		if err := db.Exec(string(sqlContent)).Error; err != nil {
			log.Printf("Failed to execute migration %s: %v", filename, err)
			continue
		}

		log.Printf("Migration %s executed successfully", filename)
	}

	return nil
}

// GetDB get database instance (for handlers and services)
func GetDB(db *gorm.DB) *gorm.DB {
	return db
}

// GetRedis get Redis instance
func GetRedis(rdb *redis.Client) *redis.Client {
	return rdb
}

// Transaction execute database transaction
func Transaction(db *gorm.DB, fn func(*gorm.DB) error) error {
	return db.Transaction(fn)
}
