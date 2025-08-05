import { Readable, Writable, Duplex } from "stream";
import * as bridge from "@kurrent/bridge";
import { CallOptions, Channel, ChannelCredentials, Client as GRPCClient, Metadata, MethodDefinition } from "@grpc/grpc-js";
import type { NodePreference, GRPCClientConstructor, EndPoint, Credentials, BaseOptions } from "../types";
import { ServerFeatures } from "./ServerFeatures";
interface ClientOptions {
    /**
     * The amount of time (in milliseconds) to wait after which a keepalive ping is sent on the transport.
     * Use -1 to disable.
     * @defaultValue 10_000
     */
    keepAliveInterval?: number;
    /**
     * The amount of time (in milliseconds) the sender of the keepalive ping waits for an acknowledgement.
     * If it does not receive an acknowledgement within this time, it will close the connection.
     * @defaultValue 10_000
     */
    keepAliveTimeout?: number;
    /**
     * Whether to immediately throw an exception when an append fails.
     * @defaultValue true
     */
    throwOnAppendFailure?: boolean;
    /**
     * An optional length of time (in milliseconds) to use for gRPC deadlines.
     * @defaultValue 10_000
     */
    defaultDeadline?: number;
    /**
     * The name of the connection to use in logs.
     * @defaultValue uuid
     */
    connectionName?: string;
}
interface DiscoveryOptions {
    /**
     * How many times to attempt connection before throwing.
     */
    maxDiscoverAttempts?: number;
    /**
     * How long to wait before retrying (in milliseconds).
     */
    discoveryInterval?: number;
    /**
     * How long to wait for the request to time out (in seconds).
     */
    gossipTimeout?: number;
    /**
     * Preferred node type.
     */
    nodePreference?: NodePreference;
}
export interface DNSClusterOptions extends DiscoveryOptions, ClientOptions {
    discover: EndPoint;
}
export interface GossipClusterOptions extends DiscoveryOptions, ClientOptions {
    endpoints: EndPoint[];
}
export interface SingleNodeOptions extends ClientOptions {
    endpoint: EndPoint | string;
}
export interface ChannelCredentialOptions {
    /**
     * Whether to use an insecure connection.
     */
    insecure?: boolean;
    /**
     * The root certificate data.
     */
    rootCertificate?: Buffer;
    /**
     * The file containing the user certificate’s matching private key in PEM format.
     */
    userKeyFile?: Buffer;
    /**
     * The file containing the X.509 user certificate in PEM format.
     */
    userCertFile?: Buffer;
    /**
     * Additional options to modify certificate verification.
     */
    verifyOptions?: Parameters<typeof ChannelCredentials.createSsl>[3];
}
export declare class Client {
    #private;
    /**
     * Returns a connection from a connection string.
     * @param connectionString - The connection string for your database.
     */
    static connectionString(connectionString: TemplateStringsArray | string, ...parts: Array<string | number | boolean>): Client;
    protected constructor(rustClient: bridge.RustClient, connectionSettings: DNSClusterOptions, channelCredentials?: ChannelCredentialOptions, defaultUserCredentials?: Credentials);
    protected constructor(rustClient: bridge.RustClient, connectionSettings: GossipClusterOptions, channelCredentials?: ChannelCredentialOptions, defaultUserCredentials?: Credentials);
    protected constructor(rustClient: bridge.RustClient, connectionSettings: SingleNodeOptions, channelCredentials?: ChannelCredentialOptions, defaultUserCredentials?: Credentials);
    /**
     * The name of the connection to use in logs.
     * Can be set via {@link ClientOptions.connectionName} or `connectionName` in the connection string.
     */
    get connectionName(): string;
    private getGRPCClient;
    private disposableStreams;
    protected GRPCStreamCreator: <Client extends GRPCClient, T extends Writable | Readable | Duplex>(Client: GRPCClientConstructor<Client>, debugName: string, creator: (client: Client) => T | Promise<T>, cache?: WeakMap<Client, T | Promise<T>>) => () => Promise<T>;
    dispose: () => Promise<void>;
    protected execute: <Client extends GRPCClient, T>(Client: GRPCClientConstructor<Client>, debugName: string, action: (client: Client) => Promise<T>) => Promise<T>;
    protected get HTTPRequest(): <T = unknown>(method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH", path: string, { searchParams, ...options }: import("./http").HTTPRequestOptions, body?: string) => Promise<T>;
    protected getChannel: () => Promise<Channel>;
    private createGRPCClient;
    private shouldReconnect;
    protected handleError: (client: GRPCClient, error: Error) => Promise<void>;
    private createChannel;
    protected resolveUri: () => Promise<string>;
    private createCredentialsMetadataGenerator;
    protected callArguments: ({ credentials, requiresLeader, deadline, }: BaseOptions, callOptions?: CallOptions) => [Metadata, CallOptions];
    protected createDeadline(deadline?: number): Date;
    protected get capabilities(): Promise<ServerFeatures>;
    protected supports: (method: MethodDefinition<any, any>, feature?: string) => Promise<boolean>;
    protected get throwOnAppendFailure(): boolean;
    get rustClient(): bridge.RustClient;
}
export {};
