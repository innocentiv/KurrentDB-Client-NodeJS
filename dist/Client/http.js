"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP = void 0;
const http_1 = require("http");
const https_1 = require("https");
const url_1 = require("url");
const utils_1 = require("../utils");
class HTTP {
    #client;
    #channelCredentials;
    #defaultUserCredentials;
    #insecure;
    constructor(client, channelCredentials, defaultUserCredentials) {
        this.#client = client;
        this.#channelCredentials = channelCredentials;
        this.#defaultUserCredentials = defaultUserCredentials;
        this.#insecure = !!channelCredentials.insecure;
    }
    request = async (method, path, { searchParams, ...options }, body) => {
        const url = await this.createURL(path, searchParams);
        return this.makeRequest(method, url, options, body);
    };
    makeRequest = async (method, url, options, body) => new Promise((resolve, reject) => {
        const headers = {
            "content-type": "application/json",
            ...(options.headers ?? {}),
        };
        const credentials = options.credentials ?? this.#defaultUserCredentials;
        if (!this.#insecure && credentials) {
            headers["Authorization"] = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`;
        }
        const ca = this.#channelCredentials.rootCertificate
            ? [this.#channelCredentials.rootCertificate]
            : undefined;
        const callback = (res) => {
            if (res.statusCode === 307) {
                return resolve(this.makeRequest(method, new url_1.URL(res.headers.location, url), options, body));
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                const error = options.transformError?.(res.statusCode, res.statusMessage, res) ??
                    defaultTransformError(res.statusCode, res.statusMessage, res);
                return reject(error);
            }
            let response = "";
            res.on("data", (d) => {
                response += d;
            });
            res.on("end", () => {
                return resolve(JSON.parse(response));
            });
        };
        utils_1.debug.connection(`Making %s call to %s with headers %h`, method, url.toString(), headers);
        const req = this.#insecure
            ? (0, http_1.request)(url, {
                method,
                headers,
            }, callback)
            : (0, https_1.request)(url, {
                method,
                headers,
                ca,
            }, callback);
        req.on("error", (error) => {
            reject(error);
        });
        if (body) {
            req.write(body);
        }
        req.end();
    });
    createURL = async (pathname, searchParams = {}) => {
        const channel = await this.getChannel.call(this.#client);
        const protocol = this.#insecure ? "http://" : "https://";
        const target = channel.getTarget().replace(/^[a-z]*:/, protocol);
        const url = new url_1.URL(target);
        url.pathname = pathname;
        for (const [key, value] of Object.entries(searchParams)) {
            if (value != null) {
                url.searchParams.set(key, value);
            }
        }
        return url;
    };
    getChannel() {
        return this.getChannel();
    }
}
exports.HTTP = HTTP;
const defaultTransformError = (statusCode, statusMessage) => {
    switch (statusCode) {
        case 401: {
            return new utils_1.AccessDeniedError();
        }
    }
    return new utils_1.UnknownError(undefined, statusMessage);
};
//# sourceMappingURL=http.js.map