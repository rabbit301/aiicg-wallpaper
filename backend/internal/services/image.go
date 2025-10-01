package services

import (
	"aiicg-backend/internal/config"
)

type ImageService struct {
	cfg *config.Config
}

func NewImageService(cfg *config.Config) *ImageService {
	return &ImageService{
		cfg: cfg,
	}
} 