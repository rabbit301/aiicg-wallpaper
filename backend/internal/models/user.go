package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRole 用户角色类型
type UserRole string

// 定义用户角色常量
const (
	RoleUser       UserRole = "user"
	RoleVIP        UserRole = "vip"
	RoleAdmin      UserRole = "admin"
	RoleSuperAdmin UserRole = "super_admin"
)

// String 实现Stringer接口
func (r UserRole) String() string {
	return string(r)
}

// User 用户模型
type User struct {
	ID          uuid.UUID     `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Username    string        `json:"username" gorm:"unique;not null;size:50"`
	Email       string        `json:"email" gorm:"unique;not null;size:255"`
	PasswordHash string       `json:"-" gorm:"not null;size:255"`
	Avatar      *string       `json:"avatar" gorm:"size:500"`
	Bio         *string       `json:"bio" gorm:"type:text"`
	Role        string        `json:"role" gorm:"default:'user';size:20"`
	IsVIP       bool          `json:"is_vip" gorm:"default:false"`
	Language    string        `json:"language" gorm:"default:'zh-CN';size:10"`
	Timezone    string        `json:"timezone" gorm:"default:'Asia/Shanghai';size:50"`
	Theme       string        `json:"theme" gorm:"default:'system';size:10"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	LastLoginAt  *time.Time     `json:"last_login_at"`
	VIPExpiresAt *time.Time     `json:"vip_expires_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// 关联关系 - 暂时注释掉，简化模型
	// Wallpapers []Wallpaper `json:"wallpapers,omitempty" gorm:"foreignKey:UserID"`
	// Activities []UserActivity `json:"activities,omitempty" gorm:"foreignKey:UserID"`
	// Favorites  []UserFavorite `json:"favorites,omitempty" gorm:"foreignKey:UserID"`
}

// 添加RoleGuest到已有的常量中
const (
	RoleGuest UserRole = "guest"
)

// Permission 权限枚举
type Permission string

const (
	PermViewWallpapers        Permission = "view_wallpapers"
	PermGenerateWallpapers    Permission = "generate_wallpapers"
	PermDeleteOwnWallpapers   Permission = "delete_own_wallpapers"
	PermDeleteAnyWallpapers   Permission = "delete_any_wallpapers"
	PermManageUsers          Permission = "manage_users"
	PermSystemAdmin          Permission = "system_admin"
)

// RolePermissions 角色权限映射
var RolePermissions = map[UserRole][]Permission{
	RoleGuest: {
		PermViewWallpapers,
	},
	RoleUser: {
		PermViewWallpapers,
		PermGenerateWallpapers,
		PermDeleteOwnWallpapers,
	},
	RoleAdmin: {
		PermViewWallpapers,
		PermGenerateWallpapers,
		PermDeleteOwnWallpapers,
		PermDeleteAnyWallpapers,
	},
	RoleSuperAdmin: {
		PermViewWallpapers,
		PermGenerateWallpapers,
		PermDeleteOwnWallpapers,
		PermDeleteAnyWallpapers,
		PermManageUsers,
		PermSystemAdmin,
	},
}

// HasPermission 检查用户是否有指定权限
func (u *User) HasPermission(permission Permission) bool {
	role := UserRole(u.Role)
	permissions, exists := RolePermissions[role]
	if !exists {
		return false
	}

	for _, p := range permissions {
		if p == permission {
			return true
		}
	}
	return false
}

// IsAdmin 检查是否为管理员
func (u *User) IsAdmin() bool {
	role := UserRole(u.Role)
	return role == RoleAdmin || role == RoleSuperAdmin
}

// IsSuperAdmin 检查是否为超级管理员
func (u *User) IsSuperAdmin() bool {
	return UserRole(u.Role) == RoleSuperAdmin
}

// UserStats 用户统计信息
type UserStats struct {
	GeneratedWallpapers int64 `json:"generated_wallpapers"`
	Downloads          int64 `json:"downloads"`
	CompressedImages   int64 `json:"compressed_images"`
	DaysActive         int64 `json:"days_active"`
}

// UserProfile 用户信息响应
type UserProfile struct {
	ID          uuid.UUID  `json:"id"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	Avatar      *string    `json:"avatar"`
	Bio         *string    `json:"bio"`
	Role        string     `json:"role"`
	IsVIP       bool       `json:"is_vip"`
	Language    string     `json:"language"`
	Timezone    string     `json:"timezone"`
	JoinedAt    time.Time  `json:"joined_at"`
	LastLoginAt *time.Time `json:"last_login_at"`
}

// ToProfile 转换为用户信息响应
func (u *User) ToProfile() *UserProfile {
	return &UserProfile{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		Avatar:      u.Avatar,
		Bio:         u.Bio,
		Role:        string(u.Role),
		IsVIP:       u.IsVIP,
		Language:    u.Language,
		Timezone:    u.Timezone,
		JoinedAt:    u.CreatedAt,
		LastLoginAt: u.LastLoginAt,
	}
} 