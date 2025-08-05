"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerFeatures = void 0;
const shared_pb_1 = require("../../generated/shared_pb");
const serverfeatures_grpc_pb_1 = require("../../generated/serverfeatures_grpc_pb");
const utils_1 = require("../utils");
const constants_1 = require("@grpc/grpc-js/build/src/constants");
const UNKNOWN = "unknown";
class ServerFeatures {
    serverVersion = UNKNOWN;
    #supported = new Map();
    static createServerFeatures = [
        serverfeatures_grpc_pb_1.ServerFeaturesClient,
        "getSupportedMethods",
        (client) => new Promise((resolve, reject) => {
            utils_1.debug.connection("Fetching server features");
            client.getSupportedMethods(new shared_pb_1.Empty(), (error, supportedMethods) => {
                if (error && error.code !== constants_1.Status.UNIMPLEMENTED) {
                    return reject(error);
                }
                return resolve(new ServerFeatures(error, supportedMethods));
            });
        }),
    ];
    constructor(error, supportedMethods) {
        if (error) {
            utils_1.debug.connection("Failed to fetch server features with error: %s", error.message);
            utils_1.debug.connection("Assuming unknown server version.");
            return;
        }
        this.serverVersion = supportedMethods.getEventStoreServerVersion();
        utils_1.debug.connection("Connected to server version %s", this.serverVersion);
        for (const method of supportedMethods.getMethodsList()) {
            const path = `/${method.getServiceName()}/${method.getMethodName()}`.toLowerCase();
            const features = method.getFeaturesList();
            this.#supported.set(path, new Set(features));
        }
    }
    supports = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method, feature) => {
        const path = method.path.toLowerCase();
        const isSupported = feature
            ? !!this.#supported.get(path)?.has(feature)
            : this.#supported.has(path);
        if (isSupported) {
            utils_1.debug.connection("%s %s is Supported", path, feature ?? "");
        }
        else {
            utils_1.debug.connection("%s %s is not Supported", path, feature ?? "");
        }
        return isSupported;
    };
}
exports.ServerFeatures = ServerFeatures;
//# sourceMappingURL=ServerFeatures.js.map