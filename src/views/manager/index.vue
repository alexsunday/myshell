<template>
  <div class='manager-tab'>
    <button @click="showNewDlg" class="new-btn">NEW</button>
    <ul class="file-list">
      <li class="file-item" v-for="item in files" :key="item.hostId">
        <span>{{item.info.name}}</span>
        <button @click="connectFile(item.hostId)">连接</button>
        <button>编辑</button>
        <button @click="removeFile(item.hostId)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { HostInfo } from '@/client/types';
import {Component, Vue, Prop, Inject} from 'vue-property-decorator';
import {addHostInfo} from './editor';
import {evtBusEmit} from '@/utils/common';

@Component
export default class FileManagerTab extends Vue {
  files: HostInfo[] = [];

  @Inject()
  evtBus!:Vue;

  created() {
    this.loadFileLists();
  }

  loadFileLists() {
    window.eapi.loadAll().then(rs=>{
      this.files = rs;
    });
  }
  
  async showNewDlg() {
    const rs = await addHostInfo();
    await window.eapi.addFile(rs);
    this.loadFileLists();
  }

  indexFile(hostId: string): HostInfo {
    const pos = this.files.findIndex(i=>i.hostId === hostId);
    if(pos === -1) {
      throw new Error(`cannot found [${hostId}]`);
    }
    return this.files[pos];
  }

  connectFile(hostId: string) {
    const f = this.indexFile(hostId);
    evtBusEmit(this.evtBus, 'connectToHost', f);
  }

  async removeFile(hostId: string) {
    await window.eapi.delFile(hostId);
    this.loadFileLists();
  }
}
</script>

<style scoped>
li.file-item {
  text-align: left;
}
.manager-tab {
  text-align: left;
}
button.new-btn {
  margin-left: 30px;
  margin-top: 10px;
}
</style>
