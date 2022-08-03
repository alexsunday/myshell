<template>
  <div class='shell-content-root'>
    <term-widget ref="term" @key-input="termKeyInput" @term-resized="termResized" @title-changed="titleChanged" />
    <el-dialog :visible="showProgress" width="20%" center >
      <el-progress type="circle" :percentage="progress" :status="dlgStatus" />
    </el-dialog>
  </div>
</template>

<script lang='ts'>
import {Component, Vue, Prop, Ref, Inject, Emit} from 'vue-property-decorator';
import TermWidget from '@/components/term.vue';
import {ConnectionEvent, requestToBackground, sendToBackground, ShellDataEvent, SSHBackend, SSHConnection} from '@/components/backend';
import {SessionManager, manager} from '@/components/backend';
import { nanoid } from 'nanoid';
import { changeSizeParams, HostInfo, operationReason, operationResult } from '@/client/types';
import {evtBusEmit, evtBusHandle, sleep} from '@/utils/common';

@Component({
  components: {
    'term-widget': TermWidget,
  }
})
export default class TabWidget extends Vue {
  @Prop()
  tabId!:string;

  @Prop()
  host!:HostInfo|null;

  @Ref()
  term!:TermWidget;

  @Inject()
  evtBus!:Vue;

  session: SSHBackend|null = null;
  connection: SSHConnection|null = null;

  showProgress = false;
  progress = 0;
  dlgStatus = "success";

  mounted() {
    if(this.host !== null) {
      // 初始化应连接
      this.connect(this.host);
    }
    // change theme event
    evtBusHandle(this.evtBus, 'changeTheme',  (v: {tabId: string}) => {
      console.log('theme change event?');
      this.changeTheme(v);
    });
    evtBusHandle(this.evtBus, 'changeTextSize', (v: {tabId: string; size: 'big'|'small'}) => {
      this.changeTextSize(v);
    });
  }

  changeTextSize(v: { tabId: string; size: 'big'|'small'; }) {
    if(v.size === 'big') {
      this.term!.biggerText();
    } else if(v.size === 'small') {
      this.term!.smallerText();
    }
  }

  changeTheme(v: {tabId: string}) {
    if(v.tabId !== this.tabId) {
      return;
    }
    this.term?.changeTheme();
  }

  termResized(s: { cols: number; rows: number;height: number;width: number }) {
    if(this.connection === null || this.session === null) {
      return;
    }

    const params:changeSizeParams = {
      sessionId: this.session!.sessionId,
      connectionId: this.connection!.connectionId,
      ...s,
    }
    requestToBackground('size_change', params);
  }

  async connect(host: HostInfo) {
    if(this.connection !== null) {
      console.error(`connection exists!`);
      return;
    }

    const connId = nanoid();
    this.connection = new SSHConnection(connId);
    this.connection.addEventListener('connection_ready', async ()=>{
      console.log('connection ready, prepare openshell.');
      await sleep(10);
      await this.openShell();
    });

    this.connection.addEventListener('keyboard_interactive', this.handleKeyboardInteractive);
    this.connection.addEventListener('closed', evt => {
      console.log(`[${this.connection?.connectionId} connection closed!`);
      this.connectionClosed({connId: connId, tabId: this.tabId});
    });
    this.term.writeContent(`Connecting to ${host.info?.host}:${host.info?.port}...\r\n`);
    const r = await SessionManager.connect(connId, host);
    // this.term.writeContent(r.err);
    console.log(`connected!`);
    this.term.writeContent('Connection established.\r\n');
    manager.addConnection(this.connection!);
  }

  handleKeyboardInteractive(evt: Event) {
    if(!(evt instanceof ConnectionEvent)) {
      console.error(`event type not match ConnectionEvent`);
      return;
    }
    // show dialog, wait user input
    console.log(evt);
    const evtData = evt.data;
    const title: string = evtData.instructions || "Keyboard interactive";
    let message: string = evtData.name || "server info empty";
    // 暂时只支持一种，后续可能支持多个 且不回显的 keyboard interactive ？
    this.$prompt(message, title).then(rs=>{
      // 输入完成
      if(typeof(rs) !== 'string' && rs.action === 'confirm') {
        const rsp: operationResult = {
          err: 'OK',
          content: rs.value,
          code: operationReason.ok,
        }
        sendToBackground(evt.channel, rsp);
      } else {
        // 也是取消输入
        const rsp: operationResult = {
          err: 'aborted',
          code: operationReason.aborted_manual,
        }
        sendToBackground(evt.channel, rsp);
      }
    }).catch(err=>{
      // 也是取消输入
      const rsp: operationResult = {
        err: 'cancel',
        code: operationReason.aborted_manual,
      }
      sendToBackground(evt.channel, rsp);
    });
  }

  async openShell() {
    const sessionId = nanoid();
    this.session = new SSHBackend(sessionId);
    this.session.addEventListener('recv_shell_data', evt=>{
      if(!(evt instanceof ShellDataEvent)) {
        console.error(`event type not match ShellDataEvent`);
        return;
      }
      this.term.onRecvShellData(evt.data);
    });
    this.session.addEventListener('closed', evt=>{
      console.log(`[${this.session?.sessionId} session closed!`);
      this.sessionClosed();
    });
    if(this.connection === null) {
      console.error('connectionId empty!');
      return;
    }

    const sizeInfo = this.term!.sizeInfo();
    await SessionManager.openShell(sessionId, {
      sessionId: sessionId,
      connectionId: this.connection.connectionId,
      ...sizeInfo,
    });

    console.log(`open shell finished [${sessionId}]`);
    manager.addSession(this.session!);
  }

  fork() {
    window.eapi.fork().then(rs=>{
      console.log(`fork [${rs}]`);
    }).catch(err=>{
      console.error(err);
    });
  }

  fileManager() {
    evtBusEmit(this.evtBus, "toFileManagerTab");
  }

  termKeyInput(data: Uint8Array) {
    if(this.session === null) {
      console.error('sessionId empty!');
      return;
    }
    this.session.keyInput(data);
  }

  @Emit()
  connectionClosed(v: {connId: string, tabId: string;}) {
    return v;
  }

  @Emit()
  titleChanged(t: string) {
    return {
      title: t,
      tabId: this.tabId,
    }
  }

  @Emit()
  sessionClosed() {
    return this.tabId;
  }
}
</script>

<style scoped>
.shell-content-root {
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}
</style>