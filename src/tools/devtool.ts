import * as path from 'path';
import * as fs from 'fs';
import electron from 'electron';

const extName: string = 'Vue.js devtools'
const extPath: string = path.join(process.cwd(), 'node_modules/vue-devtools/vender')

export function installDevTools() {
  if (process.type !== 'renderer' && process.type !== 'browser') {
    throw new Error(`${extName} can only be installed from an Electron process.`)
  }
  console.log(`Installing ${extName} from ${extPath}`)

  const extLists = electron.session.defaultSession.getAllExtensions();
  const pos = extLists.findIndex(i=>i.name === extName);
  if(pos !== -1) {
    return null;
  }
  return electron.session.defaultSession.loadExtension(extPath)
}

export function fixDevTools() {
  const dstPath = path.resolve(__dirname, '../node_modules/vue-devtools/vender/manifest.json');
  if(!fs.existsSync(dstPath)) {
    console.log(`[${dstPath}] not exist.`);
    return;
  }
  console.log(`fix file: [${dstPath}]`);
  const content = fs.readFileSync(dstPath, {encoding: 'utf-8'});
  const obj = JSON.parse(content);
  delete obj.browser_action;
  const perms = obj.permissions as string[];
  const permLists = perms.filter(i=>i !== 'contextMenus');
  obj.permissions = permLists;
  const rs = JSON.stringify(obj, undefined, 2);
  // console.log(rs);
  fs.writeFileSync(dstPath, rs, {encoding: 'utf-8'});
}