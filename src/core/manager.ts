import * as cp from 'child_process';
import * as path from 'path';
import {EventEmitter} from 'events';
import { nanoid } from 'nanoid';
import { Connection } from './connections';
import { Process } from './process';
import { Session } from './sessions';
import { operationReason, operationResult, HostInfo, IpcDirection, IpcMethods, IPCRequest, MessageModel, toIpcRequest, openShellOptions, changeSizeParams } from '@/client/types';

type resolveType = (v: string|PromiseLike<string>)=>void;

/**
 * 考虑由一个Manager管理一切
 * 1. 管理进程，可以fork进程
 * 1. 管理连接
 * 1. 管理会话
 * 
 * 模型：
 * 1. 进程，即 cp.ChildProcess 进程应该只是容器，所有进程都可以连接所有协议 同理，一个进程应该也能管理所有
 * 1. 连接，即 ssh2.Client
 * 1. 会话，即 ssh2.ClientChannel
**/
export class Manager {
  private processList: Process[] = [];
  private connList: Connection[] = [];
  private sessionList: Session[] = [];

  private addProcess(pid: string, c: cp.ChildProcess) {
    for(let item of this.processList) {
      if(item.pid === pid) {
        throw new Error(`pid: [${pid}] process exists!`);
      }
    }
    this.processList.push(new Process(pid, c));
  }

  // uint8Array 通过 node 的进程间管道发到对端时变样了 序列化为string吧
  public keyInput(sessionId: string, key: Uint8Array) {
    const s = this.indexSession(sessionId);
    const r:IPCRequest = {
      direction: IpcDirection.to_backend,
      method: IpcMethods.user_keypress,
      connId: s.cid,
      id: sessionId,
      model: MessageModel.session,
      content: {
        sessionId: sessionId,
        data: Buffer.from(key).toString('base64'),
      },
    }

    // TODO: 在rz/sz时需要流控
    const f = this.toChild(s.pid, r);
    if(!f) {
      console.error(`send to child key press event, queue full!`);
    }
  }

  private indexSession(sid: string): Session {
    const pos = this.sessionList.findIndex(i=>i.sid === sid);
    if(pos === -1) {
      throw new Error(`index session [${sid}] error!`);
    }

    return this.sessionList[pos];
  }

  // TODO: check params type.
  changeSize(args: changeSizeParams) {
    this.indexSession(args.sessionId).changeSize(args);
  }

  public async openShell(sessionId: string, opt: openShellOptions):Promise<operationResult> {
    const connId = opt.connectionId;
    const pos = this.connList.findIndex(i=>i.cid === connId);
    if(pos === -1) {
      console.error(`open shell but cannot found connection: [${connId}]`);
      return {
        err: 'cannot found process',
        code: operationReason.cannot_found_valid_process,
      }
    }
    const c = this.connList[pos];

    const sess = new Session(this);
    sess.sid = sessionId;
    sess.cid = connId;
    sess.pid = c.pid;
    this.sessionList.push(sess);

    const r:IPCRequest = {
      direction: IpcDirection.to_backend,
      method: IpcMethods.open_shell,
      connId: connId,
      id: connId,
      model: MessageModel.connection,
      content: opt,
    }
    const f = this.toChild(c.pid, r);
    if(!f) {
      return {
        code: operationReason.send_message_failed,
        err: "to child failed!",
      };
    }

    return new Promise((resolve, reject) => {
      c.on('open_shell', () => {
        resolve({
          code: operationReason.ok,
          err: "OK",
          content: sessionId,
        });
      });
    });
  }

