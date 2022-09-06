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

run(() => {
    let div = document.createElement('div');
    div.style = 'width:100px;height:100px;background:red';
    div.textContent = 'hello';
    document.body.appendChild(div);
    div.addEventListener('dragstart', (e) => {
        console.log('drag start');
    });
    div.addEventListener('drag', () => console.log('drag')); // 持续触发

    let img = document.createElement('img');
    img.src = '/public/vite.svg';
    document.body.appendChild(img);
    img.addEventListener('dragstart', (e) => {
        // 设置自定义 string 数据
        e.dataTransfer.setData('text/plain', 'custom text');
    });

    let div2 = document.createElement('div');
    div2.style = 'border: 1px solid #ccc; width:300px;height:300px';
    div2.innerHTML = 'hello world';
    document.body.appendChild(div2);
    div2.addEventListener('drop', (e) => {
        console.log('drop', e.target); // 自己本身
        // 拿到 drag 对象的信息
        console.log('url', e.dataTransfer.getData('text/uri-list'));
        console.log('text', e.dataTransfer.getData('text/plain'));
    });
    div2.addEventListener('dragover', (e) => e.preventDefault()); // 取消 dragover 的默认行为， 才会在触发 drop 事件

    let div3 = document.createElement('div');
    div3.innerHTML = 'text222';
    // 媒体元素和选中文字默认 true, 一般其他的都是false
    div3.draggable = true;
    div3.id = 'dddddd';
    document.body.appendChild(div3);
    div3.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.effectAllowed = 'move';
        // 设置光标底下的图片
        e.dataTransfer.setDragImage(img, 10, 10);
    });
    div2.addEventListener('dragenter', (e) => {
        console.log('dragenter', e.target, e);
        e.dataTransfer.dropEffect = 'move';
    });
}, true);

run(async () => {
    // Notification
    // 询问框只会出现一次， 浏览器会记住之前的结果
    const permission = await Notification.requestPermission();
    console.log('permission is', permission); // granted

    let btn = document.createElement('button');
    btn.innerText = 'show notification';
    btn.addEventListener('click', () => {
        let notification = new Notification('标题');
        setTimeout(() => {
            notification.close();
        }, 1000);
    });
    document.body.appendChild(btn);

    let btn2 = document.createElement('button');
    btn2.innerHTML = 'show2';
    btn2.onclick = () => {
        let notification = new Notification('标题', {
            body: '正文',
            icon: '/public/vite.png'
        });
        notification.onclick = () => console.log('click');
        notification.onshow = () => console.log('show');
        notification.onclose = () => console.log('close');
        notification.onerror = () => console.log('error');
    };
    document.body.appendChild(btn2);
}, true);

run(() => {
    console.log(document.visibilityState);
    document.onvisibilitychange = () => {
        // 切换tab / 最小化触发
        // 如果是切换应用，不一定会触发
        console.log(document.visibilityState);
    };
}, true);

run(async () => {
    let readableStream = new ReadableStream({
        // 构造后， 该方法就会被调用
        async start(controller) {
            for (let i of Array(20)
                .fill(0)
                .map((_, i) => i)) {
                console.log('enqueue', i);
                controller.enqueue(i);
                await delay(10);
            }
            controller.close();
        }
    });
    await delay(100);
    console.log('locked', readableStream.locked);
    let reader = readableStream.getReader();
    // 只允许一个 reader 读取
    console.log('locked', readableStream.locked);
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }
        console.log('value is', value);
        await delay(100);
    }
}, true);

run(async () => {
    const writeStream = new WritableStream({
        write(v) {
            console.log('write', v);
        }
    });
    // 只允许一个 writer
    console.log('locked', writeStream.locked);
    const writer = writeStream.getWriter();
    console.log('locked', writeStream.locked);
    for (let i of Array(10)
        .fill(0)
        .map((_, i) => i)) {
        // 等待 ready 后再写
        await writer.ready;
        writer.write(i);
        await delay(10);
    }
}, true);

run(async () => {
    let { readable, writable } = new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(chunk * 2);
        }
    });
    const reader = readable.getReader();
    const writer = writable.getWriter();
    run(async () => {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.log('read done');
                break;
            }
            console.log('read value', value);
        }
    });
    run(async () => {
        for (let i of Array(3)
            .fill(0)
            .map((_, i) => i)) {
            console.log('write', i);
            writer.write(i);
            await Promise.resolve();
            console.log('write', i, 'resolve');
            await delay(0);
            console.log('write', i, 'delay');
        }
        // 这里触发 close
        writer.close();
    });
}, true);

run(async () => {
    const readableStream = new ReadableStream({
        async start(controller) {
            for (let i = 0; i < 10; i++) {
                controller.enqueue(i);
                await delay(1);
            }
            controller.close();
        }
    });
    const doubleStream = new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(chunk * 2);
        }
    });
    // pipeThrough
    const reader = readableStream.pipeThrough(doubleStream).getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log('done');
            break;
        }
        console.log('end', value);
    }
    let readableStream2 = new ReadableStream({
        async start(controller) {
            for (let i = 0; i < 10; i++) {
                controller.enqueue(i);
                await delay(1);
            }
        }
    });
    const writeStream = new WritableStream({
        write(v) {
            console.log('write', v);
        }
    });
    // pipeTo 可写流
    readableStream2.pipeTo(writeStream);
}, true);

