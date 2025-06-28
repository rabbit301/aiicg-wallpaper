# Cloudinary AI压缩配置指南

## 获取Cloudinary API密钥

1. 访问 [Cloudinary官网](https://cloudinary.com/)
2. 注册免费账户或登录现有账户
3. 进入Dashboard，查看API Keys部分
4. 复制以下信息：
   - Cloud Name (已配置: dig04lnn7)
   - API Key (已配置: 393378456155828)
   - API Secret (需要配置)

## 配置步骤

1. 打开 `.env.local` 文件
2. 将 `CLOUDINARY_API_SECRET=your_api_secret_here` 替换为实际的API Secret
3. 重启开发服务器

## 示例配置

```env
# Cloudinary Configuration (AI Compression)
CLOUDINARY_CLOUD_NAME=dig04lnn7
CLOUDINARY_API_KEY=393378456155828
CLOUDINARY_API_SECRET=你的实际API密钥
```

## 免费额度

Cloudinary免费账户包含：
- 每月25,000次图片转换
- 25GB存储空间
- 25GB带宽

## 注意事项

- 如果不配置Cloudinary，AI压缩功能将不可用
- 系统会自动回退到免费版压缩
- 免费版压缩功能完全可用，无需外部API

## 测试AI压缩

配置完成后：
1. 重启开发服务器
2. 刷新页面
3. AI版按钮应显示为可用状态
4. 选择AI版进行压缩测试
