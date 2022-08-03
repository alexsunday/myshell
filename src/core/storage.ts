// 数据存储

import { HostInfo } from "@/client/types";
import { app } from "electron";
// https://github.com/mifi/commonify
import { Low, JSONFile } from '@commonify/lowdb';
import * as path from 'path';

type Settings = {

}

type KeyPair = {

}

type HostFootPrint = {
  hostId: string;
  footPrint: string;
}

/**
 * otp 密钥
 * name 可以自动生成
 */
type OtpKey = {
  name: string;
  secret: string;
  algorithm: 'SHA1';
  digits: number;
  period: number;
  issuer?: string;
}

// 暂时没有分层结构 暂未使用
type Dir = {
  dirs: Dir[];
  files: HostInfo[];
}

type DbDataType = {
  files: HostInfo[];
  settings: Settings;
  otpLists: OtpKey[];
  hosts: HostFootPrint[];
}

export function initDB() {
  //
}

export function saveSettings(s: Settings) {
  //
}

function defaultData(): DbDataType {
  return {
    files: [],
    settings: {},
    otpLists: [],
    hosts: [],
  }
}

export class Storage {
  private db: Low<DbDataType>;

  constructor() {
    const dstPath = path.join(app.getPath('userData'), '1.db');
    const adapter = new JSONFile<DbDataType>(dstPath);
    const db = new Low(adapter);
    this.db = db;
  }

  async loadAll() {
    await this.db.read();
    this.db.data = this.db.data || defaultData();
  
    return this.db.data.files;
  }

  async addFile(host: HostInfo) {
    this.db.data = this.db.data || defaultData();
    this.db.data.files.push(host);
    await this.db.write();
    console.log(`added host info!`);
  }

  async delFile(hostId: string) {
    this.db.data = this.db.data || defaultData();
    this.db.data.files = this.db.data.files.filter(i=>i.hostId !== hostId);
    await this.db.write();
  }
}

const dbInst = new Storage();
export default dbInst;
