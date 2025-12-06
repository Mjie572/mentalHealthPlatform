/**
 * 测试Dify API不同格式
 */

const axios = require('axios')

const DIFY_BASE_URL = 'http://localhost:9001/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU'

async function testFormat1() {
  console.log('测试1: 简单查询（已知成功）')
  try {
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {},
        query: '你好，请简单回复"连接成功"',
        response_mode: 'blocking',
        user: 'test-user',
        conversation_id: ''
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    console.log('✓ 成功:', response.data.answer?.substring(0, 50))
    return true
  } catch (error) {
    console.log('✗ 失败:', error.response?.data?.message || error.message)
    return false
  }
}

async function testFormat2() {
  console.log('\n测试2: 情绪分析查询（简化版）')
  try {
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {},
        query: '请分析这句话的情绪："今天心情很好，工作顺利"。请给出情绪标签（愉悦/焦虑/平静/烦躁/低落）和情绪分数（0-100）',
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
    console.log('✓ 成功')
    console.log('答案:', response.data.answer)
    return true
  } catch (error) {
    console.log('✗ 失败:', error.response?.data?.message || error.message)
    if (error.response?.data) {
      console.log('详细错误:', JSON.stringify(error.response.data, null, 2))
    }
    return false
  }
}

async function testFormat3() {
  console.log('\n测试3: 情绪分析查询（带JSON格式要求）')
  try {
    const query = `分析这句话的情绪："今天心情很好，工作顺利"。

请以JSON格式返回：
{
  "emotionTag": "情绪标签（愉悦/焦虑/平静/烦躁/低落）",
  "emotionScore": 情绪分数（0-100）,
  "analysis": "分析说明"
}`
    
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {},
        query: query,
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
    console.log('✓ 成功')
    console.log('答案:', response.data.answer)
    return true
  } catch (error) {
    console.log('✗ 失败:', error.response?.data?.message || error.message)
    if (error.response?.data) {
      console.log('详细错误:', JSON.stringify(error.response.data, null, 2))
    }
    return false
  }
}

async function runTests() {
  await testFormat1()
  await testFormat2()
  await testFormat3()
}

runTests()

