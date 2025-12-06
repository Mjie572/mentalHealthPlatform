/**
 * 心理健康智能平台 - 后端API（Node.js + Express）
 * 多维解压服务模块接口
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

// ========== 中间件配置 ==========

// CORS配置
app.use(cors({
  origin: '*', // 生产环境应限制具体域名
  credentials: true,
  methods: ['*'],
  allowedHeaders: ['*']
}));

// 解析JSON请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== 工具函数 ==========

/**
 * 生成90题心理健康自测量表（基于 PsychologyTest.net 格式）
 */
function generateMentalHealthQuestions() {
  const questionsList = [
    "头痛", "神经过敏，心中不踏实", "头脑中有不必要的想法或字句盘旋", "头昏或昏倒",
    "对异性的兴趣减退", "对旁人责备求全", "感到别人能控制您的思想", "责怪别人制造麻烦",
    "忘记性大", "担心自己的衣饰整齐及仪态的端正", "容易烦恼和激动", "胸痛",
    "害怕空旷的场所或街道", "感到自己的精力下降，活动减慢", "想结束自己的生命",
    "听到旁人听不到的声音", "发抖", "感到大多数人都不可信任", "胃口不好", "容易哭泣",
    "同异性相处时感到害羞不自在", "感到受骗，中了圈套或有人想抓住您", "无缘无故地突然感到害怕",
    "自己不能控制地大发脾气", "怕单独出门", "经常责怪自己", "腰痛", "感到难以完成任务",
    "感到孤独", "感到苦闷", "过分担忧", "对事物不感兴趣", "感到害怕", "您的感情容易受到伤害",
    "旁人能知道您的私下想法", "感到别人不理解您、不同情您", "感到人们对您不友好，不喜欢您",
    "做事必须做得很慢以保证做得正确", "心跳得很厉害", "恶心或胃部不舒服", "感到比不上他人",
    "肌肉酸痛", "感到有人在监视您、谈论您", "难以入睡", "做事必须反复检查", "难以做出决定",
    "怕乘电车、公共汽车、地铁或火车", "呼吸有困难", "一阵阵发冷或发热",
    "因为感到害怕而避开某些东西、场合或活动", "脑子变空了", "身体发麻或刺痛", "喉咙有梗塞感",
    "感到前途没有希望", "不能集中注意力", "感到身体的某一部分软弱无力", "感到紧张或容易紧张",
    "感到手或脚发重", "想到死亡的事", "吃得太多", "当别人看着您或谈论您时感到不自在",
    "有一些不属于您自己的想法", "有想打人或伤害他人的冲动", "醒得太早", "必须反复洗手、点数",
    "睡得不稳不深", "有想摔坏或破坏东西的冲动", "有一些别人没有的想法或念头", "感到对别人神经过敏",
    "在商店或电影院等人多的地方感到不自在", "感到任何事情都很困难", "一阵阵恐惧或惊恐",
    "感到在公共场合吃东西很不舒服", "经常与人争论", "单独一人时神经很紧张",
    "别人对您的成绩没有做出恰当的评价", "即使和别人在一起也感到孤单", "感到坐立不安心神不定",
    "感到自己没有什么价值", "感到熟悉的东西变成陌生或不像是真的", "大叫或摔东西",
    "害怕会在公共场合昏倒", "感到别人想占您的便宜", "为一些有关性的想法而很苦恼",
    "您认为应该因为自己的过错而受到惩罚", "感到要很快把事情做完", "感到自己的身体有严重问题",
    "从未感到和其他人很亲近", "感到自己有罪", "感到自己的脑子有毛病"
  ];
  
  const standardOptions = [
    { value: 1, label: "完全没有" },
    { value: 2, label: "有一点" },
    { value: 3, label: "中等程度" },
    { value: 4, label: "相当多" },
    { value: 5, label: "非常多" }
  ];
  
  const questions = [];
  questionsList.forEach((title, index) => {
    questions.push({
      id: `mh_${index + 1}`,
      title: title,
      options: JSON.parse(JSON.stringify(standardOptions)) // 深拷贝
    });
  });
  
  return questions;
}

/**
 * 生成Demo版响应格式
 * 严格遵循Demo版要求：包含code/msg/data，msg标注「Demo版模拟数据」
 */
function getDemoResponse(data = null, msg = "Demo版模拟数据") {
  return {
    code: 200,
    msg: msg,
    data: data
  };
}

/**
 * 生成错误响应格式
 * code: 1001为Demo版专用错误码
 */
function getErrorResponse(code = 1001, msg = "Demo版错误", data = null) {
  return {
    code: code,
    msg: msg,
    data: data
  };
}

/**
 * 计算答题结果
 */