run(() => {
    let tpl = document.createElement('template');
    let p = document.createElement('p');
    p.innerHTML = 'hello world'; // 不会渲染到页面上
    tpl.appendChild(p);
    let script = document.createElement('script');
    script.innerHTML = 'console.log("exec script")'; // 会执行
    tpl.appendChild(script);
    document.body.appendChild(tpl);
}, true);

run(() => {
    let div = document.createElement('div');
    let shadowRoot = div.attachShadow({ mode: 'open' }); // open 表示外部可以访问内容的元素
    shadowRoot.innerHTML = `
        <p>hello world</p>
        <button>click</button>
        <style>
            p {
                color: red;
            }
            button {
                color: blue;
            }
        </style>
    `;
    console.log(div.shadowRoot); // 如果mode 是 open , 那么有值， 如果是 closed, 那么为null
    document.body.appendChild(div);
}, true);

run(() => {
    let div = document.createElement('div');
    div.innerHTML = `
        <p slot="p">hello</p>
    `;
    document.body.appendChild(div);
    // 原来的 p 会被替换
    let shadowRoot = div.attachShadow({ mode: 'open' });
    // 使用 slot 可以恢复原来的 p
    shadowRoot.innerHTML = `
        <div>in shadow</div>
        <slot name="p"></slot>
    `;
}, true);

run(() => {
    let div = document.createElement('div');
    div.innerHTML = `
        <button onclick="console.log('slot',event.target)">slot click</button>
    `;
    document.body.appendChild(div);
    let shadowRoot = div.attachShadow({ mode: 'open' });
    // 内部的 event target 就是 shadow element 本身
    shadowRoot.innerHTML = `
        <button onclick="console.log('inner', event.target)">click</button>
        <slot></slot>
    `;
    // 外部的事件 target 会 retargeting 到根部
    // 如果是 slot ，那么不会 retargeting
    div.onclick = (e) => console.log('outer', e.target);
}, true);

run(() => {
    // 自定义元素
    class FooElement extends HTMLElement {
        // 每次创建 element 都会构造
        constructor() {
            super();
            let shadowRoot = this.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = `
                <p>hello world</p>
            `;
        }
        connectedCallback() {
            console.log('connected');
        }
        disconnectedCallback() {
            console.log('disconnected');
        }
        // 监听属性的改变
        static get observedAttributes() {
            return ['bar'];
        }
        attributeChangedCallback(name, oldV, newV) {
            console.log(name, oldV, newV);
            this[name] = newV;
        }
    }
    customElements.define('x-foo', FooElement);
    let foo = document.createElement('x-foo');
    document.body.appendChild(foo);
    document.body.removeChild(foo);

    let div = document.createElement('div');
    document.body.appendChild(div);
    div.innerHTML = `
        <x-foo bar="1"></x-foo>
    `;
    div.firstElementChild.setAttribute('bar', 2);
}, true);

run(async () => {
    class FooElement extends HTMLElement {
        constructor() {
            super();
            let shadowRoot = this.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = `
                <p>hello</p>
            `;
        }
    }
    let foo = document.createElement('x-foo');
    document.body.appendChild(foo);
    console.log(customElements.get('x-foo'));
    customElements.whenDefined('x-foo').then(() => console.log('define'));

    // 会自动升级页面内的对应元素
    customElements.define('x-foo', FooElement);
    console.log(foo instanceof FooElement);

    // 如果元素还没有插入到 DOM ， 那么需要调用该方法强制升级
    customElements.upgrade(foo);
}, true);

run(async () => {
    const randomFloat = () => {
        return crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff; // 2^32 -1
    };
    console.log(randomFloat());

    const uint8ArrayToHex = (array) => {
        return Array.from(array)
            .map((a) => a.toString(16).padStart(2, '0'))
            .join('');
    };

    // SubtleCrypto 要在安全环境下才有
    const sha256 = async (str) => {
        const textEncoder = new TextEncoder();
        const arrayBuffer = await crypto.subtle.digest(
            'SHA-256',
            textEncoder.encode(str)
        );
        const digest = new Uint8Array(arrayBuffer);
        return uint8ArrayToHex(digest);
    };
    console.log(await sha256('hello'));

    // 生成 key
    let key = await crypto.subtle.generateKey(
        { name: 'AES-CTR', length: 128 },
        true,
        ['decrypt', 'encrypt']
    );
    console.log(key);
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    console.log(new Uint8Array(exportedKey));
    const importedKey = await crypto.subtle.importKey(
        'raw',
        exportedKey,
        { name: 'AES-CTR', length: 128 },
        true,
        ['decrypt', 'encrypt']
    );
    console.log(importedKey);
});
