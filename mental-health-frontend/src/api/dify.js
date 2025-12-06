import axios from 'axios'
import { getStorage, setStorage } from '@/utils/index.js'

const DEFAULT_BASE_URL = import.meta.env.VITE_DIFY_BASE_URL || '/v1'

export const createDifyClient = ({ initialBaseURL, initialApiKey } = {}) => {
  const baseURL = initialBaseURL || DEFAULT_BASE_URL
  const apiKey = initialApiKey

  const service = axios.create({
    baseURL: baseURL,
    timeout: 30000
  })

  service.interceptors.request.use((config) => {
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`
    }
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  })

  service.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
  )

  return {
    /**
     * 发送聊天消息 (阻塞模式，如果 Dify 支持)
     * @param {Object} params
     * @param {string} params.query - 用户输入
     * @param {Object} params.inputs - 业务上下文输入，可为空
     * @param {string} params.conversation_id - 会话ID，首次为空将由 Dify 生成
     * @param {string} params.user - 用户唯一标识（用于 Dify 侧会话区分）
     * @returns {Promise<any>} Dify 响应数据
     */
    sendChat: async ({ query, inputs = {}, conversation_id, user = 'web-user' }) => {
      const body = {
        inputs,
        query,
        response_mode: 'blocking',
        conversation_id,
        user
      }
      const res = await service.post('/chat-messages', body)
      return res.data
    },

    /**
     * 发送聊天消息 (流式模式)
     * @param {Object} params
     * @param {string} params.query - 用户输入
     * @param {Object} params.inputs - 业务上下文输入，可为空
     * @param {string} params.conversation_id - 会话ID，首次为空将由 Dify 生成
     * @param {string} params.user - 用户唯一标识（用于 Dify 侧会话区分）
     * @param {Function} onMessage - 接收到消息时的回调函数 (data) => void
     * @param {Function} onComplete - 流结束时的回调函数 () => void
     * @param {Function} onError - 发生错误时的回调函数 (error) => void
     * @returns {Function} stop - 停止流式请求的函数
     */
    sendChatStream: ({ query, inputs = {}, conversation_id, user = 'web-user', onMessage, onComplete, onError }) => {
      const body = {
        inputs,
        query,
        response_mode: 'streaming',
        conversation_id,
        user
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }

      const controller = new AbortController();
      const signal = controller.signal;

      fetch(`${baseURL}/chat-messages`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        signal: signal
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || 'Streaming request failed');
          });
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              onComplete && onComplete();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the last incomplete line in buffer

            lines.forEach(line => {
              if (line.startsWith('data:')) {
                try {
                  const data = JSON.parse(line.substring(5).trim());
                  onMessage && onMessage(data);
                } catch (e) {
                  console.error('Error parsing SSE data:', e, line);
                }
              }
            });
            read();
          }).catch(error => {
            if (error.name === 'AbortError') {
              console.log('Stream aborted');
            } else {
              onError && onError(error);
            }
          });
        };
        read();
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          onError && onError(error);
        }
      });

      return () => controller.abort(); // Return a function to stop the stream
    }
  }
}

export const difyClient = createDifyClient()