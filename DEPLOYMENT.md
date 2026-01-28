# 部署指南

本指南将帮助你将Dify工作流对话系统部署为公网可访问的服务。

## 📋 目录

- [快速开始](#快速开始)
- [部署方案](#部署方案)
- [公网访问配置](#公网访问配置)
- [反向代理配置](#反向代理配置)
- [生产环境部署](#生产环境部署)
- [故障排查](#故障排查)

## 快速开始

### 方案一：Python服务器（最简单）

```bash
# 1. 确保已安装Python 3.7+
python --version

# 2. 启动服务器（监听所有网卡）
python server.py 8000 0.0.0.0
```

### 方案二：Node.js服务器（推荐）

```bash
# 1. 安装依赖
npm install

# 2. 启动服务器
npm start

# 或使用开发模式（自动重启）
npm run dev
```

### 方案三：Docker部署

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 停止服务
docker-compose down
```

## 部署方案

### 方案1：Python HTTP服务器

**优点**：无需额外依赖，开箱即用

```bash
# 启动服务器，端口8000，监听所有网卡
python server.py 8000 0.0.0.0
```

**访问地址**：
- 本地：http://localhost:8000
- 局域网：http://<你的IP地址>:8000

**获取本机IP地址**：
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

### 方案2：Express Node.js服务器

**优点**：功能更强大，支持 gzip 压缩、CORS等

```bash
# 安装依赖
npm install

# 启动服务器
npm start
```

**自定义端口和主机**：
```bash
# 方式1：环境变量
PORT=9000 HOST=0.0.0.0 npm start

# 方式2：修改 server.js 中的配置
```

### 方案3：Docker容器化部署

**优点**：环境隔离，易于迁移

```bash
# 使用 docker-compose（推荐）
docker-compose up -d

# 或单独使用 docker
docker build -t dify-chat .
docker run -d -p 8000:8000 --name dify-chat dify-chat
```

### 方案4：Nginx静态文件服务器

**安装Nginx**：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

**配置Nginx**：
```nginx
# 编辑 /etc/nginx/sites-available/dify-chat
server {
    listen 8000;
    server_name _;

    root /path/to/web_api_dify;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/dify-chat /etc/nginx/sites-enabled/

# 重启Nginx
sudo systemctl restart nginx
```

## 公网访问配置

### 方法1：直接暴露（不安全，仅测试用）

```bash
# 启动服务器监听 0.0.0.0
python server.py 8000 0.0.0.0
```

**防火墙配置**：
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 8000/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### 方法2：使用内网穿透工具

#### 2.1 使用ngrok（推荐）

```bash
# 下载并安装 ngrok
# 访问 https://ngrok.com/download

# 启动ngrok
ngrok http 8000
```

ngrok会生成一个公网URL，如：`https://xxxx-xx-xx-xx-xx.ngrok-free.app`

#### 2.2 使用frp

**服务端配置（frps.ini）**：
```ini
[common]
bind_port = 7000
```

**客户端配置（frpc.ini）**：
```ini
[common]
server_addr = <你的服务器IP>
server_port = 7000

[web]
type = http
local_port = 8000
custom_domains = your-domain.com
```

```bash
# 启动frpc
./frpc -c frpc.ini
```

#### 2.3 使用cpolar

```bash
# 安装 cpolar
# 访问 https://www.cpolar.com/

# 创建隧道
cpolar http 8000
```

### 方法3：云服务器部署

#### 3.1 购买云服务器

推荐：
- 阿里云ECS
- 腾讯云CVM
- 华为云ECS
- AWS EC2
- 阿里云轻量应用服务器（便宜）

#### 3.2 部署步骤

```bash
# 1. 连接到服务器
ssh root@<服务器IP>

# 2. 安装Node.js（如果使用Node方案）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 克隆代码
git clone https://github.com/zxh0305/web_api_dify.git
cd web_api_dify

# 4. 安装依赖并启动
npm install
npm start

# 5. 配置防火墙
sudo ufw allow 8000/tcp
```

#### 3.3 使用PM2保持服务运行

```bash
# 安装PM2
sudo npm install -g pm2

# 启动服务
pm2 start server.js --name dify-chat

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs dify-chat
```

### 方法4：使用云平台

#### 4.1 Vercel部署

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel
```

#### 4.2 Netlify部署

1. 将代码推送到GitHub
2. 在Netlify连接GitHub仓库
3. 设置构建命令和发布目录（build命令留空，发布目录为根目录）

#### 4.3 腾讯云/阿里云对象存储+CDN

1. 上传文件到对象存储
2. 配置静态网站托管
3. 绑定自定义域名
4. 开启CDN加速

## 反向代理配置

### Nginx反向代理

**配置文件**：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**启用HTTPS（使用Let's Encrypt）**：
```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### Apache反向代理

```apache
<VirtualHost *:80>
    ServerName your-domain.com

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
</VirtualHost>
```

## 生产环境部署

### 安全配置

1. **修改默认端口**：
```bash
# 使用非标准端口
PORT=8443 npm start
```

2. **启用HTTPS**：
```bash
# 使用Nginx+Let's Encrypt
# 或使用Cloudflare SSL
```

3. **配置防火墙**：
```bash
# 只开放必要的端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

4. **启用访问日志**（Node.js方案已配置）

### 性能优化

1. **启用压缩**（Node.js方案已启用gzip）

2. **使用CDN加速静态资源**

3. **配置缓存**：
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

4. **使用PM2集群模式**：
```bash
pm2 start server.js -i max --name dify-chat
```

### 监控和日志

```bash
# PM2监控
pm2 monit

# 查看实时日志
pm2 logs dify-chat

# 日志文件位置
tail -f ~/.pm2/logs/dify-chat-out.log
tail -f ~/.pm2/logs/dify-chat-error.log
```

## 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i :8000
netstat -tuln | grep 8000

# 杀死进程
kill -9 <PID>
```

### 无法访问

1. **检查防火墙**：
```bash
sudo ufw status
```

2. **检查服务状态**：
```bash
pm2 status
# 或
ps aux | grep node
```

3. **检查端口监听**：
```bash
netstat -tuln | grep 8000
```

4. **测试本地访问**：
```bash
curl http://localhost:8000
```

### 跨域问题

如果遇到CORS错误，检查 `server.js` 中的 CORS 配置：

```javascript
app.use(cors({
    origin: '*', // 生产环境应改为具体域名
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
```

### API调用失败

1. 检查API Key是否正确
2. 检查API URL是否可访问
3. 查看浏览器控制台错误信息
4. 检查Dify服务是否正常运行

## 常见问题

### Q: 如何获取公网IP？
A: 访问 `https://ip.cn` 或 `https://ifconfig.me`

### Q: 如何绑定自定义域名？
A: 在域名提供商处添加A记录指向服务器IP，然后配置Nginx反向代理

### Q: 如何自动重启服务？
A: 使用PM2的 `--watch` 参数或 `--restart-delay` 配置

### Q: 如何限制访问频率？
A: 使用 `express-rate-limit` 中间件

### Q: 如何添加用户认证？
A: 可以集成JWT或Session认证

## 推荐部署方案

### 个人测试：Python + ngrok
```bash
python server.py 8000 0.0.0.0
ngrok http 8000
```

### 小型项目：Node.js + PM2
```bash
npm install
pm2 start server.js --name dify-chat
pm2 startup && pm2 save
```

### 生产环境：Docker + Nginx + HTTPS
```bash
docker-compose up -d
# 配置Nginx反向代理和SSL证书
```

## 技术支持

遇到问题？请提交Issue：https://github.com/zxh0305/web_api_dify/issues
