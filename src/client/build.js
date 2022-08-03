const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// 先构建校验器
const tjs = require("typescript-json-schema")
const app = tjs.getProgramFromFiles( [ path.resolve("./types.ts")], { strictNullChecks: true}, "./");
const schema = tjs.generateSchema(app, "IPCRequest", {required: true});
fs.writeFileSync("./schema.json", JSON.stringify(schema), {encoding: 'utf-8'});

const build_mode = process.env.NODE_ENV || 'production';
console.log(`build client [${build_mode}]`);
// 编译输出
webpack({
  entry: path.join(__dirname, 'index.ts'),
  output: {
    path: path.join(__dirname, '../../dist_electron/dist'),
    filename: 'client.js',
  },
  mode: build_mode,
  target: 'node',
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ]
  },  
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.join(__dirname, 'src'),
    }
  }  
}, (err, stats) => {
  if(err || stats.hasErrors()) {
    if(err) {
      console.log(err);
    }
    if(stats.hasErrors()) {
      console.log();
      for(let e of stats.compilation.errors) {
        console.log(e);
      }
    }
  }
});
