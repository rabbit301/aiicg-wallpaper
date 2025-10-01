package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"aiicg-backend/internal/config"
	"aiicg-backend/internal/models"
	"aiicg-backend/pkg/auth"
	"aiicg-backend/pkg/types"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	db                  *gorm.DB
	cfg                 *config.Config
	notificationService *NotificationService
}

func NewUserService(db *gorm.DB, cfg *config.Config, notificationService *NotificationService) *UserService {
	return &UserService{
		db:                  db,
		cfg:                 cfg,
		notificationService: notificationService,
	}
}

// Register 用户注册
func (s *UserService) Register(req *types.RegisterRequest) (*types.AuthResponse, error) {
	// 检查用户名是否已存在
	var existingUser models.User
	if err := s.db.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名或邮箱已存在")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("密码加密失败: %w", err)
	}

	// 创建用户
	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Role:         "user",
		IsVIP:        false,
		Language:     "zh-CN",
		Timezone:     "Asia/Shanghai",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// 设置可选字段
	if req.Language != "" {
		user.Language = req.Language
	}
	if req.Timezone != "" {
		user.Timezone = req.Timezone
	}

	// 保存到数据库
	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("创建用户失败: %w", err)
	}

	// 自动初始化用户通知状态
	if s.notificationService != nil {
		if err := s.notificationService.InitUserNotifications(user.ID); err != nil {
			// 记录错误但不影响注册流程
			fmt.Printf("警告: 用户 %s 通知初始化失败: %v\n", user.ID, err)
		}
	}

	// 生成JWT令牌
	tokens, err := auth.GenerateTokenPair(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, fmt.Errorf("生成令牌失败: %w", err)
	}

	// 转换用户信息
	userProfile := s.convertToUserProfile(&user)

	return &types.AuthResponse{
		User:         userProfile,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		TokenType:    tokens.TokenType,
	}, nil
}

// Login 用户登录
func (s *UserService) Login(req *types.LoginRequest) (*types.AuthResponse, error) {
	// 查找用户（支持用户名或邮箱登录）
	var user models.User
	if err := s.db.Where("username = ? OR email = ?", req.Username, req.Username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, fmt.Errorf("查询用户失败: %w", err)
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("密码错误")
	}

	// 更新最后登录时间
	now := time.Now()
	user.LastLoginAt = &now
	s.db.Save(&user)

	// 生成JWT令牌
	tokens, err := auth.GenerateTokenPair(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, fmt.Errorf("生成令牌失败: %w", err)
	}

	// 转换用户信息
	userProfile := s.convertToUserProfile(&user)

	return &types.AuthResponse{
		User:         userProfile,
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		TokenType:    tokens.TokenType,
	}, nil
}

// GetProfile 获取用户资料
func (s *UserService) GetProfile(userID uuid.UUID) (*types.UserProfile, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, fmt.Errorf("查询用户失败: %w", err)
	}

	return s.convertToUserProfile(&user), nil
}

// UpdateProfile 更新用户资料
func (s *UserService) UpdateProfile(userID uuid.UUID, req *types.UpdateProfileRequest) (*types.UserProfile, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, fmt.Errorf("查询用户失败: %w", err)
	}

	// 更新字段
	if req.Username != nil {
		// 检查新用户名是否已存在
		var existingUser models.User
		if err := s.db.Where("username = ? AND id != ?", *req.Username, userID).First(&existingUser).Error; err == nil {
			return nil, errors.New("用户名已存在")
		}
		user.Username = *req.Username
	}

	if req.Email != nil {
		// 检查新邮箱是否已存在
		var existingUser models.User
		if err := s.db.Where("email = ? AND id != ?", *req.Email, userID).First(&existingUser).Error; err == nil {
			return nil, errors.New("邮箱已存在")
		}
		user.Email = *req.Email
	}

	if req.Avatar != nil {
		user.Avatar = req.Avatar
	}

	if req.Bio != nil {
		user.Bio = req.Bio
	}

	if req.Language != nil {
		user.Language = *req.Language
	}

	if req.Timezone != nil {
		user.Timezone = *req.Timezone
	}

	if req.Theme != nil {
		user.Theme = *req.Theme
	}

	user.UpdatedAt = time.Now()

	// 保存更新
	if err := s.db.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("更新用户失败: %w", err)
	}

	return s.convertToUserProfile(&user), nil
}

