const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'http://localhost/v1'
const DIFY_API_KEY = process.env.DIFY_API_KEY || ''

// === Diary storage helpers ===
const DATA_DIR = path.join(__dirname, '..', 'data')
const DIARIES_FILE = path.join(DATA_DIR, 'diaries.json')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
if (!fs.existsSync(DIARIES_FILE)) fs.writeFileSync(DIARIES_FILE, '[]')

const loadDiaries = () => {
  try {
    const raw = fs.readFileSync(DIARIES_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

const saveDiaries = (list) => {
  fs.writeFileSync(DIARIES_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

/**
 * POST /positive/content
 * Body: { "userMood": "用户输入的情绪/状态" }
 * Response: { code: 200, msg: 'success', data: { encourageText: '...' } }
 */
exports.postPositiveContent = async (req, res) => {
  try {
    const { userMood } = req.body || {}
    if (!userMood || !String(userMood).trim()) {
      return res.status(200).json({ code: 400, msg: '请输入日记内容或心情', data: null })
    }

    if (!DIFY_API_KEY) {
      return res.status(200).json({ code: 500, msg: 'Dify鉴权失败，请检查API Key', data: null })
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Accept': 'text/event-stream'
    }

    // 使用 Dify 流式模式 (SSE)
    const payload = {
      query: String(userMood),
      inputs: { user_statement: String(userMood) },
      response_mode: 'streaming',
      user: 'web-user'
    }

    const url = `${DIFY_BASE_URL}/chat-messages`
    const resp = await axios.post(url, payload, { headers, responseType: 'stream', timeout: 30000 })

    let answer = ''
    let finished = false
    let responded = false

    const stream = resp.data

    stream.on('data', (chunk) => {
      const dataStr = chunk.toString()
      dataStr.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) return
        const payloadStr = trimmed.slice('data:'.length).trim()
        if (!payloadStr || payloadStr === '[DONE]') return
        try {
          const json = JSON.parse(payloadStr)
          const event = json.event || json.type
          const evtData = json.data || json
          if (event === 'message' || event === 'agent_message' || event === 'message_replace') {
            if (typeof evtData.answer === 'string') answer += evtData.answer
            else if (typeof evtData.content === 'string') answer += evtData.content
            // 兼容 Dify Agent Chat App：从 message.content 段落中提取文本
            if (evtData.message && Array.isArray(evtData.message.content)) {
              for (const seg of evtData.message.content) {
                if (seg && seg.type === 'text' && typeof seg.text === 'string') {
                  answer += seg.text
                }
              }
            }
          }
          if (event === 'message_end' || event === 'tts_message_end') {
            if (evtData && typeof evtData.answer === 'string' && !answer) answer = evtData.answer
            finished = true
            tryRespond()
            try { stream.destroy() } catch (_) {}
          }
          if (event === 'error') {
            finished = true
            tryRespond()
            try { stream.destroy() } catch (_) {}
          }
        } catch (e) {
          // ignore parse errors for non-JSON data
        }
      })
    })

    const tryRespond = () => {
      if (responded) return
      responded = true
      if (finished && answer && String(answer).trim()) {
        return res.status(200).json({ code: 200, msg: 'success', data: { encourageText: String(answer).trim() } })
      }
      return res.status(200).json({ code: 500, msg: '鼓励语句生成失败，请稍后再试', data: null })
    }

    stream.on('end', tryRespond)
    stream.on('close', tryRespond)
    stream.on('error', (err) => {
      console.error('Dify stream error:', err?.message || err)
      tryRespond()
    })
  } catch (error) {
    const status = error?.response?.status
    const msg = error?.response?.data?.message || error.message
    if (status === 401) {
      return res.status(200).json({ code: 500, msg: 'Dify鉴权失败，请检查API Key', data: null })
    }
    if (status === 404) {
      return res.status(200).json({ code: 500, msg: 'Dify接口不可用，请检查基础 URL', data: null })
    }
    if (status === 400 && /Agent Chat App does not support blocking mode/i.test(msg || '')) {
      return res.status(200).json({ code: 500, msg: '当前 Dify 应用不支持阻塞模式，已切换为流式模式，请重试', data: null })
    }
    console.error('Dify error:', error?.response?.data || error.message)
    return res.status(200).json({ code: 500, msg: '鼓励语句生成失败，请稍后再试', data: null })
  }
}

/**
 * GET /positive/diary
 * Response: { code: 200, msg: 'success', data: Diary[] }
 */
exports.getDiaryList = (req, res) => {
  try {
    const list = loadDiaries()
    // 默认按 updatedAt desc 排序
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return res.status(200).json({ code: 200, msg: 'success', data: list })
  } catch (e) {
    return res.status(200).json({ code: 500, msg: '获取日记失败，请稍后再试', data: null })
  }
}

/**
 * POST /positive/diary
 * Body: { content: string, date?: string(YYYY-MM-DD) }
 */
exports.createDiary = (req, res) => {
  try {
    const { content, date } = req.body || {}
    if (!content || !String(content).trim()) {
      return res.status(200).json({ code: 400, msg: '请输入日记内容', data: null })
    }
    const list = loadDiaries()
    const now = new Date()
    const diary = {
      id: uuidv4(),
      content: String(content).trim(),
      date: date && String(date).trim() ? String(date).trim() : now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
    list.push(diary)
    saveDiaries(list)
    return res.status(200).json({ code: 200, msg: 'success', data: diary })
  } catch (e) {
    return res.status(200).json({ code: 500, msg: '创建日记失败，请稍后再试', data: null })
  }
}

/**
 * PUT /positive/diary/:id
 * Body: { content?: string, date?: string(YYYY-MM-DD) }
 */
exports.updateDiary = (req, res) => {
  try {
    const { id } = req.params || {}
    const { content, date } = req.body || {}
    if (!id) {
      return res.status(200).json({ code: 400, msg: '缺少日记ID', data: null })
    }
    const list = loadDiaries()
    const idx = list.findIndex(d => d.id === id)
    if (idx === -1) {
      return res.status(200).json({ code: 404, msg: '日记不存在', data: null })
    }
    const now = new Date().toISOString()
    if (typeof content === 'string') {
      list[idx].content = String(content).trim()
    }
    if (typeof date === 'string' && date.trim()) {
      list[idx].date = String(date).trim()
    }
    list[idx].updatedAt = now
    saveDiaries(list)
    return res.status(200).json({ code: 200, msg: 'success', data: list[idx] })
  } catch (e) {
    return res.status(200).json({ code: 500, msg: '更新日记失败，请稍后再试', data: null })
  }
}