import { closedMsgType, IpcDirection, IpcMethodName, IpcMethods, IPCRequest, MessageModel, openShellOptions, ServerMessage, serverMsgType, shellDataType } from '@/client/types';
import {EventEmitter} from 'events';
import { Manager } from './manager';
import { ipcToBrowser, toBrowser } from './utils';

// 会话，封装 ssh2.ClientChannel 

export class Session extends EventEmitter {
  sid = "";
  cid = "";
  pid = "";
  manager: Manager;

  constructor(m: Manager) {
    super();
    this.manager = m;

    // TODO: 需要检查类型
    this.on('recv_shell_data', (msg: Uint8Array) => {
      this.recvShellData(msg);
    });
    this.on('server_message', args=>{
      this.onServerMsg(args);
    });
  }

  onServerMsg(r: any) {
    // TODO: check type.
    const args: serverMsgType = r;
    switch(args.type) {
      case ServerMessage.closed:
        const req:closedMsgType = {
          model: MessageModel.session,
          id: this.sid,
          reason: 'closed',
        }
        toBrowser('closed_event', req);
        this.manager.releaseSession(this.sid);
        break;
      case ServerMessage.error:
        break;
      default:
        break;
    }
  }

  override on(eventName: IpcMethodName, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  // send to browser
  recvShellData(data: Uint8Array) {
    const d: shellDataType = {
      sessionId: this.sid,
      data: data,
    }
    return toBrowser('recv_shell_data', d);
  }

  // change size
  changeSize(args: openShellOptions) {
    const r:IPCRequest = {
      direction: IpcDirection.to_backend,
      method: IpcMethods.size_change,
      connId: this.cid,
      id: this.sid,
      model: MessageModel.session,
      content: args,
    }
    const f = this.manager.toChild(this.pid, r);
    if(!f) {
      console.error(`send to child changeSize queue full!`);
    }
  }
}
