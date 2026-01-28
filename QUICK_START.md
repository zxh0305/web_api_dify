# 快速部署指南 - 如何将服务暴露到公网

## 🎯 最快速的方法（5分钟搞定）

### 方法1：使用 ngrok（无需云服务器）

这是最简单的方法，适合临时分享或测试。

```bash
# 步骤1：启动本地服务器（选择任一方式）

# 方式A：Python（推荐，无需安装依赖）
python server.py 8000 0.0.0.0

# 方式B：Node.js（需要先 npm install）
npm install
npm start

# 步骤2：新开一个终端，安装并启动ngrok
# 访问 https://ngrok.com/download 下载ngrok
ngrok http 8000

# 步骤3：ngrok会显示一个公网URL，例如：
# https://xxxx-xx-xx-xx-xx.ngrok-free.app
# 将这个URL分享给任何人即可访问！
```

**注意**：ngrok免费版每次重启URL会变化，且有一些限制。

---

### 方法2：使用云服务器（生产环境推荐）

如果你有云服务器（阿里云/腾讯云/AWS），这是最稳定的方案。

```bash
# 步骤1：连接到你的云服务器
ssh root@你的服务器IP

# 步骤2：安装Node.js（Ubuntu为例）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 步骤3：克隆项目
git clone https://github.com/zxh0305/web_api_dify.git
cd web_api_dify

# 步骤4：安装依赖并启动
npm install
npm start

# 步骤5：配置防火墙（开放8000端口）
sudo ufw allow 8000/tcp

# 步骤6：访问测试
# 本地测试：curl http://localhost:8000
# 公网访问：http://你的服务器IP:8000
```

**使用PM2保持服务运行（推荐）**：

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

---

### 方法3：使用Python（无需安装任何东西）

如果你不想安装Node.js，可以直接用Python：

```bash
# 启动服务器，监听所有网卡
python server.py 8000 0.0.0.0

# 查看本机IP
# Linux/Mac: ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows: ipconfig | findstr IPv4

# 局域网内其他设备访问：http://你的本机IP:8000
```

**配合ngrok实现公网访问**：

```bash
# 终端1：启动Python服务器
python server.py 8000 0.0.0.0

# 终端2：启动ngrok
ngrok http 8000
```

---

### 方法4：使用Docker（一键部署）

```bash
# 确保已安装Docker和docker-compose

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 📝 获取你的公网IP

不知道你的公网IP？访问这些网站：
- https://ip.cn
- https://ifconfig.me
- https://www.whatismyip.com

---

## 🔥 使用快速启动脚本

### Linux/Mac用户：

```bash
chmod +x start.sh
./start.sh
```

选择启动方式（Python/Node.js/Docker），按提示输入端口即可。

### Windows用户：

```bash
start.bat
```

双击运行或在命令行执行即可。

---

## ⚠️ 注意事项

1. **安全性**：
   - 生产环境不要直接暴露服务器的8000端口
   - 建议使用Nginx反向代理 + HTTPS
   - 参考 `DEPLOYMENT.md` 中的反向代理配置

2. **防火墙**：
   - 确保云服务器防火墙开放了相应端口
   - 阿里云/腾讯云需要在安全组中添加规则

3. **ngrok限制**：
   - 免费版URL会变化
   - 每月有流量和连接数限制
   - 适合临时使用，不适合生产环境

4. **域名绑定**：
   - 如果有域名，可以在云服务器上配置Nginx + 绑定域名
   - 然后申请SSL证书（Let's Encrypt免费）

---

## 📚 更详细文档

完整部署指南请查看：[DEPLOYMENT.md](DEPLOYMENT.md)

包含内容：
- 多种Web服务器部署方案对比
- 内网穿透工具详细配置（ngrok/frp/cpolar）
- 云服务器部署完整流程
- 反向代理配置（Nginx/Apache）
- HTTPS/SSL证书配置
- 生产环境安全和性能优化
- 故障排查指南

---

## 🎉 开始使用

选择上面的任一方法启动服务后：

1. 在浏览器访问你的服务地址
2. 配置Dify API Key
3. 开始对话！

有问题？查看 `DEPLOYMENT.md` 或提交Issue。
