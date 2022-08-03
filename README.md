# myshell

有一个基于 Electron 的 shell 工具，技术栈 `electron/typescript/vue/xterm.js` 

为什么不是 [Electerm](https://github.com/electerm/electerm) ： 太卡了，这个实现实在是太卡了

为什么不是 [Tabby](https://github.com/Eugeny/tabby) ：似乎无法登入启用了二次认证的服务器

## dev
```bash
yarn install
yarn as
```

## build
`yarn electron:build`

# TODO
1. [ ] 公钥认证功能
1. [ ] 密钥管理器
1. [ ] 全屏功能 大屏时似乎卡顿
1. [ ] 加入 iterm 多主题可选 选主题功能要设计好 不能下拉直接选 要预览
1. [ ] build模式icon图标
1. [ ] 服务器未开启时 链接无响应 且报错
1. [ ] 进程间IPC, ssh2 的 c.write , xterm.js 的写入 应考虑流控、合并发送等
1. [ ] 考虑加入 OTP 快捷认证
1. [ ] 标签页应能快捷关闭
1. [ ] 多标签 连接复用/会话克隆
1. [ ] 标签页 美化 参考 chrome-tabs
1. [ ] 子进程的很多其他事件 如 closed ，disconnected 等也要处理
1. [ ] 各种错误 边界情况 处理
1. [ ] 加入文件/会话管理器 密码/密钥考虑要能延后输入
1. [ ] 加入自动指令功能 可自动登录跳板机 等
1. [ ] 加入 keepAlive 与指令保活功能
1. [ ] 把自动更新加上，再找一些用户?
1. [ ] UE/UI 设计
1. [ ] 切换tab时 应默认激活终端选中
1. [√] 文字大小可调整
1. [√] 窗口标题 应能随事件更新
1. [√] 窗口尺寸 变更时会出bug
1. [√] zmodem rz/sz 上传下载功能
