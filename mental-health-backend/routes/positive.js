const express = require('express')
const router = express.Router()
const { postPositiveContent, getDiaryList, createDiary, updateDiary } = require('../controllers/positiveController')

// 仅本模块：积极赋能内容生成
router.post('/positive/content', postPositiveContent)

// 感恩日记：列表/创建/更新
router.get('/positive/diary', getDiaryList)
router.post('/positive/diary', createDiary)
router.put('/positive/diary/:id', updateDiary)

module.exports = router