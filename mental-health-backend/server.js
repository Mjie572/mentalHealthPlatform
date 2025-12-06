// Simple Express backend for login & register
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = process.env.PORT || 8000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const DATA_DIR = path.join(__dirname, 'data')
const USER_FILE = path.join(DATA_DIR, 'users.json')

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
if (!fs.existsSync(USER_FILE)) fs.writeFileSync(USER_FILE, '[]')

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }))
app.use(express.json())

const send = (res, code, data = null, message = 'ok') => {
  res.json({ code, data, message })
}

const loadUsers = () => {
  try {
    const raw = fs.readFileSync(USER_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

const saveUsers = (users) => {
  fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

const isEmail = (val) => /.+@.+\..+/.test(val)

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body || {}
  if (!username || !email || !password) return send(res, 400, null, '缺少必要参数')
  if (!isEmail(email)) return send(res, 400, null, '邮箱格式不正确')
  if (String(password).length < 6) return send(res, 400, null, '密码长度至少6位')

  const users = loadUsers()
  const exists = users.find(u => u.username.toLowerCase() === String(username).toLowerCase() || u.email.toLowerCase() === String(email).toLowerCase())
  if (exists) return send(res, 400, null, '用户名或邮箱已存在')

  const password_hash = await bcrypt.hash(String(password), 10)
  const user = {
    id: uuidv4(),
    username: String(username),
    email: String(email).toLowerCase(),
    password_hash,
    createdAt: new Date().toISOString()
  }
  users.push(user)
  saveUsers(users)

  const { id, username: un, email: em } = user
  return send(res, 200, { id, username: un, email: em }, '注册成功')
})

// Login
app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body || {}
  if (!usernameOrEmail || !password) return send(res, 400, null, '请输入用户名/邮箱和密码')

  const users = loadUsers()
  let user = null
  if (isEmail(usernameOrEmail)) {
    user = users.find(u => u.email.toLowerCase() === String(usernameOrEmail).toLowerCase())
  } else {
    user = users.find(u => u.username.toLowerCase() === String(usernameOrEmail).toLowerCase())
  }
  if (!user) return send(res, 401, null, '用户不存在或密码错误')

  const ok = await bcrypt.compare(String(password), user.password_hash)
  if (!ok) return send(res, 401, null, '用户不存在或密码错误')

  const token = jwt.sign({ uid: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  return send(res, 200, { token, user: { id: user.id, username: user.username, email: user.email } }, '登录成功')
})

// Me
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return send(res, 401, null, '未授权')
  const token = auth.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return send(res, 200, { id: payload.uid, username: payload.username, email: payload.email }, 'ok')
  } catch (e) {
    return send(res, 401, null, '未授权')
  }
})

app.get('/api/health', (req, res) => send(res, 200, { status: 'ok' }, 'healthy'))

// === Positive Empowerment Module (isolated) ===
require('dotenv').config({ path: path.join(__dirname, '.env') })
const positiveRoutes = require('./routes/positive')
app.use('/api', positiveRoutes)

app.listen(PORT, () => {
  console.log(`Auth backend running at http://localhost:${PORT}`)
})