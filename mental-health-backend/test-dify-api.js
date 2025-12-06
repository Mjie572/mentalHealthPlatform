/**
 * 测试Dify API连接
 * 用于验证正式版Dify API是否正常工作
 * 
 * 使用方法：
 * cd mental-health-backend
 * node test-dify-api.js
 */

const axios = require('axios')

const DIFY_BASE_URL = 'http://localhost:9001/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU'

async function testDifyAPI() {
  console.log('=== 测试Dify API连接 ===\n')
  
  // 测试1: 健康检查（如果Dify提供）
  console.log('1. 测试API连接...')
  try {
    const testQuery = '你好，请简单回复"连接成功"'
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {},
        query: testQuery,
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

    console.log('✓ API连接成功')
    console.log('  响应数据:', JSON.stringify(response.data, null, 2))
    
    if (response.data.answer) {
      console.log(`  答案: ${response.data.answer}`)
    }
    
    return true
  } catch (error) {
    console.error('✗ API连接失败')
    if (error.response) {
      console.error(`  状态码: ${error.response.status}`)
      console.error(`  错误信息: ${JSON.stringify(error.response.data, null, 2)}`)
    } else if (error.request) {
      console.error('  请求已发送但未收到响应')
      console.error('  可能原因:')
      console.error('    - Dify服务未启动')
      console.error('    - URL配置错误 (当前: http://localhost/v1)')
      console.error('    - 网络连接问题')
    } else {
      console.error(`  错误: ${error.message}`)
    }
    return false
  }
}

async function testEmotionAnalysis() {
  console.log('\n2. 测试情绪分析功能...')
  try {
    const emotionQuery = '请分析以下文本数据的情绪状态，并给出情绪标签（愉悦/焦虑/平静/烦躁/低落）和情绪分数（0-100）：今天心情很好，工作顺利'
    
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {
          content: '今天心情很好，工作顺利',
          data_type: 'text'
        },
        query: emotionQuery,
        response_mode: 'blocking',
        user: 'emotion-analyzer',
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

    console.log('✓ 情绪分析成功')
    console.log('  完整响应:', JSON.stringify(response.data, null, 2))
    
    if (response.data.answer) {
      console.log(`  分析结果: ${response.data.answer}`)
    }
    
    return true
  } catch (error) {
    console.error('✗ 情绪分析失败')
    if (error.response) {
      console.error(`  状态码: ${error.response.status}`)
      console.error(`  错误信息: ${JSON.stringify(error.response.data, null, 2)}`)
    } else {
      console.error(`  错误: ${error.message}`)
    }
    return false
  }
}

// 运行测试
(async () => {
  const test1 = await testDifyAPI()
  const test2 = await testEmotionAnalysis()
  
  console.log('\n=== 测试总结 ===')
  console.log(`API连接: ${test1 ? '✓ 通过' : '✗ 失败'}`)
  console.log(`情绪分析: ${test2 ? '✓ 通过' : '✗ 失败'}`)
  
  if (test1 && test2) {
    console.log('\n✅ 所有测试通过，Dify API配置正确！')
    process.exit(0)
  } else {
    console.log('\n❌ 部分测试失败，请检查Dify服务配置')
    console.log('\n提示:')
    console.log('  1. 确保Dify服务已启动并运行在 http://localhost/v1')
    console.log('  2. 检查API密钥是否正确: app-E60XsJdpfPZGWvb2f4rkhmTU')
    console.log('  3. 检查网络连接和防火墙设置')
    process.exit(1)
  }
})()

