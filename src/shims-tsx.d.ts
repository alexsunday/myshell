import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

import {HostInfo, operationResult, openShellOptions} from '@/client/types';
import {IpcRendererEvent} from 'electron';

type EAPI = {
  // 返回 processId
  async fork(): Promise<string>;
  // 返回 connectionId
  async connect(connectionId: string, host: HostInfo):Promise<operationResult>;
  // 传入 connectionId，返回 sessionId
  async openShell(sessionId: string, opts: openShellOptions): Promise<operationResult>;
  // 任意数据发送
  sendMessage(channel: string, args: any):void;

  keyInput(sessionId: string, data: Uint8Array):void;
  onEvent(channel: string, cb: (event: IpcRendererEvent, ...args: any[]) => void):void;
  onceEvent(channel: string, cb: (event: IpcRendererEvent, ...args: any[]) => void):void;

  // file manager
  async loadAll(): Promise<HostInfo[]>;
  async addFile(host: HostInfo): Promise<void>;
  async saveFile(host: HostInfo):Promise<void>;
  async delFile(hostId: string): Promise<void>;

  // zmodem
  async recvFile(name: string, content: Uint8Array): Promise<boolean>;

  // system
  quit(code?: number):void;
  minimize():void;
}

declare global {
  interface Window {
    eapi: EAPI;
  }
}
