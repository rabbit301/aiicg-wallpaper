# VPS部署指南

## 📋 环境要求

### 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**: 至少 2GB RAM (推荐 4GB+)
- **存储**: 至少 20GB 可用空间
- **网络**: 公网IP + 域名 (可选)

### 软件要求
- Node.js 18.0+
- npm/yarn
- Git
- PM2 (进程管理)
- Nginx (反向代理)

## 🚀 快速部署

### 1. 服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git unzip

# 安装Node.js (使用NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应显示 v18.x.x
npm --version   # 应显示 9.x.x
```

### 2. 克隆项目

```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆代码
sudo git clone https://github.com/rabbit301/aiicg-wallpaper.git
sudo chown -R $USER:$USER aiicg-wallpaper
cd aiicg-wallpaper

# 切换到稳定分支
git checkout master
```

### 3. 安装依赖

```bash
# 安装项目依赖
npm install --production

# 全局安装PM2
sudo npm install -g pm2
```

### 4. 环境配置

```bash
# 创建生产环境变量文件
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

**`.env.local` 配置内容**：
```env
# =============================================================================
# 生产环境配置
# =============================================================================

# 运行环境
NODE_ENV=production

# 服务端口 (可选，默认3000)
PORT=3000

# -----------------------------------------------------------------------------
# Fal.ai Configuration (AI图片生成)
# -----------------------------------------------------------------------------
FAL_KEY=367bb9eb-56e0-470c-b709-9eb211e5b9d2:22a0824074f02ce799bde0124091085d

# -----------------------------------------------------------------------------
# Cloudinary Configuration (AI图片压缩)
# -----------------------------------------------------------------------------
CLOUDINARY_CLOUD_NAME=dig04lnn7
CLOUDINARY_API_KEY=393378456155828
CLOUDINARY_API_SECRET=你的实际API密钥

# -----------------------------------------------------------------------------
# 外部图片API配置 (可选)
# -----------------------------------------------------------------------------
UNSPLASH_API_KEY=你的密钥
PEXELS_API_KEY=你的密钥
GIPHY_API_KEY=你的密钥

# -----------------------------------------------------------------------------
# 安全配置
# -----------------------------------------------------------------------------
# 生产环境域名
NEXTAUTH_URL=https://你的域名.com
NEXTAUTH_SECRET=生成的随机密钥字符串
```

### 5. 构建项目

```bash
# 构建生产版本
npm run build

# 验证构建成功
ls -la .next/
```

### 6. PM2进程管理

创建PM2配置文件：

```bash
# 创建pm2配置
nano ecosystem.config.js
```

**`ecosystem.config.js` 内容**：
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
    log_file: '/var/log/aiicg-wallpaper/combined.log',
    out_file: '/var/log/aiicg-wallpaper/out.log',
    error_file: '/var/log/aiicg-wallpaper/error.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true
  }]
}
```

启动服务：

```bash
# 创建日志目录
sudo mkdir -p /var/log/aiicg-wallpaper
sudo chown -R $USER:$USER /var/log/aiicg-wallpaper

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 7. Nginx反向代理

安装Nginx：

```bash
sudo apt install -y nginx
```

创建站点配置：

```bash
sudo nano /etc/nginx/sites-available/aiicg-wallpaper
```

**Nginx配置内容**：
```nginx
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;
    
    # 重定向到HTTPS (如果有SSL证书)
    # return 301 https://$server_name$request_uri;
    
    # HTTP配置 (临时使用，建议配置HTTPS)
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
        
        # 文件上传大小限制
        client_max_body_size 50M;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件优化
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

启用站点：

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/aiicg-wallpaper /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 8. SSL证书配置 (推荐)

使用Let's Encrypt免费SSL：

```bash
# 安装certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com

# 自动续期
sudo crontab -e
```

添加自动续期任务：
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 运维管理

### 服务状态检查

```bash
# 检查PM2状态
pm2 status
pm2 logs aiicg-wallpaper

# 检查Nginx状态
sudo systemctl status nginx

# 检查端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

### 常用操作

```bash
# 重启应用
pm2 restart aiicg-wallpaper

# 更新代码
cd /var/www/aiicg-wallpaper
git pull origin master
npm run build
pm2 restart aiicg-wallpaper

# 查看日志
pm2 logs aiicg-wallpaper --lines 100

# 监控资源
pm2 monit
```

### 防火墙配置

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 监控和备份

### 系统监控

```bash
# 安装htop
sudo apt install -y htop

# 监控磁盘空间
df -h

# 监控内存使用
free -h

# 监控进程
pm2 monit
```

### 数据备份

```bash
# 创建备份脚本
sudo nano /opt/backup-aiicg.sh
```

**备份脚本内容**：
```bash
#!/bin/bash
BACKUP_DIR="/backup/aiicg-wallpaper"
PROJECT_DIR="/var/www/aiicg-wallpaper"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份项目数据
tar -czf $BACKUP_DIR/aiicg-data-$DATE.tar.gz -C $PROJECT_DIR data/

# 备份环境配置
cp $PROJECT_DIR/.env.local $BACKUP_DIR/env-$DATE.backup

# 清理7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup completed: $DATE"
```

设置定时备份：
```bash
sudo chmod +x /opt/backup-aiicg.sh
sudo crontab -e

# 添加每日凌晨2点备份
0 2 * * * /opt/backup-aiicg.sh >> /var/log/backup.log 2>&1
```

## 🚨 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查端口是否被占用
   sudo lsof -i :3000
   
   # 检查环境变量
   cat .env.local
   
   # 查看详细错误
   pm2 logs aiicg-wallpaper --err
   ```

2. **内存不足**
   ```bash
   # 创建swap空间
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   
   # 永久启用
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. **Nginx 502错误**
   ```bash
   # 检查应用是否运行
   pm2 status
   
   # 检查端口连通性
   curl http://localhost:3000
   
   # 查看Nginx错误日志
   sudo tail -f /var/log/nginx/error.log
   ```

### 性能优化

```bash
# 启用Nginx缓存
sudo mkdir -p /var/cache/nginx
sudo chown -R www-data:www-data /var/cache/nginx

# 优化PM2配置
pm2 update
pm2 install pm2-logrotate
```

## 📞 技术支持

部署完成后：
- 访问 `http://你的域名.com` 测试网站
- 检查所有功能是否正常
- 配置监控和告警

如有问题，请检查：
1. 防火墙设置
2. 域名解析
3. SSL证书
4. 应用日志 