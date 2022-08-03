import Vue from "vue";

enum evtChannel {
  toFileManagerTab,
  connectToHost,
  changeTheme,
  changeTextSize,
}
type evtBusChannelType = keyof typeof evtChannel;

export function evtBusEmit(v: Vue, channel: evtBusChannelType, ...args: any[]) {
  console.log(`EVTBUS: [${channel}]`);
  v.$emit(channel, ...args);
}

export function evtBusHandle(v: Vue, channel: evtBusChannelType, cb: Function) {
  console.log(`HANDLE: [${channel}]`);
  v.$on(channel, cb);
}

export async function sleep(millsecond: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millsecond);
  });
}
