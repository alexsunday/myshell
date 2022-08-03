// background 进程
import {BrowserWindow, ipcMain, IpcMainEvent} from 'electron';
import manager from './manager';
import { changeSizeParams, HostInfo, IpcMethodName, openShellOptions } from '@/client/types';
import db from './storage';
import { recvZModemFile } from './zm';

function onIpcMainMessage(m: IpcMethodName, listener: (event: IpcMainEvent, ...args: any[]) => void) {
  ipcMain.on(m, listener);
}

/**
 * fork:
 * 
 * openShell:
 * 
 * connect:
 * 
 * keyInput:
 */

export function initCore() {
  // eapi interface
  ipcMain.handle('eapi:fork', eapiFork);
  ipcMain.handle('eapi:connect', eapiConnect);
  ipcMain.handle('eapi:open-shell', eapiOpenShell);
  ipcMain.on('eapi:key-input', eapiKeyInput);

  ipcMain.handle('fmapi:load-all', fmApiLoadAll);
  ipcMain.handle('fmapi:add-file', fmApiAddFile);
  ipcMain.handle('fmapi:save-file', fmApiSaveFile);
  ipcMain.handle('fmapi:del-file', fmApiDelFile);

  // zmodem
  ipcMain.handle('zmodem:recv', zModemRecv);

  // system
  ipcMain.on('sys:quit', eapiQuit);
  ipcMain.on('sys:minimize', eapiMinimize)

  // ipc message
  onIpcMainMessage('size_change', (sender: any, args: changeSizeParams) => {
    manager.changeSize(args);
  });
}

export async function forkProcess(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    manager.fork(resolve);
  });
}

function eapiFork() {
  // return manager.fork();
}

function eapiConnect(sender:any, connectionId: string, host: HostInfo) {
  return manager.connect(connectionId, host);
}

function eapiOpenShell(sender:any, sessionId: string, opt: openShellOptions) {
  return manager.openShell(sessionId, opt);
}

function eapiKeyInput(sender: any, key: {sessionId: string, data: Uint8Array}) {
  manager.keyInput(key.sessionId, key.data);
}

function zModemRecv(sender: any, v: {content: Uint8Array, name: string}) {
  recvZModemFile(v.name, v.content);
}

function fmApiLoadAll(sender: any) {
  return db.loadAll();
}

function fmApiDelFile(sender: any, hostId: string) {
  return db.delFile(hostId);
}

function fmApiAddFile(sender: any, host: HostInfo) {
  return db.addFile(host);
}

function fmApiSaveFile() {
  //
}

function eapiQuit(sender: any, code: number) {
  process.exit(code);
}

function eapiMinimize() {
  const wndList = BrowserWindow.getAllWindows();
  wndList.forEach(wnd=>{
    if(!wnd.isMinimized()) {
      wnd.minimize();
    }
  });
}
