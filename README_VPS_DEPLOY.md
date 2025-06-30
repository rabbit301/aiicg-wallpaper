# VPS部署快速指南

## 🚀 一键部署 (推荐)

**适用系统**: Ubuntu 20.04+, Debian 10+, CentOS 7+

### 方式一：直接下载执行

```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh

# 添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 方式二：克隆仓库后执行

```bash
# 克隆项目
git clone https://github.com/rabbit301/aiicg-wallpaper.git
cd aiicg-wallpaper

# 执行部署脚本
./deploy.sh
```

## 📋 部署完成后

### 1. 配置API密钥

编辑环境变量文件：
```bash
nano /var/www/aiicg-wallpaper/.env.local
```

**必须配置**：
- `CLOUDINARY_API_SECRET` - Cloudinary压缩功能密钥

**可选配置**：
- `UNSPLASH_API_KEY` - Unsplash图片源
- `PEXELS_API_KEY` - Pexels图片源  
- `GIPHY_API_KEY` - Giphy动图源

### 2. 重启服务

```bash
pm2 restart aiicg-wallpaper
```

### 3. 验证部署

```bash
# 检查服务状态
pm2 status

# 查看访问地址
curl -s ipinfo.io/ip
```

访问 `http://你的服务器IP` 验证网站正常运行。

## 🔧 日常运维

### 查看状态
```bash
pm2 status                    # 查看进程状态
pm2 logs aiicg-wallpaper      # 查看应用日志
pm2 monit                     # 实时监控
```

### 重启服务
```bash
pm2 restart aiicg-wallpaper   # 重启应用
sudo systemctl restart nginx  # 重启Nginx
```

### 更新代码
```bash
cd /var/www/aiicg-wallpaper
git pull origin master
npm run build
pm2 restart aiicg-wallpaper
```

### 查看日志
```bash
pm2 logs aiicg-wallpaper --lines 100    # 查看最近100行日志
tail -f /var/log/nginx/error.log        # 查看Nginx错误日志
```

## 🌐 SSL证书配置 (可选)

### 使用Let's Encrypt

```bash
# 安装certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书 (将your-domain.com替换为你的域名)
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚨 故障排除

### 1. 端口被占用
```bash
sudo lsof -i :3000  # 查看3000端口占用
sudo lsof -i :80    # 查看80端口占用
```

### 2. 服务无法启动
```bash
pm2 logs aiicg-wallpaper --err  # 查看错误日志
cat /var/www/aiicg-wallpaper/.env.local  # 检查环境变量
```

### 3. Nginx 502错误
```bash
pm2 status                           # 确认应用正在运行
curl http://localhost:3000           # 测试应用直连
sudo tail -f /var/log/nginx/error.log  # 查看Nginx错误
```

### 4. 内存不足
```bash
# 创建2GB交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 📞 技术支持

- **详细文档**: 参考 `VPS_DEPLOYMENT.md`
- **项目仓库**: https://github.com/rabbit301/aiicg-wallpaper
- **部署脚本**: 支持 Ubuntu/Debian/CentOS 系统

### 系统要求
- **CPU**: 1核心+
- **内存**: 2GB+ (推荐4GB)
- **存储**: 20GB+
- **网络**: 公网IP

---

## ⚡ 快速命令参考

```bash
# 一键部署
curl -sSL https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh | bash

# 服务管理
pm2 restart aiicg-wallpaper     # 重启
pm2 stop aiicg-wallpaper        # 停止
pm2 start aiicg-wallpaper       # 启动
pm2 delete aiicg-wallpaper      # 删除

# 系统状态
pm2 status                      # PM2状态
systemctl status nginx         # Nginx状态
df -h                          # 磁盘使用
free -h                        # 内存使用
``` 