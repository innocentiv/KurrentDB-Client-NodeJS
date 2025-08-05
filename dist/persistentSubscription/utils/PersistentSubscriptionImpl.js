"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentSubscriptionImpl = void 0;
const stream_1 = require("stream");
const persistent_pb_1 = require("../../../generated/persistent_pb");
const utils_1 = require("../../utils");
class PersistentSubscriptionImpl extends stream_1.Transform {
    #grpcStream;
    convertGrpcEvent;
    id;
    constructor(createGRPCStream, convertGrpcEvent, options) {
        super({ ...options, objectMode: true });
        this.#grpcStream = createGRPCStream();
        this.convertGrpcEvent = convertGrpcEvent;
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
        if (resp.hasSubscriptionConfirmation()) {
            this.id = resp.getSubscriptionConfirmation()?.getSubscriptionId();
            this.emit("confirmation");
        }
        if (resp.hasEvent()) {
            const resolved = this.convertGrpcEvent(resp.getEvent());
            next(null, resolved);
            return;
        }
        next();
    }
    async ack(...events) {
        try {
            const req = new persistent_pb_1.ReadReq();
            const ack = new persistent_pb_1.ReadReq.Ack();
            for (const event of events) {
                const id = event.link?.id ?? event.event?.id;
                // A resolved event will always have either link or event (or both), so this should to be unreachable
                if (!id)
                    throw new Error("Attempted to ack an event with no id");
                const uuid = (0, utils_1.createUUID)(id);
                ack.addIds(uuid);
            }
            req.setAck(ack);
            const stream = await this.#grpcStream;
            await (0, utils_1.backpressuredWrite)(stream, req);
        }
        catch (error) {
            throw (0, utils_1.convertToCommandError)(error);
        }
    }
    async nack(action, reason, ...events) {
        try {
            const req = new persistent_pb_1.ReadReq();
            const nack = new persistent_pb_1.ReadReq.Nack();
            switch (action) {
                case "park":
                    nack.setAction(persistent_pb_1.ReadReq.Nack.Action.PARK);
                    break;
                case "retry":
                    nack.setAction(persistent_pb_1.ReadReq.Nack.Action.RETRY);
                    break;
                case "skip":
                    nack.setAction(persistent_pb_1.ReadReq.Nack.Action.SKIP);
                    break;
                case "stop":
                    nack.setAction(persistent_pb_1.ReadReq.Nack.Action.STOP);
                    break;
            }
            for (const event of events) {
                const id = event.link?.id ?? event.event?.id;
                // A resolved event will always have either link or event (or both), so this should to be unreachable
                if (!id)
                    throw new Error("Attempted to ack an event with no id");
                const uuid = (0, utils_1.createUUID)(id);
                nack.addIds(uuid);
            }
            nack.setReason(reason);
            req.setNack(nack);
            const stream = await this.#grpcStream;
            await (0, utils_1.backpressuredWrite)(stream, req);
        }
        catch (error) {
            throw (0, utils_1.convertToCommandError)(error);
        }
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
exports.PersistentSubscriptionImpl = PersistentSubscriptionImpl;
//# sourceMappingURL=PersistentSubscriptionImpl.js.map