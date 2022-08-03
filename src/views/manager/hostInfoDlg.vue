<template>
  <el-drawer title="连接信息" class="host-info-dlg-root" :visible.sync="drawer" :direction="direction" :before-close="handleClose">
    <el-form ref="form" :model="host">
      <el-form-item>
        <el-input v-model="host.name" placeholder="名称"/>
      </el-form-item>
      <el-form-item>
        <el-input v-model="host.host" placeholder="主机"/>
      </el-form-item>
      <el-form-item>
        <el-input v-model.number="host.port" placeholder="端口"/>
      </el-form-item>
      <el-form-item>
        <el-input v-model="host.userName" placeholder="用户"/>
      </el-form-item>
      <el-form-item>
        <el-input v-model="host.password" placeholder="密码" type="password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="finish">保存</el-button>
        <el-button>取消</el-button>        
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang='ts'>
import { HostInfo, HostType, SshHostInfo } from '@/client/types';
import { nanoid } from 'nanoid';
import {Component, Vue, Prop, Emit} from 'vue-property-decorator';

@Component
export default class HostInfoDialog extends Vue {
  direction="rtl";
  drawer=true;

  host: SshHostInfo = {
    name: '',
    host: '',
    port: 22,
    userName: 'root',
    password: '',
  }

  handleClose() {
    return this.error();
  }

  @Emit()
  finish(): HostInfo {
    return {
      hostId: nanoid(),
      hType: HostType.ssh,
      info: this.host,
    };
  }

  @Emit()
  error() {
    //
  }
}
</script>
