"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backpressuredWrite = void 0;
const cache = new WeakMap();
class BackpressureQueue {
    stream;
    queue = [];
    writing = false;
    constructor(stream) {
        this.stream = stream;
        this.stream.once("error", this.errorOut);
    }
    write = async (data) => new Promise((resolve, reject) => {
        this.queue.push({ data, resolve, reject });
        this.triggerWrite();
    });
    triggerWrite = async () => {
        if (this.writing)
            return;
        this.writing = true;
        while (this.queue.length) {
            const { data, resolve } = this.queue.shift();
            const written = this.stream.write(data);
            if (!written) {
                await new Promise((r) => this.stream.once("drain", r));
            }
            resolve();
        }
        this.cleanUp();
    };
    errorOut = (err) => {
        this.cleanUp();
        while (this.queue.length) {
            const { reject } = this.queue.shift();
            reject(err);
        }
    };
    cleanUp = () => {
        this.stream.removeListener("error", this.errorOut);
        cache.delete(this.stream);
    };
}
const backpressuredWrite = async (stream, data) => {
    if (!cache.has(stream)) {
        cache.set(stream, new BackpressureQueue(stream));
    }
    await cache.get(stream).write(data);
};
exports.backpressuredWrite = backpressuredWrite;
//# sourceMappingURL=backpressuredWrite.js.map