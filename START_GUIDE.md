# 项目启动指南

## 📋 项目结构

```
mentalHealthPlatform/
├── mental-health-frontend/    # 前端项目（Vue 3 + Vite）
└── mental-health-backend/     # 后端项目（FastAPI）
```

## 🚀 启动步骤

### 方式一：分别启动前端和后端（推荐）

#### 1. 启动前端服务

**在项目根目录 `D:\Ggit` 执行：**

```bash
# 方式1：使用根目录的快捷脚本
npm run dev

# 方式2：直接进入前端目录启动
cd mentalHealthPlatform/mental-health-frontend
npm install  # 如果还没安装依赖
npm run dev
```

前端服务将在 **http://localhost:63334** 启动

#### 2. 启动后端服务

**打开新的终端窗口，在项目根目录 `D:\Ggit` 执行：**

```bash
# 进入后端目录
cd mentalHealthPlatform/mental-health-backend

# 安装Python依赖（如果还没安装）
pip install -r requirements.txt

# 启动FastAPI服务
python main.py
# 或者使用uvicorn
uvicorn main:app --reload --port 8000
```

后端服务将在 **http://localhost:8000** 启动

**后端API文档：** http://localhost:8000/docs

### 方式二：仅启动前端（使用默认数据）

如果后端服务未启动，前端会自动使用内置的默认题库数据（包含90题心理健康自测量表），功能完全可用。

## ✅ 验证启动成功

### 前端验证
1. 打开浏览器访问：http://localhost:63334
2. 点击左侧导航栏的 **"解压服务"**
3. 点击 **"心理健康自测"**
4. 应该能看到3个题库：
   - 压力评估测试（5题）
   - 焦虑自评量表（7题）
   - **心理健康自测量表（90题）** ⭐

### 后端验证
1. 访问：http://localhost:8000/docs
2. 应该能看到FastAPI的交互式API文档
3. 测试接口：`GET /api/decompress/questionnaire/list?userId=demo_user_001`

## 📚 题库说明

### 90题心理健康自测量表

- **题目数量**：90题
- **预计时长**：20分钟
- **评分标准**：5级评分制
  - 完全没有（1分）
  - 有一点（2分）
  - 中等程度（3分）
  - 相当多（4分）
  - 非常多（5分）

- **评估维度**：基于SCL-90量表，涵盖9个心理健康维度
  - 躯体化
  - 强迫症状
  - 人际关系敏感
  - 抑郁
  - 焦虑
  - 敌对
  - 恐怖
  - 偏执
  - 精神病性

- **评估标准**：
  - 正常范围：总分 < 160
  - 轻度：160-200
  - 中度：200-250
  - 重度：> 250

## 🔧 常见问题

### 1. 前端显示"暂无题库"

**解决方案：**
- 检查浏览器控制台是否有错误
- 确认前端服务已正确启动（http://localhost:63334）
- 前端已内置默认题库数据，即使后端未启动也能显示

### 2. 后端启动失败

**检查项：**
- Python版本 >= 3.8
- 已安装所有依赖：`pip install -r requirements.txt`
- 端口8000未被占用

### 3. 跨域问题

后端已配置CORS，允许所有来源。如果仍有问题，检查：
- 后端服务是否正常运行
- 前端请求的API地址是否正确

## 📝 注意事项

1. **前端端口**：63334（可在 `mental-health-frontend/package.json` 中修改）
2. **后端端口**：8000（可在启动命令中修改）
3. **API地址**：前端默认请求 `/api`，会自动代理到后端
4. **用户ID**：Demo版默认使用 `demo_user_001`

## 🎯 快速测试

1. 启动前端：`npm run dev`
2. 访问：http://localhost:63334
3. 导航到：解压服务 → 心理健康自测
4. 选择"心理健康自测量表（90题）"
5. 开始答题测试

---

**提示**：如果后端未启动，前端会使用内置的默认题库数据，90题量表完全可用！

