self.onmessage = ({ data }) => {
    const view = new Uint32Array(data);
    for (let i = 0; i < 1000; i++) {
        view[0] += 1;
    }
    self.postMessage(null);
};
