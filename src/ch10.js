import { run } from './utils.js';

// 也可以使用 Function 构造函数
// 这种方式有性能问题，因为在运行时又解析了一次代码
run(() => {
    const sum = new Function('a', 'b', 'return a+b');
    console.log(sum(1, 2));
}, true);

run(() => {
    // 箭头函数限制
    const foo = (a) => {
        // 没有 arguments
        console.log(arguments);
        // 不能使用 new.target，
        // 会直接编译失败
        // console.log(new.target)
    };
    foo();
    // 不能 new
    new foo();
}, true);

run(() => {
    // 函数的 name
    function foo() {}
    let bar = foo;
    let baz = function () {};
    console.log(foo.name);
    console.log(bar.name);
    console.log(baz.name);
    console.log((() => {}).name);
    console.log(new Function().name);

    // 如果是 getter setter. 会有前缀
    let dog = {
        get age() {
            return 1;
        },
        set age(v) {}
    };
    let descriptor = Object.getOwnPropertyDescriptor(dog, 'age');
    console.log(descriptor.get.name); // get age
    console.log(descriptor.set.name); // set age

    // 如果使用了 bind
    console.log(foo.bind(dog).name); // bound foo
}, true);

run(() => {
    function foo(a, b) {
        // arguments 是一个 Array like 对象
        // 只有 function 声明的才会创建这个对象
        console.log('args size', arguments.length, '', arguments[0]);

        // 非严格模式下，
        arguments[1] = 2;
        console.log(a, b);
    }
    foo(10, 9);
}, true);

run(() => {
    let count = 0;
    const bar = () => count++;
    function foo(a = 1, b = 2, c = bar()) {
        // 默认参数不会影响到 arguments
        // 只有 c 缺省时， 才会调用 bar()
        console.log(a, b, arguments[1], c);
    }
    foo();
    foo(5, 5, 6);
    foo();
}, true);

run(() => {
    // 默认参数的时间死区问题
    // 参数是按顺序，等同与 let 的方式声明
    function foo(a = 1, b = a) {
        console.log(a, b);
    }
    foo();

    // wrong
    function bar(a = b, b = 1) {}
    function baz(a = b) {
        let b = 1;
    }
    bar();
    baz();
}, true);

run(() => {
    // 扩展运算符， 剩余参数
    const foo = (a, b, ...rest) => console.log(a, b, rest);
    foo(1, ...[1, 2, 3]);
}, true);

run(() => {
    // 下面两个 error 不一样
    foo(); // Cannot access 'foo' before initialization
    bar(); // bar is not a function
    var bar = () => {};
    let foo = () => {};
}, true);

run(() => {
    function foo() {
        console.log(arguments);
        // callee 指向调用的函数本身， 在严格模式下不能使用
        // console.log(arguments.callee);
        // caller 指向调用该函数的外部函数，严格模式不能使用
        // console.log(arguments.callee.caller);
    }
    foo();
    function bar() {
        // 如果直接调用，那么是 undefined, 如果使用new, 那么指向构造器
        console.log(new.target);
    }
    bar();
    new bar();
}, true);

run(() => {
    function foo(a, b, ...args) {}
    // .length 命名参数的个数
    console.log(foo.length);
}, true);
run(() => {
    globalThis.a = 1;
    function foo() {
        // 严格模式下， this 会是 undefined ， 不会自动指向 global
        console.log(this.a);
    }
    foo();
}, true);

run(() => {
    'use strict';
    // 尾部调用优化的触发条件
    // 1. 严格模式
    // 2. 外部函数在尾部 return 调用函数
    // 3. 尾部函数执行后不在运行其他代码
    // 4. 尾部函数没有引用外部函数的变量（没有闭包）
    function bar() {}
    function foo(a) {
        // 会运行尾部调用优化
        // 执行到这里， foo 的 stack frame 会 pop, bar的会 push
        return bar(a);
    }
    foo();

    function fib(n) {
        if (n < 2) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }
    // 没有尾部调用优化， 耗时久
    fib(40);
    function fib1(n) {
        if (n < 2) {
            return n;
        }
        return fibImpl(0, 1, n);
    }
    function fibImpl(a, b, n) {
        if (n === 0) {
            return n;
        }
        return fibImpl(b, a + b, n - 1);
    }
    // 有尾部调用优化
    fib1(1000);
}, true);

run(() => {
    let a = {
        aa: 1,
        foo() {
            return this.aa;
        }
    };
    // (a.foo)() 返回结果与下面相同， 因为 (a.foo) 与 a.foo 等效
    console.log(a.foo());
    console.log(a.foo());
});
