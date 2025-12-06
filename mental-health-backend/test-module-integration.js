/**
 * 模块集成测试脚本
 * 测试模块5预约接口和模块3/模块4情绪历史接口
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:8000'
const TEST_USER_ID = 'test-user-integration-123'

async function testModule5Booking() {
  console.log('=== 测试模块5：专业咨询预约接口 ===\n')

  // 测试1: 创建预约
  console.log('1. 测试创建预约...')
  try {
    const response = await axios.post(
      `${BASE_URL}/api/professional/book`,
      {
        emotionTag: '焦虑',
        // consultantId 和 timeSlot 可选，测试自动匹配和推荐
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 预约创建成功')
      console.log('  预约ID:', response.data.data.appointmentId)
      console.log('  咨询师:', response.data.data.consultantName)
      console.log('  时间段:', response.data.data.timeSlot)
      console.log('  状态:', response.data.data.status)
      return response.data.data.appointmentId
    } else {
      console.log('✗ 预约创建失败:', response.data.msg)
      return null
    }
  } catch (error) {
    console.log('✗ 预约创建异常:', error.response?.data?.msg || error.message)
    return null
  }
}

async function testModule5Query(appointmentId) {
  console.log('\n2. 测试查询预约列表...')
  try {
    const response = await axios.get(
      `${BASE_URL}/api/professional/appointments`,
      {
        params: { status: 'pending' },
        headers: {
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 查询成功')
      console.log('  预约数量:', response.data.data.length)
      if (response.data.data.length > 0) {
        console.log('  最新预约:', response.data.data[0].appointmentId)
      }
      return true
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      return false
    }
  } catch (error) {
    console.log('✗ 查询异常:', error.response?.data?.msg || error.message)
    return false
  }
}

async function testModule3EmotionHistory() {
  console.log('\n=== 测试模块3：情绪历史接口（内容推荐） ===\n')

  try {
    const response = await axios.get(
      `${BASE_URL}/api/emotion/history`,
      {
        params: {
          userId: TEST_USER_ID,
          // limit 通过专用接口控制
        },
        headers: {
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 情绪历史查询成功')
      console.log('  记录数量:', response.data.data.length)
      if (response.data.data.length > 0) {
        console.log('  最新记录:', {
          emotionTag: response.data.data[0].emotionTag,
          emotionScore: response.data.data[0].emotionScore,
          timestamp: new Date(response.data.data[0].timestamp).toLocaleString()
        })
      }
      return true
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      return false
    }
  } catch (error) {
    console.log('✗ 查询异常:', error.response?.data?.msg || error.message)
    return false
  }
}

async function testModule3RecommendationAPI() {
  console.log('\n=== 测试模块3：内容推荐专用接口 ===\n')

  try {
    const response = await axios.get(
      `${BASE_URL}/api/module/emotion-for-recommendation`,
      {
        params: {
          userId: TEST_USER_ID,
          limit: 5
        },
        headers: {
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 推荐数据查询成功')
      console.log('  记录数量:', response.data.data.length)
      if (response.data.data.length > 0) {
        console.log('  数据示例:', response.data.data[0])
      }
      return true
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      return false
    }
  } catch (error) {
    console.log('✗ 查询异常:', error.response?.data?.msg || error.message)
    return false
  }
}

async function testModule4ReportAPI() {
  console.log('\n=== 测试模块4：报告生成专用接口 ===\n')

  try {
    const response = await axios.get(
      `${BASE_URL}/api/module/emotion-stats-for-report`,
      {
        params: {
          userId: TEST_USER_ID
          // startTime 和 endTime 可选
        },
        headers: {
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 统计数据查询成功')
      console.log('  总记录数:', response.data.data.totalRecords)
      console.log('  平均分数:', response.data.data.averageScore)
      console.log('  情绪分布:', response.data.data.emotionDistribution)
      console.log('  趋势数据:', response.data.data.trend.length, '天')
      return true
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      return false
    }
  } catch (error) {
    console.log('✗ 查询异常:', error.response?.data?.msg || error.message)
    return false
  }
}

// 主测试函数
async function runAllTests() {
  console.log('========================================')
  console.log('  模块集成功能测试')
  console.log('========================================\n')

  // 测试模块5
  const appointmentId = await testModule5Booking()
  await testModule5Query(appointmentId)

  // 测试模块3
  await testModule3EmotionHistory()
  await testModule3RecommendationAPI()

  // 测试模块4
  await testModule4ReportAPI()

  console.log('\n========================================')
  console.log('  测试完成')
  console.log('========================================')
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试执行异常:', error)
  process.exit(1)
})

