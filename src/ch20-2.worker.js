self.onmessage = ({ data }) => {
    // 只能在 worker 中使用
    const syncReader = new FileReaderSync();
    self.postMessage(syncReader.readAsArrayBuffer(data));
};
