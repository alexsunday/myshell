<template>
  <div class='shell-tab'>
    <el-tabs class="tabs" v-model="curTab" @tab-click="tabActived" :addable="false" @tab-remove="tabRemove">
      <el-tab-pane :key="tab.tabId" v-for="tab in tabs" :name="tab.tabId" :label="tab.name">
        <content-widget :tabId="tab.tabId"
          :host="tab.host || null"
          v-if="tab.type === 'terminal'"
          @connection-closed="handleConnClosed"
          @title-changed="titleChanged"
          @session-closed="closeTab" />
        <file-manager-widget :tabId="tab.tabId" v-if="tab.type === 'file-manager'" />
      </el-tab-pane>
    </el-tabs>
    <div class="btns right">
      <el-dropdown @command="optCmdClicked">
        <button title="选项">
          <em aria-hidden="true" class="el-icon-more" />
        </button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="changeCmd">终端风格</el-dropdown-item>
          <el-dropdown-item command="biggerText">文字尺寸+</el-dropdown-item>
          <el-dropdown-item command="smallerText">文字尺寸-</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <button @click="minimizeWindow" title="最小化">
        <em aria-hidden="true" class="el-icon-minus" />
      </button>
      <button class="quit-app close" @click="quitApp" title="退出程序">
        <em aria-hidden="true" class="el-icon-close" />
      </button>
    </div>
  </div>
</template>

<script lang='ts'>
import {Component, Provide, Vue} from 'vue-property-decorator';
import ContentWidget from './content.vue';
import FileManagerWidget from '../manager/index.vue';
import {nanoid} from 'nanoid';
import { evtBusEmit, evtBusHandle } from '@/utils/common';
import { HostInfo } from '@/client/types';

type TabType = 'terminal' | 'file-manager' | 'settings';

type TabInfo = {
  tabId: string;
  sessionId: string;
  name: string;
  type: TabType;
  host?: HostInfo;
}

@Component({
  components: {
    'content-widget': ContentWidget,
    'file-manager-widget': FileManagerWidget,
  }
})
export default class ShellTabs extends Vue {
  private curTab = "";
  private tabs: TabInfo[] = [];

  @Provide()
  evtBus = new Vue();

  created() {
    this.addFileManagerTab();
    // this.addTerminal();
    this.initEventBus();
  }

  initEventBus() {
    evtBusHandle(this.evtBus, 'toFileManagerTab', () => {
      this.addFileManagerTab();
    });
    evtBusHandle(this.evtBus, 'connectToHost', (host: HostInfo) => {
      this.connectToHost(host);
    });
  }

  addFileManagerTab() {
    const tab = nanoid();
    const name = `tab ${this.tabs.length+1}`;
    this.tabs.push({
      tabId: tab,
      name: name,
      sessionId: '',
      type: 'file-manager',
    });
    this.curTab = tab;
  }

  connectToHost(host: HostInfo) {
    const tab = nanoid();
    const name = host.info?.name || host.info?.host || `tab ${this.tabs.length+1}`;
    this.tabs.push({
      tabId: tab,
      name: name,
      sessionId: '',
      type: 'terminal',
      host: host,
    });
    this.curTab = tab;
  }

  addTerminal() {
    const tab = nanoid();
    const name = `tab ${this.tabs.length+1}`;
    this.tabs.push({
      tabId: tab,
      name: name,
      sessionId: '',
      type: 'terminal',
    });
    this.curTab = tab;
    console.log('over~');
  }

  tabActived(tab: any) {
    console.log(tab);
  }

  tabRemove(name: string) {
    console.log(name);
  }

  closeTab(tabId: string) {
    const pos = this.tabs.findIndex(i=>i.tabId === tabId);
    if(pos === -1) {
      console.error(`cannot found [${tabId}] tab.`);
      return;
    }
    this.curTab = this.tabs[pos-1].tabId;
    this.tabs = this.tabs.filter(i=>i.tabId !== tabId);
  }

  handleConnClosed(v: {connId: string, tabId: string;}) {
    this.closeTab(v.tabId);
  }

  titleChanged(v: {title: string; tabId: string}) {
    const pos = this.tabs.findIndex(i=>i.tabId === v.tabId);
    if(pos === -1) {
      console.warn('index tabs failed!');
      return;
    }
    const tab = this.tabs[pos];
    tab.name = v.title;
    this.$set(this.tabs, pos, tab);
  }

  changeTheme() {
    const tab = this.indexTerminalTab();
    evtBusEmit(this.evtBus, 'changeTheme', {
      tabId: tab.tabId,
    });
  }

  indexTab() {
    const pos = this.tabs.findIndex(i=>i.tabId === this.curTab);
    if(pos === -1) {
      throw new Error('index tab failed!');
    }
    return this.tabs[pos];
  }

  indexTerminalTab() {
    const tab = this.indexTab();
    if(tab.type !== 'terminal') {
      throw new Error('tab id not a terminal tab.');
    }

    return tab;
  }

  biggerText() {
    const tab = this.indexTerminalTab();
    evtBusEmit(this.evtBus, 'changeTextSize', {
      tabId: tab.tabId,
      size: 'big',
    });
  }

  smallerText() {
    const tab = this.indexTerminalTab();
    evtBusEmit(this.evtBus, 'changeTextSize', {
      tabId: tab.tabId,
      size: 'small',
    });
  }

  optCmdClicked(cmd: "changeCmd"|"biggerText"|"smallerText") {
    switch(cmd) {
      case "changeCmd": {
        this.changeTheme();
        break;
      }
      case "biggerText": {
        this.biggerText();
        break;
      }
      case "smallerText": {
        this.smallerText();
        break;
      }
    }
  }

  minimizeWindow() {
    window.eapi.minimize();
  }

  quitApp() {
    window.eapi.quit(0);
  }
}
</script>

<style scoped>
.tabs ::v-deep(.el-tabs__header) {
  margin-bottom: 1px;
}

.tabs ::v-deep(div.el-tabs__nav-scroll) {
  -webkit-app-region: drag;
  margin-right: 135px;
  background-color: #f3f7fa;
}

.tabs ::v-deep(div.el-tabs__nav-scroll > *) {
  -webkit-app-region: no-drag;
}

.shell-tab {
  position: relative;
}

.btns {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  background-color: #f3f7fa;
  height: 40px;
}

.btns button {
  outline: none;
  border: none;
  background-color: transparent;
  width: 45px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btns button:hover {
  background-color: #E5E5E5;
}

.btns button:active {
  background-color: #CACACB;
}

.btns button[disabled] {
  cursor: not-allowed;
}

.btns button[disabled]:hover {
  background-color: transparent;
}

button.close:hover {
  background-color: #E81123;
  color: white;
}
button.close:active {
  color: white;
  background-color: #F1707A;
}
</style>
