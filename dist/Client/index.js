"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const bridge = __importStar(require("@kurrent/bridge"));
const uuid_1 = require("uuid");
const grpc_js_1 = require("@grpc/grpc-js");
const call_1 = require("@grpc/grpc-js/build/src/call");
const utils_1 = require("../utils");
const discovery_1 = require("./discovery");
const parseConnectionString_1 = require("./parseConnectionString");
const ServerFeatures_1 = require("./ServerFeatures");
const http_1 = require("./http");
class Client {
    #rustClient;
    #throwOnAppendFailure;
    #connectionSettings;
    #channelCredentials;
    #insecure;
    #keepAliveInterval;
    #keepAliveTimeout;
    #defaultDeadline;
    #defaultCredentials;
    #nextChannelSettings;
    #channel;
    #serverFeatures;
    #grpcClients = new Map();
    #http;
    #connectionName;
    /**
     * Returns a connection from a connection string.
     * @param connectionString - The connection string for your database.
     */
    static connectionString(connectionString, ...parts) {
        const string = Array.isArray(connectionString)
            ? connectionString.reduce((acc, chunk, i) => `${acc}${chunk}${parts[i] ?? ""}`, "")
            : connectionString;
        utils_1.debug.connection(`Using connection string: ${string}`);
        const options = (0, parseConnectionString_1.parseConnectionString)(string);
        const channelCredentials = {
            insecure: options.tls === false,
        };
        if (options.tlsCAFile) {
            if (channelCredentials.insecure) {
                utils_1.debug.connection("tslCAFile passed to insecure connection. Will be ignored.");
            }
            else {
                const resolvedPath = (0, path_1.isAbsolute)(options.tlsCAFile)
                    ? options.tlsCAFile
                    : (0, path_1.resolve)(process.cwd(), options.tlsCAFile);
                utils_1.debug.connection(`Resolved tslCAFile option as ${resolvedPath}`);
                if (!(0, fs_1.existsSync)(resolvedPath)) {
                    throw new Error("Failed to load certificate file. File was not found.");
                }
                channelCredentials.rootCertificate = (0, fs_1.readFileSync)(resolvedPath);
            }
        }
        if (options.userCertFile || options.userKeyFile) {
            if (!options.userCertFile || !options.userKeyFile) {
                throw new Error("userCertFile must be given with accompanying userKeyFile");
            }
            const certPathResolved = (0, path_1.isAbsolute)(options.userCertFile)
                ? options.userCertFile
                : (0, path_1.resolve)(process.cwd(), options.userCertFile);
            const certKeyPathResolved = (0, path_1.isAbsolute)(options.userKeyFile)
                ? options.userKeyFile
                : (0, path_1.resolve)(process.cwd(), options.userKeyFile);
            if (!(0, fs_1.existsSync)(certPathResolved)) {
                throw new Error("Failed to load certificate file. File was not found.");
            }
            if (!(0, fs_1.existsSync)(certKeyPathResolved)) {
                throw new Error("Failed to load certificate key file. File was not found.");
            }
            channelCredentials.userKeyFile = (0, fs_1.readFileSync)(certKeyPathResolved);
            channelCredentials.userCertFile = (0, fs_1.readFileSync)(certPathResolved);
        }
        const rustClient = bridge.createClient(string);
        if (options.dnsDiscover) {
            const [discover] = options.hosts;
            if (options.hosts.length > 1) {
                utils_1.debug.connection(`More than one address provided for discovery. Using first: ${discover.address}:${discover.port}.`);
            }
            return new Client(rustClient, {
                discover,
                nodePreference: options.nodePreference,
                discoveryInterval: options.discoveryInterval,
                gossipTimeout: options.gossipTimeout,
                maxDiscoverAttempts: options.maxDiscoverAttempts,
                throwOnAppendFailure: options.throwOnAppendFailure,
                keepAliveInterval: options.keepAliveInterval,
                keepAliveTimeout: options.keepAliveTimeout,
                defaultDeadline: options.defaultDeadline,
                connectionName: options.connectionName,
            }, channelCredentials, options.defaultCredentials);
        }
        if (options.hosts.length > 1) {
            return new Client(rustClient, {
                endpoints: options.hosts,
                nodePreference: options.nodePreference,
                discoveryInterval: options.discoveryInterval,
                gossipTimeout: options.gossipTimeout,
                maxDiscoverAttempts: options.maxDiscoverAttempts,
                throwOnAppendFailure: options.throwOnAppendFailure,
                keepAliveInterval: options.keepAliveInterval,
                keepAliveTimeout: options.keepAliveTimeout,
                defaultDeadline: options.defaultDeadline,
                connectionName: options.connectionName,
            }, channelCredentials, options.defaultCredentials);
        }
        return new Client(rustClient, {
            endpoint: options.hosts[0],
            throwOnAppendFailure: options.throwOnAppendFailure,
            keepAliveInterval: options.keepAliveInterval,
            keepAliveTimeout: options.keepAliveTimeout,
            defaultDeadline: options.defaultDeadline,
            connectionName: options.connectionName,
        }, channelCredentials, options.defaultCredentials);
    }
    constructor(rustClient, { throwOnAppendFailure = true, keepAliveInterval = 10_000, keepAliveTimeout = 10_000, defaultDeadline = 10_000, connectionName = (0, uuid_1.v4)(), ...connectionSettings }, channelCredentials = { insecure: false }, defaultUserCredentials) {
        if (keepAliveInterval < -1) {
            throw new Error(`Invalid keepAliveInterval "${keepAliveInterval}". Please provide a positive integer, or -1 to disable.`);
        }
        if (keepAliveTimeout < -1) {
            throw new Error(`Invalid keepAliveTimeout "${keepAliveTimeout}". Please provide a positive integer, or -1 to disable.`);
        }
        if (keepAliveInterval > -1 && keepAliveInterval < 10_000) {
            console.warn(`Specified KeepAliveInterval of ${keepAliveInterval} is less than recommended 10_000 ms.`);
        }
        if (defaultDeadline <= 0) {
            throw new Error(`Invalid defaultDeadline "${defaultDeadline}". Please provide a positive integer.`);
        }
        this.#rustClient = rustClient;
        this.#throwOnAppendFailure = throwOnAppendFailure;
        this.#keepAliveInterval = keepAliveInterval;
        this.#keepAliveTimeout = keepAliveTimeout;
        this.#defaultDeadline = defaultDeadline;
        this.#connectionSettings = connectionSettings;
        this.#insecure = !!channelCredentials.insecure;
        this.#defaultCredentials = defaultUserCredentials;
        this.#connectionName = connectionName;
        this.#http = new http_1.HTTP(this, channelCredentials, defaultUserCredentials);
        if (this.#insecure) {
            utils_1.debug.connection("Using insecure channel");
            this.#channelCredentials = grpc_js_1.credentials.createInsecure();
        }
        else {
            utils_1.debug.connection("Using secure channel with credentials %O", channelCredentials);
            this.#channelCredentials = grpc_js_1.credentials.createSsl(channelCredentials.rootCertificate, channelCredentials.userKeyFile, channelCredentials.userCertFile, channelCredentials.verifyOptions);
        }
    }
    /**
     * The name of the connection to use in logs.
     * Can be set via {@link ClientOptions.connectionName} or `connectionName` in the connection string.
     */
    get connectionName() {
        return this.#connectionName;
    }
    // Internal access to grpc client.
    getGRPCClient = async (Client, debugName) => {
        if (this.#grpcClients.has(Client)) {
            utils_1.debug.connection("Using existing grpc client for %s", debugName);
        }
        else {
            utils_1.debug.connection("Creating client for %s", debugName);
            this.#grpcClients.set(Client, this.createGRPCClient(Client));
        }
        return this.#grpcClients.get(Client);
    };
    disposableStreams = new Set();
    // Internal handled execution
    GRPCStreamCreator = (Client, debugName, creator, cache) => async () => {
        const client = await this.getGRPCClient(Client, debugName);
        if (cache && cache.has(client))
            return cache.get(client);
        const streamPromise = creator(client);
        cache?.set(client, streamPromise);
        const stream = await streamPromise;
        this.disposableStreams.add(stream);
        (0, stream_1.finished)(stream, (err) => {
            cache?.delete(client);
            this.disposableStreams.delete(stream);
            if (err)
                this.handleError(client, err);
        });
        return stream;
    };
    dispose = async () => {
        utils_1.debug.command(`Disposing ${this.disposableStreams.size} streams.`);
        const promises = [];
        for (const stream of this.disposableStreams) {
            promises.push(new Promise((resolve) => {
                (0, stream_1.finished)(stream, resolve);
            }));
            if (stream instanceof call_1.ClientWritableStreamImpl ||
                stream instanceof call_1.ClientDuplexStreamImpl ||
                stream instanceof call_1.ClientUnaryCallImpl ||
                stream instanceof call_1.ClientReadableStreamImpl) {
                stream.cancel();
            }
            else {
                stream.destroy();
            }
        }
        await Promise.allSettled(promises);
        utils_1.debug.command(`Disposed ${promises.length} streams.`);
    };
    // Internal handled execution
    execute = async (Client, debugName, action) => {
        const client = await this.getGRPCClient(Client, debugName);
        try {
            return await action(client);
        }
        catch (error) {
            this.handleError(client, error);
            throw error;
        }
    };
    get HTTPRequest() {
        return this.#http.request;
    }
    getChannel = async () => {
        if (this.#channel) {
            utils_1.debug.connection("Using existing connection");
            return this.#channel;
        }
        this.#channel = this.createChannel();
        return this.#channel;
    };
    createGRPCClient = async (Client) => {
        const channelOverride = await this.getChannel();
        const client = new Client(null, null, {
            channelOverride,
        });
        return client;
    };
    shouldReconnect = (err) => {
        const error = (0, utils_1.convertToCommandError)(err);
        if (error instanceof utils_1.NotLeaderError) {
            return [true, error.leader];
        }
        return [
            // Server is unavailable to take request
            error instanceof utils_1.UnavailableError ||
                // Server has cancelled a long-running request
                error instanceof utils_1.CancelledError,
        ];
    };
    handleError = async (client, error) => {
        const [shouldReconnect, nextEndpoint] = this.shouldReconnect(error);
        if (!shouldReconnect)
            return;
        utils_1.debug.connection("Got reconnection error", error.message);
        const failedChannel = client.getChannel();
        const currentChannel = await this.#channel;
        if (failedChannel !== currentChannel) {
            utils_1.debug.connection("Channel already reconnected");
            return;
        }
        utils_1.debug.connection(`Reconnection required${nextEndpoint ? ` to: ${nextEndpoint}` : ""}`);
        const [_protocol, address, port] = failedChannel.getTarget().split(":");
        failedChannel.close();
        this.#grpcClients.clear();
        this.#channel = undefined;
        this.#serverFeatures = undefined;
        this.#nextChannelSettings = {
            failedEndpoint: {
                address,
                port: Number.parseInt(port),
            },
            nextEndpoint,
        };
    };
    createChannel = async () => {
        const uri = await this.resolveUri();
        utils_1.debug.connection(`Connecting to http${this.#channelCredentials._isSecure() ? "s" : ""}://%s`, uri);
        this.#nextChannelSettings = undefined;
        return new grpc_js_1.Channel(uri, this.#channelCredentials, {
            "grpc.keepalive_time_ms": this.#keepAliveInterval < 0
                ? Number.MAX_VALUE
                : this.#keepAliveInterval,
            "grpc.keepalive_timeout_ms": this.#keepAliveTimeout < 0 ? Number.MAX_VALUE : this.#keepAliveTimeout,
            // EventStore allows events of up to 16mb to be written internally.
            // While you can't write events this large through gRPC, you could do so through the TCP client, or through projections.
            // To allow the client to read any event that KurrentDB was able to write, we want to hardcode the max receive message length to 17mb.
            "grpc.max_receive_message_length": 17 * 1024 * 1024,
        });
    };
    resolveUri = async () => {
        if (this.#nextChannelSettings?.nextEndpoint) {
            const { address, port } = this.#nextChannelSettings.nextEndpoint;
            return `${address}:${port}`;
        }
        if ("endpoint" in this.#connectionSettings) {
            const { endpoint } = this.#connectionSettings;
            return typeof endpoint === "string"
                ? endpoint
                : `${endpoint.address}:${endpoint.port}`;
        }
        try {
            const { address, port } = await (0, discovery_1.discoverEndpoint)(this.#connectionSettings, this.#channelCredentials, this.#nextChannelSettings?.failedEndpoint);
            return `${address}:${port}`;
        }
        catch (error) {
            this.#grpcClients.clear();
            this.#channel = undefined;
            throw error;
        }
    };
    createCredentialsMetadataGenerator = ({ username, password, }) => (_, cb) => {
        const metadata = new grpc_js_1.Metadata();
        if (this.#insecure) {
            utils_1.debug.connection("Credentials are unsupported in insecure mode, and will be ignored.");
        }
        else {
            const auth = Buffer.from(`${username}:${password}`).toString("base64");
            metadata.add("authorization", `Basic ${auth}`);
        }
        return cb(null, metadata);
    };
    callArguments = ({ credentials = this.#defaultCredentials, requiresLeader, deadline, }, callOptions) => {
        const metadata = new grpc_js_1.Metadata();
        const options = callOptions ? { ...callOptions } : {};
        metadata.add("connection-name", this.#connectionName);
        if (requiresLeader) {
            metadata.add("requires-leader", "true");
        }
        if (credentials) {
            options.credentials = grpc_js_1.CallCredentials.createFromMetadataGenerator(this.createCredentialsMetadataGenerator(credentials));
        }
        options.deadline = options.deadline ?? this.createDeadline(deadline);
        return [metadata, options];
    };
    createDeadline(deadline = this.#defaultDeadline) {
        // grpcJS chokes on an invalid date, so we cap the deadline to max 1 year.
        return new Date(Date.now() + Math.min(deadline, 0x757b12c00));
    }
    get capabilities() {
        if (!this.#serverFeatures) {
            utils_1.debug.command("Fetching server capabilities");
            this.#serverFeatures = this.execute(...ServerFeatures_1.ServerFeatures.createServerFeatures);
        }
        return this.#serverFeatures;
    }
    supports = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method, feature) => (await this.capabilities).supports(method, feature);
    get throwOnAppendFailure() {
        return this.#throwOnAppendFailure;
    }
    get rustClient() {
        return this.#rustClient;
    }
}
exports.Client = Client;
//# sourceMappingURL=index.js.map