function calculateQuestionResult(questionId, answers) {
  const questionBank = questionBanks[questionId];
  if (!questionBank) {
    return {
      score: 0,
      totalScore: 0,
      analysis: "无法计算结果",
      suggestions: []
    };
  }
  
  // 根据题目类型计算总分（90题量表使用5分制，其他使用4分制）
  const maxScorePerQuestion = questionId === 3 ? 5 : 4;
  const totalScore = questionBank.questions.length * maxScorePerQuestion;
  const userScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const percentage = (userScore / totalScore) * 100;
  
  // 90题心理健康自测量表的评估标准（基于SCL-90量表）
  if (questionId === 3) {
    // SCL-90量表：总分越高，症状越明显
    // 正常范围：总分 < 160 (90题 * 1.78)
    // 轻度：160-200，中度：200-250，重度：>250
    let analysis, suggestions;
    
    if (userScore < 160) {
      analysis = "您的心理健康状况良好。各项指标都在正常范围内，请继续保持健康的生活方式。";
      suggestions = [
        "继续保持良好的生活习惯和作息规律",
        "定期进行放松活动，如运动、冥想等",
        "保持积极的心态和良好的人际关系",
        "定期进行心理健康自测，关注自身状态"
      ];
    } else if (userScore < 200) {
      analysis = "您存在一些轻微的心理健康问题。建议适当关注并采取一些自我调节措施。";
      suggestions = [
        "尝试深呼吸、冥想等放松技巧",
        "增加运动时间，保持规律作息",
        "寻求朋友或家人的支持和理解",
        "考虑使用平台的小游戏和放松功能",
        "如果症状持续，建议咨询心理专家"
      ];
    } else if (userScore < 250) {
      analysis = "您的心理健康状况需要关注。建议及时采取干预措施，必要时寻求专业帮助。";
      suggestions = [
        "建议咨询专业的心理专家或心理咨询师",
        "学习压力管理和情绪调节技巧",
        "调整工作或学习节奏，适当休息",
        "保持规律的作息时间和健康饮食",
        "使用平台的心理顾问功能获取专业建议",
        "考虑参加心理健康相关的活动或课程"
      ];
    } else {
      analysis = "您的心理健康状况需要高度重视。强烈建议尽快寻求专业的心理健康服务。";
      suggestions = [
        "立即咨询专业的心理医生或精神科医生",
        "寻求家人和朋友的支持和理解",
        "考虑参加专业的心理健康治疗",
        "使用平台的所有心理健康功能辅助恢复",
        "保持规律的作息，避免过度压力",
        "如有紧急情况，请拨打心理健康热线"
      ];
    }
    
    return {
      score: userScore,
      totalScore: totalScore,
      percentage: Math.round(percentage * 10) / 10,
      analysis: analysis,
      suggestions: suggestions
    };
  } else {
    // 其他量表的评估标准
    let analysis, suggestions;
    
    if (percentage < 30) {
      analysis = "你的压力水平较低，情绪状态良好。继续保持健康的生活方式。";
      suggestions = [
        "继续保持良好的生活习惯",
        "定期进行放松活动",
        "保持积极的心态"
      ];
    } else if (percentage < 60) {
      analysis = "你存在一定的压力，需要适当调整。建议采取一些减压措施。";
      suggestions = [
        "尝试深呼吸或冥想",
        "增加运动时间",
        "保证充足的睡眠",
        "寻求朋友或家人的支持"
      ];
    } else {
      analysis = "你的压力水平较高，建议及时寻求专业帮助。";
      suggestions = [
        "考虑咨询心理专家",
        "学习压力管理技巧",
        "调整工作或学习节奏",
        "保持规律的作息时间"
      ];
    }
    
    return {
      score: userScore,
      totalScore: totalScore,
      percentage: Math.round(percentage * 10) / 10,
      analysis: analysis,
      suggestions: suggestions
    };
  }
}

// ========== 模拟数据存储（Demo版） ==========

// 游戏记录
const gameRecords = [];

// 题库数据
const questionBanks = {
  1: {
    id: 1,
    title: "压力评估测试",
    description: "评估你当前的压力水平",
    questionCount: 5,
    duration: 5,
    questions: [
      {
        id: "q1_1",
        title: "最近一周，你感到压力的频率如何？",
        options: [
          { value: 1, label: "几乎没有" },
          { value: 2, label: "偶尔" },
          { value: 3, label: "经常" },
          { value: 4, label: "几乎总是" }
        ]
      },
      {
        id: "q1_2",
        title: "工作或学习任务是否让你感到焦虑？",
        options: [
          { value: 1, label: "完全没有" },
          { value: 2, label: "有一点" },
          { value: 3, label: "比较明显" },
          { value: 4, label: "非常明显" }
        ]
      },
      {
        id: "q1_3",
        title: "你是否因为压力而失眠？",
        options: [
          { value: 1, label: "从不" },
          { value: 2, label: "很少" },
          { value: 3, label: "有时" },
          { value: 4, label: "经常" }
        ]
      },
      {
        id: "q1_4",
        title: "压力是否影响了你的日常生活？",
        options: [
          { value: 1, label: "没有影响" },
          { value: 2, label: "轻微影响" },
          { value: 3, label: "明显影响" },
          { value: 4, label: "严重影响" }
        ]
      },
      {
        id: "q1_5",
        title: "你是否有有效的压力缓解方法？",
        options: [
          { value: 1, label: "有很多方法" },
          { value: 2, label: "有一些方法" },
          { value: 3, label: "方法很少" },
          { value: 4, label: "没有方法" }
        ]
      }
    ]
  },
  2: {
    id: 2,
    title: "焦虑自评量表",
    description: "了解你的焦虑程度",
    questionCount: 7,
    duration: 7,
    questions: [
      {
        id: "q2_1",
        title: "我感到紧张或焦虑",
        options: [
          { value: 1, label: "没有或很少" },
          { value: 2, label: "有时" },
          { value: 3, label: "经常" },
          { value: 4, label: "总是" }
        ]
      },
      {
        id: "q2_2",
        title: "我担心一些实际上并不重要的事情",
        options: [
          { value: 1, label: "没有或很少" },
          { value: 2, label: "有时" },
          { value: 3, label: "经常" },
          { value: 4, label: "总是" }
        ]
      }
    ]
  },
  // 添加90题心理健康自测量表（基于 PsychologyTest.net）
  3: {
    id: 3,
    title: "心理健康自测量表",
    description: "全面评估您的心理健康状况，包含90个专业问题",
    questionCount: 90,
    duration: 20,
    questions: generateMentalHealthQuestions()
  }
};

