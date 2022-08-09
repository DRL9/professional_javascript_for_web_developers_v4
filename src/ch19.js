import { run } from './utils.js';

run(() => {
    let div = document.createElement('div');
    // 如果表单中有 submit button, 那么当表单聚焦时按下 enter 会触发提交
    div.innerHTML = `
    <form>
        <input type="text" name="t1" />
        <input type="text" name="t2" />
        <button type="button">submit</button>
        <button type="submit">submit</button>
        <button type='reset'>reset</button>
        <button id="btn1" type="button">select range</button>
    </form>
    `;
    document.body.appendChild(div);
    document.forms[0].onreset = (e) => {
        /**
         * @type {HTMLFormElement}
         */
        let form = e.target;
        //
        console.log(
            // 表单元素到集合
            form.elements,
            // 可以通过 name 获取
            form.elements['t1']
        );
    };
    document.forms[0].onsubmit = (e) => {
        console.log('submit');
        e.preventDefault();
        e.target.reset();
        // submit() 不会触发 submit 事件
        e.target.submit();
    };

    document.forms[0].elements.t1.onfocus = (e) => {
        // 聚焦时选中全部
        e.target.select();
    };
    document.forms[0].elements.t1.onselect = (e) => {
        // 打印选中的文本
        console.log(
            e.target.value.substring(
                e.target.selectionStart,
                e.target.selectionEnd
            )
        );
    };

    /**
     * @type {HTMLInputElement}
     */
    let t2 = document.forms[0].elements.t2;
    document.getElementById('btn1').addEventListener('click', (e) => {
        // 选中 第3-4个字符
        t2.setSelectionRange(2, 4);
        // 需要 focus 才能看到效果
        t2.focus();
    });
}, true);

run(() => {
    // 使用 iframe 做富文本编辑
    let div = document.createElement('div');
    div.innerHTML = `
    <iframe name="rich" style="height:100px;width:100px"></iframe>
    `;
    document.body.appendChild(div);
    window.frames[0].document.designMode = 'on';
});
