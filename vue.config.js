const { defineConfig } = require('@vue/cli-service');
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.ts',
      customFileProtocol: './',
      chainWebpackMainProcess: config => {
        config.module
          .rule('babel')
          .exclude
            .add(path.resolve('node_modules'))
            .add(path.resolve('src/client/schema.json'))
            .end()
          .before('ts')
          .use('babel')
          .loader('babel-loader')
          .options({
            presets: [['@babel/preset-env', { modules: false }]],
            plugins: ['@babel/plugin-proposal-class-properties'],
          })
      },
      builderOptions: {
        productName: "shell2",
        extraResources: [
          {
            from: "dist_electron/dist",
            to: "dist",
            filter: ["**/*"],
          }
        ]
      }
    }
  }
})
