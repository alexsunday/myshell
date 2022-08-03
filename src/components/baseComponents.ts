
import { Vue } from 'vue-property-decorator';
import { MessageBoxInputData } from 'element-ui/types/message-box';
import { MessageType } from 'element-ui/types/message';

export default class BaseComponents extends Vue {
  showNotify(text: string, title = "通知", type: MessageType = 'warning') {
    return this.$notify({
      message: text,
      title: title,
      type: type,
    })
  }

  async showConfirm(text: string, title = "提示"): Promise<boolean> {
    try {
      await this.$confirm(text, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
    } catch {
      return false;
    }

    return true;
  }

  showInfo(s: string) {
    this.$message({
      showClose: true,
      message: s,
      duration: 2000
    });
  }

  async promptInput(content: string, title: string) {
    let r = await this.$prompt(content, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
    let body = r as MessageBoxInputData;
    return body.value;
  }

  showSuccessInfo(s: string) {
    this.$message({
      showClose: true,
      message: s,
      type: 'success',
      duration: 2000
    });
  }

  showWarnInfo(s: string) {
    return this.$message({
      showClose: true,
      message: s,
      type: 'warning',
      duration: 2000
    });
  }

  showErrorInfo(s: string) {
    this.$message({
      showClose: true,
      message: s,
      type: 'error',
      duration: 2000
    });
  }

  confirmInfo(title = '确定要删除选中的数据吗?') {
    return this.$confirm(title, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
  }

  isTextEmpty(text: string) {
    if (!text) {
      return false
    } else {
      return true
    }
  }

  showErrorMsg(err: any) {
    if (!this.isTextEmpty(err.msg)) {
      this.showErrorInfo(err.msg);
    }
  }

  async FormVerification(FormRefName: string): Promise<boolean> {
    return new Promise(f => {
      if (this.$refs && this.$refs[FormRefName]) {
        let form = this.$refs[FormRefName] as HTMLFormElement
        form.validate((bol: boolean) => {
          if (bol) f(true);
          else return f(false);
        })
      }
    })
  }
}