  /**
   * 连接到目标 
   * 1. 首先生成一个connection对象 包含cid
   * 2. 找一个目标进程，发送请求
   * 3. 对应process.on(message) 收到连接事件时，拆解 cid ，激活connection对象的事件
   * @param host 连接目标信息
   */
  public async connect(connId: string, host: HostInfo):Promise<operationResult> {
    if(this.processList.length <= 0) {
      console.error('process list empty!');
      return {
        code: operationReason.cannot_found_valid_process,
        err: 'cannot found valid process'
      };
    }
    const p = this.processList[0];

    const pid = p.pid;
    const conn = new Connection(pid, connId, this);
    this.connList.push(conn);

    const r:IPCRequest = {
      direction: IpcDirection.to_backend,
      method: IpcMethods.connect_to_host,
      connId: connId,
      id: connId,
      model: MessageModel.connection,
      content: host,
    }
    const f = this.toChild(p.pid, r);
    if(!f) {
      return {
        code: operationReason.send_message_failed,
        err: "to child failed!",
      };
    }

    return new Promise((resolve, reject) => {
      conn.once('connect_to_host', () => {
        console.log('connected to host!');
        resolve({
          code: operationReason.ok,
          content: connId,
          err: 'OK',
        });
      });
      // conn.on('error')
      // conn.on('end')
      // conn.on('timeout')
    });
  }

  public toChild(pid: string, r: IPCRequest) {
    const pos = this.processList.findIndex(i=>i.pid === pid);
    if(pos === -1) {
      throw new Error(`index process [${pid}] error!`);
    }
    return this.processList[pos].handleEvent(r);
  }

  public releaseConnection(conId: string) {
    this.connList = this.connList.filter(i=>i.cid !== conId);
  }

  public releaseSession(sessionId: string) {
    this.sessionList = this.sessionList.filter(i=>i.sid !== sessionId);
  }

  public async fork(resolve: resolveType) {
    const pid = nanoid();
    let clientPath = "./dist/client.js";
    if(process.env.NODE_ENV === 'production') {
      clientPath = "../dist/client.js";
    }
    const vPath = path.join(__dirname, clientPath);
    const child = cp.fork(vPath, [`--pid=${pid}`], {
      env: {
        ELECTRON_RUN_AS_NODE: '1',
      }
    });

    // node 14.17 前，fork 完毕后就应该认定进程执行成功了
    this.addProcess(pid, child);

    // 子进程退出了 应执行大量清理工作
    // 删除 manager 内所有该进程的残留对象
    child.on('exit', (code, signal) => {
    });
    child.on('error', e=>{
      console.log('fork failed! error:');
      console.error(e);
      // ipcToBrowser('fork_process', {})
    });

    // 收到子进程的任何消息，都要转化为新的事件发出
    // 如子进程报告 收到shell 数据，则应根据shellId找到对应的会话，激活对应事件
    // 如子进程报告connection ready，则应根据 connectionId 找到对应 连接，激活对应事件
    child.on('message', (message: unknown, sendHandle: unknown) => {
      const msg = toIpcRequest(message);
      if(!msg) {
        console.error('message check failed!');
        return;
      }
      // 如果收到子进程fork成功的通知
      if(msg.method === IpcMethods.fork_process) {
        console.log('fork succeed!');
        resolve(pid);
        return;
      }

      if(msg.direction !== IpcDirection.to_frontend) {
        console.error(`direction [${msg.direction}] not match DIRECTION_TO_BACKEND`);
        return;
      }
    
      // 这里需要调整 只需要取出 tabId or connId，再分发即可，忽略 methods
      const modelId = msg.id;
      const evtName = IpcMethods[msg.method];
      // item.emit(evtName, msg.content);
      const emit = (v: EventEmitter) => {
        v.emit(evtName, msg.content);
      }
      // console.log(`core recv event: [${evtName}], to: [${msg.model}, ${msg.id}]`);
      if(msg.model === MessageModel.connection) {
        this.connList.filter(i=>i.cid === modelId).forEach(emit);
      } else if(msg.model === MessageModel.process) {
        this.processList.filter(i=>i.pid === modelId).forEach(emit);
      } else if(msg.model === MessageModel.session) {
        this.sessionList.filter(i=>i.sid === modelId).forEach(emit);
      } else {
        console.error(`unknown message model:[${msg.model}]`);
      }
    });
    return pid;
  }
}


export default new Manager();
