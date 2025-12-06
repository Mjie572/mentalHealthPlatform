"""
心理健康智能平台 - 后端API（FastAPI）
多维解压服务模块接口
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import os

app = FastAPI(title="心理健康智能平台API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 数据模型 ==========

class GameStartRequest(BaseModel):
    userId: str
    gameType: str  # 'breathing' | 'number'

class GameCompleteRequest(BaseModel):
    userId: str
    gameType: str
    duration: Optional[int] = None
    cycles: Optional[int] = None
    score: Optional[int] = None
    result: Optional[str] = None

class SubmitQuestionnaireRequest(BaseModel):
    userId: str
    questionId: int
    answers: Dict[str, int]

class DifyChatRequest(BaseModel):
    userId: str
    message: str
    emotionTags: Optional[List[str]] = None
    emotionScore: Optional[float] = None
    conversationHistory: Optional[List[Dict[str, str]]] = None

class CheckInRequest(BaseModel):
    userId: str
    checkInTime: str
    activityId: Optional[int] = None
    activityName: Optional[str] = None
    activityType: Optional[str] = None
    points: Optional[int] = 10

class PointsUpdateRequest(BaseModel):
    userId: str
    points: int
    source: str  # 'game_breathing' | 'game_number' | 'checkin' | 'questionnaire'
    description: str

# ========== 工具函数 ==========

def generate_mental_health_questions():
    """生成90题心理健康自测量表（基于 PsychologyTest.net 格式）"""
    questions_list = [
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
    ]
    
    standard_options = [
        {"value": 1, "label": "完全没有"},
        {"value": 2, "label": "有一点"},
        {"value": 3, "label": "中等程度"},
        {"value": 4, "label": "相当多"},
        {"value": 5, "label": "非常多"}
    ]
    
    questions = []
    for i, title in enumerate(questions_list, 1):
        questions.append({
            "id": f"mh_{i}",
            "title": title,
            "options": standard_options.copy()
        })
    
    return questions

# ========== 模拟数据存储（Demo版） ==========

# 游戏记录
game_records = []

# 题库数据
question_banks = {
    1: {
        "id": 1,
        "title": "压力评估测试",
        "description": "评估你当前的压力水平",
        "questionCount": 5,
        "duration": 5,
        "questions": [
            {
                "id": "q1_1",
                "title": "最近一周，你感到压力的频率如何？",
                "options": [
                    {"value": 1, "label": "几乎没有"},
                    {"value": 2, "label": "偶尔"},
                    {"value": 3, "label": "经常"},
                    {"value": 4, "label": "几乎总是"}
                ]
            },
            {
                "id": "q1_2",
                "title": "工作或学习任务是否让你感到焦虑？",
                "options": [
                    {"value": 1, "label": "完全没有"},
                    {"value": 2, "label": "有一点"},
                    {"value": 3, "label": "比较明显"},
                    {"value": 4, "label": "非常明显"}
                ]
            },
            {
                "id": "q1_3",
                "title": "你是否因为压力而失眠？",
                "options": [
                    {"value": 1, "label": "从不"},
                    {"value": 2, "label": "很少"},
                    {"value": 3, "label": "有时"},
                    {"value": 4, "label": "经常"}
                ]
            },
            {
                "id": "q1_4",
                "title": "压力是否影响了你的日常生活？",
                "options": [
                    {"value": 1, "label": "没有影响"},
                    {"value": 2, "label": "轻微影响"},
                    {"value": 3, "label": "明显影响"},
                    {"value": 4, "label": "严重影响"}
                ]
            },
            {
                "id": "q1_5",
                "title": "你是否有有效的压力缓解方法？",
                "options": [
                    {"value": 1, "label": "有很多方法"},
                    {"value": 2, "label": "有一些方法"},
                    {"value": 3, "label": "方法很少"},
                    {"value": 4, "label": "没有方法"}
                ]
            }
        ]
    },
    2: {
        "id": 2,
        "title": "焦虑自评量表",
        "description": "了解你的焦虑程度",
        "questionCount": 7,
        "duration": 7,
        "questions": [
            {
                "id": "q2_1",
                "title": "我感到紧张或焦虑",
                "options": [
                    {"value": 1, "label": "没有或很少"},
                    {"value": 2, "label": "有时"},
                    {"value": 3, "label": "经常"},
                    {"value": 4, "label": "总是"}
                ]
            },
            {
                "id": "q2_2",
                "title": "我担心一些实际上并不重要的事情",
                "options": [
                    {"value": 1, "label": "没有或很少"},
                    {"value": 2, "label": "有时"},
                    {"value": 3, "label": "经常"},
                    {"value": 4, "label": "总是"}
                ]
            }
        ]
    },
    # 添加90题心理健康自测量表（基于 PsychologyTest.net）
    3: {
        "id": 3,
        "title": "心理健康自测量表",
        "description": "全面评估您的心理健康状况，包含90个专业问题",
        "questionCount": 90,
        "duration": 20,
        "questions": generate_mental_health_questions()
    }
}

# 打卡记录
checkin_records = {}

# 积分数据
points_data = {}

# Dify对话历史
dify_conversations = {}

# ========== 工具函数 ==========

def get_demo_response(data: Any = None, msg: str = "Demo版模拟数据"):
    """
    生成Demo版响应格式
    严格遵循Demo版要求：包含code/msg/data，msg标注「Demo版模拟数据」
    """
    return {
        "code": 200,
        "msg": msg,
        "data": data
    }

def get_error_response(code: int = 1001, msg: str = "Demo版错误", data: Any = None):
    """
    生成错误响应格式
    code: 1001为Demo版专用错误码
    """
    return {
        "code": code,
        "msg": msg,
        "data": data
    }
    """生成Demo版响应格式"""
    return {
        "code": 200,
        "msg": msg,
        "data": data
    }

def calculate_question_result(question_id: int, answers: Dict[str, int]) -> Dict[str, Any]:
    """计算答题结果"""
    question_bank = question_banks.get(question_id)
    if not question_bank:
        return {
            "score": 0,
            "totalScore": 0,
            "analysis": "无法计算结果",
            "suggestions": []
        }
    
    # 根据题目类型计算总分（90题量表使用5分制，其他使用4分制）
    max_score_per_question = 5 if question_id == 3 else 4
    total_score = len(question_bank["questions"]) * max_score_per_question
    user_score = sum(answers.values())
    percentage = (user_score / total_score) * 100
    
    # 90题心理健康自测量表的评估标准（基于SCL-90量表）
    if question_id == 3:
        # SCL-90量表：总分越高，症状越明显
        # 正常范围：总分 < 160 (90题 * 1.78)
        # 轻度：160-200，中度：200-250，重度：>250
        if user_score < 160:
            analysis = "您的心理健康状况良好。各项指标都在正常范围内，请继续保持健康的生活方式。"
            suggestions = [
                "继续保持良好的生活习惯和作息规律",
                "定期进行放松活动，如运动、冥想等",
                "保持积极的心态和良好的人际关系",
                "定期进行心理健康自测，关注自身状态"
            ]
        elif user_score < 200:
            analysis = "您存在一些轻微的心理健康问题。建议适当关注并采取一些自我调节措施。"
            suggestions = [
                "尝试深呼吸、冥想等放松技巧",
                "增加运动时间，保持规律作息",
                "寻求朋友或家人的支持和理解",
                "考虑使用平台的小游戏和放松功能",
                "如果症状持续，建议咨询心理专家"
            ]
        elif user_score < 250:
            analysis = "您的心理健康状况需要关注。建议及时采取干预措施，必要时寻求专业帮助。"
            suggestions = [
                "建议咨询专业的心理专家或心理咨询师",
                "学习压力管理和情绪调节技巧",
                "调整工作或学习节奏，适当休息",
                "保持规律的作息时间和健康饮食",
                "使用平台的心理顾问功能获取专业建议",
                "考虑参加心理健康相关的活动或课程"
            ]
        else:
            analysis = "您的心理健康状况需要高度重视。强烈建议尽快寻求专业的心理健康服务。"
            suggestions = [
                "立即咨询专业的心理医生或精神科医生",
                "寻求家人和朋友的支持和理解",
                "考虑参加专业的心理健康治疗",
                "使用平台的所有心理健康功能辅助恢复",
                "保持规律的作息，避免过度压力",
                "如有紧急情况，请拨打心理健康热线"
            ]
    else:
        # 其他量表的评估标准
        if percentage < 30:
            analysis = "你的压力水平较低，情绪状态良好。继续保持健康的生活方式。"
            suggestions = [
                "继续保持良好的生活习惯",
                "定期进行放松活动",
                "保持积极的心态"
            ]
        elif percentage < 60:
            analysis = "你存在一定的压力，需要适当调整。建议采取一些减压措施。"
            suggestions = [
                "尝试深呼吸或冥想",
                "增加运动时间",
                "保证充足的睡眠",
                "寻求朋友或家人的支持"
            ]
        else:
            analysis = "你的压力水平较高，建议及时寻求专业帮助。"
            suggestions = [
                "考虑咨询心理专家",
                "学习压力管理技巧",
                "调整工作或学习节奏",
                "保持规律的作息时间"
            ]
    
    return {
        "score": user_score,
        "totalScore": total_score,
        "percentage": round(percentage, 1),
        "analysis": analysis,
        "suggestions": suggestions
    }

# ========== API路由 ==========

@app.get("/")
async def root():
    return {"message": "心理健康智能平台API", "version": "1.0.0"}

# ========== 小游戏相关接口 ==========

@app.get("/api/decompress/games")
async def get_games():
    """获取小游戏列表"""
    games = [
        {"id": 1, "name": "呼吸引导", "type": "breathing", "description": "通过呼吸练习放松身心"},
        {"id": 2, "name": "数字消消乐", "type": "number", "description": "消除相同数字，锻炼专注力"}
    ]
    return get_demo_response(games)

@app.post("/api/decompress/games/start")
async def start_game(request: GameStartRequest):
    """开始游戏"""
    game_record = {
        "id": len(game_records) + 1,
        "userId": request.userId,
        "gameType": request.gameType,
        "startTime": datetime.now().isoformat(),
        "status": "playing"
    }
    game_records.append(game_record)
    return get_demo_response({"gameId": game_record["id"]})

@app.post("/api/decompress/games/complete")
async def complete_game(request: GameCompleteRequest):
    """完成游戏"""
    game_record = {
        "id": len(game_records) + 1,
        "userId": request.userId,
        "gameType": request.gameType,
        "duration": request.duration,
        "cycles": request.cycles,
        "score": request.score,
        "result": request.result,
        "completeTime": datetime.now().isoformat()
    }
    game_records.append(game_record)
    return get_demo_response({"success": True, "gameId": game_record["id"]})

# ========== 心理题库相关接口 ==========

@app.get("/api/decompress/questionnaire/list")
async def get_question_bank_list(userId: str = Query(...)):
    """获取题库列表"""
    banks = [
        {
            "id": bank_id,
            "title": bank["title"],
            "description": bank["description"],
            "questionCount": bank["questionCount"],
            "duration": bank["duration"]
        }
        for bank_id, bank in question_banks.items()
    ]
    return get_demo_response(banks)

@app.get("/api/decompress/questionnaire/{question_id}")
async def get_question_detail(question_id: int):
    """获取题目详情"""
    bank = question_banks.get(question_id)
    if not bank:
        raise HTTPException(status_code=404, detail="题库不存在")
    return get_demo_response(bank)

@app.post("/api/decompress/questionnaire/submit")
async def submit_questionnaire(request: SubmitQuestionnaireRequest):
    """提交答题"""
    result = calculate_question_result(request.questionId, request.answers)
    result_id = len(game_records) + 1  # 简单的ID生成
    
    # 保存结果（实际应保存到数据库）
    result["resultId"] = result_id
    result["userId"] = request.userId
    result["questionId"] = request.questionId
    result["submitTime"] = datetime.now().isoformat()
    
    return get_demo_response({"resultId": result_id, "result": result})

@app.get("/api/decompress/questionnaire/result/{result_id}")
async def get_question_result(result_id: int):
    """获取答题结果"""
    # Demo版：返回模拟结果
    result = {
        "resultId": result_id,
        "score": 12,
        "totalScore": 20,
        "percentage": 60.0,
        "analysis": "你存在一定的压力，需要适当调整。建议采取一些减压措施。",
        "suggestions": [
            "尝试深呼吸或冥想",
            "增加运动时间",
            "保证充足的睡眠"
        ]
    }
    return get_demo_response(result)

# ========== Dify心理顾问对接接口 ==========

@app.post("/api/ai/dify/chat")
async def call_dify_advisor(request: DifyChatRequest):
    """
    调用Dify心理顾问（通过后端中转，避免前端直接暴露密钥）
    严格遵循Dify对接规范：
    - 统一通过/api/ai/路径中转调用
    - 关联currentUserId传递用户标识
    - 适配emotionCommonTags统一情绪标签
    """
    # 兼容性检查：currentUserId不能为空
    if not request.userId:
        return get_error_response(1001, "Demo版错误：userId不能为空")
    
    # 实际应调用Dify API，使用以下参数：
    # - userId: request.userId (用户标识)
    # - message: request.message (用户消息)
    # - emotionTags: request.emotionTags (统一情绪标签，来自emotionCommonTags)
    # - emotionScore: request.emotionScore (最新情绪评分，来自latestEmotionScore)
    # - conversationHistory: request.conversationHistory (对话历史)
    # 
    # Dify API调用示例（正式版）：
    # import requests
    # dify_response = requests.post(
    #     f"{DIFY_API_URL}/chat-messages",
    #     headers={"Authorization": f"Bearer {DIFY_API_KEY}"},
    #     json={
    #         "inputs": {
    #             "userId": request.userId,
    #             "emotionTags": request.emotionTags or [],
    #             "emotionScore": request.emotionScore
    #         },
    #         "query": request.message,
    #         "conversation_id": get_or_create_conversation_id(request.userId),
    #         "user": request.userId
    #     }
    # )
    
    # Demo版：保存对话历史
    if request.userId not in dify_conversations:
        dify_conversations[request.userId] = []
    
    dify_conversations[request.userId].append({
        "role": "user",
        "content": request.message,
        "timestamp": datetime.now().isoformat(),
        "emotionTags": request.emotionTags or [],
        "emotionScore": request.emotionScore
    })
    
    # Demo版：模拟AI回复（根据情绪标签和评分提供不同回复）
    import random
    mock_responses = [
        "我理解您的感受。建议您尝试深呼吸，放松身心。",
        "压力是正常的，重要的是找到适合自己的缓解方式。可以尝试运动、听音乐或与朋友交流。",
        "睡眠问题可能与压力有关。建议保持规律的作息时间，睡前避免使用电子设备。",
        "保持积极心态需要时间和练习。可以尝试记录每天的小确幸，培养感恩的习惯。"
    ]
    
    # 根据情绪标签调整回复（Demo版逻辑）
    if request.emotionTags:
        if "焦虑" in request.emotionTags or "压力" in request.emotionTags:
            mock_responses = [
                "我注意到您提到焦虑和压力。建议您尝试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒，重复几次。",
                "压力管理很重要。可以尝试将大任务分解成小步骤，逐步完成，减少压力感。",
                "当感到焦虑时，可以尝试正念冥想，专注于当下，观察自己的感受而不评判。"
            ]
        elif "抑郁" in request.emotionTags:
            mock_responses = [
                "如果您感到情绪低落，建议寻求专业帮助。同时，保持规律的作息和适度的运动有助于改善情绪。",
                "抑郁情绪需要认真对待。建议与信任的人分享您的感受，或寻求专业心理咨询师的帮助。"
            ]
    
    ai_reply = random.choice(mock_responses)
    
    dify_conversations[request.userId].append({
        "role": "assistant",
        "content": ai_reply,
        "timestamp": datetime.now().isoformat()
    })
    
    return get_demo_response({
        "reply": ai_reply,
        "message": ai_reply,  # 兼容不同字段名
        "userId": request.userId,
        "emotionTags": request.emotionTags,
        "emotionScore": request.emotionScore
    })

@app.get("/api/ai/dify/history")
async def get_dify_history(userId: str = Query(...), limit: int = Query(20)):
    """获取Dify对话历史"""
    history = dify_conversations.get(userId, [])
    return get_demo_response(history[-limit:])

# ========== 打卡与积分相关接口 ==========

@app.post("/api/decompress/checkin")
async def check_in(request: CheckInRequest):
    """活动打卡"""
    user_id = request.userId
    checkin_time = datetime.now().isoformat()
    
    # 检查今日是否已打卡
    today = datetime.now().date().isoformat()
    if user_id in checkin_records:
        today_records = [r for r in checkin_records[user_id] if r["date"] == today]
        if today_records:
            raise HTTPException(status_code=400, detail="今日已打卡")
    
    # 记录打卡
    if user_id not in checkin_records:
        checkin_records[user_id] = []
    
    # 获取积分（根据活动类型）
    points = request.points or 10
    activity_name = request.activityName or "每日打卡"
    
    checkin_record = {
        "id": len(checkin_records[user_id]) + 1,
        "userId": user_id,
        "checkInTime": checkin_time,
        "date": today,
        "points": points,
        "activityId": request.activityId,
        "activityName": activity_name,
        "activityType": request.activityType
    }
    checkin_records[user_id].append(checkin_record)
    
    # 更新积分
    if user_id not in points_data:
        points_data[user_id] = {"totalPoints": 0, "history": []}
    
    points_data[user_id]["totalPoints"] += points
    points_data[user_id]["history"].append({
        "id": len(points_data[user_id]["history"]) + 1,
        "points": points,
        "source": "checkin",
        "description": f"完成{activity_name}",
        "createTime": checkin_time
    })
    
    # 返回打卡结果，包含activeTaskCount相关信息
    # 注意：activeTaskCount由前端更新，后端仅返回提示信息
    return get_demo_response({
        "id": checkin_record["id"],
        "points": points,
        "checkInTime": checkin_time,
        "activityName": activity_name,
        "totalPoints": points_data[user_id]["totalPoints"],
        "message": "打卡成功，请前端更新activeTaskCount"
    })

@app.get("/api/decompress/checkin/records")
async def get_checkin_records(userId: str = Query(...), startDate: str = Query(...), endDate: str = Query(...)):
    """获取打卡记录"""
    user_records = checkin_records.get(userId, [])
    
    # 过滤日期范围
    filtered_records = [
        r for r in user_records
        if startDate <= r["date"] <= endDate
    ]
    
    # 按时间倒序
    filtered_records.sort(key=lambda x: x["checkInTime"], reverse=True)
    
    return get_demo_response(filtered_records)

@app.get("/api/points/info")
async def get_points_info(userId: str = Query(...)):
    """获取积分信息"""
    user_points = points_data.get(userId, {"totalPoints": 0, "history": []})
    return get_demo_response({
        "totalPoints": user_points["totalPoints"],
        "userId": userId
    })

@app.get("/api/points/history")
async def get_points_history(userId: str = Query(...), limit: int = Query(20)):
    """获取积分变动记录"""
    user_points = points_data.get(userId, {"totalPoints": 0, "history": []})
    history = user_points["history"][-limit:]
    history.reverse()  # 最新的在前
    return get_demo_response(history)

@app.get("/api/points/rules")
async def get_points_rules():
    """获取积分规则"""
    rules = [
        {"action": "每日打卡", "points": 10},
        {"action": "完成呼吸游戏", "points": 5},
        {"action": "完成数字消消乐", "points": 10},
        {"action": "完成心理测试", "points": 15},
        {"action": "连续打卡7天", "points": 50},
        {"action": "连续打卡30天", "points": 200}
    ]
    return get_demo_response(rules)

# ========== 跨模块接口：积分更新（供模块C调用）==========

@app.post("/api/points/update")
async def update_points(request: PointsUpdateRequest):
    """积分更新接口（提供给其他模块调用）"""
    user_id = request.userId
    
    # 初始化用户积分数据
    if user_id not in points_data:
        points_data[user_id] = {"totalPoints": 0, "history": []}
    
    # 更新积分
    points_data[user_id]["totalPoints"] += request.points
    
    # 记录积分变动
    points_data[user_id]["history"].append({
        "id": len(points_data[user_id]["history"]) + 1,
        "points": request.points,
        "source": request.source,
        "description": request.description,
        "createTime": datetime.now().isoformat()
    })
    
    return get_demo_response({
        "success": True,
        "totalPoints": points_data[user_id]["totalPoints"],
        "addedPoints": request.points
    })

# ========== 跨模块接口：用户信息（可调用）==========

@app.get("/api/user/info")
async def get_user_info(userId: str = Query(...)):
    """获取用户信息（供跨模块调用）"""
    return get_demo_response({
        "userId": userId,
        "username": f"用户_{userId}",
        "role": "user",
        "avatar": None
    })

# ========== 跨模块接口：情绪数据查询（可调用）==========

@app.get("/api/emotion/history")
async def get_emotion_history(userId: str = Query(...), limit: int = Query(10)):
    """获取情绪数据历史（供跨模块调用）"""
    # Demo版：返回模拟数据
    history = [
        {
            "id": i,
            "userId": userId,
            "score": 60 + i * 2,
            "tags": ["压力", "焦虑"],
            "createTime": datetime.now().isoformat()
        }
        for i in range(limit)
    ]
    return get_demo_response(history)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

