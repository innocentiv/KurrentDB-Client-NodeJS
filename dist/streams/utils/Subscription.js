"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const stream_1 = require("stream");
const utils_1 = require("../../utils");
class Subscription extends stream_1.Transform {
    convertGrpcEvent;
    #grpcStream;
    #checkpointReached;
    id;
    constructor(createGRPCStream, convertGrpcEvent, options, checkpointReached) {
        super({ ...options, objectMode: true });
        this.convertGrpcEvent = convertGrpcEvent;
        this.#grpcStream = createGRPCStream();
        this.#checkpointReached = checkpointReached;
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
    async _transform(resp, _encoding, next) {
        if (resp.hasConfirmation?.()) {
            this.id = resp.getConfirmation()?.getSubscriptionId();
            this.emit("confirmation");
        }
        if (resp.hasCaughtUp?.()) {
            const info = {};
            const grpc = resp.getCaughtUp();
            if (grpc.hasTimestamp()) {
                info.date = grpc.getTimestamp().toDate();
                if (grpc.hasStreamRevision()) {
                    info.revision = BigInt(grpc.getStreamRevision());
                }
                else if (grpc.hasPosition()) {
                    const position = grpc.getPosition();
                    info.position = {
                        commit: BigInt(position.getCommitPosition()),
                        prepare: BigInt(position.getPreparePosition()),
                    };
                }
            }
            this.emit("caughtUp", info);
        }
        if (resp.hasFellBehind?.()) {
            const info = {};
            const grpc = resp.getFellBehind();
            if (grpc.hasTimestamp()) {
                info.date = grpc.getTimestamp().toDate();
                if (grpc.hasStreamRevision()) {
                    info.revision = BigInt(grpc.getStreamRevision());
                }
                else if (grpc.hasPosition()) {
                    const position = grpc.getPosition();
                    info.position = {
                        commit: BigInt(position.getCommitPosition()),
                        prepare: BigInt(position.getPreparePosition()),
                    };
                }
            }
            this.emit("fellBehind", info);
        }
        if (resp.hasCheckpoint?.() && this.#checkpointReached) {
            const checkpoint = resp.getCheckpoint();
            const position = {
                commit: BigInt(checkpoint.getCommitPosition()),
                prepare: BigInt(checkpoint.getPreparePosition()),
            };
            await this.#checkpointReached(this, position);
        }
        if (resp.hasEvent?.()) {
            const resolved = this.convertGrpcEvent(resp.getEvent());
            return next(null, resolved);
        }
        next();
    }
    async unsubscribe() {
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
exports.Subscription = Subscription;
//# sourceMappingURL=Subscription.js.map