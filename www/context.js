// 处理get/post
const server = require('./server.js')

// 接口处理
function ServerContext(req, res) {
  const method = req.method.toLowerCase()
  // get
  if (method === 'get') {
    server.Get(req,res)
  } else {
    server.Post(req, res)
  }
}


module.exports = {
  ServerContext
}
