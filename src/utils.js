export function run(fn, disable) {
    if (disable) {
        return;
    }
    fn();
}
