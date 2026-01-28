# Dify智能对话系统

一个功能完整的Web界面，支持文本/语音对话、ASR语音识别、TTS语音合成，完美对接Dify工作流API。

## ✨ 功能特性

### 核心功能
- ✅ **Dify对话API集成** - 完整对接Dify对话型API，支持多轮对话
- ✅ **对话上下文管理** - 自动保存和使用conversation_id，实现连续对话
- ✅ **文本输入** - 支持文本输入，回车发送，Shift+Enter换行
- ✅ **ASR语音识别** - 集成Web Speech API，点击麦克风即可语音输入
- ✅ **TTS语音合成** - AI回复自动朗读，支持播放/暂停/停止控制
- ✅ **打字机效果** - AI回复逐字显示，提升用户体验
- ✅ **加载状态** - 友好的加载提示，防止重复提交

### 界面体验
- ✅ **现代化UI** - 简洁美观的设计，渐变色主题
- ✅ **移动端适配** - 完美适配手机/平板/电脑，响应式布局
- ✅ **配置管理** - API配置自动保存到localStorage，无需重复输入
- ✅ **对话历史** - 自动保存最近50条对话，刷新页面不丢失
- ✅ **Toast提示** - 友好的操作反馈和错误提示
- ✅ **语音控制** - 实时调整语速、音量，开关语音朗读

### 开发特性
- ✅ **纯前端实现** - 无需后端代码，降低部署难度
- ✅ **无数据库依赖** - 对话历史保存在前端localStorage
- ✅ **详细注释** - 代码包含完整的中文注释
- ✅ **错误处理** - 完善的异常处理和用户提示

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/zxh0305/web_api_dify.git
cd web_api_dify
```

### 2. 本地运行

#### 方式一：直接打开（适合本地测试）

直接在浏览器中打开 `index.html` 文件即可使用。

#### 方式二：Python服务器（简单快速）

```bash
# 启动服务器
python server.py 8000 0.0.0.0
```

#### 方式三：Node.js服务器（推荐）

```bash
# 安装依赖
npm install

# 启动服务器
npm start
```

#### 方式四：Docker部署

```bash
# 使用docker-compose
docker-compose up -d
```

访问地址：`http://localhost:8000`

### 3. 公网部署

如需将服务部署到公网供外部访问，请查看 [部署指南](DEPLOYMENT.md) 获取详细说明。

## ⚙️ 配置说明

### 基础配置

点击页面右上角的"⚙️ 设置"按钮，填写以下信息：

- **API地址**: Dify对话API地址
  - 默认值: `https://api.dify.ai/v1/chat-messages`
  - 如使用工作流API，请改为: `https://api.dify.ai/v1/workflows/run`

- **API Key**: 你的Dify API密钥
  - 从Dify平台的应用设置中获取

- **用户ID**: 用户标识符
  - 默认自动生成唯一ID，可手动修改

### 语音设置

#### TTS语音朗读
- **开关**: 点击"🔊 语音朗读"按钮开启/关闭
- **语速**: 拖动滑块调整（0.5x - 2.0x）
- **音量**: 拖动滑块调整（0% - 100%）
- **控制**: 播放时显示暂停/继续/停止按钮

#### ASR语音识别
- 点击"🎤"麦克风按钮开始录音
- 再次点击停止录音
- 语音自动转换为文字填入输入框
- 识别结果显示Toast提示

## 📱 使用方法

### 文本对话

1. 在输入框中输入问题
2. 点击"📤"发送按钮或按 `Enter` 键
3. 等待AI回复（支持打字机效果）

### 语音输入

1. 点击"🎤"麦克风按钮
2. 对着麦克风说话
3. 再次点击停止录音
4. 语音自动转换为文字，点击发送

### 语音朗读

- AI回复后自动朗读（默认开启）
- 点击"🔊 语音朗读"按钮可开关
- 播放时显示控制按钮（暂停/继续/停止）
- 在设置中调整语速和音量

### 对话管理

- 点击"🗑️ 清空"按钮清除所有对话历史
- 对话历史自动保存在浏览器本地
- 刷新页面后自动恢复最近对话

## 🔧 API接口说明

### Dify对话API调用

**请求格式**：

```javascript
POST https://api.dify.ai/v1/chat-messages
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY

Body:
{
  "query": "你的问题",
  "response_mode": "blocking",
  "user": "user-001",
  "conversation_id": "可选-对话ID"  // 用于多轮对话
}
```

**响应格式**：