// 打卡记录
const checkinRecords = {};

// 积分数据
const pointsData = {};

// Dify对话历史
const difyConversations = {};

// ========== API路由 ==========

// 根路由
app.get('/', (req, res) => {
  res.json({ message: "心理健康智能平台API", version: "1.0.0" });
});

// ========== 小游戏相关接口 ==========

// 获取小游戏列表
app.get('/api/decompress/games', (req, res) => {
  const games = [
    { id: 1, name: "呼吸引导", type: "breathing", description: "通过呼吸练习放松身心" },
    { id: 2, name: "数字消消乐", type: "number", description: "消除相同数字，锻炼专注力" }
  ];
  res.json(getDemoResponse(games));
});

// 开始游戏
app.post('/api/decompress/games/start', (req, res) => {
  const { userId, gameType } = req.body;
  
  const gameRecord = {
    id: gameRecords.length + 1,
    userId: userId,
    gameType: gameType,
    startTime: new Date().toISOString(),
    status: "playing"
  };
  gameRecords.push(gameRecord);
  
  res.json(getDemoResponse({ gameId: gameRecord.id }));
});

// 完成游戏
app.post('/api/decompress/games/complete', (req, res) => {
  const { userId, gameType, duration, cycles, score, result } = req.body;
  
  const gameRecord = {
    id: gameRecords.length + 1,
    userId: userId,
    gameType: gameType,
    duration: duration,
    cycles: cycles,
    score: score,
    result: result,
    completeTime: new Date().toISOString()
  };
  gameRecords.push(gameRecord);
  
  res.json(getDemoResponse({ success: true, gameId: gameRecord.id }));
});

// ========== 心理题库相关接口 ==========

// 获取题库列表
app.get('/api/decompress/questionnaire/list', (req, res) => {
  const { userId } = req.query;
  
  const banks = Object.keys(questionBanks).map(bankId => {
    const bank = questionBanks[bankId];
    return {
      id: parseInt(bankId),
      title: bank.title,
      description: bank.description,
      questionCount: bank.questionCount,
      duration: bank.duration
    };
  });
  
  res.json(getDemoResponse(banks));
});

// 获取题目详情
app.get('/api/decompress/questionnaire/:question_id', (req, res) => {
  const questionId = parseInt(req.params.question_id);
  const bank = questionBanks[questionId];
  
  if (!bank) {
    return res.status(404).json(getErrorResponse(404, "题库不存在"));
  }
  
  // 确保返回完整的题库数据，包括questions数组
  const responseData = {
    id: bank.id,
    title: bank.title,
    description: bank.description,
    questionCount: bank.questionCount,
    duration: bank.duration,
    questions: bank.questions || []
  };
  
  console.log(`返回题目详情 - ID: ${questionId}, 题目数: ${responseData.questions.length}`);
  
  res.json(getDemoResponse(responseData));
});

// 提交答题
app.post('/api/decompress/questionnaire/submit', (req, res) => {
  const { userId, questionId, answers } = req.body;
  
  const result = calculateQuestionResult(questionId, answers);
  const resultId = gameRecords.length + 1; // 简单的ID生成
  
  // 保存结果（实际应保存到数据库）
  result.resultId = resultId;
  result.userId = userId;
  result.questionId = questionId;
  result.submitTime = new Date().toISOString();
  
  res.json(getDemoResponse({ resultId: resultId, result: result }));
});

// 获取答题结果
app.get('/api/decompress/questionnaire/result/:result_id', (req, res) => {
  const resultId = parseInt(req.params.result_id);
  
  // Demo版：返回模拟结果
  const result = {
    resultId: resultId,
    score: 12,
    totalScore: 20,
    percentage: 60.0,
    analysis: "你存在一定的压力，需要适当调整。建议采取一些减压措施。",
    suggestions: [
      "尝试深呼吸或冥想",
      "增加运动时间",
      "保证充足的睡眠"
    ]
  };
  
  res.json(getDemoResponse(result));
});

// ========== 心理顾问Agent对接接口 ==========

// ========== 【关键配置项】心理顾问Agent API配置 ==========
// ⚠️ 重要：以下配置项需要根据实际部署环境修改
// API基础地址：Dify服务的完整地址
const AGENT_API_BASE_URL = 'http://172.26.96.1.80/v1';
// API密钥：Dify应用的API密钥
const AGENT_API_KEY = 'app-8nHR8v6mryIQM4eBmc8Od9V1';
// 鉴权方式：Bearer Token（在HTTP Header中携带：Authorization: Bearer {API_KEY}）
// ========== 【配置项结束】 ==========

// 用户对话ID映射（用于管理每个用户的对话会话）
const userConversationIds = {};

/**
 * 获取或创建用户的对话ID
 * 如果本地没有，尝试从Dify API获取最新的会话ID
 */
