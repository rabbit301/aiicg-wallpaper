#!/bin/bash

# AIICG壁纸平台 - VPS自动部署脚本
# 支持: Ubuntu 20.04+, Debian 11+, CentOS 8+
# 作者: AIICG Team
# 版本: 1.0.0

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查root权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 检测操作系统
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    
    log_info "检测到系统: $OS $VER"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    
    case $OS in
        ubuntu|debian)
            export DEBIAN_FRONTEND=noninteractive
            apt update && apt upgrade -y
            apt install -y curl wget git build-essential software-properties-common
            ;;
        centos|rhel|rocky|almalinux)
            yum update -y
            yum groupinstall -y "Development Tools"
            yum install -y curl wget git
            ;;
        *)
            log_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac
    
    log_success "系统更新完成"
}

# 安装Node.js 20.11.0 LTS
install_nodejs() {
    log_info "安装Node.js 20.11.0 LTS..."
    
    # 检查是否已安装正确版本
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        if [[ "$NODE_VERSION" == "v20.11.0" ]]; then
            log_success "Node.js 20.11.0 已安装"
            return
        fi
    fi
    
    case $OS in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt install -y nodejs
            ;;
        centos|rhel|rocky|almalinux)
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            yum install -y nodejs
            ;;
    esac
    
    # 验证安装
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log_success "Node.js $(node --version) 安装成功"
        log_success "npm $(npm --version) 安装成功"
    else
        log_error "Node.js 安装失败"
        exit 1
    fi
}

# 安装Nginx
install_nginx() {
    log_info "安装Nginx..."
    
    case $OS in
        ubuntu|debian)
            apt install -y nginx certbot python3-certbot-nginx
            ;;
        centos|rhel|rocky|almalinux)
            yum install -y nginx certbot python3-certbot-nginx
            ;;
    esac
    
    systemctl enable nginx
    systemctl start nginx
    
    log_success "Nginx 安装完成"
}

# 安装PM2
install_pm2() {
    log_info "安装PM2进程管理器..."
    
    npm install -g pm2@latest
    
    if command -v pm2 >/dev/null 2>&1; then
        log_success "PM2 $(pm2 --version) 安装成功"
    else
        log_error "PM2 安装失败"
        exit 1
    fi
}

# 创建应用用户
create_app_user() {
    log_info "创建应用用户..."
    
    if ! id "aiicg" &>/dev/null; then
        useradd -m -s /bin/bash aiicg
        usermod -aG sudo aiicg
        log_success "用户 aiicg 创建成功"
    else
        log_info "用户 aiicg 已存在"
    fi
}

# 克隆项目
clone_project() {
    log_info "克隆项目代码..."
    
    APP_DIR="/var/www/aiicg-wallpaper"
    
    # 创建目录
    mkdir -p "$APP_DIR"
    
    # 克隆代码
    if [[ -d "$APP_DIR/.git" ]]; then
        log_info "项目已存在，更新代码..."
        cd "$APP_DIR"
        git pull origin master
    else
        log_info "克隆新项目..."
        git clone https://github.com/rabbit301/aiicg-wallpaper.git "$APP_DIR"
        cd "$APP_DIR"
    fi
    
    # 设置权限
    chown -R aiicg:aiicg "$APP_DIR"
    
    log_success "项目代码准备完成"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    cd /var/www/aiicg-wallpaper
    
    # 切换到应用用户
    sudo -u aiicg npm install
    
    log_success "依赖安装完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    cd /var/www/aiicg-wallpaper
    
    if [[ ! -f .env.local ]]; then
        # 创建环境变量文件
        cat > .env.local << 'EOF'
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
NEXTAUTH_URL=http://localhost:3000

# === 数据库配置（可选）===
DATABASE_URL=your_database_url
EOF
        
        chown aiicg:aiicg .env.local
        log_warning "环境变量文件已创建，请编辑 /var/www/aiicg-wallpaper/.env.local 配置您的API密钥"
    else
        log_info "环境变量文件已存在"
    fi
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    cd /var/www/aiicg-wallpaper
    sudo -u aiicg npm run build
    
    log_success "项目构建完成"
}

# 配置PM2
setup_pm2() {
    log_info "配置PM2..."
    
    cd /var/www/aiicg-wallpaper
    
    # 创建PM2配置文件
    cat > ecosystem.config.js << 'EOF'
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
EOF
    
    # 创建日志目录
    mkdir -p /var/log/pm2
    chown -R aiicg:aiicg /var/log/pm2
    
    # 启动应用
    sudo -u aiicg pm2 start ecosystem.config.js
    sudo -u aiicg pm2 save
    
    # 设置开机自启
    pm2 startup systemd -u aiicg --hp /home/aiicg
    
    log_success "PM2 配置完成"
}

