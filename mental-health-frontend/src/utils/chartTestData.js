// 图表功能测试数据
// 用于测试情绪趋势图、压力来源图和干预效果评估图的各种情况

export const chartTestData = {
  // 场景1: 正常波动的数据
  normalFluctuation: {
    emotionTrend: {
      dates: ['12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07'],
      positive: [65, 70, 60, 75, 80, 78, 82],
      neutral: [25, 20, 25, 15, 12, 15, 10],
      negative: [10, 10, 15, 10, 8, 7, 8]
    },
    stressSources: [
      { name: '工作压力', value: 45 },
      { name: '人际关系', value: 25 },
      { name: '生活琐事', value: 15 },
      { name: '睡眠不足', value: 10 },
      { name: '其他', value: 5 }
    ],
    interventionEffect: {
      categories: ['冥想', '运动', '阅读', '游戏', '社交'],
      effectiveness: [85, 78, 72, 65, 80]
    }
  },
  
  // 场景2: 情绪持续上升
  continuousImprovement: {
    emotionTrend: {
      dates: ['12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07'],
      positive: [40, 50, 55, 65, 70, 75, 85],
      neutral: [30, 25, 25, 20, 20, 15, 10],
      negative: [30, 25, 20, 15, 10, 10, 5]
    },
    stressSources: [
      { name: '工作压力', value: 30 },
      { name: '人际关系', value: 20 },
      { name: '生活琐事', value: 15 },
      { name: '睡眠不足', value: 25 },
      { name: '其他', value: 10 }
    ],
    interventionEffect: {
      categories: ['冥想', '运动', '阅读', '游戏', '社交'],
      effectiveness: [75, 80, 85, 90, 95]
    }
  },
  
  // 场景3: 情绪持续下降
  continuousDecline: {
    emotionTrend: {
      dates: ['12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07'],
      positive: [80, 75, 70, 65, 60, 50, 40],
      neutral: [15, 15, 20, 20, 25, 25, 30],
      negative: [5, 10, 10, 15, 15, 25, 30]
    },
    stressSources: [
      { name: '工作压力', value: 60 },
      { name: '人际关系', value: 20 },
      { name: '生活琐事', value: 10 },
      { name: '睡眠不足', value: 8 },
      { name: '其他', value: 2 }
    ],
    interventionEffect: {
      categories: ['冥想', '运动', '阅读', '游戏', '社交'],
      effectiveness: [60, 55, 50, 45, 40]
    }
  },
  
  // 场景4: 极端情绪数据
  extremeEmotions: {
    emotionTrend: {
      dates: ['12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07'],
      positive: [95, 10, 90, 5, 85, 15, 80],
      neutral: [3, 5, 5, 10, 5, 10, 5],
      negative: [2, 85, 5, 85, 10, 75, 15]
    },
    stressSources: [
      { name: '工作压力', value: 80 },
      { name: '人际关系', value: 10 },
      { name: '生活琐事', value: 5 },
      { name: '睡眠不足', value: 3 },
      { name: '其他', value: 2 }
    ],
    interventionEffect: {
      categories: ['冥想', '运动', '阅读', '游戏', '社交'],
      effectiveness: [95, 5, 90, 10, 85]
    }
  },
  
  // 场景5: 单一压力来源
  singleStressSource: {
    emotionTrend: {
      dates: ['12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07'],
      positive: [40, 45, 50, 55, 60, 65, 70],
      neutral: [30, 25, 25, 20, 20, 15, 15],
      negative: [30, 30, 25, 25, 20, 20, 15]
    },
    stressSources: [
      { name: '工作压力', value: 90 },
      { name: '人际关系', value: 5 },
      { name: '生活琐事', value: 2 },
      { name: '睡眠不足', value: 2 },
      { name: '其他', value: 1 }
    ],
    interventionEffect: {
      categories: ['冥想', '运动', '阅读', '游戏', '社交'],
      effectiveness: [70, 75, 80, 60, 65]
    }
  },
  
  // 场景6: 良好的干预效果
  goodInterventionEffect: {
    emotionTrend: {
      dates: ['12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07'],
      positive: [60, 65, 70, 75, 80, 85, 90],
      neutral: [25, 20, 20, 15, 15, 10, 10],
      negative: [15, 15, 10, 10, 5, 5, 0]
    },
    stressSources: [
      { name: '工作压力', value: 20 },
      { name: '人际关系', value: 15 },
      { name: '生活琐事', value: 10 },
      { name: '睡眠不足', value: 5 },
      { name: '其他', value: 50 }
    ],
    interventionEffect: {
      categories: ['冥想', '运动', '阅读', '游戏', '社交'],
      effectiveness: [95, 90, 85, 80, 75]
    }
  }
}

// 工具函数：获取随机测试数据
export const getRandomTestData = () => {
  const scenarios = Object.keys(chartTestData)
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
  return {
    scenario: randomScenario,
    ...chartTestData[randomScenario]
  }
}

// 工具函数：生成指定场景的完整报告数据
export const generateReportData = (scenarioKey) => {
  const scenarioData = chartTestData[scenarioKey] || chartTestData.normalFluctuation
  
  return {
    emotionOverview: {
      mainEmotion: '平静',
      change: 5
    },
    stressOverview: {
      level: '中等',
      change: -10
    },
    interventionEffectiveness: {
      evaluation: '良好',
      score: 78
    },
    taskCompletion: {
      rate: 65,
      completed: 13,
      total: 20
    },
    ...scenarioData,
    detailedAnalysis: {
      findings: [
        '情绪数据显示出典型的波动模式',
        '压力主要来自工作和人际关系',
        '冥想和运动干预效果显著',
        '建议保持良好的作息习惯'
      ],
      suggestions: [
        '继续坚持每日冥想10分钟的习惯',
        '每周增加2-3次户外运动，每次30分钟',
        '尝试减少晚间使用电子设备的时间',
        '可以考虑增加社交活动，多与朋友交流'
      ]
    }
  }
}