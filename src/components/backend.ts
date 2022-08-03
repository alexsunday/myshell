// SHELL 后端

import { closedMsgType, HostInfo, HostType, IpcMethodName, MessageModel, openShellOptions, shellDataType } from "@/client/types";
import { IpcRendererEvent } from "electron";

export interface ShellBackend {
  keyInput(v: Uint8Array): void;
}

const toArrayBuffer = (hex: string)=>{
  const r = hex.match(/[\da-f]{2}/gi);
  if(!r) {
    return null;
  }
  return new Uint8Array(r.map(function (h) {
    return parseInt(h, 16)
  })).buffer;
}

const ab2String = (a: Uint8Array) => {
  return new TextDecoder("utf-8").decode(a.buffer);
}

export class ShellDataEvent extends Event {
  data: number[];
  constructor(t: string, d: number[]) {
    super(t);
    this.data = d;
  }
}

export class ConnectionEvent extends Event {
  data: any;
  channel = "";

  constructor(t: string, data: any, channel?: string) {
    super(t);
    this.data = data;
    if(channel) {
      this.channel = channel;
    }
  }
}

export class SessionEvent extends Event {
  data: string;
  channel = "";

  constructor(t: string, data: string, channel?: string) {
    super(t);
    this.data = data;
    if(channel) {
      this.channel = channel;
    }
  }
}

export function sendToBackground(channel: string, args: any) {
  console.log(`send to background: [${channel}], [{${args}}]`);
  return window.eapi.sendMessage(channel, args);
}

export function requestToBackground(channel: IpcMethodName, args: any) {
  console.log(`send to background: [${channel}], [{${args}}]`);
  return window.eapi.sendMessage(channel, args);
}

export class SSHBackend extends EventTarget implements ShellBackend {
  private id: string;

  constructor(sessionId: string) {
    super();
    this.id = sessionId;
  }
  
  keyInput(data: Uint8Array): void {
    window.eapi.keyInput(this.id, data);
  }

  get sessionId() {
    return this.id;
  }
}

export class SSHConnection extends EventTarget {
  private id: string;

  constructor(connectionId: string) {
    super();
    this.id = connectionId;
  }

  get connectionId() {
    return this.id;
  }
}

export class SessionManager {
  private sessions: SSHBackend[] = [];
  private connections: SSHConnection[] = [];

  constructor() {
    window.eapi.onEvent('recv_shell_data', (evt, args) => {
      this.handleRecvShellData(evt, args);
    });
    window.eapi.onEvent('keyboard_interactive', (evt, args) => {
      this.handleKeyboardInteractive(evt, args);
    });
    window.eapi.onEvent('connection_ready', (evt, args) => {
      this.handleConnectionReady(evt, args);
    });
    window.eapi.onEvent('closed_event', (evt, args) => {
      this.handleClosedEvent(args);
    });
  }

  handleClosedEvent(r: closedMsgType) {
    if(r.model === MessageModel.connection) {
      this.handleConnectionClosed(r.id);
    } else if(r.model === MessageModel.session) {
      this.handleSessionClosed(r.id);
    }
  }

  handleSessionClosed(sid: string) {
    this.indexSession(sid).dispatchEvent(new SessionEvent('closed', sid));
  }

  handleConnectionClosed(cid: string) {
    this.indexConnection(cid).dispatchEvent(new ConnectionEvent('closed', cid));
  }

  indexConnection(cid: string) {
    const pos = this.connections.findIndex(i=>i.connectionId === cid);
    if(pos === -1) {
      throw new Error('indexConnection failed!');
    }
    return this.connections[pos];
  }

  indexSession(sid: string) {
    const pos = this.sessions.findIndex(i=>i.sessionId === sid);
    if(pos === -1) {
      throw new Error('indexSession failed!');
    }
    return this.sessions[pos];
  }

  handleConnectionReady(arg0: IpcRendererEvent, args: any) {
    type connReadyType = {
      connectionId: string;
      data: any;
    }
    const d: connReadyType = args;
    const pos = this.connections.findIndex(i=>i.connectionId === d.connectionId);
    if(pos === -1) {
      console.error(`cannot found valid connection: [${d.connectionId}]`);
      return;
    }
    const b = this.connections[pos];
    const e = new ConnectionEvent("connection_ready", d.data);
    b.dispatchEvent(e);
  }

  handleKeyboardInteractive(arg0: IpcRendererEvent, args: any) {
    console.log(args);
    type keyboardDataType = {
      connectionId: string;
      data: any;
      evtName: string;
    }
    // TODO: 类型检查
    const d: keyboardDataType = args;
    const pos = this.connections.findIndex(i=>i.connectionId === d.connectionId);
    if(pos === -1) {
      console.error(`cannot found valid connection: [${d.connectionId}]`);
      return;
    }
    const b = this.connections[pos];
    const e = new ConnectionEvent("keyboard_interactive", d.data, d.evtName);
    b.dispatchEvent(e);
  }

  handleRecvShellData(arg0: IpcRendererEvent, args: any) {
    // TODO: 类型检查
    const d: shellDataType = args;
    const pos = this.sessions.findIndex(i=>i.sessionId === d.sessionId);
    if(pos === -1) {
      console.error(`cannot found valid ssh backend: [${d.sessionId}]`);
      return;
    }
    const b = this.sessions[pos];
    // Buffer 类 从 子进程 到 主进程 再到渲染进程，就变成这个鬼样子了
    // const array = new Uint8Array((d.data as any).data);
    const e = new ShellDataEvent("recv_shell_data", (d.data as any).data);
    b.dispatchEvent(e);
  }

  addSession(c: SSHBackend) {
    this.sessions.push(c);
  }

  addConnection(c: SSHConnection) {
    this.connections.push(c);
  }

  static connect(connectionId: string, host: HostInfo) {
    return window.eapi.connect(connectionId, host);
  }

  static openShell(sessionId: string, opt: openShellOptions) {
    return window.eapi.openShell(sessionId, opt);
  }
}

const manager = new SessionManager();

export {manager};
