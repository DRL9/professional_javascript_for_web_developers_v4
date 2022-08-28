import { run } from './utils.js';
import CWorker from './ch20.worker.js?worker&inline';
import CWorker2 from './ch20-2.worker.js?worker&inline';

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
    // utf-8 Uint8Array
    console.log(textEncoder.encode('foo')); // length 3

    // 多字节字符
    console.log(textEncoder.encode('😆')); // length 4
    console.log(textEncoder.encode('金')); // length 3

    const arr = new Uint8Array(20);
    // 必须是 Uint8Array, 不然会报错
    // 如果空间不够, 会提前终止
    let result = textEncoder.encodeInto('foo', arr);
    console.log(result); // {read: 3, written: 3}
    console.log(arr);

    // 使用 stream
    const textStream = new ReadableStream({
        async start(controller) {
            for (let char of '今天, we are') {
                controller.enqueue(char);
                await delay(100);
            }
            controller.close();
        }
    });
    let readableStreamDefaultReader = textStream
        .pipeThrough(new TextEncoderStream())
        .getReader();
    console.log(textStream, readableStreamDefaultReader);
    (async function () {
        let i = 0;
        while (true) {
            const { done, value } = await readableStreamDefaultReader.read();
            if (done) {
                break;
            }
            console.log(i++, value); // Uint8Array
        }
    })();
}, true);

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

run(async () => {
    let textDecoder = new TextDecoder(); // 默认 utf8
    console.log(textDecoder.decode(Uint8Array.of(102, 111))); // fo
    // 可以传入其他 TypedArray
    console.log(textDecoder.decode(Uint32Array.of(102, 111))); // fo

    // 解码多字节字符
    console.log(textDecoder.decode(Uint8Array.of(0xf0, 0x9f, 0x98, 0x8a)));

    textDecoder = new TextDecoder('utf-16');
    console.log(textDecoder.decode(Uint16Array.of(102, 111))); // fo
    console.log(textDecoder.decode(Uint8Array.of(102, 90))); // 婦

    let decodeStream = new ReadableStream({
        async start(controller) {
            for (let a of [102, 111, 0xf0, 0x9f, 0x98, 0x8a, 0x88]) {
                controller.enqueue(Uint8Array.of(a));
                await delay(50);
            }
            controller.enqueue(Uint8Array.of(102, 111));
            controller.close();
        }
    });
    let readableStreamDefaultReader = decodeStream
        .pipeThrough(new TextDecoderStream())
        .getReader();
    let i = 0;
    while (true) {
        // 如果是多字节字符， 会等到所有字节都读完
        const { done, value } = await readableStreamDefaultReader.read();
        if (done) {
            break;
        }
        console.log(i++, value); // f o 😊 乱码 fo
    }

    // 结合 fetch 使用
    let resp = await fetch('/src/ch20.js');
    console.log(resp, resp.body);
    let reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
        let { done, value } = await reader.read();
        if (done) {
            break;
        }
        console.log(value);
    }
}, true);

run(async () => {
    // blob
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    document.body.appendChild(input);
    input.addEventListener('change', async (e) => {
        /**
         * @type {FileList}
         */
        let files = e.target.files;
        console.log(files);
        for (let i = 0; i < files.length; i++) {
            // File 继承自 Blob
            let file = files[i];
            console.log(
                file.name,
                file.type,
                file.size + 'byte',
                file.lastModified
            );
            if (file.type.includes('text')) {
                // 多种读取内容的方式
                console.log(await file.text());

                const buffer = await file.arrayBuffer();
                console.log(new TextDecoder().decode(new Uint8Array(buffer)));
                /**
                 * @type {ReadableStreamDefaultReader}
                 */
                let reader = file
                    .stream()
                    .pipeThrough(new TextDecoderStream())
                    .getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    console.log(value);
                }

                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    console.log('load end');
                };
                fileReader.onprogress = (e) => {
                    console.log('progress', e.loaded, e.total);
                    // 可以提前终止
                    // fileReader.abort()
                };
                fileReader.onload = () => {
                    console.log('load', fileReader.result);
                };
                fileReader.readAsText(file);
            }
            const worker = new CWorker2();
            worker.postMessage(file);
            worker.addEventListener('message', ({ data }) => {
                console.log('from worker', data);
            });
            // 只读取开始4个字节
            console.log(await file.slice(0, 4).arrayBuffer());
            if (file.type.includes('image')) {
                let img = document.createElement('img');
                // 没有读入 js 中, 该 url 指向 blob 的内存地址
                let url = URL.createObjectURL(file);
                img.src = url;
                document.body.appendChild(img);
            }
        }
    });
    // 不使用 input 获取文件
    let div = document.createElement('div');
    div.innerHTML = `
    <div style="border:1px solid #ccc; width:200px;height:200px">拖文件到这里</div>
    `;
    document.body.appendChild(div);
    const handleEvent = async (e) => {
        // 需要阻止默认行为
        e.preventDefault();
        if (e.type == 'drop') {
            console.log(await e.dataTransfer.files[0].arrayBuffer());
        }
    };
    // 两个事件都要绑定
    div.addEventListener('dragover', handleEvent);
    div.addEventListener('drop', handleEvent);
}, true);
