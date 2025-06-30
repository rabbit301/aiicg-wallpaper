# 🚀 VPS部署指南

## 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **内存**: 最低2GB，推荐4GB+
- **存储**: 最低10GB可用空间
- **Node.js**: 20.11.0 LTS
- **网络**: 公网IP和域名（可选）

## 🎯 一键部署脚本

### 快速开始

```bash
# 下载部署脚本
curl -fsSL https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh -o deploy.sh

# 赋予执行权限
chmod +x deploy.sh

# 执行部署
sudo ./deploy.sh
```

### 手动部署步骤

#### 1. 系统准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# sudo yum update -y                    # CentOS

# 安装基础工具
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx

# 安装Node.js 20.11.0 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v20.11.0
npm --version   # 应显示 10.9.2+
```

#### 2. 项目部署

```bash
# 创建应用目录
sudo mkdir -y /var/www/aiicg-wallpaper
cd /var/www/aiicg-wallpaper

# 克隆项目
sudo git clone https://github.com/rabbit301/aiicg-wallpaper.git .

# 设置权限
sudo chown -R $USER:$USER /var/www/aiicg-wallpaper

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

#### 3. 环境变量配置

在 `.env.local` 中设置：

```bash
# === AI 服务配置 ===
FAL_KEY=367bb9eb-56e0-470c-b709-9eb211e5b9d2:22a0824074f02ce799bde0124091085d

# === 图片服务配置 ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# === API 服务配置 ===
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
GIPHY_API_KEY=your_giphy_key

# === 应用配置 ===
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=https://your-domain.com

# === 数据库配置（可选）===
DATABASE_URL=your_database_url
```

#### 4. 构建和启动

```bash
# 构建生产版本
npm run build

# 启动应用
npm start

# 验证运行
curl http://localhost:3000
```

#### 5. 配置Nginx反向代理

```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/aiicg-wallpaper
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 静态文件直接服务
    location /_next/static/ {
        alias /var/www/aiicg-wallpaper/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    location /wallpapers/ {
        alias /var/www/aiicg-wallpaper/public/wallpapers/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # API和页面代理到Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 文件上传大小限制
    client_max_body_size 50M;
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/aiicg-wallpaper /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

#### 6. 配置SSL证书

```bash
# 申请Let's Encrypt证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 7. 配置系统服务

```bash
# 创建systemd服务
sudo nano /etc/systemd/system/aiicg-wallpaper.service
```

```ini
[Unit]
Description=AIICG Wallpaper Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aiicg-wallpaper
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable aiicg-wallpaper
sudo systemctl start aiicg-wallpaper

# 检查状态
sudo systemctl status aiicg-wallpaper
```

## 🔧 高级配置

### PM2进程管理（推荐）

```bash
# 安装PM2
sudo npm install -g pm2

# 创建PM2配置
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'aiicg-wallpaper',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/aiicg-wallpaper',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/aiicg-wallpaper-error.log',
    out_file: '/var/log/pm2/aiicg-wallpaper-out.log',
    log_file: '/var/log/pm2/aiicg-wallpaper.log',
    time: true
  }]
};
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 性能优化

```bash
# 创建日志目录
sudo mkdir -p /var/log/pm2

# 配置日志轮转
sudo nano /etc/logrotate.d/pm2
```

```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 检查状态
sudo ufw status
```

### 备份策略

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-aiicg.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/aiicg-wallpaper"
APP_DIR="/var/www/aiicg-wallpaper"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份代码和数据
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .
tar -czf $BACKUP_DIR/data_$DATE.tar.gz -C $APP_DIR/data .

# 保留最近7天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
```

```bash
# 设置定时备份
sudo chmod +x /usr/local/bin/backup-aiicg.sh
sudo crontab -e
# 添加：每天凌晨2点备份
# 0 2 * * * /usr/local/bin/backup-aiicg.sh
```

## 📊 监控和维护

### 系统监控

```bash
# 查看应用状态
pm2 status
pm2 logs aiicg-wallpaper

# 查看系统资源
htop
df -h
free -h

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 更新部署

```bash
# 拉取最新代码
cd /var/www/aiicg-wallpaper
git pull origin master

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart aiicg-wallpaper

# 或使用零停机更新
pm2 reload aiicg-wallpaper
```

## 🚨 故障排除

### 常见问题

1. **端口被占用**
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

2. **权限问题**
```bash
sudo chown -R www-data:www-data /var/www/aiicg-wallpaper
sudo chmod -R 755 /var/www/aiicg-wallpaper
```

3. **内存不足**
```bash
# 添加swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

4. **SSL证书问题**
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

## 🎯 性能优化建议

- **CDN**: 使用Cloudflare或其他CDN加速静态资源
- **缓存**: 配置Redis缓存（可选）
- **压缩**: 启用Nginx gzip压缩
- **监控**: 使用Grafana+Prometheus监控
- **备份**: 定期备份数据和配置文件

## 📞 技术支持

如遇问题，请检查：
1. 系统日志：`journalctl -u aiicg-wallpaper`
2. 应用日志：`pm2 logs`
3. Nginx日志：`/var/log/nginx/`
4. 系统资源：`htop`, `df -h`

---

**部署完成后，您的AI壁纸平台将在 `https://your-domain.com` 上运行！** 