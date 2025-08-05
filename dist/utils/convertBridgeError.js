"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertBridgeError = void 0;
const CommandError_1 = require("./CommandError");
// export const convertBridgeError = (
//   error: ServiceError,
//   streamName?: string
// ) => {
//   const stream = streamName ?? "unknown stream";
//
//   switch (error.name) {
//     case StreamNotFoundError.name:
//       throw new StreamNotFoundError(error, stream);
//     case StreamDeletedError.name:
//       throw StreamDeletedError.fromStreamName(stream);
//     case NotLeaderError.name:
//       throw new NotLeaderError(error);
//     case AccessDeniedError.name:
//       throw new AccessDeniedError(error);
//     default:
//       throw error;
//   }
// };
const convertBridgeError = (error, streamName) => {
    const stream = streamName ?? "unknown stream";
    const serviceError = error;
    switch (error.name) {
        case CommandError_1.StreamNotFoundError.name:
            return new CommandError_1.StreamNotFoundError(serviceError, stream);
        case CommandError_1.StreamDeletedError.name:
            return CommandError_1.StreamDeletedError.fromStreamName(stream);
        case CommandError_1.NotLeaderError.name:
            return new CommandError_1.NotLeaderError(serviceError);
        case CommandError_1.AccessDeniedError.name:
            return new CommandError_1.AccessDeniedError(serviceError);
        default:
            return error;
    }
};
exports.convertBridgeError = convertBridgeError;
//# sourceMappingURL=convertBridgeError.js.map