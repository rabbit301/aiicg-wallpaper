#!/bin/bash

# =============================================================================
# AIICG壁纸项目 - VPS一键部署脚本
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="aiicg-wallpaper"
PROJECT_DIR="/var/www/$PROJECT_NAME"
REPO_URL="https://github.com/rabbit301/aiicg-wallpaper.git"
NODE_VERSION="18"

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请不要使用root用户运行此脚本！"
        exit 1
    fi
}

# 检查系统类型
check_system() {
    if [[ -f /etc/ubuntu-release ]] || [[ -f /etc/debian_version ]]; then
        OS="ubuntu"
        PKG_MANAGER="apt"
    elif [[ -f /etc/centos-release ]] || [[ -f /etc/redhat-release ]]; then
        OS="centos"
        PKG_MANAGER="yum"
    else
        log_error "不支持的操作系统！仅支持 Ubuntu/Debian/CentOS"
        exit 1
    fi
    log_info "检测到操作系统: $OS"
}

# 安装基础依赖
install_dependencies() {
    log_info "正在安装基础依赖..."
    
    if [[ $OS == "ubuntu" ]]; then
        sudo apt update
        sudo apt install -y curl wget git unzip nginx
    elif [[ $OS == "centos" ]]; then
        sudo yum update -y
        sudo yum install -y curl wget git unzip nginx
    fi
    
    log_success "基础依赖安装完成"
}

# 安装Node.js
install_nodejs() {
    log_info "正在安装 Node.js $NODE_VERSION..."
    
    if command -v node &> /dev/null; then
        current_version=$(node -v | sed 's/v//')
        major_version=${current_version%%.*}
        if [[ $major_version -ge $NODE_VERSION ]]; then
            log_success "Node.js 已安装，版本: v$current_version"
            return
        fi
    fi
    
    # 安装Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo $PKG_MANAGER install -y nodejs
    
    # 安装PM2
    sudo npm install -g pm2
    
    log_success "Node.js 和 PM2 安装完成"
}

# 克隆项目
clone_project() {
    log_info "正在克隆项目..."
    
    # 创建项目目录
    sudo mkdir -p $(dirname $PROJECT_DIR)
    
    # 如果目录已存在，询问是否覆盖
    if [[ -d $PROJECT_DIR ]]; then
        read -p "项目目录已存在，是否覆盖? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo rm -rf $PROJECT_DIR
        else
            log_error "部署取消"
            exit 1
        fi
    fi
    
    # 克隆代码
    sudo git clone $REPO_URL $PROJECT_DIR
    sudo chown -R $USER:$USER $PROJECT_DIR
    cd $PROJECT_DIR
    
    log_success "项目克隆完成"
}

# 安装项目依赖
install_project_deps() {
    log_info "正在安装项目依赖..."
    
    cd $PROJECT_DIR
    npm install --production
    
    log_success "项目依赖安装完成"
}

# 配置环境变量
setup_env() {
    log_info "正在配置环境变量..."
    
    cd $PROJECT_DIR
    
    if [[ ! -f .env.local ]]; then
        cat > .env.local << 'EOF'
# =============================================================================
# 生产环境配置
# =============================================================================

# 运行环境
NODE_ENV=production
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
CLOUDINARY_API_SECRET=your_api_secret_here

# -----------------------------------------------------------------------------
# 外部图片API配置 (可选)
# -----------------------------------------------------------------------------
UNSPLASH_API_KEY=your_unsplash_key_here
PEXELS_API_KEY=your_pexels_key_here
GIPHY_API_KEY=your_giphy_key_here
EOF
        
        log_warning "请编辑 $PROJECT_DIR/.env.local 文件，填入真实的API密钥"
        log_warning "特别是 CLOUDINARY_API_SECRET 需要替换为真实值"
    fi
    
    log_success "环境变量配置完成"
}

# 构建项目
build_project() {
    log_info "正在构建项目..."
    
    cd $PROJECT_DIR
    npm run build
    
    log_success "项目构建完成"
}

# 配置PM2
setup_pm2() {
    log_info "正在配置 PM2..."
    
    cd $PROJECT_DIR
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PROJECT_NAME',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/$PROJECT_NAME/combined.log',
    out_file: '/var/log/$PROJECT_NAME/out.log',
    error_file: '/var/log/$PROJECT_NAME/error.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true
  }]
}
EOF
    
    # 创建日志目录
    sudo mkdir -p /var/log/$PROJECT_NAME
    sudo chown -R $USER:$USER /var/log/$PROJECT_NAME
    
    # 启动应用
    pm2 start ecosystem.config.js
    pm2 save
    
    # 设置开机自启
    pm2 startup
    
    log_success "PM2 配置完成"
}

# 配置Nginx
setup_nginx() {
    log_info "正在配置 Nginx..."
    
    # 获取服务器IP
    SERVER_IP=$(curl -s ipinfo.io/ip || echo "YOUR_SERVER_IP")
    
    sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_IP _;
    
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
        
        client_max_body_size 50M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    
    # 删除默认配置
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log_success "Nginx 配置完成"
}

# 配置防火墙
setup_firewall() {
    log_info "正在配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw --force enable
        sudo ufw allow 22
        sudo ufw allow 80
        sudo ufw allow 443
        log_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
        log_success "Firewalld 防火墙配置完成"
    else
        log_warning "未检测到防火墙，请手动配置"
    fi
}

# 显示部署结果
show_result() {
    SERVER_IP=$(curl -s ipinfo.io/ip || echo "YOUR_SERVER_IP")
    
    echo
    echo "=============================================="
    log_success "🎉 部署完成！"
    echo "=============================================="
    echo
    echo "📋 部署信息:"
    echo "   项目目录: $PROJECT_DIR"
    echo "   访问地址: http://$SERVER_IP"
    echo "   进程管理: pm2 status"
    echo "   查看日志: pm2 logs $PROJECT_NAME"
    echo
    echo "⚠️  重要提醒:"
    echo "   1. 请编辑 $PROJECT_DIR/.env.local 文件"
    echo "   2. 填入真实的 API 密钥"
    echo "   3. 重启应用: pm2 restart $PROJECT_NAME"
    echo
    echo "🔧 常用命令:"
    echo "   重启应用: pm2 restart $PROJECT_NAME"
    echo "   查看状态: pm2 status"
    echo "   查看日志: pm2 logs $PROJECT_NAME"
    echo "   更新代码: cd $PROJECT_DIR && git pull && npm run build && pm2 restart $PROJECT_NAME"
    echo
    log_info "详细文档请查看: $PROJECT_DIR/VPS_DEPLOYMENT.md"
}

# 主函数
main() {
    echo
    echo "=============================================="
    echo "🚀 AIICG壁纸项目 - VPS一键部署脚本"
    echo "=============================================="
    echo
    
    check_root
    check_system
    
    log_info "开始部署过程..."
    
    install_dependencies
    install_nodejs
    clone_project
    install_project_deps
    setup_env
    build_project
    setup_pm2
    setup_nginx
    setup_firewall
    
    show_result
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 