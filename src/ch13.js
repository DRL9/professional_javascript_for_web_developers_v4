import { run } from './utils.js';

run(() => {
    console.log(navigator.userAgent);
    // 不正规的重写 UA
    navigator.__defineGetter__('userAgent', () => 'hello');
    console.log(navigator.userAgent);
}, true);

run(() => {
    // 需要https
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            console.log(pos);
            console.log(pos.timestamp, pos.coords);
        },
        (err) => {
            console.log('fail');
            console.log(err.code);
            console.log(err.PERMISSION_DENIED);
        }
    );
}, true);

run(() => {
    console.log(navigator.connection);
    window.addEventListener('online', () => console.log('online'));
    window.addEventListener('offline', () => console.log('offline'));
}, true);

run(async () => {
    console.log(await navigator.getBattery());
});
