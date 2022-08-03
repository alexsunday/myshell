import { IPCRequest } from '@/client/types';
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import { Readable, Writable } from 'stream';

export class Process extends EventEmitter {
  pid = "";
  child: cp.ChildProcess;
  
  private reader: Readable = new Readable({objectMode: true});
  private writer: Writable = new Writable({objectMode: true});

  constructor(pid: string, child: cp.ChildProcess) {
    super();
    this.pid = pid;
    this.child = child;

    this.reader._read = ()=>{};
    this.writer._write = (data, enc, next) => {
      this.child.send(data, err=>{
        if(err) {
          console.error(`send to child process, failed!`);
          console.error(err);
          return;
        }
        next();
      });
    }
    this.reader.pipe(this.writer);
  }

  handleEvent(r: IPCRequest) {
    return this.reader.push(r);
  }
}
