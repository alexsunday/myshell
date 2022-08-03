import {contextBridge, ipcRenderer, IpcRendererEvent} from 'electron';
import {operationResult, HostInfo, openShellOptions, IpcMethodName} from '@/client/types';

type IpcRenderCallback = (event: IpcRendererEvent, ...args: any[]) => void;

contextBridge.exposeInMainWorld('eapi', {
  fork: () => ipcRenderer.invoke('eapi:fork'),
  connect: (connectionId: string, host: HostInfo):Promise<operationResult> => ipcRenderer.invoke('eapi:connect', connectionId, host),
  openShell: (sessionId: string, opts: openShellOptions):Promise<operationResult> => ipcRenderer.invoke('eapi:open-shell', sessionId, opts),

  sendMessage: (channel: string, args: any) => ipcRenderer.send(channel, args),
  keyInput: (sessionId: string, data: Uint8Array) => ipcRenderer.send('eapi:key-input', {sessionId: sessionId, data: data}),
  onEvent: (channel: string, cb: IpcRenderCallback) => ipcRenderer.on(channel, cb),
  onceEvent: (channel: string, cb: IpcRenderCallback) => ipcRenderer.once(channel, cb),

  // file manager
  loadAll: () => ipcRenderer.invoke('fmapi:load-all'),
  addFile: (host: HostInfo) => ipcRenderer.invoke('fmapi:add-file', host),
  saveFile: (host: HostInfo) => ipcRenderer.invoke('fmapi:save-file', host),
  delFile: (hostId: string) => ipcRenderer.invoke('fmapi:del-file', hostId),

  // zmodem
  recvFile: (name: string, content: Uint8Array) => ipcRenderer.invoke('zmodem:recv', {name, content}),

  // system
  quit: (code?: number) => ipcRenderer.send('sys:quit', {code: code||0}),
  minimize: () => ipcRenderer.send('sys:minimize'),
});
