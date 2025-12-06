/**
 * 简单情绪分析测试
 */

const axios = require('axios')

const DIFY_BASE_URL = 'http://localhost:9001/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU'

async function testSimpleEmotion() {
  console.log('=== 简单情绪分析测试 ===\n')
  
  const queryText = `请分析以下文本数据的情绪状态。

待分析内容：今天心情很好，工作顺利

要求：
1. 情绪标签：从以下选项中选择一个（愉悦、焦虑、平静、烦躁、低落）
2. 情绪分数：0-100的整数，分数越低表示情绪越负面
3. 分析说明：简要说明情绪状态和建议

请以JSON格式返回，格式如下：
{
  "emotionTag": "情绪标签",
  "emotionScore": 情绪分数,
  "analysis": "分析说明"
}`
  
  try {
    console.log('发送请求（传入空的inputs）...')
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {}, // 必需参数，传空对象
        query: queryText,
        response_mode: 'blocking',
        user: 'emotion-analyzer',
        conversation_id: ''
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )
    
    console.log('✓ 请求成功')
    console.log('响应数据:', JSON.stringify(response.data, null, 2))
    console.log('\n答案:', response.data.answer)
    
    return true
  } catch (error) {
    console.error('✗ 请求失败')
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error('错误:', error.message)
    }
    return false
  }
}

testSimpleEmotion()

