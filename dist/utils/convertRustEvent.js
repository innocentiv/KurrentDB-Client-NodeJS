"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRustRecord = exports.convertRustEvent = void 0;
const debug_1 = require("./debug");
const convertRustEvent = (rustClient) => {
    const resolved = {};
    if (rustClient.event != undefined) {
        resolved.event = (0, exports.convertRustRecord)(rustClient.event);
    }
    if (rustClient.link != undefined) {
        resolved.link = (0, exports.convertRustRecord)(rustClient.link);
    }
    if (rustClient.commitPosition != undefined) {
        resolved.commitPosition = BigInt(rustClient.commitPosition);
    }
    return resolved;
};
exports.convertRustEvent = convertRustEvent;
const safeParseJSON = (str, fallback, errorMessage) => {
    try {
        const parsed = JSON.parse(str);
        return parsed;
    }
    catch (error) {
        debug_1.debug.events(errorMessage);
        return fallback(str);
    }
};
const parseMetadata = (rustEvent, id) => {
    const metadata = rustEvent.metadata;
    if (!metadata.length)
        return;
    try {
        return JSON.parse(Buffer.from(metadata).toString("utf8"));
    }
    catch (error) {
        return metadata;
    }
};
const convertRustRecord = (rustEvent) => {
    const type = rustEvent.type;
    const streamId = rustEvent.streamId;
    const id = rustEvent.id;
    const created = new Date(rustEvent.created);
    const revision = rustEvent.revision;
    const metadata = parseMetadata(rustEvent, id);
    const isJson = rustEvent.isJson;
    const position = {
        commit: rustEvent.position?.commit !== undefined
            ? BigInt(rustEvent.position.commit)
            : undefined,
        prepare: rustEvent.position?.prepare !== undefined
            ? BigInt(rustEvent.position.prepare)
            : undefined,
    };
    if (isJson) {
        const dataStr = Buffer.from(rustEvent.data).toString("utf8");
        const data = safeParseJSON(dataStr, (d) => d, `Malformed JSON data in event ${id}`);
        return {
            streamId,
            id,
            revision,
            type,
            data,
            metadata,
            isJson,
            created,
            position,
        };
    }
    const data = rustEvent.data;
    return {
        streamId,
        id,
        revision,
        type,
        data,
        metadata,
        isJson,
        created,
        position,
    };
};
exports.convertRustRecord = convertRustRecord;
//# sourceMappingURL=convertRustEvent.js.map