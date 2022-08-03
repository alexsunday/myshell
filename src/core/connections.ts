import { closedMsgType, IpcDirection, IpcMethodName, IpcMethods, IPCRequest, MessageModel, operationResult, ServerMessage, serverMsgType } from '@/client/types';
import { IpcMainEvent } from 'electron';
import {EventEmitter} from 'events';
import { nanoid } from 'nanoid';
import type{ Manager } from './manager';
import { ipcMainOnceEvent, ipcToBrowser, toBrowser } from './utils';

// 连接 封装 ssh2.Client 或其他类型的 TCP/Serial 连接等

export class Connection extends EventEmitter {
  cid = "";
  pid = "";
  manager: Manager;

  constructor(pid: string, cid: string, manager: Manager) {
    super();
    this.pid = pid;
    this.cid = cid;
    this.manager = manager;

    // keyboard interactive
    this.on('keyboard_interactive', args=>{
      return this.handleKeyboardInteractive(args);
    });
    this.on('connection_ready', args=>{
      return this.handleConnectionReady(args);
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
          model: MessageModel.connection,
          id: this.cid,
          reason: 'closed',
        }
        toBrowser('closed_event', req);
        this.manager.releaseConnection(this.cid);
        break;
      case ServerMessage.error:
        break;
      case ServerMessage.timeout:
        break;
      case ServerMessage.banner:
        break;
      case ServerMessage.greeting:
        break;
      default:
        break;
    }
  }

  handleConnectionReady(args: any): void {
    toBrowser('connection_ready', {
      connectionId: this.cid,
      data: args,
    });
  }

  private handleKeyboardInteractive(args: any) {
    const evtId = nanoid();
    const evtName = `keyboard_interactive-${evtId}`;
    ipcToBrowser('keyboard_interactive', {
      connectionId: this.cid,
      data: args,
      evtName: evtName,
    });
    ipcMainOnceEvent(evtName, (event: IpcMainEvent, rsp: any) => {
      // TODO: check args type
      const args: operationResult = rsp;
      const r:IPCRequest = {
        direction: IpcDirection.to_backend,
        method: IpcMethods.keyboard_interactive,
        connId: this.cid,
        id: this.cid,
        model: MessageModel.connection,
        content: args,
      }
      const f = this.manager.toChild(this.pid, r);
      if(!f) {
        console.error(`send to child keyboard_interactive queue full!`);
      }
    });
  }

  override on(eventName: IpcMethodName, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }
}
