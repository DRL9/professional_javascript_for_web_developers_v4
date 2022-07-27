import { run } from './utils.js';

function btnFactory() {
    let btn = document.createElement('button');
    btn.innerHTML = 'click me';
    return btn;
}

run(() => {
    let btn = btnFactory();
    document.body.appendChild(btn);
    // document->div->document bubbling->win
    // 捕获
    btn.addEventListener('click', () => console.log('div'));
    document.addEventListener(
        'click',
        (e) => {
            console.log('document capture');
            // 事件开始于捕获阶段， 如果在这里停止，那么其他元素的监听器都不会触发
            // e.stopPropagation();
        },
        {
            capture: true
        }
    );
    // 冒泡
    document.addEventListener('click', () => console.log('document bubbling'));
    window.addEventListener('click', () => console.log('win'));
}, true);

run(() => {
    let btn = btnFactory();
    document.body.appendChild(btn);
    btn.onclick = function () {
        // this 指向event currentTarget
        console.log(this.innerHTML);
    };
}, true);

run(() => {
    let btn = btnFactory();
    document.body.appendChild(btn);
    document.body.onclick = function (e) {
        console.log(e.type === 'click');
        console.log(e.target === btn);
        console.log(e.currentTarget === this);
        console.log(e.currentTarget === document.body);
    };
}, true);

run(() => {
    const btn = btnFactory();
    const div = document.createElement('div');
    document.body.appendChild(div);
    div.appendChild(btn);
    div.onclick = function (e) {
        console.log(e.eventPhase); // 3 冒泡阶段
    };
    btn.onclick = function (e) {
        console.log(e.eventPhase); //2 目标节点
    };
    document.body.onclick = function (e) {
        console.log(e.eventPhase); //3 冒泡阶段
    };
    document.body.addEventListener(
        'click',
        (e) => {
            console.log(e.eventPhase); //1 捕获阶段
        },
        true
    );
}, true);

run(() => {
    // focus 和 blur 不会冒泡
    document.body.onfocus = () => console.log('body');
    const btn = btnFactory();
    btn.onfocus = () => console.log('btn');
    document.body.appendChild(btn);
    // focusin 和 focusout 会冒泡
    btn.addEventListener('focusin', () => {
        console.log('focuin');
    });
}, true);

run(() => {
    Array(20)
        .fill(1)
        .forEach((_, i) => {
            let p = document.createElement('p');
            p.innerHTML = i;
            document.body.appendChild(p);
        });

    document.body.onclick = (e) => {
        // 相对于视口
        console.log('client', e.clientX, e.clientY);
        // 相对于屏幕
        console.log('screen', e.screenX, e.screenY);
        // 相对于页面，考虑滚动条
        console.log('page', e.pageX, e.pageY);
    };
});
