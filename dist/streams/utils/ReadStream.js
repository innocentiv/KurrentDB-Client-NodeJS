"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadStream = void 0;
const stream_1 = require("stream");
const utils_1 = require("../../utils");
class ReadStream extends stream_1.Transform {
    #convertGrpcEvent;
    #grpcStream;
    constructor(createGRPCStream, convertGrpcEvent, options) {
        super({ ...options, objectMode: true });
        this.#convertGrpcEvent = convertGrpcEvent;
        this.#grpcStream = createGRPCStream();
        this.initialize();
    }
    initialize = async () => {
        try {
            (await this.#grpcStream)
                .on("error", (err) => {
                if ((0, utils_1.isClientCancellationError)(err))
                    return;
                const error = (0, utils_1.convertToCommandError)(err);
                this.emit("error", error);
            })
                .pipe(this);
        }
        catch (error) {
            this.emit("error", error);
        }
    };
    _transform(resp, _encoding, next) {
        if (resp.hasConfirmation?.()) {
            this.emit("confirmation");
        }
        if (resp.hasStreamNotFound?.()) {
            const streamNotFound = resp.getStreamNotFound();
            this.#grpcStream.then((stream) => {
                stream.destroy(new utils_1.StreamNotFoundError(null, streamNotFound.getStreamIdentifier()?.getStreamName()));
                next();
            });
            return;
        }
        if (resp.hasEvent?.()) {
            const resolved = this.#convertGrpcEvent(resp.getEvent());
            return next(null, resolved);
        }
        next();
    }
    async cancel() {
        const stream = await this.#grpcStream;
        return new Promise((resolve) => {
            // https://github.com/grpc/grpc-node/issues/1464
            // https://github.com/grpc/grpc-node/issues/1652
            setImmediate(() => {
                stream.cancel();
                resolve();
            });
        });
    }
}
exports.ReadStream = ReadStream;
//# sourceMappingURL=ReadStream.js.map