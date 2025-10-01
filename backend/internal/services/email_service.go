package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// EmailServiceOptimized optimized email service with Redis storage
type EmailServiceOptimized struct {
	resendAPIKey string
	fromEmail    string
	redis        *redis.Client
}

// NewEmailServiceOptimized create optimized email service
func NewEmailServiceOptimized(resendAPIKey, fromEmail string, redis *redis.Client) *EmailServiceOptimized {
	return &EmailServiceOptimized{
		resendAPIKey: resendAPIKey,
		fromEmail:    fromEmail,
		redis:        redis,
	}
}

// SendEmailRequest email sending request
type SendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
	Text    string   `json:"text,omitempty"`
}

// SendEmailResponse email sending response
type SendEmailResponse struct {
	ID string `json:"id"`
}

// VerificationCodeInfo verification code information
type VerificationCodeInfo struct {
	Email     string    `json:"email"`
	Code      string    `json:"code"`
	Username  string    `json:"username"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	Attempts  int       `json:"attempts"`
}

const (
	// Redis keys
	VERIFICATION_CODE_PREFIX = "verification_code:"
	RATE_LIMIT_PREFIX       = "rate_limit:"
	
	// Limits
	CODE_EXPIRY_MINUTES     = 5
	RATE_LIMIT_MINUTES      = 1
	MAX_ATTEMPTS_PER_EMAIL  = 3
	MAX_SENDS_PER_HOUR      = 5
)

// SendVerificationEmail send verification email with rate limiting
func (e *EmailServiceOptimized) SendVerificationEmail(email, username string) error {
	ctx := context.Background()
	
	// Check rate limiting
	if err := e.checkRateLimit(ctx, email); err != nil {
		return err
	}
	
	// Generate 6-digit verification code
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	// Store verification code in Redis
	codeInfo := VerificationCodeInfo{
		Email:     email,
		Code:      code,
		Username:  username,
		ExpiresAt: time.Now().Add(CODE_EXPIRY_MINUTES * time.Minute),
		CreatedAt: time.Now(),
		Attempts:  0,
	}
	
	codeJSON, err := json.Marshal(codeInfo)
	if err != nil {
		return fmt.Errorf("failed to marshal verification code: %w", err)
	}
	
	// Store in Redis with expiration
	redisKey := VERIFICATION_CODE_PREFIX + email
	err = e.redis.Set(ctx, redisKey, codeJSON, CODE_EXPIRY_MINUTES*time.Minute).Err()
	if err != nil {
		return fmt.Errorf("failed to store verification code in Redis: %w", err)
	}
	
	// Update rate limiting counter
	e.updateRateLimit(ctx, email)
	
	log.Printf("📧 Verification code stored in Redis for %s: %s (expires in %d minutes)", 
		email, code, CODE_EXPIRY_MINUTES)
	
	// Generate email content
	subject := "AIICG Wallpaper - Email Verification Code"
	html := e.generateVerificationHTML(code, username)
	text := e.generateVerificationText(code, username)
	
	// Send email
	if e.resendAPIKey == "" || e.resendAPIKey == "your-resend-api-key-here" {
		// Mock email service for development
		log.Printf("🔧 Mock Email Service (Development Environment)")
		log.Printf("📧 To: %s", email)
		log.Printf("📋 Subject: %s", subject)
		log.Printf("🔑 Verification Code: %s", code)
		log.Printf("⏰ Valid for: %d minutes", CODE_EXPIRY_MINUTES)
		return nil
	}
	
	return e.sendWithResend(email, subject, html, text)
}

// VerifyCode verify verification code with attempt limiting
func (e *EmailServiceOptimized) VerifyCode(email, inputCode string) error {
	ctx := context.Background()
	
	log.Printf("🔍 Verifying code for %s: input=%s", email, inputCode)
	
	// Get verification code from Redis
	redisKey := VERIFICATION_CODE_PREFIX + email
	codeJSON, err := e.redis.Get(ctx, redisKey).Result()
	if err == redis.Nil {
		log.Printf("❌ No verification code found for email: %s", email)
		return fmt.Errorf("verification code not found or expired")
	} else if err != nil {
		return fmt.Errorf("failed to get verification code from Redis: %w", err)
	}
	
	var codeInfo VerificationCodeInfo
	if err := json.Unmarshal([]byte(codeJSON), &codeInfo); err != nil {
		return fmt.Errorf("failed to unmarshal verification code: %w", err)
	}
	
	log.Printf("📋 Found stored code: %s, expires at: %s, attempts: %d", 
		codeInfo.Code, codeInfo.ExpiresAt.Format("15:04:05"), codeInfo.Attempts)
	
	// Check if expired
	if time.Now().After(codeInfo.ExpiresAt) {
		e.redis.Del(ctx, redisKey)
		log.Printf("⏰ Verification code expired for: %s", email)
		return fmt.Errorf("verification code expired")
	}
	
	// Check attempt limit
	if codeInfo.Attempts >= MAX_ATTEMPTS_PER_EMAIL {
		e.redis.Del(ctx, redisKey)
		log.Printf("🚫 Too many attempts for: %s", email)
		return fmt.Errorf("too many verification attempts, please request a new code")
	}
	
	// Check code
	if codeInfo.Code != inputCode {
		// Increment attempt counter
		codeInfo.Attempts++
		updatedJSON, _ := json.Marshal(codeInfo)
		e.redis.Set(ctx, redisKey, updatedJSON, time.Until(codeInfo.ExpiresAt))
		
		log.Printf("❌ Code mismatch. Expected: %s, Got: %s, Attempts: %d/%d", 
			codeInfo.Code, inputCode, codeInfo.Attempts, MAX_ATTEMPTS_PER_EMAIL)
		return fmt.Errorf("invalid verification code (%d/%d attempts)", codeInfo.Attempts, MAX_ATTEMPTS_PER_EMAIL)
	}
	
	// Remove verification code after successful verification
	e.redis.Del(ctx, redisKey)
	log.Printf("✅ Email verification successful: %s", email)
	return nil
}

// checkRateLimit check if email sending rate limit is exceeded
func (e *EmailServiceOptimized) checkRateLimit(ctx context.Context, email string) error {
	rateLimitKey := RATE_LIMIT_PREFIX + email
	
	// Get current count
	countStr, err := e.redis.Get(ctx, rateLimitKey).Result()
	if err == redis.Nil {
		return nil // No previous sends
	} else if err != nil {
		log.Printf("⚠️ Failed to check rate limit: %v", err)
		return nil // Allow on Redis error
	}
	
	count, err := strconv.Atoi(countStr)
	if err != nil {
		return nil // Allow on parse error
	}
	
	if count >= MAX_SENDS_PER_HOUR {
		return fmt.Errorf("rate limit exceeded: maximum %d verification emails per hour", MAX_SENDS_PER_HOUR)
	}
	
	return nil
}

// updateRateLimit update rate limiting counter
func (e *EmailServiceOptimized) updateRateLimit(ctx context.Context, email string) {
	rateLimitKey := RATE_LIMIT_PREFIX + email
	
	// Increment counter with 1 hour expiration
	pipe := e.redis.Pipeline()
	pipe.Incr(ctx, rateLimitKey)
	pipe.Expire(ctx, rateLimitKey, time.Hour)
	_, err := pipe.Exec(ctx)
	
	if err != nil {
		log.Printf("⚠️ Failed to update rate limit: %v", err)
	}
}

// sendWithResend send email using Resend API
func (e *EmailServiceOptimized) sendWithResend(to, subject, html, text string) error {
	log.Printf("📧 Sending email via Resend to: %s", to)
	
	reqBody := SendEmailRequest{
		From:    e.fromEmail,
		To:      []string{to},
		Subject: subject,
		HTML:    html,
		Text:    text,
	}
	
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %w", err)
	}
	
	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Authorization", "Bearer "+e.resendAPIKey)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		var errorResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errorResp)
		log.Printf("❌ Resend API error: %v", errorResp)
		return fmt.Errorf("resend API error: %d - %v", resp.StatusCode, errorResp)
	}
	
	var response SendEmailResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}
	
	log.Printf("✅ Email sent successfully, ID: %s", response.ID)
	return nil
}

// generateVerificationHTML generate optimized HTML email template
func (e *EmailServiceOptimized) generateVerificationHTML(code, username string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - AIICG Wallpaper</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        .code-section {
            text-align: center;
            margin: 30px 0;
        }
        .code-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .code-box {
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            display: inline-block;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .instructions {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 30px 20px;
            color: #6c757d;
            font-size: 14px;
        }
        .security-tips {
            margin-top: 20px;
            font-size: 13px;
            color: #666;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 20px;
                border-radius: 12px;
            }
            .content {
                padding: 30px 20px;
            }
            .code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🎨 AIICG Wallpaper</div>
            <div class="subtitle">AI Intelligent Wallpaper Generator</div>
        </div>
        
        <div class="content">
            <div class="greeting">Dear %s,</div>
            
            <p>Thank you for registering with AIICG Wallpaper! To complete your registration, please verify your email address using the verification code below:</p>
            
            <div class="code-section">
                <div class="code-label">Your Verification Code</div>
                <div class="code-box">
                    <div class="code">%s</div>
                </div>
            </div>
            
            <div class="instructions">
                <strong>📋 How to use this code:</strong>
                <ol>
                    <li>Return to the AIICG Wallpaper registration page</li>
                    <li>Enter this 6-digit verification code</li>
                    <li>Complete your account setup</li>
                </ol>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                    <li>This code is valid for <strong>%d minutes only</strong></li>
                    <li>You have <strong>3 attempts</strong> to enter the correct code</li>
                    <li>Never share this code with anyone</li>
                    <li>If you didn't request this verification, please ignore this email</li>
                </ul>
            </div>
            
            <p>After verification, you'll be able to:</p>
            <ul style="color: #667eea;">
                <li>🎨 Generate unlimited AI wallpapers</li>
                <li>💾 Save and manage your creations</li>
                <li>⭐ Favorite wallpapers you love</li>
                <li>🎭 Access premium features</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email was sent automatically, please do not reply.</p>
            <p><strong>© 2024 AIICG Wallpaper</strong> - Let AI Create Beauty for You</p>
            
            <div class="security-tips">
                <p>🔒 <strong>Security Tips:</strong></p>
                <p>• Always verify the sender's email address<br>
                • AIICG will never ask for your password via email<br>
                • Report suspicious emails to security@aiicg.com</p>
            </div>
        </div>
    </div>
</body>
</html>`, username, code, CODE_EXPIRY_MINUTES)
}

// generateVerificationText generate plain text email template
func (e *EmailServiceOptimized) generateVerificationText(code, username string) string {
	return fmt.Sprintf(`
AIICG Wallpaper - Email Verification Code

Dear %s,

Thank you for registering with AIICG Wallpaper!

Your verification code is: %s

This code is valid for %d minutes and you have 3 attempts to enter it correctly.

How to use this code:
1. Return to the AIICG Wallpaper registration page
2. Enter this 6-digit verification code
3. Complete your account setup

Security reminders:
- Never share this code with anyone
- If you didn't request this verification, please ignore this email
- AIICG will never ask for your password via email

After verification, you'll be able to generate unlimited AI wallpapers, save your creations, and access premium features.

This email was sent automatically, please do not reply.
© 2024 AIICG Wallpaper - Let AI Create Beauty for You
`, username, code, CODE_EXPIRY_MINUTES)
}
