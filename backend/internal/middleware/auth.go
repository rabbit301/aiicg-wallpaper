package middleware

import (
	"net/http"
	"strings"

	"aiicg-backend/pkg/auth"

	"github.com/gin-gonic/gin"
)

// Auth JWT认证中间件
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Missing authorization token",
				"code":  "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		claims, err := auth.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
				"code":  "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// 将用户信息存储到上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("claims", claims)

		c.Next()
	}
}

// OptionalAuth 可选认证中间件（用于不强制需要登录的接口）
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token != "" {
			claims, err := auth.ValidateToken(token)
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("username", claims.Username)
				c.Set("role", claims.Role)
				c.Set("claims", claims)
			}
		}
		c.Next()
	}
}

// RequireRole 检查用户角色中间件
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User role not found",
				"code":  "NO_ROLE",
			})
			c.Abort()
			return
		}

		role := userRole.(string)
		
		// 检查用户角色是否在允许的角色列表中
		for _, allowedRole := range roles {
			if role == allowedRole || role == "super_admin" {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"error": "Insufficient permissions",
			"code":  "INSUFFICIENT_PERMISSIONS",
		})
		c.Abort()
	}
}

// RequirePermission 检查用户权限中间件
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User claims not found",
				"code":  "NO_CLAIMS",
			})
			c.Abort()
			return
		}

		userClaims := claims.(*auth.Claims)
		
		// 超级管理员拥有所有权限
		if userClaims.Role == "super_admin" {
			c.Next()
			return
		}

		// TODO: 从数据库检查用户权限
		// 这里可以实现更复杂的权限检查逻辑
		
		c.Next()
	}
}

// AdminOnly 仅管理员访问中间件
func AdminOnly() gin.HandlerFunc {
	return RequireRole("admin", "super_admin")
}

// SuperAdminOnly 仅超级管理员访问中间件
func SuperAdminOnly() gin.HandlerFunc {
	return RequireRole("super_admin")
}

// extractToken 从请求中提取JWT token
func extractToken(c *gin.Context) string {
	// 从Authorization header提取
	bearerToken := c.GetHeader("Authorization")
	if len(strings.Split(bearerToken, " ")) == 2 {
		return strings.Split(bearerToken, " ")[1]
	}

	// 从Cookie中提取（备用方案）
	token, _ := c.Cookie("access_token")
	return token
}

// GetCurrentUserID 获取当前用户ID
func GetCurrentUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	return userID.(string), true
}

// GetCurrentUsername 获取当前用户名
func GetCurrentUsername(c *gin.Context) (string, bool) {
	username, exists := c.Get("username")
	if !exists {
		return "", false
	}
	return username.(string), true
}

// GetCurrentUserRole 获取当前用户角色
func GetCurrentUserRole(c *gin.Context) (string, bool) {
	role, exists := c.Get("role")
	if !exists {
		return "", false
	}
	return role.(string), true
}

// IsCurrentUserAdmin 检查当前用户是否为管理员
func IsCurrentUserAdmin(c *gin.Context) bool {
	role, exists := GetCurrentUserRole(c)
	if !exists {
		return false
	}
	return role == "admin" || role == "super_admin"
}

// IsCurrentUserSuperAdmin 检查当前用户是否为超级管理员
func IsCurrentUserSuperAdmin(c *gin.Context) bool {
	role, exists := GetCurrentUserRole(c)
	if !exists {
		return false
	}
	return role == "super_admin"
} 