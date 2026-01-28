/**
 * Dify智能对话系统 - 核心逻辑
 * 功能：文本/语音对话、ASR语音识别、TTS语音合成、对话上下文管理
 */

class VoiceChatSystem {
    constructor() {
        // API配置
        this.apiConfig = {
            url: 'https://api.dify.ai/v1/chat-messages',
            apiKey: '',
            userId: 'user-' + Date.now(),
            conversationId: null
        };

        // TTS配置
        this.ttsConfig = {
            enabled: true,
            rate: 1.0,      // 语速 0.5-2.0
            volume: 1.0,    // 音量 0-1
            voice: null      // 语音选择
        };

        // ASR配置
        this.asrConfig = {
            recognition: null,
            isRecording: false
        };

        // TTS语音合成
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;

        // 消息历史
        this.messageHistory = [];
        this.maxHistory = 50; // 最多保存50条消息

        // 状态
        this.isLoading = false;

        // 初始化
        this.init();
    }

    /**
     * 初始化系统
     */
    init() {
        this.loadConfig();
        this.loadConversationId();
        this.initASR();
        this.loadTTSVoices();
        this.bindEvents();
        this.loadMessageHistory();
        console.log('✓ Dify智能对话系统初始化完成');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 配置相关
        document.getElementById('config-toggle').addEventListener('click', () => {
            document.getElementById('config-panel').classList.toggle('show');
        });

        document.getElementById('save-config-btn').addEventListener('click', () => {
            this.saveConfig();
            this.showToast('配置已保存', 'success');
            document.getElementById('config-panel').classList.remove('show');
        });

        // 自动保存配置
        document.getElementById('api-url').addEventListener('input', (e) => {
            this.apiConfig.url = e.target.value;
        });
        document.getElementById('api-key').addEventListener('input', (e) => {
            this.apiConfig.apiKey = e.target.value;
        });
        document.getElementById('user-id').addEventListener('input', (e) => {
            this.apiConfig.userId = e.target.value;
        });

        // 消息发送
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // ASR语音识别
        document.getElementById('mic-btn').addEventListener('click', () => this.toggleASR());

        // TTS语音朗读开关
        document.getElementById('tts-toggle-btn').addEventListener('click', () => {
            this.ttsConfig.enabled = !this.ttsConfig.enabled;
            const btn = document.getElementById('tts-toggle-btn');
            if (this.ttsConfig.enabled) {
                btn.classList.add('active');
                btn.textContent = '🔊 语音朗读: 开';
                this.showToast('语音朗读已开启', 'success');
            } else {
                btn.classList.remove('active');
                btn.textContent = '🔇 语音朗读: 关';
                this.stopTTS(); // 立即停止当前播放
                this.showToast('语音朗读已关闭', 'warning');
            }
            this.saveConfig();
        });

        // TTS参数调整
        document.getElementById('tts-rate').addEventListener('input', (e) => {
            this.ttsConfig.rate = parseFloat(e.target.value);
            document.getElementById('tts-rate-value').textContent = this.ttsConfig.rate.toFixed(1) + 'x';
            this.saveConfig();
        });

        document.getElementById('tts-volume').addEventListener('input', (e) => {
            this.ttsConfig.volume = parseFloat(e.target.value);
            document.getElementById('tts-volume-value').textContent = Math.round(this.ttsConfig.volume * 100) + '%';
            this.saveConfig();
        });

        // 清空对话
        document.getElementById('clear-btn').addEventListener('click', () => this.clearChat());

        // 语音控制按钮
        document.getElementById('pause-audio-btn').addEventListener('click', () => this.pauseTTS());
        document.getElementById('resume-audio-btn').addEventListener('click', () => this.resumeTTS());
        document.getElementById('stop-audio-btn').addEventListener('click', () => this.stopTTS());
    }

    /**
     * 初始化ASR语音识别
     */
    initASR() {
        // 检查浏览器支持
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ 浏览器不支持Web Speech API');
            document.getElementById('mic-btn').disabled = true;
            document.getElementById('mic-btn').title = '您的浏览器不支持语音识别（请使用Chrome/Edge）';
            return;
        }

        // 创建识别实例
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.asrConfig.recognition = new SpeechRecognition();

