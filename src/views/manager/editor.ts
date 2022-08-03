import { HostInfo } from "@/client/types";
import hostInfoWidget from './hostInfoDlg.vue';
import Vue from "vue";

async function showDialog<T>(widget: any, props: any): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const w = new Vue({
      render: h=>{
        return h(widget, {
          props: props,
          on: {
            finish: (v: T) => {
              resolve(v);
              w.$destroy();
              w.$el.remove();
            },
            error: (err:any) => {
              reject(err);
              w.$destroy();
              w.$el.remove();
            }
          }
        })
      }
    });

    w.$mount();
    document.body.appendChild(w.$el);
  });
}

export async function addHostInfo(): Promise<HostInfo> {
  return showDialog<HostInfo>(hostInfoWidget, {});
}
