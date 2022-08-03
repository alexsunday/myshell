import { AuthenticationType, Client, ClientChannel, NextAuthHandler, VerifyCallback } from 'ssh2';
import { EventEmitter } from 'events';
import { changeSizeParams, HostInfo, HostType, IpcDirection, IpcMethodName, IpcMethods, IPCRequest, MessageModel, openShellOptions, operationReason, operationResult, ServerMessage, serverMsgType, toIpcRequest } from './types';
import { InterByteTimeoutParser } from './timeout-transfer';
import { Readable, Writable } from 'stream';

const ipcSend = (m: IPCRequest, callback?: (error: Error | null) => void) => {
  if (!process.send) {
    throw new Error('run standalone????? cannot reach here!');
  }
  return process.send!(m, callback);
}

export class SSHChannel extends EventEmitter {
  private channel: ClientChannel;
  private connectionId;
  private sessionId;
  public writer: Writable = new Writable();
  public reader: Readable = new Readable();

  constructor(c: ClientChannel, sessionId: string, connectionId: string) {
    super();
    this.channel = c;
    this.channel.on('close', () => {
      console.log('session closed!');
      this.serverMsg(ServerMessage.closed, null);
      this.emit('close', this.sessionId);
    });

    this.sessionId = sessionId;
    this.connectionId = connectionId;
    // 这个 reader 是从父进程收到 按键消息的 reader，会将按键消息转换为 Buffer Reader
    // 空实现即可 收到 keyEvent 时，会通过 reader.push 推送数据
    this.reader._read = ()=>{};
    this.reader.pipe(new InterByteTimeoutParser({interval: 0})).pipe(this.channel);
    // writer 为数据写入，将ssh协议收到的数据，转换为发往父进程的消息
    this.writer._write = (data, enc, next) => {
      this.sessionMsg(IpcMethods.recv_shell_data, data, err => {
        if(err) {
          console.error(`session message failed`);
          console.error(err);
          // 这里是应该直接 return 还是？
          return;
        }
        next();
      });
    }
    this.channel.pipe(new InterByteTimeoutParser({interval: 0})).pipe(this.writer);
  }

  serverMsg(msgType: ServerMessage, data: any) {
    const args: serverMsgType = {
      type: msgType,
      data: data,
    };
    return this.sessionMsg(IpcMethods.server_message, args);
  }

  sessionMsg(method: IpcMethods, content: any, callback?: (error: Error | null) => void) {
    const r: IPCRequest = {
      method: method,
      connId: this.connectionId,
      model: MessageModel.session,
      id: this.sessionId,
      direction: IpcDirection.to_frontend,
      content: content,
    }
    return ipcSend(r, callback);
  }

  setWindow(rows: number, cols: number, height: number, width: number): void {
    // 应该是 xterm.js 的 declare script 文件有误，这里应该是number型
    return this.channel.setWindow(rows.toString(), cols.toString(), height.toString(), width.toString());
  }
}

export class SSHConnection extends EventEmitter {
  private id = "";
  private conn: Client;
  private connReady = false;
  // TODO: 所有操作channels 的地方，也要操作 readers 建议整合
  private channels: Map<string, SSHChannel> = new Map();

  connectionMsg(method: IpcMethods, content: any) {
    const r: IPCRequest = {
      method: method,
      connId: this.id,
      model: MessageModel.connection,
      id: this.id,
      direction: IpcDirection.to_frontend,
      content: content,
    }
    return ipcSend(r);
  }

  serverMsg(msgType: ServerMessage, data: any) {
    const args: serverMsgType = {
      type: msgType,
      data: data,
    };
    return this.connectionMsg(IpcMethods.server_message, args);
  }

