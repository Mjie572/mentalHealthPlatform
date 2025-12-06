/**
 * 模块1：AI情绪分析服务
 * 成员A开发：Dify情绪监控师智能体配置
 * 文件命名规范：emotionAnalyzeService.js（便于5人分工合并）
 */

const axios = require('axios')
const GlobalConfig = require('../config/GlobalConfig')

// Dify API配置
const DIFY_BASE_URL = 'http://localhost:9001/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU' // 情绪监控师智能体密钥

/**
 * 调用Dify情绪监控师智能体分析情绪
 * @param {String} content - 情绪内容
 * @param {String} dataType - 数据类型（text/voice/behavior）
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeEmotion(content, dataType) {
  try {
    // Demo版返回模拟结果
    if (GlobalConfig.systemConfig.isDemo) {
      const mockTag = GlobalConfig.emotionCommonTags[Math.floor(Math.random() * GlobalConfig.emotionCommonTags.length)]
      return {
        success: true,
        emotionTag: mockTag,
        emotionScore: Math.floor(Math.random() * 40) + 60, // 60-100
        analysis: `Demo版AI分析结果：检测到${mockTag}情绪，建议关注心理健康状态`,
        severity: mockTag === '低落' || mockTag === '焦虑' ? 'high' : 'normal'
      }
    }

    // 正式版：调用Dify API（工作流编排对话型应用）
    // 根据Dify API文档：POST /chat-messages
    // 根据测试，简化query格式，避免400错误
    const dataTypeText = dataType === 'text' ? '文本' : dataType === 'voice' ? '语音转文字' : '行为'
    
    // 构建查询文本（简化版，避免格式要求导致400错误）
    const queryText = `请分析以下${dataTypeText}数据的情绪状态："${content}"。

请给出：
1. 情绪标签（从以下选项中选择：愉悦、焦虑、平静、烦躁、低落）
2. 情绪分数（0-100的整数，分数越低表示情绪越负面）
3. 简要分析说明`
    
    console.log('调用Dify API:', {
      url: `${DIFY_BASE_URL}/chat-messages`,
      dataType,
      contentLength: content.length,
      queryLength: queryText.length
    })
    
    // 根据Dify API文档，inputs参数是必需的，但如果智能体没有定义变量，传空对象
    const requestBody = {
      inputs: {}, // 必需参数，如果智能体没有定义变量，传空对象
      query: queryText,
      response_mode: 'blocking', // 阻塞模式，等待完整结果
      user: 'emotion-analyzer',
      conversation_id: '' // 首次对话为空
    }
    
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: GlobalConfig.systemConfig.timeout || 60000 // 增加超时时间到60秒
      }
    )

    // 解析Dify返回结果
    // 根据API文档，blocking模式返回ChatCompletionResponse格式
    const difyResult = response.data
    
    console.log('Dify API响应:', {
      hasData: !!difyResult,
      event: difyResult?.event,
      hasAnswer: !!difyResult?.answer,
      answerLength: difyResult?.answer?.length
    })
    
    // 检查响应格式
    if (!difyResult) {
      throw new Error('Dify API返回数据为空')
    }

    // blocking模式返回格式：{event: "message", answer: "...", ...}
    // 检查event字段（如果存在）
    if (difyResult.event && difyResult.event !== 'message') {
      throw new Error(`Dify API返回异常事件类型: ${difyResult.event}`)
    }

    const answer = difyResult.answer || ''
    
    if (!answer || answer.trim().length === 0) {
      throw new Error('Dify API返回空答案')
    }

    console.log('Dify返回的答案:', answer.substring(0, 200))

    // 从答案中提取情绪标签和分数
    // 优先尝试解析JSON格式
    let emotionTag = '平静'
    let emotionScore = 70
    let severity = 'normal'
    let analysis = answer

    // 方法1: 尝试解析完整的JSON格式
    try {
      // 查找JSON对象（可能包含在代码块中）
      const jsonPatterns = [
        /```json\s*(\{[\s\S]*?\})\s*```/,  // 代码块格式
        /```\s*(\{[\s\S]*?\})\s*```/,       // 普通代码块
        /\{[\s\S]*"emotionTag"[\s\S]*\}/    // 直接JSON对象
      ]
      
      for (const pattern of jsonPatterns) {
        const match = answer.match(pattern)
        if (match) {
          const jsonStr = match[1] || match[0]
          const parsed = JSON.parse(jsonStr)
          if (parsed.emotionTag && GlobalConfig.emotionCommonTags.includes(parsed.emotionTag)) {
            emotionTag = parsed.emotionTag
            if (parsed.emotionScore !== undefined) {
              emotionScore = parseInt(parsed.emotionScore)
              if (isNaN(emotionScore) || emotionScore < 0 || emotionScore > 100) {
                emotionScore = 70 // 默认值
              }
            }
            if (parsed.analysis) {
              analysis = parsed.analysis
            }
            console.log('成功解析JSON格式:', { emotionTag, emotionScore })
            break
          }
        }
      }
    } catch (e) {
      console.log('JSON解析失败，使用文本解析:', e.message)
    }

    // 方法2: 如果未从JSON中提取到，使用文本解析
    if (emotionTag === '平静') {
      // 查找情绪标签
      for (const tag of GlobalConfig.emotionCommonTags) {
        // 使用更精确的匹配，避免误匹配
        const tagPattern = new RegExp(`情绪标签[：:：]\\s*${tag}|${tag}(?:情绪|状态)`, 'i')
        if (tagPattern.test(answer) || answer.includes(`"${tag}"`) || answer.includes(`'${tag}'`)) {
          emotionTag = tag
          console.log('从文本中提取情绪标签:', emotionTag)
          break
        }
      }
      
      // 如果还是没找到，使用简单包含匹配
      if (emotionTag === '平静') {
        for (const tag of GlobalConfig.emotionCommonTags) {
          if (answer.includes(tag)) {
            emotionTag = tag
            console.log('使用简单匹配提取情绪标签:', emotionTag)
            break
          }
        }
      }
    }

    // 方法3: 提取情绪分数（多种格式）
    if (emotionScore === 70) {
      const scorePatterns = [
        /情绪分数[：:：]\s*(\d+)/i,           // 情绪分数：85
        /分数[：:：]\s*(\d+)/i,              // 分数：85
        /(\d+)\s*\/\s*100/i,                // 85/100
        /(\d+)\s*分/i,                       // 85分
        /"emotionScore"\s*[:：]\s*(\d+)/i,   // JSON格式
        /emotionScore[：:：]\s*(\d+)/i       // emotionScore: 85
      ]
      
      for (const pattern of scorePatterns) {
        const match = answer.match(pattern)
        if (match) {
          const extractedScore = parseInt(match[1])
          if (!isNaN(extractedScore) && extractedScore >= 0 && extractedScore <= 100) {
            emotionScore = extractedScore
            console.log('从文本中提取情绪分数:', emotionScore)
            break
          }
        }
      }
    }

    // 判断严重程度
    if (['低落', '焦虑', '烦躁'].includes(emotionTag)) {
      severity = 'high'
      // 如果分数过高，根据情绪标签调整
      if (emotionScore > 60) {
        emotionScore = Math.min(emotionScore, 60) // 负面情绪分数不应超过60
      }
    } else {
      severity = 'normal'
      // 如果分数过低，根据情绪标签调整
      if (emotionScore < 50) {
        emotionScore = Math.max(emotionScore, 60) // 正面情绪分数不应低于60
      }
    }

    console.log('最终解析结果:', { emotionTag, emotionScore, severity })

    return {
      success: true,
      emotionTag,
      emotionScore,
      analysis: answer,
      severity,
      conversationId: difyResult.conversation_id || '',
      messageId: difyResult.message_id || ''
    }
  } catch (error) {
    console.error('Dify情绪分析错误:', error)
    return {
      success: false,
      error: error.message || 'AI分析失败'
    }
  }
}

module.exports = {
  analyzeEmotion
}