        // 配置识别参数
        this.asrConfig.recognition.lang = 'zh-CN'; // 中文
        this.asrConfig.recognition.continuous = false; // 不连续识别
        this.asrConfig.recognition.interimResults = false; // 只返回最终结果

        // 识别结果
        this.asrConfig.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const userInput = document.getElementById('user-input');
            userInput.value = transcript;
            this.showToast('语音识别成功', 'success');
        };

        // 识别结束
        this.asrConfig.recognition.onend = () => {
            this.asrConfig.isRecording = false;
            this.updateRecordingUI();
        };

        // 识别错误
        this.asrConfig.recognition.onerror = (event) => {
            this.asrConfig.isRecording = false;
            this.updateRecordingUI();

            let errorMsg = '语音识别失败';
            if (event.error === 'no-speech') {
                errorMsg = '未检测到语音，请重新录制';
            } else if (event.error === 'audio-capture') {
                errorMsg = '无法访问麦克风，请检查权限';
            } else if (event.error === 'not-allowed') {
                errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许';
            }

            this.showToast(errorMsg, 'error');
            console.error('ASR错误:', event.error);
        };

        console.log('✓ ASR语音识别初始化完成');
    }

    /**
     * 切换ASR录音状态
     */
    toggleASR() {
        if (this.asrConfig.isRecording) {
            // 停止录音
            this.asrConfig.recognition.stop();
        } else {
            // 开始录音
            try {
                this.asrConfig.recognition.start();
                this.asrConfig.isRecording = true;
                this.updateRecordingUI();
                this.showToast('正在录音...', 'warning');
            } catch (error) {
                console.error('启动录音失败:', error);
                this.showToast('启动录音失败，请重试', 'error');
            }
        }
    }

    /**
     * 更新录音UI状态
     */
    updateRecordingUI() {
        const micBtn = document.getElementById('mic-btn');
        const indicator = document.getElementById('recording-indicator');

        if (this.asrConfig.isRecording) {
            micBtn.classList.add('recording');
            indicator.classList.add('show');
        } else {
            micBtn.classList.remove('recording');
            indicator.classList.remove('show');
        }
    }

    /**
     * 加载TTS语音列表
     */
    loadTTSVoices() {
        if (!this.speechSynthesis) {
            console.warn('⚠️ 浏览器不支持语音合成');
            return;
        }

        // 加载中文语音
        const loadVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            const zhVoice = voices.find(voice =>
                voice.lang.includes('zh') || voice.lang.includes('CN')
            );
            if (zhVoice) {
                this.ttsConfig.voice = zhVoice;
                console.log('✓ 已选择中文语音:', zhVoice.name);
            }
        };

        // 某些浏览器需要等待voices加载
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();
    }

    /**
     * 文本转语音
     */
    speakTTS(text) {
        if (!this.ttsConfig.enabled || !text) {
            return;
        }

        // 停止当前播放
        this.stopTTS();

        // 创建语音实例
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.ttsConfig.rate;
        utterance.volume = this.ttsConfig.volume;

        if (this.ttsConfig.voice) {
            utterance.voice = this.ttsConfig.voice;
        }

        // 事件处理
        utterance.onstart = () => {
            this.showAudioControl(true);
        };

        utterance.onend = () => {
            this.showAudioControl(false);
        };

        utterance.onerror = (event) => {
            console.error('TTS错误:', event);
            this.showAudioControl(false);
        };

        // 开始播放
        this.currentUtterance = utterance;
        this.speechSynthesis.speak(utterance);
    }

    /**
     * 暂停TTS
     */
    pauseTTS() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.pause();
            document.getElementById('pause-audio-btn').style.display = 'none';
            document.getElementById('resume-audio-btn').style.display = 'inline-flex';
        }
    }

    /**
     * 继续TTS
     */
    resumeTTS() {
        if (this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
            document.getElementById('pause-audio-btn').style.display = 'inline-flex';
            document.getElementById('resume-audio-btn').style.display = 'none';
        }
    }

    /**
     * 停止TTS
     */
    stopTTS() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            this.showAudioControl(false);
        }
    }

    /**
     * 显示/隐藏音频控制
     */
    showAudioControl(show) {
        const control = document.getElementById('audio-control');
        control.style.display = show ? 'flex' : 'none';

        // 重置按钮显示
        if (show) {
            document.getElementById('pause-audio-btn').style.display = 'inline-flex';
            document.getElementById('resume-audio-btn').style.display = 'none';
        }
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();

        if (!message) {
            this.showToast('请输入内容或使用语音输入', 'warning');
            return;
        }

        if (!this.apiConfig.apiKey) {
            this.showToast('请先配置API Key', 'error');
            document.getElementById('config-panel').classList.add('show');
            return;
        }

        if (this.isLoading) {
            this.showToast('正在处理中，请稍候...', 'warning');
            return;
        }

        // 显示用户消息
        this.addMessage(message, 'user');
        userInput.value = '';

        // 调用API
        await this.callDifyAPI(message);
    }

    /**
     * 调用Dify API
     */
    async callDifyAPI(query) {
        this.isLoading = true;
        this.showLoading('AI正在思考...');

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiConfig.apiKey}`
            };

            const body = {
                query: query,
                response_mode: 'blocking',
                user: this.apiConfig.userId
            };

            // 如果有conversation_id，添加到请求中以维持对话上下文
            if (this.apiConfig.conversationId) {
                body.conversation_id = this.apiConfig.conversationId;
            }

            const response = await fetch(this.apiConfig.url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `API请求失败: ${response.status}`);
            }

            const data = await response.json();

            // 保存conversation_id用于下一轮对话
            if (data.conversation_id) {
                this.apiConfig.conversationId = data.conversation_id;
                this.saveConversationId();
            }

            // 显示AI回复（打字机效果）
            const reply = this.extractReply(data);
            this.showTypingEffect(reply);

        } catch (error) {
            console.error('API调用错误:', error);
            let errorMsg = '网络异常，请检查网络连接';
            if (error.message.includes('API Key') || error.message.includes('401')) {
                errorMsg = 'API Key错误，请检查配置';
            } else if (error.message.includes('429')) {
                errorMsg = 'API调用次数超限，请稍后重试';
            }
            this.showToast(errorMsg, 'error');
            this.addMessage(`❌ ${errorMsg}`, 'assistant');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * 提取回复内容
     */
    extractReply(data) {
        if (data.answer) {
            return data.answer;
        } else if (data.data && data.data.outputs) {
            const outputs = data.data.outputs;
            if (outputs.text) return outputs.text;
            if (outputs.answer) return outputs.answer;
            return JSON.stringify(outputs, null, 2);
        }
        return '抱歉，我无法理解您的问题。';
    }

    /**
     * 打字机效果显示消息
     */
    showTypingEffect(fullText) {
        // 创建消息容器
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-cursor';
        contentDiv.textContent = '';
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // 自动滚动
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 打字机效果
        let index = 0;
        const typeSpeed = 20; // 每个字符的间隔（毫秒）

        const typeChar = () => {
            if (index < fullText.length) {
                contentDiv.textContent += fullText.charAt(index);
                index++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(typeChar, typeSpeed);
            } else {
                // 打字完成
                contentDiv.classList.remove('typing-cursor');

                // 保存到历史
                this.messageHistory.push({
                    role: 'assistant',
                    content: fullText,
                    timestamp: Date.now()
                });
                this.saveMessageHistory();

                // 朗读
                this.speakTTS(fullText);
            }
        };

        typeChar();
    }

    /**
     * 添加消息（非打字机效果）
     */
    addMessage(content, type = 'assistant') {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(content);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // 自动滚动
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 保存到历史（系统消息不保存）
        if (type !== 'system') {
            this.messageHistory.push({
                role: type,
                content: content,
                timestamp: Date.now()
            });
            this.saveMessageHistory();
        }
    }

    /**
     * 格式化消息内容
     */
    formatMessage(content) {
        if (typeof content === 'object') {
            return JSON.stringify(content, null, 2);
        }
        // 转义HTML
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    /**
     * 清空对话
     */
    clearChat() {
        if (confirm('确定要清空所有对话吗？')) {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = `
                <div class="message system-message">
                    <div class="message-content">
                        <p>对话已清空，可以重新开始对话。</p>
                    </div>
                </div>
            `;

            // 清空历史
            this.messageHistory = [];
            this.saveMessageHistory();

            // 不清空conversation_id，保持会话连续性

            this.showToast('对话已清空', 'success');
        }
    }

    /**
     * 显示加载状态
     */
    showLoading(text = '处理中...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = text;
        overlay.classList.add('show');
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('show');
    }

    /**
     * 显示Toast提示
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * 保存配置到localStorage
     */
    saveConfig() {
        const config = {
            apiUrl: this.apiConfig.url,
            apiKey: this.apiConfig.apiKey,
            userId: this.apiConfig.userId,
            ttsEnabled: this.ttsConfig.enabled,
            ttsRate: this.ttsConfig.rate,
            ttsVolume: this.ttsConfig.volume
        };
        localStorage.setItem('difyChatConfig', JSON.stringify(config));
    }

    /**
     * 从localStorage加载配置
     */
    loadConfig() {
        const saved = localStorage.getItem('difyChatConfig');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.apiConfig.url = config.apiUrl || this.apiConfig.url;
                this.apiConfig.apiKey = config.apiKey || '';
                this.apiConfig.userId = config.userId || this.apiConfig.userId;
                this.ttsConfig.enabled = config.ttsEnabled !== false;
                this.ttsConfig.rate = config.ttsRate || 1.0;
                this.ttsConfig.volume = config.ttsVolume || 1.0;

                // 更新UI
                document.getElementById('api-url').value = this.apiConfig.url;
                document.getElementById('api-key').value = this.apiConfig.apiKey;
                document.getElementById('user-id').value = this.apiConfig.userId;
                document.getElementById('tts-rate').value = this.ttsConfig.rate;
                document.getElementById('tts-volume').value = this.ttsConfig.volume;
                document.getElementById('tts-rate-value').textContent = this.ttsConfig.rate.toFixed(1) + 'x';
                document.getElementById('tts-volume-value').textContent = Math.round(this.ttsConfig.volume * 100) + '%';

                const ttsBtn = document.getElementById('tts-toggle-btn');
                if (this.ttsConfig.enabled) {
                    ttsBtn.classList.add('active');
                    ttsBtn.textContent = '🔊 语音朗读: 开';
                } else {
                    ttsBtn.classList.remove('active');
                    ttsBtn.textContent = '🔇 语音朗读: 关';
                }

                console.log('✓ 配置已加载');
            } catch (error) {
                console.error('加载配置失败:', error);
            }
        }
    }

    /**
     * 保存conversation_id
     */
    saveConversationId() {
        localStorage.setItem('difyConversationId', this.apiConfig.conversationId);
    }

    /**
     * 加载conversation_id
     */
    loadConversationId() {
        const saved = localStorage.getItem('difyConversationId');
        if (saved) {
            this.apiConfig.conversationId = saved;
            console.log('✓ 会话ID已加载:', saved);
        }
    }

    /**
     * 保存消息历史
     */
    saveMessageHistory() {
        // 只保存最近的消息
        const recentMessages = this.messageHistory.slice(-this.maxHistory);
        localStorage.setItem('difyMessageHistory', JSON.stringify(recentMessages));
    }

    /**
     * 加载消息历史
     */
    loadMessageHistory() {
        const saved = localStorage.getItem('difyMessageHistory');
        if (saved) {
            try {
                const history = JSON.parse(saved);
                this.messageHistory = history;

                // 恢复消息显示
                const chatMessages = document.getElementById('chat-messages');
                chatMessages.innerHTML = '';

                history.forEach(msg => {
                    this.addMessageToUI(msg.content, msg.role);
                });

                // 滚动到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;

                console.log(`✓ 已恢复${history.length}条历史消息`);
            } catch (error) {
                console.error('加载消息历史失败:', error);
            }
        }
    }

    /**
     * 添加消息到UI（不带历史记录保存）
     */
    addMessageToUI(content, type) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(content);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查HTTPS（语音功能需要HTTPS）
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('⚠️ 语音功能需要HTTPS环境');
    }

    window.chatSystem = new VoiceChatSystem();
});
