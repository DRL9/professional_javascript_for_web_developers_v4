import { run } from './utils.js';

const nodeFactory = () => {
    let $div = document.createElement('div');
    $div.innerHTML = `
    <p>hello</p>
    今天
    <!-- comment -->
    <a href="www.baidu.com">world</a>
    `;
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

run(() => {
    let div = nodeFactory();
    document.body.appendChild(div);
    // 鼠标放上去显示的值
    div.title = 'hello world';
    console.log(div.title, div.lang);
    // 如果元素有样式， 修改 id, className 会立即生效
    console.log(div.id, div.dir);
    console.log(div.className, div.dir);
}, true);

run(() => {
    let div = nodeFactory();
    // 属性名不区分大小写
    console.log(div.getAttribute('data-id'));
    div.removeAttribute('data-id');

    div.style = 'color: red;';
    // 返回的是一个object, 可以直接访问对应的样式
    console.log(div.style, div.style.color);
    // 返回 string
    console.log(div.getAttribute('style'));

    div.onclick = () => {};
    // 取事件监听器，不会返回对应的函数
    console.log(div.getAttribute('onclick'));

    // 自定义属性，直接赋值给 element, 不会影响到 attribute
    div.custom = 1;
    console.log(div.getAttribute('custom'));
    div.setAttribute('custom', 1);

    console.log(div.getAttribute('custom'));
}, true);

run(() => {
    let div = nodeFactory();
    // 只有 Element 节点 有 attributes 属性
    const attribures = div.attributes;
    console.log(
        attribures.getNamedItem('data-id'),
        attribures['data-id'],
        attribures[0]
    );
    console.log(attribures.getNamedItem('data-id').nodeValue);
}, true);

run(() => {
    let div = nodeFactory();
    document.body.appendChild(div);
    // 注意 childElementCount 和 childNodes.length 不一定相等
    for (let i = 0; i < div.childNodes.length; i++) {
        let child = div.childNodes[i];
        console.log(child);
        if (child.nodeType === Node.TEXT_NODE) {
            // 文本节点的文本
            console.log('值是', child.nodeValue);
        }
    }
    // 文本节点的html tag 会直接显示
    let textNode = document.createTextNode('<strong>hello</strong>');
    div.appendChild(textNode);
    div.appendChild(textNode.cloneNode());
    console.log(div.childNodes.length, div.lastChild.nodeValue);
    // 合并相邻文本节点
    div.normalize();
    console.log(div.childNodes.length, div.lastChild.nodeValue);

    // 将文本节点分成两个
    div.lastChild.splitText(10);
    console.log(div.lastChild.nodeValue);
}, true);

run(() => {
    let div = nodeFactory();
    let commentNode;
    div.childNodes.forEach((node) => {
        if (node.nodeType === Node.COMMENT_NODE) {
            commentNode = node;
        }
    });
    // 注释节点有跟文本节点相同的方法， 除了 splitText
    console.log(commentNode);
    console.log(commentNode.data);
    let comm = document.createComment('hello');
    div.appendChild(comm);
    document.body.appendChild(div);

    // cdata-section

    // DocumentType
    // 不能直接创建
    console.log(document.doctype);
}, true);

run(() => {
    let div = nodeFactory();
    document.body.appendChild(div);
    //  浏览器不渲染 DocumentFragment
    let fragment = document.createDocumentFragment();
    // 将元素添加到 DocumentFragment ， 会直接都 dom 移除
    fragment.appendChild(div);

    // 插入 fragment到 DOM ， 会忽略 fragment 节点本身，仅插入 childNodes
    document.body.appendChild(fragment);
}, true);

run(() => {
    let script = document.createElement('script');
    script.innerHTML = 'console.log(11111)';
    document.body.appendChild(script);
    let div = document.createElement('div');
    // innserHTML 中的 script 不会被执行， 也不会显示在页面上
    div.innerHTML = `<script>${script.innerHTML}</script>`;
    document.body.appendChild(div);
}, true);

run(() => {
    // NodeList 会实时反应DOM，所以每次访问 length 都会查询对应的数
    let div = document.getElementsByTagName('div');
    console.log(div.length);
    document.body.appendChild(nodeFactory());
    console.log(div.length);
});
