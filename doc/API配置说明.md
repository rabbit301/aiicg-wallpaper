# AIICG壁纸站 - API配置详解

## 概述

AIICG壁纸站集成了多个外部API服务，用于AI图像生成、图像压缩和壁纸资源获取。本文档详细说明了所有API的配置方法和使用说明。

## 环境变量配置

### 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# AI图像生成 - Fal.ai (必需)
FAL_KEY=你的fal.ai密钥

# 云端智能压缩 - Cloudinary (可选，不配置将使用免费版压缩)
CLOUDINARY_CLOUD_NAME=dig04lnn7
CLOUDINARY_API_KEY=393378456155828
CLOUDINARY_API_SECRET=你的实际API密钥

# 壁纸资源API - Unsplash (可选)
UNSPLASH_API_KEY=你的Unsplash访问密钥

# 壁纸资源API - Pexels (可选)  
PEXELS_API_KEY=你的Pexels API密钥

# 动图资源API - Giphy (可选)
GIPHY_API_KEY=你的Giphy API密钥

# 运行环境
NODE_ENV=development
```

## API详细配置

### 1. Fal.ai (AI图像生成) 🔥 **必需配置**

**用途**: AI壁纸生成的核心服务  
**状态**: 必需 - 无此配置无法使用生成功能  
**费用**: 按使用量付费

#### 获取密钥步骤:
1. 访问 [Fal.ai官网](https://fal.ai/)
2. 注册账户并登录
3. 进入Dashboard，找到API Keys部分
4. 创建新的API密钥
5. 复制密钥到环境变量

#### 配置示例:
```bash
FAL_KEY=fal_xxx_your_api_key_here
```

#### 使用模型:
- **模型名称**: `fal-ai/flux/schnell`
- **生成参数**: 
  - 推理步数: 4 (快速生成)
  - 图像尺寸: 根据预设自动选择
  - 安全检查: 默认启用

#### 费用说明:
- 按生成次数计费
- 建议先申请免费额度测试
- 监控使用量避免超支

---

### 2. Cloudinary (云端AI压缩) ⭐ **推荐配置**

**用途**: 智能图像压缩和优化  
**状态**: 可选 - 不配置会回退到免费版压缩  
**费用**: 免费额度 + 付费套餐

#### 获取配置信息:
1. 访问 [Cloudinary官网](https://cloudinary.com/)
2. 注册免费账户
3. 进入Dashboard查看API Keys
4. 复制Cloud Name、API Key、API Secret

#### 配置示例:
```bash
CLOUDINARY_CLOUD_NAME=你的云名称
CLOUDINARY_API_KEY=你的API密钥  
CLOUDINARY_API_SECRET=你的API密钥
```

#### 功能特性:
- **AI智能压缩**: 自动选择最佳格式和质量
- **智能裁剪**: AI识别图像主体
- **格式转换**: 自动WebP/AVIF优化
- **圆形裁剪**: 360水冷屏幕圆形适配
- **批量处理**: 支持大量图片处理

#### 免费额度:
- 每月25,000次转换
- 25GB存储空间
- 25GB带宽

---

### 3. Unsplash (高质量壁纸) 📸 **可选配置**

**用途**: 获取高质量摄影壁纸  
**状态**: 可选 - 用于丰富壁纸库  
**费用**: 免费使用

#### 获取密钥步骤:
1. 访问 [Unsplash Developers](https://unsplash.com/developers)
2. 注册账户并创建应用
3. 获取Access Key
4. 复制到环境变量

#### 配置示例:
```bash
UNSPLASH_API_KEY=你的Unsplash访问密钥
```

#### API限制:
- 免费用户: 50请求/小时
- 付费用户: 5000请求/小时
- 图片质量: 高分辨率摄影作品

---

### 4. Pexels (免费商用壁纸) 🖼️ **可选配置**

**用途**: 获取免费商用图片  
**状态**: 可选 - 壁纸资源补充  
**费用**: 完全免费

#### 获取密钥步骤:
1. 访问 [Pexels API](https://www.pexels.com/api/)
2. 注册账户
3. 创建应用获取API密钥
4. 复制到环境变量

#### 配置示例:
```bash
PEXELS_API_KEY=你的Pexels API密钥
```

#### API限制:
- 200请求/小时/IP
- 20,000请求/月
- 所有图片免费商用

---

### 5. Giphy (动图资源) 🎬 **可选配置**

**用途**: 获取GIF动图资源  
**状态**: 可选 - 用于动画分类  
**费用**: 免费使用

#### 获取密钥步骤:
1. 访问 [Giphy Developers](https://developers.giphy.com/)
2. 注册账户
3. 创建应用获取API密钥
4. 复制到环境变量

#### 配置示例:
```bash
GIPHY_API_KEY=你的Giphy API密钥
```

#### API限制:
- 1000请求/小时/应用
- 适合小屏幕的GIF动图

## 配置验证

### API状态检查

项目提供了API状态检查功能:

```bash
# 启动开发服务器
npm run dev

