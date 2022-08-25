import { run } from './utils.js';
import CWorker from './ch20.worker.js?worker&inline';
run(() => {
    let buffer = new SharedArrayBuffer(4);
    let arr = new Uint32Array(buffer);
    let count = 0;
    let workerCount = 4;
    Array(workerCount)
        .fill(0)
        .map(() => {
            /**
             * @type {Worker}
             */
            let worker = new CWorker();
            worker.onmessage = () => {
                if (++count == workerCount) {
                    // 期待是 4000 , 因为并发的原因，会小于等于该数
                    console.log('result', arr[0]);
                }
            };
            worker.postMessage(buffer);
            return worker;
        });
}, true);

run(() => {
    // Atomic API
});

run(() => {
    // postMessage() XDM
});

run(() => {
    const textEncoder = new TextEncoder();
    let decodeText = 'foo'
    // utf-8 Uint8Array
    let result1 = textEncoder.encode(decodeText)
    console.log(result1);
    // 多字节字符
    decodeText = '😆';
    const result2 = textEncoder.encode(decodeText)
    console.log(result2); // length 4
    decodeText = '金'
    console.log(textEncoder.encode(decodeText)); // length 3

});
