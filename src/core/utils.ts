import { IpcDirection, IpcMethodName, IpcMethods, IPCRequest, MessageModel } from '@/client/types';
import * as cp from 'child_process';
import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';

// 统一的入口 用于配置一些 一次性事件捕获
export function ipcMainOnceEvent(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
  return ipcMain.once(channel, listener)
}

export function toBrowser(channel: string, msg: any) {
  const wnds = BrowserWindow.getAllWindows();
  wnds.forEach(wnd=>{
    wnd.webContents.send(channel, msg);
  });
}

export function ipcToBrowser(c: IpcMethodName, msg: any) {
  return toBrowser(c, msg);
}
