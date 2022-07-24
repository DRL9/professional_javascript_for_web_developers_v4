import { run } from './utils.js';

function divFactory() {
    let div = document.createElement('div');
    div.style = `background-color:red;float:left;color:blue;height:80px;overflow:scroll;`;
    div.innerHTML = `
        <p>sd</p>
        <p>ss</p>
        <p>ss</p>
        <p>ss</p>
    `;
    return div;
}

run(() => {
    // 命名空间操作
});

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    // CSSStyleDeclaration 对象
    console.log(div.style);
    // float 是保留字，所以用 cssFloat
    console.log(div.style.cssFloat);
    // 如果赋值不符合格式，会被忽略
    div.style.width = 20;
    console.log(div.style.width);

    // 写入 cssText 会覆盖整个
    console.log(div.style.cssText);
    div.style.cssText = 'font-size:12px';
    console.log(div.style.cssText);

    // 设置的样式数量
    console.log(div.style.length, div.style.item(1));

    //遍历
    for (let i = 0; i < div.style.length; i++) {
        let prop = div.style[i];
        let v = div.style.getPropertyValue(prop);
        console.log(prop, v);
    }
    div.style.removeProperty('font-size');
    console.log(div.style.cssText);
}, true);

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    let style = getComputedStyle(div);
    console.log(style);
    let stylePseudoElement = getComputedStyle(div, 'after');
    console.log(stylePseudoElement);

    console.log(style.fontSize);
    // 该style是只读的， 赋值会报错
    style.fontSize = '12px';
}, true);

run(() => {
    let styleSheets = document.styleSheets;
    console.log(styleSheets);
    let sheet = styleSheets[0];
    console.log(sheet);
    let rules = sheet.cssRules;
    console.log(rules);
    console.log(rules[0], rules[0].cssText);

    // 会直接改变样式
    rules[0].style.backgroundColor = 'red';
    console.log(rules[0].cssText);
    // 但是不影响 innerHTML
    console.log(document.querySelector('style').innerHTML);

    sheet.deleteRule(0);
    sheet.insertRule(
        `
        div{
            border:1px solid #ccc;
        }
    `,
        0
    );
}, true);

run(() => {
    let div = divFactory();
    document.body.appendChild(div);
    div.style.cssFloat = 'initial';
    console.log(
        // 容器
        div.offsetParent,
        // 相对于容器的
        // 每次访问，都会实时调用，所以避免频繁访问
        div.offsetLeft,
        div.offsetTop,
        // 包含滚动条
        div.offsetWidth,
        div.offsetHeight,
        'client',
        // 不包含滚动条
        div.clientWidth,
        div.clientHeight,
        'scroll',
        // 滚动条的偏移
        div.scrollTop,
        // 内容都可视的情况下的高
        div.scrollHeight
    );
}, true);

run(() => {
    document.body.appendChild(divFactory());
    // 遍历所有 Node
    let it = document.createNodeIterator(
        document.body,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        (node) => node.nodeName.toLowerCase() === 'p'
    );
    let node = it.nextNode();
    while (node) {
        console.log(node.nodeName, node);
        node = it.nextNode();
    }

    // 还可以遍历 祖先等
    let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL);
    console.log(walker.nextNode());
    console.log(walker.parentNode());
    console.log(walker.currentNode);
}, true);

run(() => {
    let div = divFactory();
    div.style.cssFloat = 'initial';
    div.style.height = 'initial';
    div.style.backgroundColor = 'initial';
    div.appendChild(div.cloneNode(true));
    document.body.appendChild(div);

    let range = document.createRange();
    // 包含div
    range.selectNode(div);
    // 不包含div, 选中后代
    range.selectNodeContents(div);
    range.setStartAfter(div.firstChild);
    range.setStartBefore(div.lastChild);
    console.log(range.collapsed);
});
