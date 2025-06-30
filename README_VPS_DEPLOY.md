# 🚀 VPS快速部署指南

## 一键部署

在您的VPS服务器上执行以下命令即可完成部署：

```bash
# 下载并执行部署脚本
curl -fsSL https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh | sudo bash
```

或分步执行：

```bash
# 1. 下载脚本
wget https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh

# 2. 添加执行权限
chmod +x deploy.sh

# 3. 运行部署
sudo ./deploy.sh
```

## 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **内存**: 最低2GB，推荐4GB+
- **存储**: 最低10GB可用空间
- **权限**: root用户或sudo权限

## 部署完成后

### 1. 配置API密钥

编辑环境变量文件：
```bash
sudo nano /var/www/aiicg-wallpaper/.env.local
```

配置您的API密钥：
- `FAL_KEY`: 已预置
- `CLOUDINARY_*`: Cloudinary图片服务
- `UNSPLASH_ACCESS_KEY`: Unsplash图片API
- `PEXELS_API_KEY`: Pexels图片API
- `GIPHY_API_KEY`: Giphy动图API

### 2. 重启应用

```bash
sudo -u aiicg pm2 restart aiicg-wallpaper
```

### 3. 访问网站

- 🌐 **外网访问**: `http://YOUR_SERVER_IP`
- 🏠 **本地访问**: `http://localhost`

### 4. 配置域名（可选）

如果您有域名，可以配置SSL证书：

```bash
# 修改Nginx配置
sudo nano /etc/nginx/sites-available/aiicg-wallpaper
# 将 server_name 改为您的域名

# 申请SSL证书
sudo certbot --nginx -d your-domain.com

# 重启Nginx
sudo systemctl reload nginx
```

## 常用管理命令

```bash
# 查看应用状态
sudo -u aiicg pm2 status

# 查看应用日志
sudo -u aiicg pm2 logs aiicg-wallpaper

# 重启应用
sudo -u aiicg pm2 restart aiicg-wallpaper

# 停止应用
sudo -u aiicg pm2 stop aiicg-wallpaper

# 启动应用
sudo -u aiicg pm2 start aiicg-wallpaper

# 查看系统资源
htop
```

## 更新应用

```bash
cd /var/www/aiicg-wallpaper
git pull origin master
npm install
npm run build
sudo -u aiicg pm2 restart aiicg-wallpaper
```

## 故障排除

### 应用无法启动
```bash
# 检查日志
sudo -u aiicg pm2 logs aiicg-wallpaper

# 检查端口占用
sudo lsof -i :3000

# 检查环境变量
cat /var/www/aiicg-wallpaper/.env.local
```

### Nginx 502错误
```bash
# 检查应用是否运行
sudo -u aiicg pm2 status

# 检查Nginx配置
sudo nginx -t

# 查看Nginx日志
sudo tail -f /var/log/nginx/error.log
```

### 内存不足
```bash
# 添加2GB交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 卸载

如需完全卸载：

```bash
# 停止服务
sudo -u aiicg pm2 delete aiicg-wallpaper
sudo systemctl stop aiicg-wallpaper
sudo systemctl disable aiicg-wallpaper

# 删除文件
sudo rm -rf /var/www/aiicg-wallpaper
sudo rm /etc/nginx/sites-available/aiicg-wallpaper
sudo rm /etc/nginx/sites-enabled/aiicg-wallpaper
sudo rm /etc/systemd/system/aiicg-wallpaper.service

# 删除用户
sudo userdel -r aiicg

# 重启服务
sudo systemctl reload nginx
sudo systemctl daemon-reload
```

---

**🎉 享受您的AI壁纸平台！**

如有问题，请查看详细部署指南：[VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) 