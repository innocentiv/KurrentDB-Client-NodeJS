"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const Client_1 = require("../Client");
const convertRustEvent_1 = require("../utils/convertRustEvent");
const convertBridgeError_1 = require("../utils/convertBridgeError");
Client_1.Client.prototype.readAll = function ({ maxCount = Number.MAX_SAFE_INTEGER, fromPosition = constants_1.START, resolveLinkTos = false, direction = constants_1.FORWARDS, ...baseOptions } = {}) {
    const options = {
        maxCount: BigInt(maxCount),
        fromPosition,
        resolvesLink: resolveLinkTos,
        direction,
        requiresLeader: baseOptions.requiresLeader ?? false,
        credentials: baseOptions.credentials,
        filter: baseOptions.filter,
    };
    let stream;
    try {
        stream = this.rustClient.readAll(options);
    }
    catch (error) {
        throw (0, convertBridgeError_1.convertBridgeError)(error);
    }
    const convert = async function* (stream) {
        try {
            for await (const events of stream) {
                for (const event of events) {
                    yield (0, convertRustEvent_1.convertRustEvent)(event);
                }
            }
        }
        catch (error) {
            throw (0, convertBridgeError_1.convertBridgeError)(error);
        }
    };
    return convert(stream);
};
//# sourceMappingURL=readAll.js.map