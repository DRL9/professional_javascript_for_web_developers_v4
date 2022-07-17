import { run } from './utils.js';

run(() => {
    console.log(window);
}, true);

run(() => {
    console.log(window.top === window.parent);
    console.log(window.parent === window.self);
}, true);

run(() => {
    // 不一定有用
    window.moveTo(0, 0);
    console.log(window.screenLeft, window.screenTop);
}, true);

run(() => {
    console.log(window.devicePixelRatio);
    console.log(window.innerWidth, window.innerHeight);
    console.log(window.outerWidth, window.outerHeight);
}, true);

const $btn = document.querySelector('#btn');
run(() => {
    $btn.addEventListener('click', () => {
        for (let i = 0; i < 100; i++) {
            let p = document.createElement('p');
            p.innerHTML = 'hello';
            document.body.appendChild(p);
        }
        console.log(window.scrollX, window.scrollY);
        window.scrollTo(0, 100); // 绝对位置
        console.log(window.scrollX, window.scrollY);
        window.scroll(0, -100); // 相对位置
        console.log(window.scrollX, window.scrollY);
        // 平滑移动
        window.scrollTo({
            left: 0,
            top: 400,
            behavior: 'smooth'
        });
    });
    document.body.appendChild($btn);
}, true);

run(() => {
    $btn.addEventListener('click', () => {
        // 如果 childWin ,已经存在， 那么会直接用新的url reload 他
        // window.open(window.location.href, 'childWin');
        let blocked = false; // 检测弹窗是否被阻止
        try {
            const win = window.open(
                location.href,
                'child2',
                'width=400,height=400,resizable=no'
            );
            if (win === null) {
                blocked = true;
            }
            // 自己打开的窗口，有些浏览器允许 moveTo
            setTimeout(() => {
                console.log(window === win.opener);
                win.moveTo(200, 200);
                setTimeout(() => {
                    win.close();
                    console.log(win.closed);
                }, 1000);
            }, 1000);
        } catch (error) {
            blocked = true;
        }
    });
}, true);

run(() => {
    // 打开打印弹框
    // 不会阻塞线程
    window.print();
    console.log('111');
}, true);

run(() => {
    let url = `${location.protocol}//user:pass@${location.host}${location.pathname}?a=1&b=2&c==1#hash`;
    console.log(url);
    location.href = url;
    console.log(location.search, location.hash);
    let qs = new URLSearchParams(location.search);
    console.log(qs, qs.has('a'), qs.get('a'));
    for (let [k, v] of qs) {
        console.log(`${k}=${v}`);
    }
}, true);

run(() => {
    let a = 1;
    $btn.addEventListener('click', () => {
        // 3者等效
        // window.location = location.href;
        // location.href = location.href;
        // location.assign(location.href);

        // 除了hash, 只要location 的属性值变了，都会reload页面
        location.search = '?b=2';
        console.log(a++);
    });
}, true);

run(() => {
    console.log(navigator);
}, true);

run(() => {
    let a = 1;
    $btn.onclick = () => {
        // state 的大小通常在 500k ~ 1M
        history.pushState({ a: a++ }, 'title');
        console.log(history.state);
    };
    window.addEventListener('popstate', (e) => {
        console.log(history.state);
        console.log('back', e.state);
    });
});
