package services

import (
	"aiicg-backend/internal/config"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type WallpaperService struct {
	db  *gorm.DB
	rdb *redis.Client
	cfg *config.Config
}

func NewWallpaperService(db *gorm.DB, rdb *redis.Client, cfg *config.Config) *WallpaperService {
	return &WallpaperService{
		db:  db,
		rdb: rdb,
		cfg: cfg,
	}
}

// DB 暴露底层DB以便少量handler直接使用（可后续封装）
func (s *WallpaperService) DB() *gorm.DB {
	return s.db
}
