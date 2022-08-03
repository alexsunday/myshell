// https://juejin.cn/post/6935621453400244260
const ZmodemBrowser = require('nora-zmodemjs/src/zmodem_browser');
import { Terminal } from 'xterm';

Object.assign(Terminal.prototype, {
  zmodemAttach: function zmodemAttach(ws:any, opts:any) {
    const term = this;

    if (!opts) opts = {};

    const senderFunc = function _ws_sender_func(octets:any) {
      ws.send(new Uint8Array(octets));
    };

    let zsentry:any;

    function _shouldWrite() {
      return (
        !!zsentry.get_confirmed_session() ||
        !opts.noTerminalWriteOutsideSession
      );
    }

    zsentry = new ZmodemBrowser.Sentry({
      to_terminal: function _to_terminal(octets:any) {
        if (_shouldWrite()) {
          (term as any).write(String.fromCharCode.apply(String, octets));
        }
      },

      sender: senderFunc,

      on_retract: function _on_retract() {
        if ((term as any).zmodemRetract) {
          (term as any).zmodemRetract();
        }
      },

      on_detect: function _on_detect(detection:any) {
        if ((term as any).zmodemDetect) {
          (term as any).zmodemDetect(detection);
        }
      }
    });

    function handleWSMessage(evt:Event) {
      // In testing with xterm.js’s demo the first message was
      // always text even if the rest were binary. While that
      // may be specific to xterm.js’s demo, ultimately we
      // should reject anything that isn’t binary.
      if (typeof (evt as any).data === 'string') {
        // console.log(evt.data)
        // if (_shouldWrite()) {
        //   term.write(evt.data);
        // }
      } else {
        zsentry.consume((evt as any).data);
      }
    }

    ws.binaryType = 'arraybuffer';
    ws.addEventListener('message', handleWSMessage);
  },

  zmodemBrowser: ZmodemBrowser.Browser
});

export {Terminal};
