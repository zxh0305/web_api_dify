# Dify工作流对话系统

一个美观的Web界面，用于调用Dify工作流API进行对话交流，预留了ASR（语音识别）和TTS（语音合成）接口。

## 功能特性

- ✅ **Dify工作流API集成** - 支持调用Dify工作流API进行对话
- ✅ **美观的UI界面** - 现代化设计，响应式布局
- ✅ **配置管理** - 支持API URL、API Key等配置，自动保存到本地存储
- ✅ **对话历史** - 保存对话历史记录
- ✅ **一键测试** - 快速测试API连接状态
- 🔜 **ASR接口预留** - 预留语音识别接口，待后续开发
- 🔜 **TTS接口预留** - 预留语音合成接口，待后续开发
- ✅ **错误处理** - 完善的错误提示和处理机制
- ✅ **加载状态** - 友好的加载提示

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/zxh0305/web_api_dify.git
cd web_api_dify
```

### 2. 打开网页

直接在浏览器中打开 `index.html` 文件即可使用。

或者使用本地服务器：

```bash
# 使用Python启动简单HTTP服务器
python -m http.server 8000

# 或使用Node.js的http-server
npx http-server
```

然后在浏览器中访问 `http://localhost:8000`

## 配置说明

### 基础配置

在页面顶部的配置区域填写以下信息：

- **API URL**: Dify工作流API地址
  - 默认值: `https://api.dify.ai/v1/workflows/run`
- **API Key**: 你的Dify API密钥
  - 从Dify平台获取

### 高级设置

点击"⚙️ 高级设置"展开更多配置选项：

- **请求超时时间**: API请求的超时时间（秒），默认30秒
- **工作流ID**: 指定要调用的工作流ID（可选）
- **用户ID**: 用户标识符，默认为 `user-001`

## 使用方法

### 发送消息

1. 在文本输入框中输入问题
2. 点击"发送"按钮或按 `Enter` 键（Shift+Enter换行）
3. 等待AI回复

### 测试API连接

点击"🔗 测试API连接"按钮，快速验证API配置是否正确。

### 清空对话

点击"🗑️ 清空对话"按钮，清除所有对话历史。

### 语音功能（预留）

- **ASR 语音识别**: 预留接口，后续将支持语音输入
- **TTS 语音合成**: 预留接口，后续将支持语音播放AI回复

## API接口说明

### Dify工作流API调用

请求示例：

```javascript
POST https://api.dify.ai/v1/workflows/run
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY

Body:
{
  "inputs": {
    "query": "你的问题"
  },
  "response_mode": "blocking",
  "user": "user-001"
}
```

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "workflow-run-id",
    "outputs": {
      "text": "AI回复内容"
    },
    "status": "succeeded"
  }
}
```

## 文件结构

```
web_api_dify/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js             # JavaScript逻辑
├── README.md          # 项目说明
└── .gitignore         # Git忽略文件
```

## 技术栈

- HTML5
- CSS3 (使用Flexbox和Grid布局)
- 原生JavaScript (ES6+)
- Fetch API

## 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari
- Opera

## 后续开发计划

- [ ] 集成ASR语音识别功能
- [ ] 集成TTS语音合成功能
- [ ] 支持流式响应
- [ ] 添加Markdown渲染支持
- [ ] 对话历史导出功能
- [ ] 主题切换功能

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，请提交Issue。
