import minimist from 'minimist';
import { Manager } from './client';
import { IpcDirection, IpcMethods, IPCRequest, MessageModel } from './types';

/**
 * 启动时 命令行传入进程ID
 * node xx.js --pid 8fs8df-23r9
 */
const argv = minimist(process.argv.slice(2));
const pid = argv.pid;
if(!!!pid) {
  console.error('cannot run standalone!');
  process.exit(-1);
}

// 只能使用 cp.fork 启动
if(!process.send) {
  console.error('cannot run standalone!');
  process.exit(-1);
}

const manager = new Manager();
process.on('message', (msg, handle) => {
  manager.handleMessage(msg, handle);
});

// 反馈父进程成功 父进程fork后，收到此信息则证明子进程启动成功
const r: IPCRequest = {
  method: IpcMethods.fork_process,
  direction: IpcDirection.to_frontend,
  connId: '',
  id: pid,
  model: MessageModel.process
}
process.send!(r);