# 访问API状态页面
http://localhost:3000/api/api-status
```

### 测试API连接

```bash
# 测试所有已配置的API
curl -X POST http://localhost:3000/api/test-apis
```

### 响应示例:
```json
{
  "success": true,
  "results": [
    {
      "api": "Unsplash",
      "status": "success",
      "statusCode": 200,
      "message": "连接成功"
    },
    {
      "api": "Pexels", 
      "status": "not_configured",
      "message": "API密钥未配置"
    }
  ],
  "summary": {
    "total": 3,
    "success": 1,
    "error": 0,
    "not_configured": 2
  }
}
```

## 配置优先级

### 必需配置 (影响核心功能)
1. **FAL_KEY** - AI生成功能无法使用
2. **NODE_ENV** - 影响开发/生产模式

### 推荐配置 (显著提升体验)
1. **CLOUDINARY_API_SECRET** - 启用AI智能压缩
2. **UNSPLASH_API_KEY** - 高质量壁纸资源

### 可选配置 (功能增强)
1. **PEXELS_API_KEY** - 补充壁纸资源
2. **GIPHY_API_KEY** - 动图资源支持

## 故障排除

### 常见问题

#### 1. Fal.ai Unauthorized 错误
```
Error [ApiError]: Unauthorized status: 401
```
**解决方案**:
- 检查FAL_KEY是否正确配置
- 确认密钥是否有效且有余额
- 重启开发服务器

#### 2. Cloudinary压缩失败
```
Cloudinary API Secret未配置，AI压缩功能将不可用
```
**解决方案**:
- 检查CLOUDINARY_API_SECRET配置
- 确认不是默认值 `your_api_secret_here`
- 验证Cloudinary账户状态

#### 3. 外部API超时
```
请求超时或网络错误
```
**解决方案**:
- 检查网络连接
- 验证API密钥权限
- 确认API服务状态

#### 4. 图片下载失败
```
下载失败: 403 Forbidden
```
**解决方案**:
- 检查图片URL有效性
- 验证API额度是否超限
- 使用代理URL重试

### 调试模式

开启详细日志:
```bash
NODE_ENV=development npm run dev
```

查看API调用日志:
- 浏览器开发者工具 → Network
- 服务器控制台输出
- API响应状态码

## 安全注意事项

### 密钥安全
- ❌ 不要将密钥提交到Git仓库
- ✅ 使用 `.env.local` 文件存储
- ✅ 定期轮换API密钥
- ✅ 监控API使用量

### 生产环境
- 使用环境变量注入密钥
- 设置合理的API限流
- 监控异常API调用
- 备份重要配置

### Git安全
```bash
# .gitignore 应包含:
.env.local
.env*.local
*.env
```

---

**配置完成度检查**:
- [ ] Fal.ai密钥已配置 (必需)
- [ ] Cloudinary已配置 (推荐)  
- [ ] Unsplash已配置 (可选)
- [ ] Pexels已配置 (可选)
- [ ] Giphy已配置 (可选)
- [ ] API状态检查通过
- [ ] 功能测试正常

**文档版本**: v1.0  
**更新时间**: 2024-12-28  
**维护者**: Masker (AI开发助手) 