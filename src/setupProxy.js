const { createProxyMiddleware } = require('http-proxy-middleware');

function proxy(target, pathRewrite) {
  const config = {
    target,
    changeOrigin: true,
    logLevel: 'debug'
  }
  if (pathRewrite) {
    config.pathRewrite = (path, req) => {
      if (typeof pathRewrite === 'string') {
        return path.replace(pathRewrite, '')
      } else {
        pathRewrite.forEach(item => {
          path = path.replace(item, '')
        })
        return path
      }
    }
  }

  return createProxyMiddleware(config)
}

module.exports = function (app) {

  app.use(
    '/public/**',
    // proxy('https://44.39.19.14')
    // proxy('http://44.39.19.14')
    // proxy('http://44.39.17.48')
    proxy('http://172.16.6.128:9587')
  )

  app.use(
    [
      '/gb28181',
      '/archive/**',
      '/file/**',
      '/admin/**',
      '/alarm/**',
      '/analyze/**',
      '/recognition/**',
      '/ship/**',
      '/commander/**',
      '/play/**',
      '/auth/**',
      '/system/**',
      '/search/**',
      '/logs/**',
      '/gb28181/**',
      '/api/**',
      '/graph/**',
      '/wsapi/**'
    ],
    // proxy('https://44.39.19.14/prod-api')
    // proxy('http://44.39.19.14/prod-api')
    // proxy('http://44.39.17.48/prod-api')
    proxy('http://172.16.6.128:9587/prod-api')
  )

};
