"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("../Client");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const convertRustEvent_1 = require("../utils/convertRustEvent");
const convertBridgeError_1 = require("../utils/convertBridgeError");
Client_1.Client.prototype.readStream = function (streamName, { maxCount = Number.MAX_SAFE_INTEGER, fromRevision = constants_1.START, resolveLinkTos = false, direction = constants_1.FORWARDS, ...baseOptions } = {}) {
    const options = {
        maxCount: BigInt(maxCount),
        fromRevision,
        resolvesLink: resolveLinkTos,
        direction,
        requiresLeader: baseOptions.requiresLeader ?? false,
        credentials: baseOptions.credentials,
    };
    switch (fromRevision) {
        case constants_1.START: {
            break;
        }
        case constants_1.END: {
            break;
        }
        default: {
            const lowerBound = BigInt("0");
            const upperBound = BigInt("0xffffffffffffffff");
            if (fromRevision < lowerBound) {
                throw new utils_1.InvalidArgumentError(`fromRevision value must be a non-negative integer. Value Received: ${fromRevision}`);
            }
            if (fromRevision > upperBound) {
                throw new utils_1.InvalidArgumentError(`fromRevision value must be a non-negative integer, range from 0 to 18446744073709551615. Value Received: ${fromRevision}`);
            }
            options.fromRevision = fromRevision;
            break;
        }
    }
    let stream;
    try {
        stream = this.rustClient.readStream(streamName, options);
    }
    catch (error) {
        throw (0, convertBridgeError_1.convertBridgeError)(error, streamName);
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
            throw (0, convertBridgeError_1.convertBridgeError)(error, streamName);
        }
    };
    return convert(stream);
};
//# sourceMappingURL=readStream.js.map