```json
{
  "message": "success",
  "data": {
    "id": "message-id",
    "answer": "AI回复内容",
    "conversation_id": "对话ID-用于下一轮对话",
    "created_at": 1234567890
  }
}
```

### Dify工作流API（可选）

如需使用工作流API，将API地址改为：
```
https://api.dify.ai/v1/workflows/run
```

请求格式：

```javascript
POST https://api.dify.ai/v1/workflows/run
Body:
{
  "inputs": {
    "query": "你的问题"
  },
  "response_mode": "blocking",
  "user": "user-001"
}
```

## 📁 文件结构

```
web_api_dify/
├── index.html          # 主页面
├── styles.css          # 样式文件（移动端优化）
├── app.js             # 核心逻辑（含ASR/TTS/对话管理）
├── server.py          # Python HTTP服务器
├── server.js          # Node.js Express服务器
├── package.json       # Node.js依赖配置
├── Dockerfile         # Docker镜像配置
├── docker-compose.yml # Docker编排配置
├── DEPLOYMENT.md      # 详细部署指南
├── README.md          # 项目说明
└── .gitignore         # Git忽略文件
```

## 🛠️ 技术栈

### 前端技术
- HTML5 + CSS3 + 原生JavaScript (ES6+)
- Web Speech API（ASR语音识别）
- Web Speech API（TTS语音合成）
- Fetch API
- localStorage（配置和历史存储）

### 服务器技术（可选）
- Python 3 + http.server
- Node.js + Express + compression + cors
- Docker + Docker Compose

## 🌐 浏览器支持

### 推荐浏览器（完美支持）
- ✅ Chrome 88+（推荐）
- ✅ Edge 88+（推荐）
- ✅ Safari 14.1+
- ✅ Opera 74+

### 功能支持
| 功能 | Chrome | Edge | Safari | Firefox |
|------|--------|------|--------|---------|
| ASR语音识别 | ✅ | ✅ | ⚠️ 部分支持 | ⚠️ 需配置 |
| TTS语音合成 | ✅ | ✅ | ✅ | ✅ |
| 对话功能 | ✅ | ✅ | ✅ | ✅ |

### 重要提示

⚠️ **HTTPS要求**：
- 语音识别（ASR）和语音合成（TTS）功能需要HTTPS环境
- 本地测试（localhost）无此限制
- 公网部署必须使用HTTPS

⚠️ **浏览器权限**：
- 首次使用语音功能时，浏览器会请求麦克风权限
- 请在浏览器设置中允许访问麦克风

## 🚨 已知限制

1. **Web Speech API兼容性**
   - Firefox的ASR支持需要手动配置
   - Safari的ASR功能有限制

2. **语音识别准确度**
   - 依赖浏览器的语音识别引擎
   - 受环境噪音和口音影响

3. **对话上下文**
   - conversation_id保存在localStorage
   - 清空浏览器数据会丢失对话上下文

4. **API调用限制**
   - 受Dify平台的API调用限制
   - 超限会提示429错误

## 📊 测试步骤

### 1. 基础功能测试

```bash
# 1. 启动服务
python server.py 8000 0.0.0.0

# 2. 浏览器访问
http://localhost:8000

# 3. 配置API
- 点击设置按钮
- 输入API地址和API Key
- 保存配置
```

### 2. 文本对话测试

1. 在输入框输入："你好"
2. 点击发送
3. 等待AI回复（打字机效果）
4. 检查回复是否正确

### 3. 语音输入测试（需要麦克风）

1. 点击"🎤"麦克风按钮
2. 对着麦克风说："介绍一下你自己"
3. 再次点击停止录音
4. 检查语音识别结果
5. 点击发送
6. 等待AI回复和语音朗读

### 4. 多轮对话测试

1. 发送第一条消息："我叫小明"
2. 发送第二条消息："我刚才叫什么名字？"
3. 检查AI是否记得对话上下文

### 5. 语音朗读测试

1. 发送一条消息
2. 等待AI回复
3. 检查是否自动朗读
4. 点击暂停/继续/停止按钮测试控制功能
5. 调整语速和音量滑块测试

### 6. 配置持久化测试

1. 配置API信息
2. 刷新页面
3. 检查配置是否保留
4. 检查对话历史是否保留

## 🌍 部署到公网

查看详细的 [部署指南](DEPLOYMENT.md)，包括：

### 快速方案（5分钟）
- Python + ngrok内网穿透
- Node.js + ngrok内网穿透

