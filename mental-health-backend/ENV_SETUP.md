# 环境变量配置说明

## 重要提示

由于安全限制，`.env` 文件无法自动创建。请按照以下步骤手动创建：

## 配置步骤

### 1. 创建 .env 文件

在 `mental-health-backend` 目录下创建 `.env` 文件：

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### 2. 配置环境变量

将以下内容复制到 `.env` 文件中，并替换为真实的 Dify API Key：

```env
# Dify API 配置
DIFY_API_BASE_URL=http://localhost/v1
DIFY_API_KEY=your_real_dify_api_key_here

# 服务器配置
PORT=3000
```

### 3. 替换 API Key

**重要**: 请将 `your_real_dify_api_key_here` 替换为真实的 Dify API Key。

## 环境变量说明

| 变量名 | 说明 | 示例值 | 是否必需 |
|--------|------|--------|----------|
| `DIFY_API_BASE_URL` | Dify API 基础 URL | `http://localhost/v1` | 是 |
| `DIFY_API_KEY` | Dify API 认证密钥 | `app-xxxxx` | 是 |
| `PORT` | 服务器端口 | `3000` | 否（默认 3000） |

## 验证配置

启动服务器后，控制台会显示环境变量检查结果：

```
环境变量检查:
  - DIFY_API_BASE_URL: http://localhost/v1
  - DIFY_API_KEY: 已设置
```

如果显示 "未设置"，请检查 `.env` 文件是否正确创建和配置。

## 安全提示

⚠️ **重要**: `.env` 文件已添加到 `.gitignore`，请勿提交到版本控制系统。

