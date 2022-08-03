import { app } from "electron";
import * as path from 'path';
import * as fs from 'fs/promises';

export async function recvZModemFile(name: string, d: Uint8Array): Promise<boolean> {
  const downPath = app.getPath('downloads');
  const dstPath = path.join(downPath, path.normalize(name));
  console.log(`write file to: [${dstPath}]`);

  try {
    await fs.writeFile(dstPath, d, {encoding: 'utf-8'});
  } catch (err) {
    console.error('write file error');
    console.error(err);
    return false;
  }
  return true;
}