### 生产方案
- 云服务器部署（阿里云/腾讯云/AWS）
- Nginx反向代理 + HTTPS
- PM2进程管理

### 其他方案
- Docker容器化部署
- 静态文件托管（Vercel/Netlify）

### 快速示例

**使用ngrok（最快）**：
```bash
# 1. 启动服务器
python server.py 8000 0.0.0.0

# 2. 启动ngrok
ngrok http 8000

# 3. 访问ngrok生成的HTTPS URL
```

**使用云服务器**：
```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 克隆并部署
git clone https://github.com/zxh0305/web_api_dify.git
cd web_api_dify
npm install
pm2 start server.js --name dify-chat

# 3. 配置HTTPS（必须用于语音功能）
# 使用Let's Encrypt免费证书
```

更多详情请查看 [DEPLOYMENT.md](DEPLOYMENT.md) 和 [QUICK_START.md](QUICK_START.md)

## 🔒 安全建议

1. **API Key保护**
   - 不要将包含API Key的代码提交到公开仓库
   - 使用环境变量或配置文件管理密钥
   - 生产环境使用后端代理API调用

2. **HTTPS部署**
   - 公网访问必须使用HTTPS
   - 使用Let's Encrypt免费SSL证书
   - 配置Nginx强制HTTPS跳转

3. **输入验证**
   - 前端已实现基本输入验证
   - 生产环境建议添加后端验证

## 📝 配置修改说明

### 修改Dify API地址

在 `app.js` 中修改默认值：

```javascript
this.apiConfig = {
    url: 'https://api.dify.ai/v1/chat-messages',  // 改为你的API地址
    apiKey: '',
    userId: 'user-' + Date.now()
};
```

或在页面设置中修改，保存后会自动更新。

### 修改语音识别语言

在 `app.js` 的 `initASR()` 方法中：

```javascript
this.asrConfig.recognition.lang = 'zh-CN';  // 中文
// 改为 'en-US' 为英文，'ja-JP' 为日文等
```

### 修改TTS语音

代码会自动选择系统中的中文语音，如需手动选择：

```javascript
// 在 loadTTSVoices() 方法中
const zhVoice = voices.find(voice =>
    voice.lang.includes('zh') || voice.lang.includes('CN')
);
```

### 修改对话历史保存数量

在 `app.js` 中修改：

```javascript
this.maxHistory = 50;  // 改为你想要的数量
```

## 🐛 故障排查

### ASR语音识别不工作

**问题**：点击麦克风无反应

**解决方案**：
1. 检查浏览器是否支持（推荐Chrome/Edge）
2. 检查是否在HTTPS环境（公网必须）
3. 检查浏览器麦克风权限设置
4. 查看浏览器控制台错误信息

### TTS语音合成不工作

**问题**：AI回复后没有语音

**解决方案**：
1. 检查语音朗读开关是否开启
2. 检查浏览器音量设置
3. 检查是否在HTTPS环境（公网必须）
4. 尝试调整语速和音量滑块

### API调用失败

**问题**：提示"网络异常"或"API Key错误"

**解决方案**：
1. 检查API Key是否正确
2. 检查网络连接
3. 检查API地址是否正确
4. 检查Dify服务是否正常
5. 查看浏览器控制台详细错误

### 对话上下文丢失

**问题**：刷新页面后AI不记得之前的对话

**解决方案**：
1. 检查localStorage是否被禁用
2. 检查浏览器隐私设置
3. 检查是否使用了无痕模式

更多故障排查请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📮 联系方式

如有问题或建议，请提交Issue。

---

## 🚀 部署到公网

想要将服务部署到公网？查看详细的文档：

- 📘 [部署指南](DEPLOYMENT.md) - 完整的部署方案和配置
- 📗 [快速开始](QUICK_START.md) - 5分钟完成部署

### 快速公网部署示例

**使用Python + ngrok（最快）**：
```bash
# 1. 启动本地服务器
python server.py 8000 0.0.0.0

# 2. 安装并启动ngrok
ngrok http 8000

# 3. 访问ngrok生成的公网URL（HTTPS）
```

**使用云服务器（生产环境推荐）**：
```bash
# 1. 连接到云服务器
ssh root@your-server-ip

# 2. 克隆项目并安装
git clone https://github.com/zxh0305/web_api_dify.git
cd web_api_dify
npm install

# 3. 使用PM2启动
npm install -g pm2
pm2 start server.js --name dify-chat
pm2 startup && pm2 save

# 4. 配置HTTPS（必须用于语音功能）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

更多详情请查看相关文档！
