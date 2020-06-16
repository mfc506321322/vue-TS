const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const webpack = require('webpack')
module.exports = {
  publicPath: '/',
  chainWebpack: (config) => {
    config.plugin('define').use(webpack.DefinePlugin, [{
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }])

    //直接干掉插件 prefetch
    config.plugins.delete('prefetch')

    // 目录
    config.resolve.alias.set('@static', resolve('public'))

    if(process.env.NODE_ENV === 'production'){
      config.optimization.minimize(true);
      // 分割代码
      config.optimization.splitChunks({
        chunks: "all",
        maxInitialRequests: 5,
        maxAsyncRequests: 5,
        minSize: 50000, // 依赖包超过20000bit将被单独打包
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace("@", "")}`;
            }
          }
        }
      })
    }
  },
  productionSourceMap:false,
  // devServer: {
  //   port:8080,
  //   proxy: {
  //     '/oauth': {
  //       target: 'http://10.38.64.79:8088/',
  //       changeOrigin: true
  //     },
  //     '/webApi': {
  //       target: 'http://api.yunfuw.dev2/api/yjf',
  //       changeOrigin: true
  //     }
  //   }
  // },
  lintOnSave: process.env.NODE_ENV !== 'production',
  css: {
    sourceMap: true,
    loaderOptions: {
      // sass: {
      //   data: `@import "@new/common/css/common.variable.scss";`
      // },
      postcss:{
        ident:'postcss',
        plugins: [
          require('autoprefixer')(),
        ]
      },
    }
  },
  configureWebpack: config => {
    if(process.env.NODE_ENV === 'production'){
      return {
        plugins: [
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css/,
            threshold: 10240,
            deleteOriginalAssets: false
          })
        ]
      }
    }
  },
}
