import Ajv from 'ajv';
// https://www.npmjs.com/package/typescript-json-schema 
// typescript-json-schema src\client\types.ts IPCRequest
const ipcSchema = require("./schema.json");

export enum IpcDirection {
  to_frontend,
  to_backend,
}

export enum IpcMethods {
  fork_process,
  // 收到服务器发回的shell数据
  recv_shell_data,
  // 用户键盘事件
  user_keypress,
  // 连接服务器成功事件到前端
  connection_ready,
  // 前端请求打开一个shell
  open_shell,
  // 前端请求连接到目标
  connect_to_host,
  // 连接、会话的单程消息
  server_message,
  // ssh 协议特定区域
  // 请求/响应 额外的交互式键盘认证
  keyboard_interactive,
  // 握手 指纹确认
  footprint_verify,
  // 进程数据维护 下行可以获取后端进程相信维护信息
  process_inspect,
  // 终端尺寸调整
  size_change,
}

export enum ServerMessage {
  banner, greeting, timeout, error, closed,
}

export enum MessageModel {
  process, connection, session, tab
}

export type IpcMethodName =  keyof typeof IpcMethods;

/**
 * method: request_keyboard, response_keyboard, recv_shell_data, user_keypress
 * pid: process identifyId
 */
export type IPCRequest = {
  method: IpcMethods;
  direction: IpcDirection,
  connId: string;
  // 根据 model 确定是发到后端哪个模型的
  id: string;
  model: MessageModel;
  content?: any;
}

export enum HostType {
  telnet, ssh, serial,
}

export type HostInfo = {
  hostId: string;
  hType: HostType;
  info?: SshHostInfo;
}

export type SshHostInfo = {
  name: string;
  host: string;
  port: number;
  userName: string;
  password: string;
}

export function toIpcRequest(msg: unknown): IPCRequest | null {
  // 编译后不校验 仅开发时校验类型
  if(process.env.NODE_ENV === 'production') {
    return msg as any as IPCRequest;
  }
  const ajv = new Ajv();
  const validate = ajv.compile(ipcSchema);
  const valid = validate(msg);
  if (!valid) {
    console.error(validate.errors);
    return null;
  }
  return msg as any as IPCRequest;
}

export interface ShellConnection {
  connect(host: HostInfo): void;
}

export enum operationReason {
  ok,

  // process
  cannot_found_valid_process,

  // connect
  send_message_failed,
  network_error,
  network_timeout,

  // open shell
  open_shell_connection_not_ready,
  session_id_duplicated,
  open_shell_failed,

  // operation abort manual
  aborted_manual,
}

// 连接结果 成功为0
export type operationResult = {
  err: string;
  content?: string;
  code: operationReason;
}

export type shellDataType = {
  sessionId: string;
  data: Uint8Array;
}

export type serverMsgType = {
  type: ServerMessage;
  data: any;
}

export type closedMsgType = {
  model: MessageModel;
  id: string;
  reason: string;
}

export type openShellOptions = {
  sessionId: string;
  connectionId: string;
  /** The number of rows (default: `24`). */
  rows: number;
  /** The number of columns (default: `80`). */
  cols: number;
  /** The height in pixels (default: `480`). */
  height: number;
  /** The width in pixels (default: `640`). */
  width: number;
  /** The value to use for $TERM (default: `'vt100'`) */
  term?: string;
}

export type changeSizeParams = openShellOptions;

export type zModemProgressType = {
  type: 'upload'|'download';
  progress: number;
  event: 'finished'|'ongoing'|'error'
}
