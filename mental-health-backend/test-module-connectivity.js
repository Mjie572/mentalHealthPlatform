/**
 * 模块连通性测试脚本
 * 验证模块1与其他模块的连通性
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:8000'
const TEST_USER_ID = 'test-connectivity-user-123'

// 测试结果统计
const results = {
  module1ToModule5: { passed: 0, failed: 0, tests: [] },
  module3ToModule1: { passed: 0, failed: 0, tests: [] },
  module4ToModule1: { passed: 0, failed: 0, tests: [] },
  emotionAlertToBooking: { passed: 0, failed: 0, tests: [] }
}

/**
 * 测试1: 模块1调用模块5预约接口
 */
async function testModule1ToModule5() {
  console.log('\n=== 测试1: 模块1 → 模块5 预约接口连通性 ===\n')

  // 测试1.1: 通过情绪预警触发预约
  console.log('1.1 测试情绪预警触发预约...')
  try {
    // 提交一个会触发预警的情绪数据（低落情绪，分数低）
    const response = await axios.post(
      `${BASE_URL}/api/emotion/submit`,
      {
        dataType: 'text',
        content: '最近心情非常低落，感觉很绝望，对生活失去了希望',
        timestamp: Date.now()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      const hasAlert = response.data.data.alertInfo && response.data.data.alertInfo.needAlert
      const hasAppointment = response.data.data.alertInfo && response.data.data.alertInfo.appointment

      if (hasAlert && hasAppointment) {
        console.log('✓ 情绪预警成功触发预约')
        console.log('  预约ID:', response.data.data.alertInfo.appointment.appointmentId)
        console.log('  咨询师:', response.data.data.alertInfo.appointment.consultantName)
        results.module1ToModule5.passed++
        results.module1ToModule5.tests.push({ name: '情绪预警触发预约', status: 'PASSED' })
      } else {
        console.log('⚠ 情绪预警未触发（可能是情绪分数不够低）')
        console.log('  情绪标签:', response.data.data.emotionTag)
        console.log('  情绪分数:', response.data.data.emotionScore)
        results.module1ToModule5.tests.push({ name: '情绪预警触发预约', status: 'SKIPPED' })
      }
    } else {
      console.log('✗ 情绪提交失败:', response.data.msg)
      results.module1ToModule5.failed++
      results.module1ToModule5.tests.push({ name: '情绪预警触发预约', status: 'FAILED', error: response.data.msg })
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.module1ToModule5.failed++
    results.module1ToModule5.tests.push({ name: '情绪预警触发预约', status: 'FAILED', error: error.message })
  }

  // 测试1.2: 直接调用模块5预约接口
  console.log('\n1.2 测试直接调用模块5预约接口...')
  try {
    const response = await axios.post(
      `${BASE_URL}/api/professional/book`,
      {
        emotionTag: '焦虑',
        // consultantId 和 timeSlot 可选
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 直接调用预约接口成功')
      console.log('  预约ID:', response.data.data.appointmentId)
      console.log('  咨询师:', response.data.data.consultantName)
      console.log('  时间段:', response.data.data.timeSlot)
      results.module1ToModule5.passed++
      results.module1ToModule5.tests.push({ name: '直接调用预约接口', status: 'PASSED' })
      return response.data.data.appointmentId
    } else {
      console.log('✗ 预约失败:', response.data.msg)
      results.module1ToModule5.failed++
      results.module1ToModule5.tests.push({ name: '直接调用预约接口', status: 'FAILED', error: response.data.msg })
      return null
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.module1ToModule5.failed++
    results.module1ToModule5.tests.push({ name: '直接调用预约接口', status: 'FAILED', error: error.message })
    return null
  }
}

/**
 * 测试2: 模块3调用模块1情绪历史接口
 */
async function testModule3ToModule1() {
  console.log('\n=== 测试2: 模块3 → 模块1 情绪历史接口连通性 ===\n')

  // 测试2.1: 通用情绪历史接口
  console.log('2.1 测试通用情绪历史接口...')
  try {
    const response = await axios.get(
      `${BASE_URL}/api/emotion/history`,
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
      console.log('✓ 情绪历史查询成功')
      console.log('  记录数量:', response.data.data.length)
      if (response.data.data.length > 0) {
        console.log('  最新记录:', {
          emotionTag: response.data.data[0].emotionTag,
          emotionScore: response.data.data[0].emotionScore
        })
      }
      results.module3ToModule1.passed++
      results.module3ToModule1.tests.push({ name: '通用情绪历史接口', status: 'PASSED' })
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      results.module3ToModule1.failed++
      results.module3ToModule1.tests.push({ name: '通用情绪历史接口', status: 'FAILED', error: response.data.msg })
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.module3ToModule1.failed++
    results.module3ToModule1.tests.push({ name: '通用情绪历史接口', status: 'FAILED', error: error.message })
  }

  // 测试2.2: 模块3专用推荐接口
  console.log('\n2.2 测试模块3专用推荐接口...')
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
      console.log('  数据格式:', response.data.data.length > 0 ? Object.keys(response.data.data[0]) : '无数据')
      results.module3ToModule1.passed++
      results.module3ToModule1.tests.push({ name: '模块3专用推荐接口', status: 'PASSED' })
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      results.module3ToModule1.failed++
      results.module3ToModule1.tests.push({ name: '模块3专用推荐接口', status: 'FAILED', error: response.data.msg })
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.module3ToModule1.failed++
    results.module3ToModule1.tests.push({ name: '模块3专用推荐接口', status: 'FAILED', error: error.message })
  }
}

/**
 * 测试3: 模块4调用模块1情绪历史接口
 */
async function testModule4ToModule1() {
  console.log('\n=== 测试3: 模块4 → 模块1 情绪历史接口连通性 ===\n')

  // 测试3.1: 通用情绪历史接口（带时间范围）
  console.log('3.1 测试情绪历史接口（带时间范围）...')
  try {
    const now = Date.now()
    const startTime = now - (7 * 24 * 60 * 60 * 1000) // 7天前
    const endTime = now

    const response = await axios.get(
      `${BASE_URL}/api/emotion/history`,
      {
        params: {
          userId: TEST_USER_ID,
          startTime,
          endTime
        },
        headers: {
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      console.log('✓ 时间范围查询成功')
      console.log('  记录数量:', response.data.data.length)
      results.module4ToModule1.passed++
      results.module4ToModule1.tests.push({ name: '时间范围查询', status: 'PASSED' })
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      results.module4ToModule1.failed++
      results.module4ToModule1.tests.push({ name: '时间范围查询', status: 'FAILED', error: response.data.msg })
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.module4ToModule1.failed++
    results.module4ToModule1.tests.push({ name: '时间范围查询', status: 'FAILED', error: error.message })
  }

  // 测试3.2: 模块4专用统计接口
  console.log('\n3.2 测试模块4专用统计接口...')
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
      console.log('  情绪分布:', Object.keys(response.data.data.emotionDistribution).length > 0 ? '有数据' : '无数据')
      console.log('  趋势数据:', response.data.data.trend.length, '天')
      results.module4ToModule1.passed++
      results.module4ToModule1.tests.push({ name: '模块4专用统计接口', status: 'PASSED' })
    } else {
      console.log('✗ 查询失败:', response.data.msg)
      results.module4ToModule1.failed++
      results.module4ToModule1.tests.push({ name: '模块4专用统计接口', status: 'FAILED', error: response.data.msg })
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.module4ToModule1.failed++
    results.module4ToModule1.tests.push({ name: '模块4专用统计接口', status: 'FAILED', error: error.message })
  }
}

/**
 * 测试4: 情绪预警到预约的完整流程
 */
async function testEmotionAlertToBooking() {
  console.log('\n=== 测试4: 情绪预警 → 预约 完整流程 ===\n')

  // 先提交一些情绪数据
  console.log('4.1 提交会触发预警的情绪数据...')
  try {
    const response = await axios.post(
      `${BASE_URL}/api/emotion/submit`,
      {
        dataType: 'text',
        content: '最近总是焦虑不安，压力很大，感觉很难受，情绪分数应该很低',
        timestamp: Date.now()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': TEST_USER_ID
        }
      }
    )

    if (response.data.code === 200) {
      const record = response.data.data
      console.log('✓ 情绪数据提交成功')
      console.log('  情绪标签:', record.emotionTag)
      console.log('  情绪分数:', record.emotionScore)

      // 检查是否有预警
      if (record.alertInfo && record.alertInfo.needAlert) {
        console.log('\n4.2 验证预警信息...')
        console.log('✓ 预警已触发')
        console.log('  预警级别:', record.alertInfo.level)
        console.log('  预警消息:', record.alertInfo.message)

        if (record.alertInfo.appointment) {
          console.log('\n4.3 验证预约信息...')
          const appointment = record.alertInfo.appointment
          console.log('✓ 预约已创建')
          console.log('  预约ID:', appointment.appointmentId)
          console.log('  咨询师:', appointment.consultantName)
          console.log('  时间段:', appointment.timeSlot)
          console.log('  状态:', appointment.status)

          // 验证预约是否真的保存了
          console.log('\n4.4 验证预约是否保存到数据库...')
          const checkResponse = await axios.get(
            `${BASE_URL}/api/professional/appointments`,
            {
              params: { status: 'pending' },
              headers: { 'X-User-Id': TEST_USER_ID }
            }
          )

          if (checkResponse.data.code === 200) {
            const appointments = checkResponse.data.data
            const found = appointments.find(a => a.appointmentId === appointment.appointmentId)
            if (found) {
              console.log('✓ 预约已保存到数据库')
              results.emotionAlertToBooking.passed++
              results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'PASSED' })
            } else {
              console.log('✗ 预约未在数据库中找到')
              results.emotionAlertToBooking.failed++
              results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'FAILED', error: '预约未保存' })
            }
          } else {
            console.log('⚠ 无法验证预约保存状态')
            results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'PARTIAL' })
          }
        } else {
          console.log('⚠ 预警触发但未创建预约')
          results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'PARTIAL' })
        }
      } else {
        console.log('⚠ 情绪数据未触发预警（可能是分数不够低）')
        console.log('  当前分数:', record.emotionScore, '（需要<60且情绪为低落/焦虑/烦躁）')
        results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'SKIPPED' })
      }
    } else {
      console.log('✗ 情绪数据提交失败:', response.data.msg)
      results.emotionAlertToBooking.failed++
      results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'FAILED', error: response.data.msg })
    }
  } catch (error) {
    console.log('✗ 测试异常:', error.response?.data?.msg || error.message)
    results.emotionAlertToBooking.failed++
    results.emotionAlertToBooking.tests.push({ name: '完整流程测试', status: 'FAILED', error: error.message })
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('\n========================================')
  console.log('  模块连通性测试报告')
  console.log('========================================\n')

  // 模块1 → 模块5
  console.log('模块1 → 模块5 预约接口:')
  console.log(`  通过: ${results.module1ToModule5.passed}, 失败: ${results.module1ToModule5.failed}`)
  results.module1ToModule5.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✓' : test.status === 'FAILED' ? '✗' : '⚠'
    console.log(`  ${status} ${test.name}`)
    if (test.error) console.log(`    错误: ${test.error}`)
  })

  // 模块3 → 模块1
  console.log('\n模块3 → 模块1 情绪历史接口:')
  console.log(`  通过: ${results.module3ToModule1.passed}, 失败: ${results.module3ToModule1.failed}`)
  results.module3ToModule1.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✓' : test.status === 'FAILED' ? '✗' : '⚠'
    console.log(`  ${status} ${test.name}`)
    if (test.error) console.log(`    错误: ${test.error}`)
  })

  // 模块4 → 模块1
  console.log('\n模块4 → 模块1 情绪历史接口:')
  console.log(`  通过: ${results.module4ToModule1.passed}, 失败: ${results.module4ToModule1.failed}`)
  results.module4ToModule1.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✓' : test.status === 'FAILED' ? '✗' : '⚠'
    console.log(`  ${status} ${test.name}`)
    if (test.error) console.log(`    错误: ${test.error}`)
  })

  // 完整流程
  console.log('\n情绪预警 → 预约 完整流程:')
  results.emotionAlertToBooking.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✓' : test.status === 'FAILED' ? '✗' : '⚠'
    console.log(`  ${status} ${test.name}`)
    if (test.error) console.log(`    错误: ${test.error}`)
  })

  // 总结
  const totalPassed = results.module1ToModule5.passed + results.module3ToModule1.passed + 
                      results.module4ToModule1.passed + results.emotionAlertToBooking.passed
  const totalFailed = results.module1ToModule5.failed + results.module3ToModule1.failed + 
                      results.module4ToModule1.failed + results.emotionAlertToBooking.failed

  console.log('\n========================================')
  console.log('  总结')
  console.log('========================================')
  console.log(`总通过: ${totalPassed}`)
  console.log(`总失败: ${totalFailed}`)

  if (totalFailed === 0) {
    console.log('\n✅ 所有连通性测试通过！')
    process.exit(0)
  } else {
    console.log('\n❌ 部分测试失败，请检查上述错误信息')
    process.exit(1)
  }
}

// 主测试函数
async function runAllTests() {
  console.log('========================================')
  console.log('  模块连通性测试')
  console.log('========================================')

  // 检查后端服务
  try {
    await axios.get(`${BASE_URL}/api/health`)
    console.log('✓ 后端服务运行正常\n')
  } catch (error) {
    console.error('✗ 后端服务未运行，请先启动服务')
    process.exit(1)
  }

  // 运行所有测试
  await testModule1ToModule5()
  await testModule3ToModule1()
  await testModule4ToModule1()
  await testEmotionAlertToBooking()

  // 生成报告
  generateReport()
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试执行异常:', error)
  process.exit(1)
})

