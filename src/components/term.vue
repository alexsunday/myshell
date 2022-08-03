<template>
  <div class='term-widget' />
</template>

<script lang='ts'>
import {Component, Emit} from 'vue-property-decorator';
import BaseComponents from '@/components/baseComponents';
require("@/../node_modules/xterm/css/xterm.css");
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import { zModemProgressType } from '@/client/types';
const ZmodemBrowser = require('nora-zmodemjs/src/zmodem_browser');
import {themes} from './theme-lists';

@Component
export default class TermWidget extends BaseComponents {
  private term:Terminal|null=null;
  private zModem:any = null;
  private fitAddon = new FitAddon();

  // 处于zmodem模式时 禁用输入
  disableInput = false;

  mounted() {
    this.term = new Terminal();
    this.term.loadAddon(this.fitAddon);
    this.term.open(this.$el as HTMLElement);
    this.fitAddon.fit();
    this.term.focus();
    // 欢迎词
    // this.term.write('\x1B[47h');
    this.term.write('Welcome to \x1B[1;3;31mMySSH\x1B[0m\r\n\r\n\r\n');
    this.term.onData(d=>{
      if(!this.disableInput) {
        this.KeyInput(new TextEncoder().encode(d));
      }
    });
    this.term.onTitleChange(title=>{
      console.log(`title changed: [${title}]`);
      this.titleChanged(title);
    });

    window.addEventListener('resize', this.fitTermSize);
    this.term.onResize((args: { cols: number, rows: number })=>{
      const el = this.$el as HTMLElement;
      this.TermResized({
        ...args,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    });
    // zmodem init
    this.zModemInit();
  }

  /**
   * changeTheme
   */
  private themeIdx = 0;
  public changeTheme() {
    const theme = themes[this.themeIdx];
    console.log(`theme idx: [${this.themeIdx}]`);
    console.info(theme);
    this.term!.setOption('theme', theme.value);
    this.themeIdx += 1;
  }

  public biggerText() {
    const fontSize = this.term!.getOption('fontSize');
    console.log(`change fontSize to ${fontSize+2}`);
    this.term!.setOption('fontSize', fontSize+2);
  }

  public smallerText() {
    const fontSize = this.term!.getOption('fontSize');
    console.log(`change fontSize to ${fontSize-2}`);
    this.term!.setOption('fontSize', fontSize-2);
  }

  zModemInit() {
    this.zModem = new ZmodemBrowser.Sentry({
      to_terminal: (octets:number[]) => {
        if(octets.length===0) {
          return;
        }
        // console.log(`TERMINAL: [${toHex(octets)}]`);
        const s = new TextDecoder("utf-8").decode(new Uint8Array(octets));
        this.term!.write(s);
      },
      on_retract: () => {
        console.log(`on retract...`);
      },
      sender: (octets:number[]) => {
        this.KeyInput(new Uint8Array(octets));
        // console.log(`SENDER: [${toHex(octets)}]`);
      },
      on_detect: (detection:any) => {
        const zsession = detection.confirm();
        this.disableInput = true;
        console.log(zsession);

        zsession.on('session_end', ()=>{
          console.log('zsession end event.');
          this.disableInput = false;
        });
        if(zsession.type === 'send') {
          // rz
          this.handleRzSession(zsession);
        } else {
          // sz
          console.log(`zmodem ${zsession.type}`);
          // offer 事件 代表 开始接收一个新文件
          zsession.on('offer', (xfer: any) => {
            this.handleSzSession(xfer);
          });
          zsession.start();
        }
      }
    });
  }

  @Emit()
  zModemProgress(typ: zModemProgressType['type'], p: number, evt: zModemProgressType['event']) {
    if(p>100 || p<0) {
      throw new Error('error progress value ' + p.toString());
    }
    return {
      type: typ,
      progress: p,
    }
  }

  async handleRzSession(zsession: any) {
    const arrFileList = await (window as any).showOpenFilePicker({
      multiple: true,
    });
    const files: File[] = [];
    for(const cur of arrFileList) {
      files.push(await cur.getFile());
    }
    ZmodemBrowser.Browser.send_files(zsession, files, {
      on_offer_response: (f: File, xfer: any) => {
        if(!xfer) {
          return;
        }
        this.showNotify(`文件:[${f.name}]正在上传中`, '文件上传', 'info');
        xfer.on('send_progress', (percent: any) => {
          // console.log(`percent: [${percent}]`);
          // const s = percent.toFixed(2);
          // this.term!.writeln(`downloading: [${percent}]`);
        });
      }
    }).then(()=>{
      console.log('close?');
      this.showNotify('所有文件上传完毕', '文件上传',  'success')
      zsession.close();
    }).catch((err:Error)=>{
      this.showNotify(`文件上传过程中出错: [${err}]`, '文件上传', 'error');
    });
  }

  handleSzSession(xfer: any) {
    console.log(`zsession offer!`);
    const details = xfer.get_details();
    console.info(xfer.get_details());
    // if(no_good) {xfer.skip(); return}
    this.showNotify(`${details.name}\nFile Size: [${details.size}]`, '正下载文件', 'info');
    const buf: number[] = [];
    xfer.on('input', (payload: number[]) => {
      // console.log(`INPUT: [${toHex(payload)}]`);
      buf.push(...payload);
    });
    xfer.accept().then(()=>{
      console.log('FINISHED!');
      window.eapi.recvFile(details.name, new Uint8Array(buf)).then(v=>{
        this.showNotify(`${details.name}\nFile Size: [${details.size}]`, '接收完毕', 'success');
      })
    }).catch((err: Error)=>{
      //
    });
  }

  fitTermSize() {
    const e = this.$el as HTMLElement;
    const parent = e.parentElement;
    if(!parent) {
      console.error(`cannot found valid parent element!`);
      return;
    }

    if(e.offsetParent === null) {
      return;
    }
    // https://blog.csdn.net/weixin_47254130/article/details/120271300
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const vp = (this.term as any)._core.viewport;
    const dimensions = (this.term as any)._core._renderService._renderer.dimensions;
    const cols = (width - vp.scrollBarWidth - 15) / dimensions.actualCellWidth;
    const rows = height / dimensions.actualCellHeight - 1;
    console.log(`cols: [${cols}], rows: [${rows}]`);
    this.term!.resize(parseInt(cols.toString(), 10), parseInt(rows.toString(), 10));
  }

  sizeInfo() {
    const el = this.$el as HTMLElement;
    return {
      rows: this.term!.rows,
      cols: this.term!.cols,
      height: el.offsetHeight,
      width: el.offsetWidth,
    }
  }

  writeContent(s: string) {
    this.term!.write(s);
  }

  onRecvShellData(data: number[]) {
    const h = data.map(n=>n.toString(16).padStart(2, '0')).join('');
    // console.log(`RECV: [${toHex(data)}]`);
    const s = new TextDecoder("utf-8").decode(new Uint8Array(data));
    this.zModem.consume(data);
    // this.term!.write(s);
  }

  @Emit()
  KeyInput(d: Uint8Array) {
    return d;
  }

  @Emit()
  TermResized(s: { cols: number; rows: number;height: number;width: number }) {
    return s;
  }

  @Emit()
  titleChanged(t: string) {
    return t;
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.fitTermSize);
    this.term && this.term.dispose();
  }
}
</script>

<style scoped>
.term-widget {
  margin: 0;
  padding: 0;
  flex: 1;
}
.term-widget ::v-deep(.terminal.xterm) {
  height: 100%;
}
</style>