  constructor(id: string) {
    super();
    this.id = id;
    const conn = this.conn = new Client();
    conn.on('connect', () => {
      console.log('client report connected succeed!');
      return this.connectionMsg(IpcMethods.connect_to_host, 'connected');
    });
    conn.on('ready', () => {
      console.error('connection ready!');
      this.connReady = true;
      return this.connectionMsg(IpcMethods.connection_ready, 'connection ready');
    });
    conn.on('banner', msg => {
      console.log(`recv banner: [${msg}]`);
      return this.serverMsg(ServerMessage.banner, msg);
    });
    conn.on('greeting', msg => {
      console.log(`recv greeting: [${msg}]`);
      return this.serverMsg(ServerMessage.greeting, msg);
    });
    conn.on('timeout', () => {
      console.error(`timeout!`);
      return this.serverMsg(ServerMessage.timeout, null);
    });
    conn.on('handshake', items => {
      console.log(`handshake request!`);
    });
    conn.on('close', () => {
      console.log(`connection close!`)
      this.serverMsg(ServerMessage.closed, null);
    })
    conn.on('end', () => {
      console.log(`connection end!`);
      this.connReady = false;
    });
    conn.on('error', e => {
      console.log(`error: [${e}]`);
      console.log(e.message);
      console.log(e.stack);
      return this.serverMsg(ServerMessage.error, e);
    });

    conn.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
      console.log('keyboard interactive.');
      console.log(`name: [${name}], instructions: [${instructions}], lang: [${lang}]`);
      prompts.forEach(item => {
        console.log(`prompt: [${item.prompt}], echo: [${item.echo}]`);
      });

      this.connectionMsg(IpcMethods.keyboard_interactive, {
        name,
        instructions,
        lang,
        prompts,
      });
      this.once('keyboard_interactive', msg => {
        console.log('recv keyboard interactive response');
        // TODO: check arguments type
        const result: operationResult = msg;
        if (result.code === operationReason.ok && !!result.content) {
          finish([result.content]);
        }
      });
    });

    // this connection event
    // TODO: 检查 参数合法性
    this.on('open_shell', (opt: openShellOptions) => {
      this.openShell(opt);
    });
    this.on('user_keypress', (d: { data: string, sessionId: string }) => {
      this.userKeyPress(d);
    });
    this.on('size_change', args => {
      this.termSizeChange(args);
    });
  }

  // TODO: type check.
  termSizeChange(args: changeSizeParams) {
    const c = this.channels.get(args.sessionId);
    if (!c) {
      console.error(`cannot found session [${args.sessionId}]`);
      return;
    }
    c.setWindow(args.rows, args.cols, args.height, args.width);
  }

  userKeyPress(d: { data: string, sessionId: string }) {
    const c = this.channels.get(d.sessionId);
    if (!c) {
      console.error(`cannot found valid channel: [${d.sessionId}]`);
      return;
    }

    const buf = Buffer.from(d.data, 'base64');
    return c.reader.push(buf);
  }

  override on(evtName: IpcMethodName, listener: (...args: any[]) => void): this {
    return super.on(evtName, listener);
  }

  override once(evtName: IpcMethodName, listener: (...args: any[]) => void): this {
    return super.once(evtName, listener);
  }

  openShell(opt: openShellOptions) {
    const sessionId = opt.sessionId;
    if (!this.connReady) {
      console.log(`connection not ready!`);
      const result: operationResult = {
        err: 'connection not ready!',
        code: operationReason.open_shell_connection_not_ready,
      }
      return this.connectionMsg(IpcMethods.open_shell, result);
    }
    if (this.channels.has(sessionId)) {
      console.log(`sessionId exists!!`);
      const result: operationResult = {
        err: 'sessionId exists!',
        code: operationReason.session_id_duplicated,
      }
      return this.connectionMsg(IpcMethods.open_shell, result);
    }
    this.conn.shell({
      height: opt.height,
      width: opt.width,
      rows: opt.rows,
      cols: opt.cols,
    }, (err, stream) => {
      if (err) {
        const result: operationResult = {
          err: `${err.name} ${err.message}`,
          code: operationReason.open_shell_failed,
        }
        return this.connectionMsg(IpcMethods.open_shell, result);
      }

      // open shell succeed.
      const result: operationResult = {
        code: operationReason.ok,
        err: 'OK',
        content: sessionId,
      }
      this.connectionMsg(IpcMethods.open_shell, result);

      // add to map
      const channel = new SSHChannel(stream, sessionId, this.id);
      channel.on('close', ()=>{
        this.sessionClosed(sessionId);
      });
      this.channels.set(sessionId, channel);
    });
  }

  // 会话关闭 如果是最后一个会话，则链接也要关闭
  sessionClosed(sessionId: string) {
    const r = this.channels.get(sessionId);
    if(r) {
      // 关闭流
      r.reader.push(null);
      r.writer.end();
    }
    this.channels.delete(sessionId);
    if(this.channels.size === 0) {
      this.conn.end();
    }
  }

  hostVerifier(key: Buffer, verify: VerifyCallback) {
    console.log('foot print', key.toString('hex'));
    // 1. send to core
    this.connectionMsg(IpcMethods.footprint_verify, key.toString('hex'));
    // 2. wait once message
    this.once('footprint_verify', evt => {
      //
    });
  }

  authHandler(authsLeft: AuthenticationType[], partialSuccess: boolean, next: NextAuthHandler) {
    //
  }

  // TODO: 得想办法校验一下此值的合法性
  connect(hostInfo: HostInfo) {
    if (hostInfo.hType != HostType.ssh) {
      console.error(`only support ssh now!`);
      return;
    }
    if (!hostInfo.info) {
      console.error(`ssh host info empty!`);
      return;
    }
    const dst = hostInfo.info;
    this.conn.connect({
      host: dst.host,
      port: dst.port,
      username: dst.userName,
      password: dst.password,
      tryKeyboard: true,
      // hostVerifier: (key: Buffer, verify: VerifyCallback) => {
      //   return this.hostVerifier(key, verify);
      // },
      // authHandler: (methodsLeft, partialSuccess, callback) => {
      //   return this.authHandler(methodsLeft, partialSuccess, callback);
      // },
      ident: 'my-ssh-v0.1',
    });
  }
}

