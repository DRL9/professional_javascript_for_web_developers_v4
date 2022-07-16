import { run } from './utils.js';

run(() => {
    // 10
    // 参数是 thenable 对象， 会，自动 调用该 then()方法
    Promise.resolve({ then: (cb) => cb(10) }).then(console.log);
}, true);

run(async () => {
    // 只会执行一次
    const p = new Promise((resolve) => {
        console.log('run');
        resolve(1);
    });
    let a = await p;
    let b = await p;
    console.log(a, b);
}, true);

run(() => {
    let p = Promise.resolve(1);
    let pp = Promise.resolve(p);
    // 如果 resolve 的参数是 Promise, 会直接返回该参数
    console.log(p === pp);

    let e = Promise.reject(1);
    let ee = Promise.reject(e);
    console.log(e === ee);
}, true);

run(() => {
    let p = Promise.resolve(1);
    // 不是 function 的 onResolve, 会被忽略
    // 等同于 p.then(a=>a)
    let pp = p.then('aa');
    setTimeout(() => {
        // pp 是 Promise {1}
        console.log(pp);
    }, 0);

    // .finally(finish) 返回最后一个 Promise 链的 resolve 的值 ，除了一下情况
    //  finish 返回Promise, 或者 finish 内部抛出异常
    // 但是如果 finish 返回 Promise resolve 之后， finally 返回的 Promise 的 resolve 值还是上一个链的
    let p2 = p.finally(() => undefined);
    let p3 = p.finally(() => 1);
    let p4 = p.finally(
        () => new Promise((resolve) => setTimeout(resolve, 0, 111))
    );
    setTimeout(() => {
        console.log(p2, p3); // Promise {1}
        console.log(p4); // Promise {pending}
        p4.then(console.log); // 1
    }, 0);
}, true);

run(() => {
    let syncResolve;
    // 调用 resolve 是在 下一个 微任务回调执行 then() 中的函数
    let p = new Promise((resolve) => {
        syncResolve = function () {
            console.log(1);
            resolve();
            console.log(2);
        };
    });
    syncResolve();
    p.then(() => console.log(4));
    console.log(3);
    // 1 2 3 4
}, true);

run(() => {
    // 会自动 对于非Promise ，会自动调用 Promise.resolve
    let p = Promise.all([1, Promise.resolve(2)]);
    p.then(console.log);

    // p0 的状态取决于第一个完成的item的，其他的item， 即使 reject 也会silent, 不会有 UnhandledPromiseRejection
    let p0 = Promise.race([
        1,
        new Promise((resolve) => setTimeout(resolve, 0, 1000)),
        Promise.reject(new Error('err'))
    ]);
    p0.then(console.log);
}, true);

run(() => {
    // cancel promise
    // Promise notify
});

run(async () => {
    let a = await 1;
    let b = await {
        then: (cb) => cb(2)
    };
    console.log(a, b);
}, true);

run(() => {
    async function a() {
        console.log(await Promise.resolve('a'));
    }
    async function b() {
        console.log(await 'b');
    }
    async function c() {
        console.log('c');
    }
    a();
    b();
    c();
}, true);

run(async () => {
    // 易错题
    async function randomDelay(id) {
        // Delay between 0 and 1000 ms
        const delay = Math.random() * 1000;
        return new Promise((resolve) =>
            setTimeout(() => {
                setTimeout(console.log, 0, `${id} finished`);
                resolve();
            }, delay)
        );
    }
    async function foo() {
        const p0 = randomDelay(0);
        const p1 = randomDelay(1);
        const p2 = randomDelay(2);
        const p3 = randomDelay(3);
        const p4 = randomDelay(4);
        await p0;
        await p1;
        await p2;
        await p3;
        await p4;
    }
    /**
     * @warning 并不一定是 0 1 2 3 4
     */
    foo();
}, true);
