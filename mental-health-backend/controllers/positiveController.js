/**
 * 积极赋能模块控制器
 * 仅处理 /positive/content 接口逻辑
 */

import axios from 'axios';

/**
 * 获取鼓励语句
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
export const getEncourageText = async (req, res) => {
  console.log('\n========== 收到请求 ==========');
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  console.log('================================\n');
  
  try {
    // 1. 提取前端传参
    const { userMood } = req.body;
    console.log('提取的 userMood:', userMood);

    // 2. 参数验证
    if (!userMood || typeof userMood !== 'string' || userMood.trim() === '') {
      return res.status(400).json({
        code: 500,
        msg: '鼓励语句生成失败，请稍后再试',
        data: null
      });
    }

    // 3. 获取环境变量
    const difyApiBaseUrl = process.env.DIFY_API_BASE_URL;
    let difyApiKey = process.env.DIFY_API_KEY;

    // 处理 API Key：如果包含 "Authorization: Bearer" 前缀，则移除
    if (difyApiKey && difyApiKey.includes('Authorization: Bearer')) {
      difyApiKey = difyApiKey.replace('Authorization: Bearer', '').trim();
      // 如果还有大括号，也移除
      difyApiKey = difyApiKey.replace(/[{}]/g, '').trim();
    }

    // 检查是否是占位符
    const isPlaceholder = !difyApiKey || 
                         difyApiKey === 'your_dify_api_key_here' || 
                         difyApiKey === 'your_actual_api_key_here' ||
                         difyApiKey === 'API_KEY' ||
                         difyApiKey.includes('请在这里填入') ||
                         difyApiKey.includes('例如：');

    if (!difyApiBaseUrl || isPlaceholder) {
      console.error('\n========== 配置错误 ==========');
      console.error('DIFY_API_BASE_URL:', difyApiBaseUrl || '未设置');
      console.error('DIFY_API_KEY:', difyApiKey ? '已设置（但是占位符，请替换为真实 API Key）' : '未设置');
      console.error('==============================\n');
      return res.status(500).json({
        code: 500,
        msg: '鼓励语句生成失败，请稍后再试',
        data: null
      });
    }

    // 4. 构造 Dify 请求体
    // 根据 Dify API 文档，对话型应用的请求体格式
    // user 字段是必需的（根据错误信息 "Arg user must be provided."）
    // 尝试使用 streaming 模式
    const difyRequestBody = {
      inputs: {},
      query: userMood.trim(),
      response_mode: 'streaming',
      user: 'user-123'
    };
    
    console.log('Dify 请求体:', JSON.stringify(difyRequestBody, null, 2));

    // 5. 调用 Dify API
    // 根据 Dify API 文档，对话型应用的端点是 /v1/chat-messages
    let difyApiUrl = difyApiBaseUrl;
    
    // 如果基础 URL 是 http://localhost/v1，添加 /chat-messages
    if (difyApiUrl.endsWith('/v1')) {
      difyApiUrl = `${difyApiUrl}/chat-messages`;
    } else if (!difyApiUrl.includes('/chat-messages')) {
      difyApiUrl = `${difyApiUrl.replace(/\/$/, '')}/chat-messages`;
    }
    
    console.log('使用 Dify API URL:', difyApiUrl);
    
    console.log('\n========== 调用 Dify API ==========');
    console.log('URL:', difyApiUrl);
    console.log('Request Body:', JSON.stringify(difyRequestBody, null, 2));
    console.log('API Key:', difyApiKey ? `${difyApiKey.substring(0, 10)}...` : '未设置');
    console.log('Headers:', {
      'Authorization': `Bearer ${difyApiKey ? difyApiKey.substring(0, 10) + '...' : '未设置'}`,
      'Content-Type': 'application/json'
    });
    console.log('=====================================\n');
    
    let difyResponse;
    try {
      difyResponse = await axios.post(
        difyApiUrl,
        difyRequestBody,
        {
          headers: {
            'Authorization': `Bearer ${difyApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        }
      );
      
      console.log('\n========== Dify API 响应成功 ==========');
      console.log('状态码:', difyResponse.status);
      console.log('响应头:', JSON.stringify(difyResponse.headers, null, 2));
      console.log('响应数据:', JSON.stringify(difyResponse.data, null, 2));
      console.log('========================================\n');
    } catch (axiosError) {
      // 处理网络错误或 Dify API 错误
      console.error('\n========== Dify API 调用失败 ==========');
      console.error('错误消息:', axiosError.message);
      console.error('错误代码:', axiosError.code);
      
      if (axiosError.response) {
        // Dify API 返回了错误响应
        console.error('响应状态码:', axiosError.response.status);
        console.error('响应头:', JSON.stringify(axiosError.response.headers, null, 2));
        console.error('响应数据:', JSON.stringify(axiosError.response.data, null, 2));
      } else if (axiosError.request) {
        // 请求已发送但未收到响应
        console.error('请求已发送但无响应');
        console.error('请求配置:', JSON.stringify(axiosError.config, null, 2));
      } else {
        console.error('请求配置错误:', axiosError.config);
      }
      console.error('========================================\n');
      
      return res.status(500).json({
        code: 500,
        msg: '鼓励语句生成失败，请稍后再试',
        data: null
      });
    }

    // 6. 检查 Dify 响应状态
    if (difyResponse.status !== 200) {
      console.error('Dify API 返回非 200 状态码:', difyResponse.status);
      return res.status(500).json({
        code: 500,
        msg: '鼓励语句生成失败，请稍后再试',
        data: null
      });
    }

    // 7. 提取 Dify 返回的文本
    // streaming 模式返回的是 SSE 格式的字符串，需要解析
    let encourageText = '';
    
    console.log('解析 Dify 响应:', typeof difyResponse.data === 'string' ? difyResponse.data.substring(0, 200) + '...' : JSON.stringify(difyResponse.data, null, 2));
    
    if (typeof difyResponse.data === 'string') {
      // streaming 模式返回 SSE 格式字符串
      // 格式: "data: {...}\n\ndata: {...}\n\n..."
      const lines = difyResponse.data.split('\n');
      const answerParts = [];
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.substring(6); // 移除 "data: " 前缀
            const eventData = JSON.parse(jsonStr);
            
            // 提取 answer 字段
            if (eventData.answer) {
              answerParts.push(eventData.answer);
            }
            
            // 如果是 message_end 事件，说明消息完成
            if (eventData.event === 'message_end') {
              break;
            }
          } catch (e) {
            // 忽略解析错误
            console.warn('解析 SSE 数据行失败:', line.substring(0, 100));
          }
        }
      }
      
      encourageText = answerParts.join('');
      console.log('提取的鼓励语句:', encourageText);
    } else if (difyResponse.data && typeof difyResponse.data === 'object') {
      // blocking 模式的响应格式
      encourageText = difyResponse.data.answer || 
                     difyResponse.data.message || 
                     difyResponse.data.text || 
                     difyResponse.data.output ||
                     difyResponse.data.content ||
                     (difyResponse.data.data && difyResponse.data.data.answer) ||
                     (difyResponse.data.result && difyResponse.data.result.answer);
    } else {
      console.error('Dify API 返回格式异常:', difyResponse.data);
      return res.status(500).json({
        code: 500,
        msg: '鼓励语句生成失败，请稍后再试',
        data: null
      });
    }

    // 8. 验证提取的文本
    if (!encourageText || encourageText.trim() === '') {
      console.error('Dify API 返回的文本为空');
      return res.status(500).json({
        code: 500,
        msg: '鼓励语句生成失败，请稍后再试',
        data: null
      });
    }

    // 9. 按前端要求格式返回
    return res.status(200).json({
      code: 200,
      msg: 'success',
      data: {
        encourageText: encourageText.trim()
      }
    });

  } catch (error) {
    // 捕获所有未预期的错误
    console.error('获取鼓励语句时发生未知错误:', error);
    return res.status(500).json({
      code: 500,
      msg: '鼓励语句生成失败，请稍后再试',
      data: null
    });
  }
};

