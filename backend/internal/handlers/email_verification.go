package handlers

import (
	"net/http"
	"regexp"
	"strings"

	"aiicg-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// EmailVerificationOptimizedHandler optimized email verification handler
type EmailVerificationOptimizedHandler struct {
	services *services.ServiceContainer
}

// NewEmailVerificationOptimizedHandler create optimized email verification handler
func NewEmailVerificationOptimizedHandler(services *services.ServiceContainer) *EmailVerificationOptimizedHandler {
	return &EmailVerificationOptimizedHandler{
		services: services,
	}
}

// SendCodeRequest send verification code request with validation
type SendCodeRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=50"`
}

// VerifyCodeRequest verify code request with validation
type VerifyCodeRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}

// SendVerificationCode send email verification code with enhanced validation
func (h *EmailVerificationOptimizedHandler) SendVerificationCode(c *gin.Context) {
	var req SendCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Enhanced email validation
	if !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email format",
		})
		return
	}

	// Enhanced username validation
	if !isValidUsername(req.Username) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username must contain only letters, numbers, and underscores",
		})
		return
	}

	// Check if email already exists
	var count int64
	h.services.DB.Raw("SELECT COUNT(*) FROM users WHERE email = ? AND deleted_at IS NULL", req.Email).Scan(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email already registered",
			"code":  "EMAIL_EXISTS",
		})
		return
	}

	// Check if username already exists
	h.services.DB.Raw("SELECT COUNT(*) FROM users WHERE username = ? AND deleted_at IS NULL", req.Username).Scan(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username already taken",
			"code":  "USERNAME_EXISTS",
		})
		return
	}

	// Send verification email with rate limiting
	err := h.services.EmailService.SendVerificationEmail(req.Email, req.Username)
	if err != nil {
		// Handle different types of errors
		if strings.Contains(err.Error(), "rate limit") {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"details": err.Error(),
				"code":    "RATE_LIMIT_EXCEEDED",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to send verification email",
			"details": err.Error(),
			"code":    "EMAIL_SEND_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Verification code sent to your email",
		"email":     req.Email,
		"expiresIn": 300, // 5 minutes
		"attempts":  3,   // Maximum attempts
	})
}

// VerifyCode verify email verification code with enhanced error handling
func (h *EmailVerificationOptimizedHandler) VerifyCode(c *gin.Context) {
	var req VerifyCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Enhanced email validation
	if !isValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email format",
		})
		return
	}

	// Enhanced code validation
	if !isValidVerificationCode(req.Code) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Verification code must be 6 digits",
		})
		return
	}

	// Verify email code
	err := h.services.EmailService.VerifyCode(req.Email, req.Code)
	if err != nil {
		// Handle different types of errors
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "expired") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Verification code not found or expired",
				"code":  "CODE_EXPIRED",
			})
			return
		}

		if strings.Contains(err.Error(), "too many attempts") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Too many verification attempts, please request a new code",
				"code":  "TOO_MANY_ATTEMPTS",
			})
			return
		}

		if strings.Contains(err.Error(), "invalid") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
				"code":  "INVALID_CODE",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Verification failed",
			"details": err.Error(),
			"code":    "VERIFICATION_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Email verification successful",
		"email":    req.Email,
		"verified": true,
	})
}

// GetVerificationStatus get verification status for an email
func (h *EmailVerificationOptimizedHandler) GetVerificationStatus(c *gin.Context) {
	email := c.Query("email")
	if email == "" || !isValidEmail(email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid email parameter",
		})
		return
	}

	// Check if email is already registered
	var count int64
	h.services.DB.Raw("SELECT COUNT(*) FROM users WHERE email = ? AND deleted_at IS NULL", email).Scan(&count)
	
	if count > 0 {
		c.JSON(http.StatusOK, gin.H{
			"email":      email,
			"registered": true,
			"verified":   true,
		})
		return
	}

	// Check if there's a pending verification
	// This would require checking Redis, but for simplicity, we'll return basic info
	c.JSON(http.StatusOK, gin.H{
		"email":      email,
		"registered": false,
		"verified":   false,
	})
}

// Validation helper functions
func isValidEmail(email string) bool {
	// Enhanced email validation
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return false
	}
	
	// Additional checks
	if len(email) > 254 {
		return false
	}
	
	// Check for common invalid patterns
	invalidPatterns := []string{
		"..", // consecutive dots
		"@.", // dot immediately after @
		".@", // dot immediately before @
	}
	
	for _, pattern := range invalidPatterns {
		if strings.Contains(email, pattern) {
			return false
		}
	}
	
	return true
}

func isValidUsername(username string) bool {
	// Username validation: letters, numbers, underscores only
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	if !usernameRegex.MatchString(username) {
		return false
	}
	
	// Additional checks
	if len(username) < 3 || len(username) > 50 {
		return false
	}
	
	// Username cannot start or end with underscore
	if strings.HasPrefix(username, "_") || strings.HasSuffix(username, "_") {
		return false
	}
	
	// Username cannot be all numbers
	numberRegex := regexp.MustCompile(`^[0-9]+$`)
	if numberRegex.MatchString(username) {
		return false
	}
	
	return true
}

func isValidVerificationCode(code string) bool {
	// Verification code validation: exactly 6 digits
	codeRegex := regexp.MustCompile(`^[0-9]{6}$`)
	return codeRegex.MatchString(code)
}
