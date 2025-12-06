# 如何获取 Dify API Key

## 方法一：在 Dify 工作台中获取

### 步骤 1：登录 Dify 平台
1. 打开你的 Dify 工作台（通常是 `http://localhost` 或你的 Dify 部署地址）
2. 使用你的账号登录

### 步骤 2：进入应用设置
1. 在工作台中找到你创建的**对话型应用**（Conversational Application）
2. 点击进入应用详情页面

### 步骤 3：查看 API 设置
1. 在应用详情页面，找到 **"API"** 或 **"设置"** 标签页
2. 点击进入 API 设置页面
3. 在 API 设置中，你会看到：
   - **API Key**：这是你需要的密钥
   - **Base URL**：通常是 `http://localhost/v1`（你已经配置好了）

### 步骤 4：复制 API Key
1. 找到 **API Key** 字段
2. 点击**复制**按钮或手动复制
3. API Key 通常格式为：
   - `app-xxxxx`（应用 API Key）
   - 或 `sk-xxxxx`（服务 API Key）

## 方法二：在 Dify 设置中获取

### 步骤 1：进入设置
1. 登录 Dify 工作台
2. 点击右上角的**用户头像**或**设置**图标
3. 选择 **"设置"** 或 **"API Keys"**

### 步骤 2：查看 API Keys
1. 在设置页面中找到 **"API Keys"** 或 **"API 密钥"** 部分
2. 你会看到已创建的 API Key 列表
3. 如果没有，点击 **"创建新的 API Key"** 按钮

### 步骤 3：创建或复制 API Key
1. 如果是新创建的，系统会显示一次完整的 API Key（**请立即复制保存**）
2. 如果是已存在的，点击**显示**或**复制**按钮

## 方法三：在应用发布设置中

### 步骤 1：进入应用
1. 在工作台中选择你的对话型应用
2. 进入应用详情

### 步骤 2：查看发布设置
1. 找到 **"发布"** 或 **"API"** 选项
2. 在发布设置中，通常会显示：
   - **API Endpoint**：`http://localhost/v1`
   - **API Key**：你的密钥

## 常见位置总结

根据 Dify 的界面，API Key 通常出现在以下位置：

1. **应用详情页** → **API** 标签页
2. **应用详情页** → **设置** → **API 设置**
3. **用户设置** → **API Keys**
4. **应用发布** → **API 配置**

## 重要提示

⚠️ **安全提醒**：
- API Key 是敏感信息，请妥善保管
- 不要将 API Key 提交到代码仓库
- 如果 API Key 泄露，请立即在 Dify 平台中重新生成

## 配置到项目中

获取到 API Key 后，在 `mental-health-backend/.env` 文件中配置：

```env
DIFY_API_BASE_URL=http://localhost/v1
DIFY_API_KEY=你复制的_API_Key（例如：app-abc123xyz）
PORT=3000
```

**注意**：只需要填写 API Key 本身，不需要 `Authorization: Bearer` 前缀。

## 如果找不到 API Key

如果按照以上步骤仍然找不到 API Key，可能是：

1. **Dify 版本不同**：不同版本的 Dify 界面可能略有不同
2. **权限问题**：确保你有查看 API Key 的权限
3. **需要创建**：某些情况下需要先创建 API Key

**建议**：
- 查看 Dify 的官方文档
- 或在 Dify 工作台中搜索 "API" 关键词
- 或联系 Dify 管理员



