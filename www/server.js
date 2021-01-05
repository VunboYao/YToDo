const Url = require('url')
const Path = require('path')
const Fs = require('fs')
const Qs = require('querystring')
const MIME = require('./mime.json')
const User = require('../resource/userMenu')
const All = require('../resource/all.json')

async function Get(req, res) {
  // 解析请求中的pathName
  const urlObj = Url.parse(req.url, true)
  // 获取文件路径
  const pathName = urlObj.pathname

  // 登陆页面
  if (pathName === '/') {
    // ReadPage
    const filePath = Path.join(__dirname, '../page', 'login.html')
    await getMimeType(filePath, res)
    Fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err
      }
      res.end(data)
    })
  } else if (pathName.startsWith('/main')) {
    // 添加页面
    const filePath = Path.join(__dirname, '../page', 'main.html')
    await getMimeType(filePath, res)
    Fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err
      }
      res.end(data)
    })
  } else if (pathName.startsWith('/userList')) {
    res.writeHead(200, {
      'Content-Type': 'text/plain;charset=utf8'
    })
    res.end(JSON.stringify(User))
  } else {
    const filePath = Path.join(__dirname, '../page', pathName)
    await getMimeType(filePath, res)
    Fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(err)
        res.end('')
        return
      }
      res.end(data)
    })
  }
}


function Post(req, res) {
  let params = ''
  req.on('data', chunk => {
    params += chunk
  })
  req.on('end', async () => {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    const end = await WriteData(params)
    res.end(JSON.stringify(end))
  })
}

// 设置文件类型
function getMimeType(path, res) {
  return new Promise((resolve, reject) => {
    try {
      // 扩展名
      const extName = Path.extname(path)
      // 文件类型
      let mimeType = ''
      if (extName) {
        mimeType = MIME[extName]
        if (mimeType.startsWith('text')) {
          mimeType += ';charset=utf8'
        }
      } else {
        mimeType = 'text/plain;charset=utf8'
      }
      // 设置返回报文头信息
      res.writeHead(200, {
        'Content-Type': mimeType
      })
      resolve()
    } catch (e) {
      console.log(e)
      resolve()
    }
  })
}


// 写入数据
function WriteData(params) {
  return new Promise((resolve, reject) => {
    // 1.整体文件：日报记录
    if (typeof params === 'string') {
      params = JSON.parse(params)
    }
    // 2.文件路径
    const fileName = Path.join(__dirname, '../resource', params.date + '.txt')
    // 3.检测文件状态
    Fs.stat(fileName, (err, stats) => {
      // 新建文件
      if (err) {
        subWrite(params, fileName, resolve)
      }
      // 存量文件
      if (stats && stats.isFile()) {
        subWrite(params, fileName, resolve)
      }
    })
  })
}

function subWrite(params, fileName, resolve) {
  All[params.date] = params.content
  let allFilePath = Path.join(__dirname, '../resource/all.json')
  Fs.writeFileSync(allFilePath, JSON.stringify(All), 'utf8')
  let text = ''
  let ul = '全渠道前端日报：\n'
  let len = params.content.length
  // 数据拼接
  params.content.forEach((item, index) => {
    text += `${item.value}\n${item.content}\n\n`
    ul += `${index + 1}:${item.content}\n`
    if (index === len - 1) {
      text += ul
    }
  })

  // 数据写入
  Fs.writeFile(fileName, text, 'utf8', err => {
    if (err) {
      resolve({status: err})
    }
    resolve({status: 'success'})
  })
}

module.exports = {
  Get,
  Post
}