export class Manager {
  // 等需要支持其他连接时扩展 value 类型吧
  connLists: Map<string, SSHConnection> = new Map();

  /*
  MessageDispatcher 接收来自父进程 IPC 通道的数据，收到后
  1. 数据合法性检查 valid 验证
  2. 根据 connectionId 找到对应连接，并透传事件
  2. 收到的数据还要检查方向 direction
  2. 根据数据类型进行分发
  */
  handleMessage(message: unknown, sendHandle: unknown) {
    const msg = toIpcRequest(message);
    if (!msg) {
      console.error('message check failed!');
      return;
    }
    if (!!!msg.connId) {
      console.error(`connId empty!`);
      return;
    }
    if (msg.direction !== IpcDirection.to_backend) {
      console.error(`direction [${msg.direction}] not match DIRECTION_TO_BACKEND`);
      return;
    }

    // 先拦截一些发给进程的信息
    if (msg.method === IpcMethods.connect_to_host) {
      // 连接到后端，直接新生成 TermConnection 对象，并转发
      if (msg.id && this.connLists.has(msg.id)) {
        console.error(`connection exists! [${msg.id}]`);
        return
      }
      const newConn = new SSHConnection(msg.id);
      this.connLists.set(msg.id, newConn);
      // 直接返回
      return newConn.connect(msg.content);
    }
    // console.log(`finding connection with: [${msg.connId}]`);

    // 余下的直接都发给连接客户端
    const c = this.connLists.get(msg.connId);
    if (!c) {
      console.error(`cannot found special connection: [${msg.connId}]`);
      return;
    }
    const evtName = IpcMethods[msg.method];
    // console.log(`evtName: [${evtName}]`);
    c.emit(evtName, msg.content);
  }
}
