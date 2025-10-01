package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// ErrorHandler 错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 记录panic错误
				log.Printf("🔥 Panic recovered: %v\n%s", err, debug.Stack())
				
				// 返回500错误
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
					"code":  "INTERNAL_ERROR",
				})
				c.Abort()
			}
		}()

		c.Next()

		// 检查是否有错误
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			log.Printf("❌ Request error: %v", err.Error())
			
			// 根据错误类型返回不同的状态码
			switch err.Type {
			case gin.ErrorTypeBind:
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid request format",
					"code":  "INVALID_REQUEST",
				})
			case gin.ErrorTypePublic:
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
					"code":  "BAD_REQUEST",
				})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
					"code":  "INTERNAL_ERROR",
				})
			}
		}
	}
}

// NotFoundHandler 404错误处理
func NotFoundHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Endpoint not found",
			"code":  "NOT_FOUND",
			"path":  c.Request.URL.Path,
		})
	}
}

// MethodNotAllowedHandler 405错误处理
func MethodNotAllowedHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"error": "Method not allowed",
			"code":  "METHOD_NOT_ALLOWED",
			"method": c.Request.Method,
		})
	}
} 