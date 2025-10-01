package middleware

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestLogger 请求日志中间件
func RequestLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// 自定义日志格式
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// CustomLogger 自定义日志中间件
func CustomLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开始时间
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// 处理请求
		c.Next()

		// 结束时间
		end := time.Now()
		latency := end.Sub(start)

		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		bodySize := c.Writer.Size()

		if raw != "" {
			path = path + "?" + raw
		}

		// 根据状态码选择日志级别
		switch {
		case statusCode >= 400 && statusCode < 500:
			log.Printf("🟡 %s %s %d %v %s %d bytes",
				method, path, statusCode, latency, clientIP, bodySize)
		case statusCode >= 500:
			log.Printf("🔴 %s %s %d %v %s %d bytes",
				method, path, statusCode, latency, clientIP, bodySize)
		default:
			log.Printf("🟢 %s %s %d %v %s %d bytes",
				method, path, statusCode, latency, clientIP, bodySize)
		}
	}
} 