async function getOrCreateConversationId(userId) {
  // 如果本地已有，直接返回
  if (userConversationIds[userId]) {
    return userConversationIds[userId];
  }
  
  // 尝试从Dify API获取最新的会话
  try {
    const response = await fetch(`${AGENT_API_BASE_URL}/conversations?user=${userId}&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AGENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // 使用最新的会话ID
        userConversationIds[userId] = data.data[0].id;
        return userConversationIds[userId];
      }
    }
  } catch (error) {
    console.warn('获取会话列表失败，将创建新会话:', error.message);
  }
  
  // 如果获取失败，返回空字符串（让Dify创建新会话）
  return '';
}

/**
 * 调用心理顾问Agent（用户咨询消息发送接口）- Streaming流式模式
 * 输入：用户ID、咨询文本
 * 输出：流式返回心理顾问Agent的回复文本
 * 
 * 根据Dify API文档实现：
 * POST /chat-messages
 * - query: 用户输入/提问内容（必填）
 * - inputs: App定义的变量值（可选）
 * - response_mode: "streaming"（流式模式，Agent模式必须使用）
 * - user: 用户标识（必填）
 * - conversation_id: 会话ID（可选，用于会话持久化）
 */
app.post('/api/ai/dify/chat', async (req, res) => {
  /**
   * 调用心理顾问Agent（通过后端中转，避免前端直接暴露密钥）
   * 严格遵循对接规范：
   * - 统一通过/api/ai/路径中转调用
   * - 关联currentUserId传递用户标识
   * - 适配emotionCommonTags统一情绪标签
   * - 使用streaming流式模式（必须，Agent模式不支持blocking）
   */
  let { userId, message, emotionTags, emotionScore, conversationId: providedConversationId } = req.body;
  
  // 自动生成用户ID（如果为空）
  if (!userId) {
    // 生成唯一用户标识（UUID格式）
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('自动生成用户ID:', userId);
  }
  
  if (!message || !message.trim()) {
    return res.json(getErrorResponse(1002, "错误：咨询文本不能为空"));
  }
  
  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用Nginx缓冲
  
  try {
    // 保存用户消息到本地历史（用于历史查询）
    if (!difyConversations[userId]) {
      difyConversations[userId] = [];
    }
    
    difyConversations[userId].push({
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
      emotionTags: emotionTags || [],
      emotionScore: emotionScore
    });
    
    // 获取或创建对话ID
    let conversationId = providedConversationId || await getOrCreateConversationId(userId);
    
    // 构建请求体（根据Dify API文档格式，必须使用streaming模式）
    // 必传参数：query（用户咨询文本）、user（用户唯一标识）、response_mode: "streaming"
    // 可选参数：conversation_id（会话持久化）、inputs（App定义的变量值）、auto_generate_name（自动生成标题）
    const requestBody = {
      query: message.trim(), // 用户输入/提问内容（必填）
      user: userId, // 用户标识（必填，唯一用户ID）
      response_mode: "streaming", // 必须使用streaming模式（Agent模式强制要求）
      inputs: {}, // App定义的变量值（可选，当前为空对象）
      auto_generate_name: true, // 自动生成标题（可选，默认true）
      ...(conversationId && conversationId !== '' ? { conversation_id: conversationId } : {}) // 会话ID（可选，首次为空，后续复用）
    };
    
    console.log('调用Dify API (Streaming):', {
      url: `${AGENT_API_BASE_URL}/chat-messages`,
      method: 'POST',
      userId: userId,
      message: message.trim().substring(0, 50) + '...',
      conversationId: conversationId || '新会话',
      requestBody: JSON.stringify(requestBody, null, 2)
    });
    
    // 调用Dify API（streaming模式）
    const agentResponse = await fetch(`${AGENT_API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENT_API_KEY}`, // 鉴权：Bearer Token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Dify API错误:', {
        status: agentResponse.status,
        statusText: agentResponse.statusText,
        errorText: errorText.substring(0, 500),
        url: `${AGENT_API_BASE_URL}/chat-messages`
      });
      
      // 解析错误信息
      let errorMessage = '咨询服务暂不可用，请检查Dify服务是否运行';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.code || errorMessage;
      } catch (e) {
        // 根据状态码返回友好提示（根据Dify API文档的错误码）
        if (agentResponse.status === 400) {
          // 400错误可能有多种原因（根据API文档）
          if (errorText.includes('invalid_param')) {
            errorMessage = '请求参数异常，请检查输入';
          } else if (errorText.includes('app_unavailable')) {
            errorMessage = 'App配置不可用';
          } else if (errorText.includes('provider_not_initialize')) {
            errorMessage = '无可用模型凭据配置';
          } else if (errorText.includes('provider_quota_exceeded')) {
            errorMessage = '模型调用额度不足';
          } else if (errorText.includes('model_currently_not_support')) {
            errorMessage = '当前模型不可用';
          } else if (errorText.includes('workflow_not_found')) {
            errorMessage = '指定的工作流版本未找到';
          } else if (errorText.includes('draft_workflow_error')) {
            errorMessage = '无法使用草稿工作流版本';
          } else if (errorText.includes('workflow_id_format_error')) {
            errorMessage = '工作流ID格式错误，需要UUID格式';
          } else if (errorText.includes('completion_request_error')) {
            errorMessage = '文本生成失败';
          } else {
            errorMessage = '请求参数错误，请检查输入';
          }
        } else if (agentResponse.status === 401 || agentResponse.status === 403) {
          errorMessage = 'API密钥验证失败，请检查配置';
        } else if (agentResponse.status === 404) {
          errorMessage = '对话不存在或Dify服务未找到，请确保服务在 http://172.26.96.1.80/v1 运行';
        } else if (agentResponse.status === 500) {
          errorMessage = 'Dify服务内部异常，请稍后重试';
        } else if (agentResponse.status === 0 || agentResponse.status >= 500) {
          errorMessage = '无法连接到Dify服务，请确保服务在 http://172.26.96.1.80/v1 运行';
        }
      }
      
      // 发送错误事件
      res.write(`data: ${JSON.stringify({ event: 'error', message: errorMessage, status: agentResponse.status })}\n\n`);
      res.end();
      return;
    }
    
    // 检查响应类型（应该是text/event-stream）
    const contentType = agentResponse.headers.get('content-type') || '';
    if (!contentType.includes('text/event-stream') && !contentType.includes('text/plain')) {
      console.warn('意外的Content-Type:', contentType);
    }
    
    // 处理流式响应
    const reader = agentResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullAnswer = '';
    let finalConversationId = conversationId;
    let messageId = null;
    let taskId = null;
    let metadata = null;
    let usage = null;
    
    // 设置超时（30秒）
    const timeout = setTimeout(() => {
      reader.cancel();
      res.write(`data: ${JSON.stringify({ event: 'error', message: '请求超时，请稍后重试' })}\n\n`);
      res.end();
    }, 30000);
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // 解码数据块
        buffer += decoder.decode(value, { stream: true });
        
        // 按行处理（SSE格式：每行以data: 开头，块之间以\n\n分隔）
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后不完整的行
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          // 处理SSE格式：data: {...}
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6); // 去掉 "data: " 前缀
            
            try {
              const eventData = JSON.parse(jsonStr);
              const eventType = eventData.event;
              
              // 处理不同的事件类型
              if (eventType === 'message' || eventType === 'agent_message') {
                // 拼接answer字段
                if (eventData.answer) {
                  fullAnswer += eventData.answer;
                  
                  // 实时发送给前端
                  res.write(`data: ${JSON.stringify({
                    event: 'message',
                    answer: eventData.answer,
                    fullAnswer: fullAnswer,
                    messageId: eventData.message_id,
                    conversationId: eventData.conversation_id
                  })}\n\n`);
                }
                
                // 保存conversation_id和message_id
                if (eventData.conversation_id) {
                  finalConversationId = eventData.conversation_id;
                  userConversationIds[userId] = finalConversationId;
                }
                if (eventData.message_id) {
                  messageId = eventData.message_id;
                }
                if (eventData.task_id) {
                  taskId = eventData.task_id;
                }
              } else if (eventType === 'message_end') {
                // 消息结束事件：收到此事件时终止拼接，存储返回的conversation_id用于后续会话
                metadata = eventData.metadata || null;
                usage = eventData.metadata?.usage || null;
                
                // 保存完整的AI回复到本地历史
                if (fullAnswer) {
                  difyConversations[userId].push({
                    role: "assistant",
                    content: fullAnswer,
                    timestamp: new Date().toISOString(),
                    messageId: messageId,
                    conversationId: finalConversationId
                  });
                }
                
                // 存储返回的conversation_id用于后续会话（会话持久化）
                if (eventData.conversation_id) {
                  finalConversationId = eventData.conversation_id;
                  userConversationIds[userId] = finalConversationId;
                }
                
                // 发送结束事件
                res.write(`data: ${JSON.stringify({
                  event: 'message_end',
                  fullAnswer: fullAnswer,
                  conversationId: finalConversationId,
                  messageId: messageId,
                  metadata: metadata,
                  usage: usage
                })}\n\n`);
                
                clearTimeout(timeout);
                res.end();
                return;
              } else if (eventType === 'error') {
                // 错误事件：捕获event: error时返回友好提示
                const errorMsg = eventData.message || '心理咨询服务暂不可用，请稍后重试';
                res.write(`data: ${JSON.stringify({
                  event: 'error',
                  message: errorMsg,
                  code: eventData.code,
                  status: eventData.status
                })}\n\n`);
                clearTimeout(timeout);
                res.end();
                return;
              } else if (eventType === 'agent_thought') {
                // Agent思考步骤事件（Agent模式下使用）
                // 可以用于显示Agent的思考过程，当前仅记录日志
                console.log('Agent思考步骤:', {
                  id: eventData.id,
                  position: eventData.position,
                  thought: eventData.thought,
                  observation: eventData.observation,
                  tool: eventData.tool
                });
                
                // 可选：将思考步骤发送给前端（用于调试或展示）
                res.write(`data: ${JSON.stringify({
                  event: 'agent_thought',
                  id: eventData.id,
                  position: eventData.position,
                  thought: eventData.thought,
                  observation: eventData.observation,
                  tool: eventData.tool,
                  toolInput: eventData.tool_input,
                  messageFiles: eventData.message_files || []
                })}\n\n`);
              } else if (eventType === 'message_file') {
                // 文件事件（表示有新文件需要展示，如Agent生成的图片）
                console.log('收到文件事件:', {
                  id: eventData.id,
                  type: eventData.type,
                  url: eventData.url,
                  belongsTo: eventData.belongs_to
                });
                
                // 将文件信息发送给前端
                res.write(`data: ${JSON.stringify({
                  event: 'message_file',
                  id: eventData.id,
                  type: eventData.type,
                  url: eventData.url,
                  belongsTo: eventData.belongs_to,
                  conversationId: eventData.conversation_id
                })}\n\n`);
              } else if (eventType === 'message_replace') {
                // 消息内容替换事件（内容审查时使用）
                console.log('消息内容被替换:', eventData.answer);
                
                // 替换完整回复内容
                fullAnswer = eventData.answer || fullAnswer;
                
                res.write(`data: ${JSON.stringify({
                  event: 'message_replace',
                  answer: eventData.answer,
                  fullAnswer: fullAnswer,
                  messageId: eventData.message_id,
                  conversationId: eventData.conversation_id
                })}\n\n`);
              } else if (eventType === 'tts_message') {
                // TTS音频流事件（语音合成输出）
                // 当前不处理音频流，仅记录日志
                console.log('收到TTS音频流事件');
                
                // 可选：将音频数据发送给前端
                res.write(`data: ${JSON.stringify({
                  event: 'tts_message',
                  messageId: eventData.message_id,
                  conversationId: eventData.conversation_id,
                  taskId: eventData.task_id,
                  audio: eventData.audio // Base64编码的音频数据
                })}\n\n`);
              } else if (eventType === 'tts_message_end') {
                // TTS音频流结束事件
                console.log('TTS音频流结束');
                
                res.write(`data: ${JSON.stringify({
                  event: 'tts_message_end',
                  messageId: eventData.message_id,
                  conversationId: eventData.conversation_id,
                  taskId: eventData.task_id
                })}\n\n`);
              } else if (eventType === 'ping') {
                // ping事件（每10秒一次，保持连接存活）
                res.write(`data: ${JSON.stringify({ event: 'ping' })}\n\n`);
              } else {
                // 其他未知事件类型，记录日志但不中断流程
                console.log('收到未知事件类型:', eventType, eventData);
              }
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError, '原始数据:', jsonStr);
            }
          }
        }
      }
      
      // 如果流结束但没有收到message_end，发送结束信号
      if (fullAnswer) {
        // 保存完整的AI回复到本地历史
        difyConversations[userId].push({
          role: "assistant",
          content: fullAnswer,
          timestamp: new Date().toISOString(),
          messageId: messageId,
          conversationId: finalConversationId
        });
        
        res.write(`data: ${JSON.stringify({
          event: 'message_end',
          fullAnswer: fullAnswer,
          conversationId: finalConversationId,
          messageId: messageId,
          metadata: metadata,
          usage: usage
        })}\n\n`);
      } else {
        // 如果没有收到任何回复，可能是连接问题
        console.warn('未收到Dify回复，fullAnswer为空');
        res.write(`data: ${JSON.stringify({
          event: 'error',
          message: '未收到Dify服务回复，请检查服务是否正常运行'
        })}\n\n`);
      }
      
      clearTimeout(timeout);
      res.end();
      
    } catch (streamError) {
      clearTimeout(timeout);
      console.error('流式响应处理错误:', {
        error: streamError.message,
        stack: streamError.stack,
        userId: userId
      });
      
      // 如果已经有部分回复，发送它
      if (fullAnswer) {
        difyConversations[userId].push({
          role: "assistant",
          content: fullAnswer,
          timestamp: new Date().toISOString(),
          messageId: messageId,
          conversationId: finalConversationId
        });
        
        res.write(`data: ${JSON.stringify({
          event: 'message_end',
          fullAnswer: fullAnswer,
          conversationId: finalConversationId,
          messageId: messageId
        })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({
          event: 'error',
          message: `流式响应处理失败: ${streamError.message}。请检查Dify服务是否正常运行。`
        })}\n\n`);
      }
      res.end();
    }
    
  } catch (error) {
    console.error('调用心理顾问Agent失败:', {
      error: error.message,
      stack: error.stack,
      userId: userId,
      url: `${AGENT_API_BASE_URL}/chat-messages`
    });
    
    // 分析错误类型，提供更具体的错误信息
    let errorMessage = '心理咨询服务暂不可用，请稍后重试';
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接或Dify服务状态';
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      errorMessage = `无法连接到Dify服务，请确保服务在 ${AGENT_API_BASE_URL} 运行`;
    } else if (error.message.includes('fetch failed')) {
      errorMessage = `网络连接失败，请检查Dify服务地址 ${AGENT_API_BASE_URL} 是否正确`;
    } else {
      errorMessage = `调用失败: ${error.message}。请确保Dify服务在 ${AGENT_API_BASE_URL} 运行`;
    }
    
    // 发送错误事件
    res.write(`data: ${JSON.stringify({
      event: 'error',
      message: errorMessage
    })}\n\n`);
    res.end();
  }
});

/**
 * 【API可达性测试接口】
 * 测试Dify API地址是否可访问
 * GET /api/ai/dify/test
 */
app.get('/api/ai/dify/test', async (req, res) => {
  try {
    console.log('测试Dify API可达性:', `${AGENT_API_BASE_URL}/info`);
    
    // 测试 GET /info 接口（验证API地址可达性）
    // 使用AbortController实现超时控制（10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);
    
    let testResponse;
    try {
      testResponse = await fetch(`${AGENT_API_BASE_URL}/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AGENT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (testResponse.ok) {
      const infoData = await testResponse.json();
      res.json(getDemoResponse({
        reachable: true,
        message: 'Dify API连接成功',
        apiUrl: AGENT_API_BASE_URL,
        appInfo: infoData
      }));
    } else {
      res.json(getErrorResponse(testResponse.status, `Dify API返回错误: ${testResponse.status} ${testResponse.statusText}`));
    }
  } catch (error) {
    console.error('Dify API可达性测试失败:', error);
    
    let errorMessage = '无法连接到Dify服务';
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = '连接超时，请检查网络或服务地址';
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      errorMessage = '无法连接到Dify服务，请检查服务地址是否正确';
    } else {
      errorMessage = `连接失败: ${error.message}`;
    }
    
    res.json(getErrorResponse(500, `${errorMessage}。请确保Dify服务在 ${AGENT_API_BASE_URL} 运行。`));
  }
});

