/**
 * 多维解压服务模块 API
 * 包含：小游戏、心理健康自测、Dify对接、打卡积分
 */

import request from './request'

// ========== 小游戏相关 ==========
// 获取小游戏列表
export const getGames = (params) => {
  return request({
    url: '/decompress/games',
    method: 'get',
    params
  })
}

// 开始游戏
export const startGame = (data) => {
  return request({
    url: '/decompress/games/start',
    method: 'post',
    data
  })
}

// 完成游戏
export const completeGame = (data) => {
  return request({
    url: '/decompress/games/complete',
    method: 'post',
    data
  })
}

// ========== 心理题库相关 ==========
// 获取题库列表
export const getQuestionBankList = (params) => {
  return request({
    url: '/decompress/questionnaire/list',
    method: 'get',
    params
  })
}

// 获取题目详情
export const getQuestionDetail = (questionId) => {
  return request({
    url: `/decompress/questionnaire/${questionId}`,
    method: 'get'
  })
}

// 提交答题
export const submitQuestionnaire = (data) => {
  return request({
    url: '/decompress/questionnaire/submit',
    method: 'post',
    data
  })
}

// 获取答题结果
export const getQuestionResult = (resultId) => {
  return request({
    url: `/decompress/questionnaire/result/${resultId}`,
    method: 'get'
  })
}

// ========== Dify心理顾问对接 ==========
// 调用Dify智能体（通过后端中转，Streaming流式模式）
export const callDifyAdvisor = (data, onMessage, onError, onEnd) => {
  // 使用fetch处理SSE流式响应
  return new Promise((resolve, reject) => {
    const { userId, message, emotionTags, emotionScore, conversationId } = data;
    
    // 构建请求体
    const requestBody = {
      userId,
      message,
      emotionTags,
      emotionScore,
      conversationId
    };
    
    // 获取API基础URL
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${baseURL}/ai/dify/chat`;
    
    // 发送请求
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 检查是否是SSE响应
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream') && !contentType.includes('text/plain')) {
        // 如果不是流式响应，尝试解析JSON
        return response.json().then(data => {
          if (onEnd) onEnd(data);
          resolve(data);
        });
      }
      
      // 处理SSE流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullAnswer = '';
      let conversationId = null;
      
      const processStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (onEnd) {
              onEnd({
                fullAnswer,
                conversationId
              });
            }
            resolve({
              fullAnswer,
              conversationId
            });
            return;
          }
          
          // 解码数据块
          buffer += decoder.decode(value, { stream: true });
          
          // 按行处理（SSE格式）
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            // 处理 data: {...} 格式
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              
              try {
                const eventData = JSON.parse(jsonStr);
                const eventType = eventData.event;
                
                if (eventType === 'message' || eventType === 'agent_message') {
                  // 实时消息块
                  if (eventData.answer) {
                    fullAnswer += eventData.answer;
                    if (onMessage) {
                      onMessage(eventData.answer, eventData.fullAnswer || fullAnswer);
                    }
                  }
                  
                  if (eventData.conversationId) {
                    conversationId = eventData.conversationId;
                  }
                } else if (eventType === 'message_end') {
                  // 消息结束
                  fullAnswer = eventData.fullAnswer || fullAnswer;
                  conversationId = eventData.conversationId || conversationId;
                  
                  console.log('收到message_end事件:', {
                    hasFullAnswer: !!fullAnswer,
                    fullAnswerLength: fullAnswer.length,
                    conversationId: conversationId
                  });
                  
                  if (onEnd) {
                    onEnd({
                      fullAnswer,
                      conversationId,
                      messageId: eventData.messageId,
                      metadata: eventData.metadata,
                      usage: eventData.usage
                    });
                  }
                  resolve({
                    fullAnswer,
                    conversationId,
                    messageId: eventData.messageId,
                    metadata: eventData.metadata,
                    usage: eventData.usage
                  });
                  return;
                } else if (eventType === 'error') {
                  // 错误事件
                  const error = new Error(eventData.message || '咨询服务暂不可用');
                  console.error('收到error事件:', eventData);
                  if (onError) onError(error);
                  reject(error);
                  return;
                }
              } catch (parseError) {
                console.warn('解析SSE数据失败:', parseError);
              }
            }
          }
          
          // 继续读取
          processStream();
        }).catch(error => {
          if (onError) onError(error);
          reject(error);
        });
      };
      
      processStream();
    })
    .catch(error => {
      if (onError) onError(error);
      reject(error);
    });
  });
}

// 获取对话历史
export const getDifyHistory = (params) => {
  return request({
    url: '/ai/dify/history',
    method: 'get',
    params
  })
}

// 获取会话列表
export const getDifyConversations = (params) => {
  return request({
    url: '/ai/dify/conversations',
    method: 'get',
    params
  })
}

// ========== 打卡与积分相关 ==========
// 活动打卡
export const checkIn = (data) => {
  return request({
    url: '/decompress/checkin',
    method: 'post',
    data
  })
}

// 获取打卡记录
export const getCheckInRecords = (params) => {
  return request({
    url: '/decompress/checkin/records',
    method: 'get',
    params
  })
}

// 获取积分信息
export const getPointsInfo = (params) => {
  return request({
    url: '/points/info',
    method: 'get',
    params
  })
}

// 获取积分变动记录
export const getPointsHistory = (params) => {
  return request({
    url: '/points/history',
    method: 'get',
    params
  })
}

// 获取积分规则
export const getPointsRules = () => {
  return request({
    url: '/points/rules',
    method: 'get'
  })
}

// ========== 跨模块接口：积分更新（供模块C调用）==========
// 积分更新接口（提供给其他模块调用）
export const updatePoints = (data) => {
  return request({
    url: '/points/update',
    method: 'post',
    data
  })
}

