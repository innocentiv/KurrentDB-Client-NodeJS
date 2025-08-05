"use strict";
/* istanbul ignore file */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
const debug_1 = __importDefault(require("debug"));
debug_1.default.formatters.g = function (v) {
    return debug_1.default.formatters.O.call(this, v.toObject());
};
debug_1.default.formatters.h = function ({ Authorization, ...rest }) {
    const headers = { ...rest };
    if (Authorization) {
        headers.Authorization = Authorization.replace(/ \S*/, " *****");
    }
    return debug_1.default.formatters.O.call(this, headers);
};
const base = (0, debug_1.default)("kdb");
const command = base.extend("command");
const command_grpc = command.extend("grpc");
const connection = base.extend("connection");
const events = base.extend("events");
exports.debug = {
    command,
    command_grpc,
    connection,
    events,
};
//# sourceMappingURL=debug.js.map