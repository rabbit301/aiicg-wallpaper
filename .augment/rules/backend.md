---
type: auto
description: "Go后端开发规范 - 自动应用于.go文件"
---

# Go 后端开发规范

## 🎯 技术栈
- **语言**: Go 1.21+
- **框架**: Gin (HTTP路由)
- **ORM**: GORM (数据库操作)
- **数据库**: PostgreSQL + Redis
- **认证**: JWT + Refresh Token
- **部署**: Docker + VPS

## 📁 项目结构
```
backend/
├── cmd/server/          # 应用入口
├── internal/
│   ├── config/         # 配置管理
│   ├── database/       # 数据库连接
│   ├── handlers/       # HTTP处理器
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   └── services/       # 业务逻辑
├── pkg/                # 公共包
├── migrations/         # 数据库迁移
└── scripts/           # 脚本文件
```

## 🛠️ API开发规范

### 路由结构
```go
// API版本前缀
v1 := router.Group("/api/v1")

// 资源分组
auth := v1.Group("/auth")
user := v1.Group("/user")
admin := v1.Group("/admin")

// RESTful路由
user.GET("/profile", handlers.GetUserProfile)
user.PUT("/profile", handlers.UpdateUserProfile)
user.GET("/wallpapers", handlers.GetUserWallpapers)
```

### 处理器模式
```go
func GetUserProfile(c *gin.Context) {
    // 1. 参数验证
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(401, gin.H{"error": "未授权访问"})
        return
    }

    // 2. 业务逻辑调用
    profile, err := services.GetUserProfile(userID.(uint))
    if err != nil {
        c.JSON(500, gin.H{"error": "获取用户信息失败"})
        return
    }

    // 3. 统一响应格式
    c.JSON(200, gin.H{
        "success": true,
        "data":    profile,
        "message": "获取成功",
    })
}
```

### 统一响应格式
```go
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message"`
    Error   string      `json:"error,omitempty"`
}

// 成功响应
func SuccessResponse(c *gin.Context, data interface{}, message string) {
    c.JSON(200, APIResponse{
        Success: true,
        Data:    data,
        Message: message,
    })
}

// 错误响应
func ErrorResponse(c *gin.Context, code int, message string) {
    c.JSON(code, APIResponse{
        Success: false,
        Error:   message,
    })
}
```

## 🗄️ 数据库规范

### 模型定义
```go
type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Email     string    `gorm:"uniqueIndex;not null" json:"email"`
    Username  string    `gorm:"uniqueIndex;not null" json:"username"`
    Password  string    `gorm:"not null" json:"-"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    
    // 关联关系
    Wallpapers []Wallpaper `gorm:"foreignKey:UserID" json:"wallpapers,omitempty"`
}
```

### 数据库操作
```go
// 查询操作
func GetUserByID(db *gorm.DB, id uint) (*User, error) {
    var user User
    err := db.First(&user, id).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// 创建操作
func CreateUser(db *gorm.DB, user *User) error {
    return db.Create(user).Error
}

// 更新操作
func UpdateUser(db *gorm.DB, id uint, updates map[string]interface{}) error {
    return db.Model(&User{}).Where("id = ?", id).Updates(updates).Error
}
```

### 事务处理
```go
func TransferCredits(db *gorm.DB, fromUserID, toUserID uint, amount int) error {
    return db.Transaction(func(tx *gorm.DB) error {
        // 扣除发送方积分
        if err := tx.Model(&User{}).Where("id = ?", fromUserID).
            Update("credits", gorm.Expr("credits - ?", amount)).Error; err != nil {
            return err
        }
        
        // 增加接收方积分
        if err := tx.Model(&User{}).Where("id = ?", toUserID).
            Update("credits", gorm.Expr("credits + ?", amount)).Error; err != nil {
            return err
        }
        
        return nil
    })
}
```

## 🔐 认证授权

### JWT中间件
```go
func JWTAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "缺少认证令牌"})
            c.Abort()
            return
        }

        // 验证JWT令牌
        claims, err := ValidateJWT(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "无效的认证令牌"})
            c.Abort()
            return
        }

        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

### 权限控制
```go
func RequireRole(role string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userRole, exists := c.Get("userRole")
        if !exists || userRole != role {
            c.JSON(403, gin.H{"error": "权限不足"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

## 🛡️ 安全规范

### 输入验证
```go
type CreateUserRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Username string `json:"username" binding:"required,min=3,max=20"`
    Password string `json:"password" binding:"required,min=8"`
}

func CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "请求参数无效"})
        return
    }
    // 处理逻辑...
}
```

### 密码安全
```go
import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    return string(bytes), err
}

func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### SQL注入防护
```go
// ✅ 正确 - 使用参数化查询
db.Where("email = ? AND status = ?", email, "active").First(&user)

// ❌ 错误 - 字符串拼接
db.Where(fmt.Sprintf("email = '%s'", email)).First(&user)
```

## 📊 日志和监控

### 结构化日志
```go
import "github.com/sirupsen/logrus"

func LogUserAction(userID uint, action string, details map[string]interface{}) {
    logrus.WithFields(logrus.Fields{
        "user_id": userID,
        "action":  action,
        "details": details,
    }).Info("用户操作记录")
}
```

### 错误处理
```go
func HandleError(c *gin.Context, err error, message string) {
    logrus.WithFields(logrus.Fields{
        "error":  err.Error(),
        "path":   c.Request.URL.Path,
        "method": c.Request.Method,
    }).Error(message)
    
    c.JSON(500, gin.H{"error": message})
}
```

## ⚡ 性能优化

### 数据库优化
```go
// 预加载关联数据
db.Preload("Wallpapers").Find(&users)

// 分页查询
func GetWallpapers(db *gorm.DB, page, pageSize int) ([]Wallpaper, error) {
    var wallpapers []Wallpaper
    offset := (page - 1) * pageSize
    err := db.Offset(offset).Limit(pageSize).Find(&wallpapers).Error
    return wallpapers, err
}
```

### 缓存策略
```go
import "github.com/go-redis/redis/v8"

func GetUserFromCache(rdb *redis.Client, userID uint) (*User, error) {
    key := fmt.Sprintf("user:%d", userID)
    val, err := rdb.Get(ctx, key).Result()
    if err != nil {
        return nil, err
    }
    
    var user User
    err = json.Unmarshal([]byte(val), &user)
    return &user, err
}
```

## 🧪 测试规范
- 单元测试覆盖率 > 80%
- 集成测试覆盖主要API
- 性能测试验证响应时间
- 安全测试防范常见攻击

## 🚀 部署规范
- Docker容器化部署
- 环境变量配置
- 健康检查端点
- 优雅关闭处理

---
**重要**: 所有后端代码都必须遵循此规范，确保系统的安全性、可维护性和性能。
