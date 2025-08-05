"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUUID = void 0;
exports.parseUUID = parseUUID;
const uuid_1 = require("uuid");
const shared_pb_1 = require("../../generated/shared_pb");
const createUUID = (id = (0, uuid_1.v4)()) => {
    const uuid = new shared_pb_1.UUID();
    uuid.setString(id);
    return uuid;
};
exports.createUUID = createUUID;
function parseUUID(uuid) {
    if (!uuid)
        return undefined;
    if (uuid.hasStructured()) {
        const structured = uuid.getStructured();
        const leastSignificantBits = BigInt(structured.getLeastSignificantBits());
        const mostSignificantBits = BigInt(structured.getMostSignificantBits());
        const buffer = new ArrayBuffer(16);
        const dataView = new DataView(buffer);
        dataView.setBigUint64(0, mostSignificantBits);
        dataView.setBigUint64(8, leastSignificantBits);
        const uint8Array = new Uint8Array(buffer);
        return (0, uuid_1.stringify)(uint8Array);
    }
    return uuid.getString();
}
//# sourceMappingURL=grpcUUID.js.map