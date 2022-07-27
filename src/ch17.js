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
}, true);

run(() => {
    const div1 = document.createElement('div');
    div1.innerHTML = 11;
    const div2 = document.createElement('div');
    div2.style.padding = '10px';
    div2.appendChild(div1);
    document.body.appendChild(div2);
    // 对于下面两个事件 relatedTarget 可以拿到之前的 DOM
    div1.addEventListener('mouseover', (e) => {
        console.log('over', e.relatedTarget === div2);
    });
    div1.addEventListener('mouseout', (e) => {
        console.log('out', e.relatedTarget === div2);
    });
}, true);

run(() => {
    document.body.addEventListener('keypress', (e) => {
        console.log(e.key);
    });
}, true);

run(() => {
    let input = document.createElement('input');
    document.body.appendChild(input);
    input.addEventListener('input', (e) => {
        // 实际的字符， shift+s 会是 S
        console.log(e.data);
    });
    // 中文输入法
    input.addEventListener('compositionstart', (e) => {
        console.log(e.type, e.data);
    });
    input.addEventListener('compositionupdate', (e) => {
        console.log(e.type, e.data);
    });
    input.addEventListener('compositionend', (e) => {
        console.log(e.type, e.data);
    });
}, true);

run(() => {
    // 有些浏览器支持
    window.addEventListener('beforeunload', (e) => {
        e.returnValue = 'Are you sure?';
        return e.returnValue;
    });
}, true);

run(() => {
    // unload 前触发
    window.addEventListener('pagehide', (e) => console.log(e.type));
    window.addEventListener('pageshow', (e) => console.log(e.type));
}, true);

run(() => {
    window.addEventListener('hashchange', (e) => {
        console.log(location.hash);
    });
}, true);

run(() => {
    let div = document.createElement('div');
    document.body.appendChild(div);

    // 检测水平反转
    window.addEventListener('orientationchange', (e) => {
        div.innerHTML = `${e.type}, ${screen.orientation.angle}`;
    });
    let div2 = document.createElement('div');
    document.body.appendChild(div2);
    // 陀螺仪
    window.addEventListener('deviceorientation', (e) => {
        div2.innerHTML = `${e.type}, ${e.absolute} ${e.alpha}, ${e.beta}, ${e.gamma}`;
    });

    let div3 = document.createElement('div');
    document.body.appendChild(div3);
    window.addEventListener('devicemotion', (e) => {
        // 移动监测
        div3.innerHTML = `${e.type}. ${e.acceleration.x}, ${e.rotationRate.alpha}`;
    });
}, true);

run(() => {
    let div = document.createElement('div');
    document.body.appendChild(div);
    document.addEventListener('touchstart', (e) => {
        div.innerHTML = `${e.type}`;
    });
    document.addEventListener('touchmove', (e) => {
        div.innerHTML = `${e.type}, ${e.touches[0].pageX}`;
    });
    document.addEventListener('touchcancel', (e) => {
        div.innerHTML = `${e.type}`;
    });
    document.addEventListener('touchend', (e) => {
        div.innerHTML = `${e.type}`;
    });
}, true);

run(() => {
    // 模拟事件
    // 内置事件都有 **Event 的构造器
    // https://developer.mozilla.org/en-US/docs/Web/API/Event
    let btn = btnFactory();
    document.body.appendChild(btn);
    btn.onclick = (e) => console.log('click', e.clientX);
    let evt = new MouseEvent('click', {
        clientX: 10
    });
    btn.dispatchEvent(evt);
});
