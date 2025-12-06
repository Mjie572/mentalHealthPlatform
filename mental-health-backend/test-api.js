/**
 * 积极赋能模块接口测试脚本
 * 用于测试 /positive/content 接口
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

/**
 * 测试获取鼓励语句接口
 */
const testGetEncourageText = async () => {
  console.log('开始测试 POST /positive/content 接口...\n');

  const testCases = [
    {
      name: '正常请求 - 低落情绪',
      data: { userMood: '今天心情有点低落' }
    },
    {
      name: '正常请求 - 焦虑情绪',
      data: { userMood: '最近工作压力很大，感觉很焦虑' }
    },
    {
      name: '正常请求 - 疲惫状态',
      data: { userMood: '感觉很累，没有动力' }
    },
    {
      name: '边界测试 - 空字符串',
      data: { userMood: '' }
    },
    {
      name: '边界测试 - 缺失字段',
      data: {}
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`测试: ${testCase.name}`);
      console.log(`请求数据:`, JSON.stringify(testCase.data, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/positive/content`,
        testCase.data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 35000
        }
      );

      console.log(`✅ 成功响应:`);
      console.log(`   状态码: ${response.status}`);
      console.log(`   响应数据:`, JSON.stringify(response.data, null, 2));
      console.log('');

    } catch (error) {
      if (error.response) {
        console.log(`❌ 失败响应:`);
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   响应数据:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log(`❌ 请求失败: 未收到响应`);
        console.log(`   错误信息: ${error.message}`);
      } else {
        console.log(`❌ 错误: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('测试完成！');
};

// 运行测试
testGetEncourageText().catch(console.error);

