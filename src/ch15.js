import { run } from './utils.js';

function divFactory() {
    const div = document.createElement('div');
    div.innerHTML = `
        <p class="a">hello</p>
        <p>world</p>
        <p>we</p>
        <p>are
        <span>11</span>
        </p>
    `;
    div.className = 'aa';
    return div;
}
function pFactory() {
    const p = document.createElement('p');
    p.innerHTML = 'hello';
    return p;
}

function btnFactory() {
    const btn = document.createElement('button');
    btn.innerHTML = 'btn';
    return btn;
}

run(() => {
    let div = divFactory();
    let ps = div.querySelectorAll('p');
    let ps2 = div.getElementsByTagName('p');
    // querySelectorAll 的 NodeList 是快照，不会实时反应真实的DOM
    console.log(ps.length, ps2.length);
    div.appendChild(pFactory());
    console.log(ps.length, ps2.length);
}, true);

run(() => {
    let div = divFactory();
    // 该原始是否匹配对应的选择器
    console.log(div.matches('div'));
}, true);

run(() => {
    let div = divFactory();
    let ele = div.firstElementChild;
    while (true) {
        console.log(ele, ele.previousElementSibling, ele.nextElementSibling);
        if (ele === div.lastElementChild) {
            break;
        }
        ele = ele.nextElementSibling;
    }
}, true);

run(() => {
    let div = divFactory();
    // classList 是 DOMTokenList 类型
    console.log(div.className, div.classList);
    div.classList.add('a1');
    console.log(div.className, div.classList);
    div.classList.remove('aa');
    console.log(div.className, div.classList);
    div.classList.toggle('aa');
    console.log(div.className, div.classList);
    console.log(div.classList.contains('aa'));
    document.body.appendChild(div);
}, true);

run(() => {
    let btn = btnFactory();
    document.body.appendChild(btn);

    // activeElement 默认是 body
    console.log(document.hasFocus(), document.activeElement);
    btn.focus();
    console.log(document.activeElement === btn);
    // 如果页面不在 顶部， 那么返回的肯定是 false
    console.log(document.hasFocus());
}, true);

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    div.setAttribute('data-id', '12');

    console.log(div.dataset.id);
    // dataset 实时反应 data-* 属性
    div.dataset.id = 13;
    div.dataset.name = 'heloo';
    console.log(div.getAttribute('data-id'), div.getAttribute('data-name'));
}, true);

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    // 相当于 类似于 replaceChild, 把整个div替换了
    div.outerHTML = `<p>we</p>`;
    // div 并不会变
    console.log(div);
}, true);

run(() => {
    // 使用 innerHTML 或 outerHTML 时，被替换掉的元素的监听器，以及附在上面的 js 对象，并不一定会自动移除
});

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    // 该脚本不会执行
    div.innerHTML = `
        <script>console.log(111) <script>
    `;
    // 事件监听器会执行， 所以会有 XSS 隐患
    div.innerHTML = `
        <div onclick="console.log(111)">1111</div>
    `;
}, true);

run(() => {
    for (let i = 0; i < 20; i++) {
        document.body.appendChild(divFactory());
    }
    let div = divFactory();
    div.style = `background-color:red;`;
    document.body.appendChild(div);
    for (let i = 0; i < 10; i++) {
        document.body.appendChild(divFactory());
    }
    let btn = document.querySelector('button');

    btn.onclick = () => {
        // true 顶部对齐， false, 底部对齐
        // div.scrollIntoView(false);
        // div.scrollIntoView(true);
        div.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest' // start end center nearest
        });
    };
}, true);

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    let p = div.querySelector('p');
    let span = div.querySelector('span');
    // 只要是后代，就返回true
    console.log(div.contains(p));
    // 5位的 bit ,
    const bit = div.compareDocumentPosition(p);
    // 传入的节点不在 document
    console.log(document.compareDocumentPosition(divFactory()) & 0x1);
    // 传入的是其 前面的节点
    console.log(span.compareDocumentPosition(p) & 0x2);
    // 传入的是其 后面的节点
    console.log(div.compareDocumentPosition(span) & 0x4);
    // 传入的是其 祖先节点
    console.log(p.compareDocumentPosition(div) & 0x8);
    // 传入的是其后代
    console.log(bit & 0x10);
});
