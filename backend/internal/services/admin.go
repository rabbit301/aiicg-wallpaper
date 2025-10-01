package services

import (
	"aiicg-backend/internal/config"
	"aiicg-backend/internal/models"
	"aiicg-backend/pkg/types"
	"errors"
	"fmt"
	"strings"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type AdminService struct {
	db  *gorm.DB
	rdb *redis.Client
	cfg *config.Config
}

func NewAdminService(db *gorm.DB, rdb *redis.Client, cfg *config.Config) *AdminService {
	return &AdminService{
		db:  db,
		rdb: rdb,
		cfg: cfg,
	}
}

// DB 暴露DB供少量handler直接使用（后续可内聚）
func (s *AdminService) DB() *gorm.DB {
	return s.db
}

// GetUsers 分页获取用户列表（支持关键词与角色过滤）
func (s *AdminService) GetUsers(q, role string, page, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := s.db.Model(&models.User{})
	if q != "" {
		like := fmt.Sprintf("%%%s%%", strings.TrimSpace(q))
		query = query.Where("username ILIKE ? OR email ILIKE ?", like, like)
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// GetUser 获取单个用户
func (s *AdminService) GetUser(id string) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser 更新用户（角色/VIP等）
func (s *AdminService) UpdateUser(id string, req types.UpdateUserRequest) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if req.Username != nil {
		updates["username"] = *req.Username
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.IsVIP != nil {
		updates["is_vip"] = *req.IsVIP
	}

	if len(updates) == 0 {
		return &user, nil
	}

	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// DeleteUser 删除用户
func (s *AdminService) DeleteUser(id string) error {
	result := s.db.Delete(&models.User{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("用户不存在")
	}
	return nil
}

// GetAllWallpapers 分页获取所有壁纸
func (s *AdminService) GetAllWallpapers(page, limit int) ([]models.Wallpaper, int64, error) {
	var wallpapers []models.Wallpaper
	var total int64

	q := s.db.Model(&models.Wallpaper{})
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	if err := q.Order("created_at DESC").Limit(limit).Offset(offset).Find(&wallpapers).Error; err != nil {
		return nil, 0, err
	}
	return wallpapers, total, nil
}

// DeleteWallpaper 管理员删除壁纸
func (s *AdminService) DeleteWallpaper(id string) error {
	result := s.db.Delete(&models.Wallpaper{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("壁纸不存在")
	}
	return nil
}