// GetUserStats 获取用户统计
func (s *UserService) GetUserStats(userID uuid.UUID) (*types.UserStats, error) {
	var stats types.UserStats

	// 获取用户信息
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, fmt.Errorf("查询用户失败: %w", err)
	}

	stats.VIPStatus = user.IsVIP

	// 统计生成的壁纸数量
	var wallpaperCount int64
	s.db.Model(&models.Wallpaper{}).Where("user_id = ?", userID).Count(&wallpaperCount)
	stats.WallpapersGenerated = int(wallpaperCount)

	// 统计下载数量（从壁纸的下载次数累加）
	var downloadCount int64
	s.db.Model(&models.Wallpaper{}).Where("user_id = ?", userID).Select("COALESCE(SUM(download_count), 0)").Scan(&downloadCount)
	stats.WallpapersDownloaded = int(downloadCount)

	// 统计收藏数量
	var favoriteCount int64
	s.db.Model(&models.UserFavorite{}).Where("user_id = ?", userID).Count(&favoriteCount)
	stats.FavoritesCount = int(favoriteCount)

	// 使用时长（暂时设为0，后续可以通过用户活动记录计算）
	stats.TotalUsageTime = 0

	return &stats, nil
}

// GetUserWallpapers 获取用户壁纸
func (s *UserService) GetUserWallpapers(userID uuid.UUID) ([]types.WallpaperResponse, error) {
	var wallpapers []models.Wallpaper
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&wallpapers).Error; err != nil {
		return nil, fmt.Errorf("查询用户壁纸失败: %w", err)
	}

	// 转换为响应格式
	result := make([]types.WallpaperResponse, len(wallpapers))
	for i, wp := range wallpapers {
		result[i] = s.convertToWallpaperResponse(&wp)
	}

	return result, nil
}

// GetUserFavorites 获取用户收藏
func (s *UserService) GetUserFavorites(userID uuid.UUID) ([]types.WallpaperResponse, error) {
	var favorites []models.UserFavorite
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&favorites).Error; err != nil {
		return nil, fmt.Errorf("查询用户收藏失败: %w", err)
	}

	// 手动查询wallpaper数据（因为关联关系被注释了）
	result := make([]types.WallpaperResponse, 0, len(favorites))
	for _, fav := range favorites {
		var wallpaper models.Wallpaper
		if err := s.db.Where("id = ?", fav.WallpaperID).First(&wallpaper).Error; err != nil {
			continue // 如果wallpaper不存在，跳过
		}

		wallpaperResp := s.convertToWallpaperResponse(&wallpaper)
		wallpaperResp.IsFavorite = true
		result = append(result, wallpaperResp)
	}

	return result, nil
}

// RefreshToken 刷新令牌
func (s *UserService) RefreshToken(refreshToken string) (*auth.TokenPair, error) {
	return auth.RefreshToken(refreshToken)
}

// 辅助方法：转换用户模型为响应格式
func (s *UserService) convertToUserProfile(user *models.User) *types.UserProfile {
	return &types.UserProfile{
		ID:           user.ID,
		Username:     user.Username,
		Email:        user.Email,
		Avatar:       user.Avatar,
		Bio:          user.Bio,
		Role:         user.Role,
		IsVIP:        user.IsVIP,
		Language:     user.Language,
		Timezone:     user.Timezone,
		Theme:        user.Theme,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
		LastLoginAt:  user.LastLoginAt,
		VIPExpiresAt: user.VIPExpiresAt,
	}
}

// 辅助方法：转换壁纸模型为响应格式
func (s *UserService) convertToWallpaperResponse(wallpaper *models.Wallpaper) types.WallpaperResponse {
	// 处理标签转换
	var tags []string
	if wallpaper.Tags != nil {
		json.Unmarshal(wallpaper.Tags, &tags)
	}

	return types.WallpaperResponse{
		ID:             wallpaper.ID,
		Title:          wallpaper.Title,
		Prompt:         wallpaper.Prompt,
		ImageURL:       wallpaper.ImageURL,
		ThumbnailURL:   wallpaper.ThumbnailURL,
		Width:          wallpaper.Width,
		Height:         wallpaper.Height,
		Format:         wallpaper.Format,
		UserID:         wallpaper.UserID,
		DownloadCount:  wallpaper.DownloadCount,
		FavoriteCount:  wallpaper.FavoriteCount,
		Tags:           tags,
		Category:       wallpaper.Category,
		IsPublic:       wallpaper.IsPublic,
		GenerationTime: wallpaper.GenerationTime,
		CreatedAt:      wallpaper.CreatedAt,
		UpdatedAt:      wallpaper.UpdatedAt,
	}
}