/**
 * 获取对话历史（对话历史查询接口）
 * 输入：用户ID、会话ID（可选）、限制数量
 * 输出：该用户的所有对话记录
 * 
 * 根据Dify API文档实现：
 * GET /messages
 * - conversation_id: 会话ID
 * - user: 用户标识
 * - limit: 一次请求返回多少条聊天记录，默认20条
 * - first_id: 当前页第一条聊天记录的ID（用于分页）
 */
app.get('/api/ai/dify/history', async (req, res) => {
  const { userId, conversationId, limit = 20, firstId } = req.query;
  
  if (!userId) {
    return res.json(getErrorResponse(1001, "错误：userId不能为空"));
  }
  
  try {
    let history = [];
    
    // 如果提供了conversation_id，从Dify API获取该会话的历史记录
    const targetConversationId = conversationId || userConversationIds[userId];
    
    if (targetConversationId) {
      try {
        // 构建查询参数
        const queryParams = new URLSearchParams({
          conversation_id: targetConversationId,
          user: userId,
          limit: limit.toString()
        });
        
        if (firstId) {
          queryParams.append('first_id', firstId);
        }
        
        // 调用Dify API获取对话历史
        const agentResponse = await fetch(`${AGENT_API_BASE_URL}/messages?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AGENT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          
          // 根据Dify API文档，返回格式：{ data: [...], limit: 20, has_more: false }
          if (agentData.data && Array.isArray(agentData.data)) {
            // 将Dify的消息格式转换为前端需要的格式
            // Dify格式：每条消息包含 query（用户输入）和 answer（AI回复）
            // 需要转换为两条记录：一条用户消息，一条助手消息
            history = [];
            
            agentData.data.forEach(msg => {
              // 根据Dify API文档，消息格式包含：
              // - query: 用户输入/提问内容
              // - answer: 回答消息内容
              // - message_files: 消息文件（图片等）
              // - agent_thoughts: Agent思考内容（仅Agent模式下不为空）
              // - retriever_resources: 引用和归属分段列表
              
              // 添加用户消息
              if (msg.query) {
                history.push({
                  id: `${msg.id}_user`,
                  role: 'user',
                  content: msg.query,
                  timestamp: msg.created_at ? new Date(msg.created_at * 1000).toISOString() : new Date().toISOString(),
                  messageId: msg.id,
                  conversationId: msg.conversation_id,
                  inputs: msg.inputs || {}, // 用户输入参数
                  messageFiles: msg.message_files || [] // 消息文件
                });
              }
              
              // 添加助手回复
              if (msg.answer) {
                history.push({
                  id: `${msg.id}_assistant`,
                  role: 'assistant',
                  content: msg.answer,
                  timestamp: msg.created_at ? new Date(msg.created_at * 1000).toISOString() : new Date().toISOString(),
                  messageId: msg.id,
                  conversationId: msg.conversation_id,
                  messageFiles: msg.message_files || [], // 消息文件（如Agent生成的图片）
                  agentThoughts: msg.agent_thoughts || [], // Agent思考内容
                  retrieverResources: msg.retriever_resources || [], // 引用和归属分段列表
                  feedback: msg.feedback || null // 反馈信息
                });
              }
            });
            
            // 按时间排序（最早的在前）
            history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // 保存到本地（用于离线访问）
            if (!difyConversations[userId]) {
              difyConversations[userId] = [];
            }
            difyConversations[userId] = history;
          }
        } else {
          console.warn('从Dify API获取历史记录失败:', agentResponse.status);
        }
      } catch (apiError) {
        console.warn('从Dify API获取历史记录失败，使用本地记录:', apiError.message);
      }
    }
    
    // 如果从API获取失败或没有conversation_id，使用本地存储
    if (history.length === 0) {
      history = difyConversations[userId] || [];
    }
    
    // 限制返回数量，最新的在前（倒序）
    const limitedHistory = history.slice(-parseInt(limit)).reverse();
    
    res.json(getDemoResponse({
      data: limitedHistory,
      limit: parseInt(limit),
      hasMore: history.length > parseInt(limit)
    }));
    
  } catch (error) {
    console.error('获取对话历史失败:', error);
    res.json(getErrorResponse(500, `获取对话历史失败: ${error.message}`));
  }
});

/**
 * 获取会话列表
 * 根据Dify API文档：GET /conversations
 */
app.get('/api/ai/dify/conversations', async (req, res) => {
  const { userId, limit = 20, lastId } = req.query;
  
  if (!userId) {
    return res.json(getErrorResponse(1001, "错误：userId不能为空"));
  }
  
  try {
    const queryParams = new URLSearchParams({
      user: userId,
      limit: limit.toString()
    });
    
    if (lastId) {
      queryParams.append('last_id', lastId);
    }
    
    const agentResponse = await fetch(`${AGENT_API_BASE_URL}/conversations?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AGENT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (agentResponse.ok) {
      const agentData = await agentResponse.json();
      res.json(getDemoResponse(agentData));
    } else {
      throw new Error(`获取会话列表失败: ${agentResponse.status}`);
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.json(getErrorResponse(500, `获取会话列表失败: ${error.message}`));
  }
});

// ========== 打卡与积分相关接口 ==========

// 活动打卡
app.post('/api/decompress/checkin', (req, res) => {
  const { userId, checkInTime, activityId, activityName, activityType, points } = req.body;
  const checkinTime = checkInTime || new Date().toISOString();
  
  // 检查今日是否已打卡
  const today = new Date().toISOString().split('T')[0];
  if (checkinRecords[userId]) {
    const todayRecords = checkinRecords[userId].filter(r => r.date === today);
    if (todayRecords.length > 0) {
      return res.status(400).json(getErrorResponse(400, "今日已打卡"));
    }
  }
  
  // 记录打卡
  if (!checkinRecords[userId]) {
    checkinRecords[userId] = [];
  }
  
  // 获取积分（根据活动类型）
  const checkinPoints = points || 10;
  const finalActivityName = activityName || "每日打卡";
  
  const checkinRecord = {
    id: checkinRecords[userId].length + 1,
    userId: userId,
    checkInTime: checkinTime,
    date: today,
    points: checkinPoints,
    activityId: activityId,
    activityName: finalActivityName,
    activityType: activityType
  };
  checkinRecords[userId].push(checkinRecord);
  
  // 更新积分
  if (!pointsData[userId]) {
    pointsData[userId] = { totalPoints: 0, history: [] };
  }
  
  pointsData[userId].totalPoints += checkinPoints;
  pointsData[userId].history.push({
    id: pointsData[userId].history.length + 1,
    points: checkinPoints,
    source: "checkin",
    description: `完成${finalActivityName}`,
    createTime: checkinTime
  });
  
  // 返回打卡结果，包含activeTaskCount相关信息
  // 注意：activeTaskCount由前端更新，后端仅返回提示信息
  res.json(getDemoResponse({
    id: checkinRecord.id,
    points: checkinPoints,
    checkInTime: checkinTime,
    activityName: finalActivityName,
    totalPoints: pointsData[userId].totalPoints,
    message: "打卡成功，请前端更新activeTaskCount"
  }));
});

// 获取打卡记录
app.get('/api/decompress/checkin/records', (req, res) => {
  const { userId, startDate, endDate } = req.query;
  const userRecords = checkinRecords[userId] || [];
  
  // 过滤日期范围
  const filteredRecords = userRecords.filter(r => {
    return startDate <= r.date && r.date <= endDate;
  });
  
  // 按时间倒序
  filteredRecords.sort((a, b) => {
    return new Date(b.checkInTime) - new Date(a.checkInTime);
  });
  
  res.json(getDemoResponse(filteredRecords));
});

// 获取积分信息
app.get('/api/points/info', (req, res) => {
  const { userId } = req.query;
  const userPoints = pointsData[userId] || { totalPoints: 0, history: [] };
  res.json(getDemoResponse({
    totalPoints: userPoints.totalPoints,
    userId: userId
  }));
});

// 获取积分变动记录
app.get('/api/points/history', (req, res) => {
  const { userId, limit = 20 } = req.query;
  const userPoints = pointsData[userId] || { totalPoints: 0, history: [] };
  const history = userPoints.history.slice(-parseInt(limit));
  history.reverse(); // 最新的在前
  res.json(getDemoResponse(history));
});

// 获取积分规则
app.get('/api/points/rules', (req, res) => {
  const rules = [
    { action: "每日打卡", points: 10 },
    { action: "完成呼吸游戏", points: 5 },
    { action: "完成数字消消乐", points: 10 },
    { action: "完成心理测试", points: 15 },
    { action: "连续打卡7天", points: 50 },
    { action: "连续打卡30天", points: 200 }
  ];
  res.json(getDemoResponse(rules));
});

// ========== 跨模块接口：积分更新（供模块C调用）==========

// 积分更新接口（提供给其他模块调用）
app.post('/api/points/update', (req, res) => {
  const { userId, points, source, description } = req.body;
  
  // 初始化用户积分数据
  if (!pointsData[userId]) {
    pointsData[userId] = { totalPoints: 0, history: [] };
  }
  
  // 更新积分
  pointsData[userId].totalPoints += points;
  
  // 记录积分变动
  pointsData[userId].history.push({
    id: pointsData[userId].history.length + 1,
    points: points,
    source: source,
    description: description,
    createTime: new Date().toISOString()
  });
  
  res.json(getDemoResponse({
    success: true,
    totalPoints: pointsData[userId].totalPoints,
    addedPoints: points
  }));
});

// ========== 跨模块接口：用户信息（可调用）==========

// 获取用户信息（供跨模块调用）
app.get('/api/user/info', (req, res) => {
  const { userId } = req.query;
  res.json(getDemoResponse({
    userId: userId,
    username: `用户_${userId}`,
    role: "user",
    avatar: null
  }));
});

// ========== 跨模块接口：情绪数据查询（可调用）==========

// 获取情绪数据历史（供跨模块调用）
app.get('/api/emotion/history', (req, res) => {
  const { userId, limit = 10 } = req.query;
  
  // Demo版：返回模拟数据
  const history = [];
  for (let i = 0; i < parseInt(limit); i++) {
    history.push({
      id: i,
      userId: userId,
      score: 60 + i * 2,
      tags: ["压力", "焦虑"],
      createTime: new Date().toISOString()
    });
  }
  
  res.json(getDemoResponse(history));
});

// ========== 启动服务器 ==========

app.listen(PORT, () => {
  console.log(`心理健康智能平台API服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}`);
});

export default app;

