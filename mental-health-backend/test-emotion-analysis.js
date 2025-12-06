/**
 * 情绪分析功能测试脚本
 * 测试Dify API集成和情绪等级分析
 */

const axios = require('axios')
const emotionAnalyzeService = require('./services/emotionAnalyzeService')

const DIFY_BASE_URL = 'http://localhost:9001/v1'
const DIFY_API_KEY = 'app-E60XsJdpfPZGWvb2f4rkhmTU'

// 测试用例
const testCases = [
  {
    name: '正面情绪测试',
    content: '今天心情很好，工作顺利，和同事相处愉快',
    dataType: 'text',
    expectedTag: '愉悦'
  },
  {
    name: '负面情绪测试',
    content: '最近总是焦虑不安，压力很大，晚上睡不好觉',
    dataType: 'text',
    expectedTag: '焦虑'
  },
  {
    name: '低落情绪测试',
    content: '感觉很失落，对什么都提不起兴趣，心情很低落',
    dataType: 'text',
    expectedTag: '低落'
  },
  {
    name: '平静情绪测试',
    content: '今天一切正常，心情平静，没有什么特别的事情',
    dataType: 'text',
    expectedTag: '平静'
  }
]

async function testDifyConnection() {
  console.log('=== 测试1: Dify服务连接 ===\n')
  
  try {
    const response = await axios.post(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {},
        query: '你好，请回复"连接成功"',
        response_mode: 'blocking',
        user: 'test-user',
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

    console.log('✓ Dify服务连接成功')
    console.log('  响应状态:', response.status)
    console.log('  答案:', response.data.answer?.substring(0, 100))
    return true
  } catch (error) {
    console.error('✗ Dify服务连接失败')
    if (error.response) {
      console.error('  状态码:', error.response.status)
      console.error('  错误信息:', error.response.data?.message || error.response.statusText)
    } else if (error.request) {
      console.error('  请求已发送但未收到响应')
      console.error('  请确保Dify服务运行在 http://localhost:9001/v1')
    } else {
      console.error('  错误:', error.message)
    }
    return false
  }
}

async function testEmotionAnalysis() {
  console.log('\n=== 测试2: 情绪分析功能 ===\n')
  
  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    console.log(`测试: ${testCase.name}`)
    console.log(`内容: ${testCase.content}`)
    
    try {
      const result = await emotionAnalyzeService.analyzeEmotion(
        testCase.content,
        testCase.dataType
      )

      if (result.success) {
        console.log('✓ 分析成功')
        console.log(`  情绪标签: ${result.emotionTag}`)
        console.log(`  情绪分数: ${result.emotionScore}`)
        console.log(`  严重程度: ${result.severity}`)
        console.log(`  分析说明: ${result.analysis.substring(0, 100)}...`)
        
        // 验证结果
        const isValidTag = ['愉悦', '焦虑', '平静', '烦躁', '低落'].includes(result.emotionTag)
        const isValidScore = result.emotionScore >= 0 && result.emotionScore <= 100
        
        if (isValidTag && isValidScore) {
          console.log('  ✓ 结果验证通过')
          passed++
        } else {
          console.log('  ✗ 结果验证失败')
          if (!isValidTag) console.log('    情绪标签无效')
          if (!isValidScore) console.log('    情绪分数超出范围')
          failed++
        }
      } else {
        console.log('✗ 分析失败')
        console.log(`  错误: ${result.error}`)
        failed++
      }
    } catch (error) {
      console.log('✗ 测试异常')
      console.log(`  错误: ${error.message}`)
      failed++
    }
    
    console.log('')
  }

  console.log('=== 测试总结 ===')
  console.log(`通过: ${passed}/${testCases.length}`)
  console.log(`失败: ${failed}/${testCases.length}`)
  
  return { passed, failed, total: testCases.length }
}

async function testEmotionLevel() {
  console.log('\n=== 测试3: 情绪等级判断 ===\n')
  
  const testContent = '最近总是焦虑不安，压力很大，感觉很难受'
  
  try {
    const result = await emotionAnalyzeService.analyzeEmotion(testContent, 'text')
    
    if (result.success) {
      console.log('情绪分析结果:')
      console.log(`  标签: ${result.emotionTag}`)
      console.log(`  分数: ${result.emotionScore}`)
      console.log(`  严重程度: ${result.severity}`)
      
      // 判断情绪等级
      let level = '正常'
      if (result.severity === 'high' || result.emotionScore < 50) {
        level = '重度'
      } else if (result.emotionScore < 70) {
        level = '中度'
      } else {
        level = '轻度'
      }
      
      console.log(`  情绪等级: ${level}`)
      
      // 验证等级判断逻辑
      const isCorrect = (
        (level === '重度' && (result.severity === 'high' || result.emotionScore < 50)) ||
        (level === '中度' && result.emotionScore >= 50 && result.emotionScore < 70) ||
        (level === '轻度' && result.emotionScore >= 70)
      )
      
      if (isCorrect) {
        console.log('✓ 情绪等级判断正确')
        return true
      } else {
        console.log('✗ 情绪等级判断异常')
        return false
      }
    } else {
      console.log('✗ 分析失败:', result.error)
      return false
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.message)
    return false
  }
}

// 主测试函数
async function runAllTests() {
  console.log('========================================')
  console.log('  情绪分析功能完整测试')
  console.log('========================================\n')
  
  // 测试1: Dify连接
  const connectionOk = await testDifyConnection()
  
  if (!connectionOk) {
    console.log('\n⚠️  Dify服务未运行，无法进行完整测试')
    console.log('请启动Dify服务后重新运行测试')
    process.exit(1)
  }
  
  // 测试2: 情绪分析
  const analysisResult = await testEmotionAnalysis()
  
  // 测试3: 情绪等级
  const levelOk = await testEmotionLevel()
  
  // 最终总结
  console.log('\n========================================')
  console.log('  最终测试结果')
  console.log('========================================')
  console.log(`Dify连接: ${connectionOk ? '✓ 通过' : '✗ 失败'}`)
  console.log(`情绪分析: ${analysisResult.passed}/${analysisResult.total} 通过`)
  console.log(`情绪等级: ${levelOk ? '✓ 通过' : '✗ 失败'}`)
  
  if (connectionOk && analysisResult.passed === analysisResult.total && levelOk) {
    console.log('\n✅ 所有测试通过！')
    process.exit(0)
  } else {
    console.log('\n❌ 部分测试失败')
    process.exit(1)
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试执行异常:', error)
  process.exit(1)
})