# 配置Nginx
setup_nginx() {
    log_info "配置Nginx..."
    
    # 获取服务器IP
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "localhost")
    
    # 创建Nginx配置
    cat > /etc/nginx/sites-available/aiicg-wallpaper << EOF
server {
    listen 80;
    server_name $SERVER_IP localhost;
    
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 文件上传大小限制
    client_max_body_size 50M;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/aiicg-wallpaper /etc/nginx/sites-enabled/
    
    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx 配置完成"
    else
        log_error "Nginx 配置错误"
        exit 1
    fi
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    case $OS in
        ubuntu|debian)
            if command -v ufw >/dev/null 2>&1; then
                ufw --force reset
                ufw default deny incoming
                ufw default allow outgoing
                ufw allow ssh
                ufw allow 'Nginx Full'
                ufw --force enable
                log_success "UFW 防火墙配置完成"
            fi
            ;;
        centos|rhel|rocky|almalinux)
            if command -v firewall-cmd >/dev/null 2>&1; then
                systemctl enable firewalld
                systemctl start firewalld
                firewall-cmd --permanent --add-service=ssh
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --reload
                log_success "Firewalld 防火墙配置完成"
            fi
            ;;
    esac
}

# 创建系统服务（备用方案）
create_systemd_service() {
    log_info "创建系统服务..."
    
    cat > /etc/systemd/system/aiicg-wallpaper.service << 'EOF'
[Unit]
Description=AIICG Wallpaper Application
After=network.target

[Service]
Type=simple
User=aiicg
WorkingDirectory=/var/www/aiicg-wallpaper
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable aiicg-wallpaper
    
    log_success "系统服务创建完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查PM2状态
    if sudo -u aiicg pm2 list | grep -q "online"; then
        log_success "PM2 服务运行正常"
    else
        log_warning "PM2 服务可能有问题"
    fi
    
    # 检查端口
    if netstat -tlnp | grep -q ":3000"; then
        log_success "应用端口 3000 正常监听"
    else
        log_warning "应用端口 3000 未监听"
    fi
    
    # 检查HTTP响应
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        log_success "HTTP 服务响应正常"
    else
        log_warning "HTTP 服务响应异常"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "🎉 ================================================="
    echo "🎉 AIICG壁纸平台部署完成！"
    echo "🎉 ================================================="
    echo ""
    echo "📍 访问信息:"
    echo "   🌐 网站地址: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
    echo "   🌐 本地地址: http://localhost"
    echo ""
    echo "📁 重要路径:"
    echo "   📂 应用目录: /var/www/aiicg-wallpaper"
    echo "   ⚙️  环境配置: /var/www/aiicg-wallpaper/.env.local"
    echo "   📋 Nginx配置: /etc/nginx/sites-available/aiicg-wallpaper"
    echo "   📊 应用日志: /var/log/pm2/"
    echo ""
    echo "🔧 管理命令:"
    echo "   ▶️  启动服务: sudo -u aiicg pm2 start aiicg-wallpaper"
    echo "   ⏹️  停止服务: sudo -u aiicg pm2 stop aiicg-wallpaper"
    echo "   🔄 重启服务: sudo -u aiicg pm2 restart aiicg-wallpaper"
    echo "   📊 查看状态: sudo -u aiicg pm2 status"
    echo "   📋 查看日志: sudo -u aiicg pm2 logs aiicg-wallpaper"
    echo ""
    echo "⚠️  下一步操作:"
    echo "   1. 编辑环境变量: nano /var/www/aiicg-wallpaper/.env.local"
    echo "   2. 配置您的API密钥（Cloudinary、Unsplash等）"
    echo "   3. 重启应用: sudo -u aiicg pm2 restart aiicg-wallpaper"
    echo "   4. 如有域名，配置SSL: sudo certbot --nginx -d your-domain.com"
    echo ""
    echo "📞 技术支持: https://github.com/rabbit301/aiicg-wallpaper"
    echo "================================================="
}

# 主函数
main() {
    echo "🚀 AIICG壁纸平台 - VPS自动部署脚本"
    echo "================================================="
    
    check_root
    detect_os
    update_system
    install_nodejs
    install_nginx
    install_pm2
    create_app_user
    clone_project
    install_dependencies
    setup_environment
    build_project
    setup_pm2
    setup_nginx
    setup_firewall
    create_systemd_service
    health_check
    show_deployment_info
    
    log_success "🎉 部署完成！"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查上面的错误信息"; exit 1' ERR

# 执行主函数
main "$@" 