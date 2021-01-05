// 1.内置模块http
const Http = require('http')

// 2.基础公共配置
const config = require('./www/config')
// 3.请求处理
const context = require('./www/context')

// 4.服务开启
Http.createServer((req,res) => {
  // 处理请求
  context.ServerContext(req, res)
}).listen(config.port, () => {
  // listening Port:2021
  console.log(`Server is running in http://${config.hostname}:${config.port}`);
})
