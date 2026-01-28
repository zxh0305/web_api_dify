class DifyChat {
    constructor() {
        this.apiConfig = {
            url: document.getElementById('api-url').value,
            apiKey: '',
            timeout: 30000,
            userId: 'user-001',
            workflowId: ''
        };

        this.messageHistory = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConfig();
    }

    bindEvents() {
        const sendBtn = document.getElementById('send-btn');
        const testApiBtn = document.getElementById('test-api-btn');
        const clearChatBtn = document.getElementById('clear-chat-btn');
        const userInput = document.getElementById('user-input');
        const asrBtn = document.getElementById('asr-btn');
        const ttsBtn = document.getElementById('tts-btn');
        const apiKeyInput = document.getElementById('api-key');
        const apiUrlInput = document.getElementById('api-url');
        const timeoutInput = document.getElementById('timeout');
        const workflowIdInput = document.getElementById('workflow-id');
        const userIdInput = document.getElementById('user-id');

        sendBtn.addEventListener('click', () => this.sendMessage());
        testApiBtn.addEventListener('click', () => this.testApiConnection());
        clearChatBtn.addEventListener('click', () => this.clearChat());

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        asrBtn.addEventListener('click', () => this.handleASR());
        ttsBtn.addEventListener('click', () => this.handleTTS());

        // 自动保存配置
        apiKeyInput.addEventListener('input', () => {
            this.apiConfig.apiKey = apiKeyInput.value;
            this.saveConfig();
        });

        apiUrlInput.addEventListener('change', () => {
            this.apiConfig.url = apiUrlInput.value;
            this.saveConfig();
        });

        timeoutInput.addEventListener('change', () => {
            this.apiConfig.timeout = parseInt(timeoutInput.value) * 1000;
            this.saveConfig();
        });

        workflowIdInput.addEventListener('change', () => {
            this.apiConfig.workflowId = workflowIdInput.value;
            this.saveConfig();
        });

        userIdInput.addEventListener('change', () => {
            this.apiConfig.userId = userIdInput.value;
            this.saveConfig();
        });
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('difyChatConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            this.apiConfig = { ...this.apiConfig, ...config };

            document.getElementById('api-key').value = this.apiConfig.apiKey || '';
            document.getElementById('api-url').value = this.apiConfig.url;
            document.getElementById('timeout').value = this.apiConfig.timeout / 1000;
            document.getElementById('workflow-id').value = this.apiConfig.workflowId || '';
            document.getElementById('user-id').value = this.apiConfig.userId;
        }
    }

    saveConfig() {
        localStorage.setItem('difyChatConfig', JSON.stringify(this.apiConfig));
    }

    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    addMessage(content, type = 'user') {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(content);

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        this.messageHistory.push({
            role: type === 'user' ? 'user' : 'assistant',
            content: content
        });

        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(content) {
        if (typeof content === 'object') {
            return JSON.stringify(content, null, 2);
        }
        return content.replace(/\n/g, '<br>');
    }

    async sendMessage() {
        const userInput = document.getElementById('user-input');
        const content = userInput.value.trim();

        if (!content) {
            this.showError('请输入内容');
            return;
        }

        if (!this.apiConfig.apiKey) {
            this.showError('请先配置API Key');
            return;
        }

        // 添加用户消息
        this.addMessage(content, 'user');
        userInput.value = '';

        // 调用API
        await this.callDifyAPI(content);
    }

    async callDifyAPI(query) {
        this.showLoading(true);

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiConfig.apiKey}`
            };

            const body = {
                inputs: {
                    query: query
                },
                response_mode: 'blocking',
                user: this.apiConfig.userId
            };

            if (this.apiConfig.workflowId) {
                body.workflow_id = this.apiConfig.workflowId;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.apiConfig.timeout);

            const response = await fetch(this.apiConfig.url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `API请求失败: ${response.status}`);
            }

            const data = await response.json();
            this.handleDifyResponse(data);

        } catch (error) {
            if (error.name === 'AbortError') {
                this.showError('请求超时，请稍后重试');
            } else {
                this.showError(`错误: ${error.message}`);
            }
        } finally {
            this.showLoading(false);
        }
    }

    handleDifyResponse(data) {
        // 根据Dify API返回的数据结构处理响应
        let responseContent = '';

        if (data.data && data.data.outputs) {
            // 工作流响应
            if (data.data.outputs.text) {
                responseContent = data.data.outputs.text;
            } else if (data.data.outputs.answer) {
                responseContent = data.data.outputs.answer;
            } else {
                responseContent = JSON.stringify(data.data.outputs, null, 2);
            }
        } else if (data.data && data.data.answer) {
            // 聊天API响应
            responseContent = data.data.answer;
        } else {
            responseContent = JSON.stringify(data, null, 2);
        }

        this.addMessage(responseContent, 'assistant');
    }

    async testApiConnection() {
        if (!this.apiConfig.apiKey) {
            this.showError('请先配置API Key');
            return;
        }

        this.showLoading(true);

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiConfig.apiKey}`
            };

            const body = {
                inputs: {
                    query: 'Hello, test connection.'
                },
                response_mode: 'blocking',
                user: this.apiConfig.userId
            };

            const response = await fetch(this.apiConfig.url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (response.ok) {
                this.showSuccess('API连接成功！');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `连接失败: ${response.status}`);
            }

        } catch (error) {
            this.showError(`连接测试失败: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    clearChat() {
        if (confirm('确定要清空所有对话吗？')) {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = `
                <div class="message system-message">
                    <div class="message-content">
                        <p>对话已清空，可以重新开始。</p>
                    </div>
                </div>
            `;
            this.messageHistory = [];
        }
    }

    // ASR 语音识别接口（预留）
    handleASR() {
        alert('ASR语音识别功能已预留接口\n\n后续将集成语音识别服务，支持语音输入功能。');

        // TODO: 集成ASR服务
        // 示例实现：
        // 1. 调用浏览器Web Speech API
        // 2. 或调用第三方ASR API服务
        // 3. 将识别的文本自动填入输入框
    }

    // TTS 语音合成接口（预留）
    handleTTS() {
        // 检查是否有最后一条AI回复
        const lastAssistantMessage = [...this.messageHistory].reverse().find(msg => msg.role === 'assistant');

        if (!lastAssistantMessage) {
            alert('暂无可合成语音的内容\n\n请先进行对话，获取AI回复后再使用TTS功能。');
            return;
        }

        alert('TTS语音合成功能已预留接口\n\n将合成最后一条AI回复的内容：\n\n' + lastAssistantMessage.content + '\n\n后续将集成语音合成服务。');

        // TODO: 集成TTS服务
        // 示例实现：
        // 1. 调用浏览器Web Speech API
        // 2. 或调用第三方TTS API服务
        // 3. 播放合成语音
    }

    showError(message) {
        const chatMessages = document.getElementById('chat-messages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message assistant-message';
        errorDiv.innerHTML = `
            <div class="message-content" style="background: #fee2e2; border-color: #ef4444; color: #dc2626;">
                ❌ ${message}
            </div>
        `;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        const chatMessages = document.getElementById('chat-messages');
        const successDiv = document.createElement('div');
        successDiv.className = 'message system-message';
        successDiv.innerHTML = `
            <div class="message-content" style="background: #dcfce7; border-color: #22c55e; color: #16a34a;">
                ✅ ${message}
            </div>
        `;
        chatMessages.appendChild(successDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.difyChat = new DifyChat();
});
