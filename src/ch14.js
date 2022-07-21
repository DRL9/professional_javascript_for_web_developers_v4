import { run } from './utils.js';

const nodeFactory = () => {
    let $div = document.createElement('div');
    $div.innerHTML = '<p>hello</p>';
    $div.setAttribute('data-id', '22');
    return $div;
};

run(() => {
    const $div = nodeFactory();
    console.log($div.nodeType === Node.ELEMENT_NODE); // 1
    console.log($div.nodeName, $div.nodeValue); // DIV null
}, true);

run(() => {
    // Node 会实时更新UI
    const $div = nodeFactory();
    console.log($div.childNodes[0] === $div.childNodes.item(0));
}, true);

run(() => {
    const div1 = nodeFactory();
    const div2 = nodeFactory();
    const div3 = nodeFactory();
    const div4 = nodeFactory();
    div1.appendChild(div2);
    div1.insertBefore(div3, div2);
    console.log(div1.lastChild === div2);
    div1.replaceChild(div4, div2);
    console.log(div1.lastChild === div4);
    div1.removeChild(div4);
    console.log(div4.ownerDocument); // 还是指向 html
}, true);

run(() => {
    const div1 = nodeFactory();
    const onclick = () => {};
    div1.onclick = onclick;
    const div11 = div1.cloneNode(); // 只复制初始Node
    const div12 = div1.cloneNode(true); // 还复制子节点
    console.log(div1.onclick === div12.onclick); // false 监听器不会复制
    div1.appendChild(div11);
    console.log(div1.innerHTML);
    div1.appendChild(div12);
    console.log(div1.innerHTML);
}, true);

run(() => {
    console.log(document.documentElement);
    console.log(document.firstChild, document.lastChild);
    console.log(document.documentElement === document.lastChild);
    console.log(document.body === document.documentElement.lastChild);
}, true);

run(() => {
    console.log(
        document.title,
        document.URL,
        document.domain,
        document.referrer
    );
}, true);

run(() => {
    const div1 = nodeFactory();
    const div2 = nodeFactory();
    div2.setAttribute('name', 'hello');
    div1.appendChild(div2);
    const childs = div1.getElementsByTagName('div');
    // 可以使用 name 来获取
    console.log(
        childs,
        childs['hello'] === div2,
        childs.namedItem('hello') === div2
    );
}, true);

run(() => {
    let $a = document.createElement('a');
    document.body.appendChild($a);
    let $b = $a.cloneNode();
    $b.href = 'www.bing.com';
    document.body.appendChild($b);
    console.log(
        document.forms, // 所有表单
        document.links // 所有 包含 href的 <a>
    );
}, true);
