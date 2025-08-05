"use strict";
/* eslint-disable  @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCommandError = exports.convertToCommandError = exports.InvalidArgumentError = exports.UnsupportedError = exports.LoginConflictError = exports.LoginNotFoundError = exports.PersistentSubscriptionDroppedError = exports.PersistentSubscriptionMaximumSubscribersReachedError = exports.PersistentSubscriptionExistsError = exports.PersistentSubscriptionDoesNotExistError = exports.PersistentSubscriptionFailedError = exports.RequiredMetadataPropertyMissingError = exports.MaxAppendSizeExceededError = exports.WrongExpectedVersionError = exports.ScavengeNotFoundError = exports.StreamDeletedError = exports.InvalidTransactionError = exports.AccessDeniedError = exports.NoStreamError = exports.StreamNotFoundError = exports.NotLeaderError = exports.UnknownError = exports.NotFoundError = exports.CancelledError = exports.UnavailableError = exports.DeadlineExceededError = exports.TimeoutError = exports.ErrorType = void 0;
/* istanbul ignore file */
const grpc_js_1 = require("@grpc/grpc-js");
const _1 = require(".");
var ErrorType;
(function (ErrorType) {
    ErrorType["TIMEOUT"] = "timeout";
    ErrorType["DEADLINE_EXCEEDED"] = "deadline-exceeded";
    ErrorType["UNAVAILABLE"] = "unavailable";
    ErrorType["CANCELLED"] = "cancelled";
    ErrorType["UNKNOWN"] = "unknown";
    ErrorType["NOT_LEADER"] = "not-leader";
    ErrorType["STREAM_NOT_FOUND"] = "stream-not-found";
    ErrorType["NO_STREAM"] = "no-stream";
    ErrorType["NOT_FOUND"] = "not-found";
    ErrorType["ACCESS_DENIED"] = "access-denied";
    ErrorType["INVALID_ARGUMENT"] = "invalid-argument";
    ErrorType["INVALID_TRANSACTION"] = "invalid-transaction";
    ErrorType["STREAM_DELETED"] = "stream-deleted";
    ErrorType["SCAVENGE_NOT_FOUND"] = "scavenge-not-found";
    ErrorType["WRONG_EXPECTED_VERSION"] = "wrong-expected-version";
    ErrorType["MAXIMUM_APPEND_SIZE_EXCEEDED"] = "maximum-append-size-exceeded";
    ErrorType["MISSING_REQUIRED_METADATA_PROPERTY"] = "missing-required-metadata-property";
    ErrorType["PERSISTENT_SUBSCRIPTION_FAILED"] = "persistent-subscription-failed";
    ErrorType["PERSISTENT_SUBSCRIPTION_DOES_NOT_EXIST"] = "persistent-subscription-does-not-exist";
    ErrorType["PERSISTENT_SUBSCRIPTION_EXISTS"] = "persistent-subscription-exists";
    ErrorType["PERSISTENT_SUBSCRIPTION_DROPPED"] = "persistent-subscription-dropped";
    ErrorType["MAXIMUM_SUBSCRIBERS_REACHED"] = "maximum-subscribers-reached";
    ErrorType["USER_NOT_FOUND"] = "user-not-found";
    ErrorType["USER_CONFLICT"] = "user-conflict";
    ErrorType["UNSUPPORTED"] = "unsupported";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class CommandErrorBase extends Error {
    code;
    message;
    _raw;
    constructor(error, message) {
        super(error?.message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.code = error?.code;
        this.message = error?.message ?? message ?? "";
        this._raw = error;
    }
}
class TimeoutError extends CommandErrorBase {
    type = ErrorType.TIMEOUT;
}
exports.TimeoutError = TimeoutError;
class DeadlineExceededError extends CommandErrorBase {
    type = ErrorType.DEADLINE_EXCEEDED;
}
exports.DeadlineExceededError = DeadlineExceededError;
class UnavailableError extends CommandErrorBase {
    type = ErrorType.UNAVAILABLE;
}
exports.UnavailableError = UnavailableError;
class CancelledError extends CommandErrorBase {
    type = ErrorType.CANCELLED;
}
exports.CancelledError = CancelledError;
class NotFoundError extends CommandErrorBase {
    type = ErrorType.NOT_FOUND;
}
exports.NotFoundError = NotFoundError;
class UnknownError extends CommandErrorBase {
    type = ErrorType.UNKNOWN;
}
exports.UnknownError = UnknownError;
class NotLeaderError extends CommandErrorBase {
    type = ErrorType.NOT_LEADER;
    leader;
    constructor(error) {
        super(error);
        const metadata = error.metadata?.getMap
            ? error.metadata.getMap()
            : error.metadata;
        this.leader = {
            address: metadata["leader-endpoint-host"].toString(),
            port: parseInt(metadata["leader-endpoint-port"].toString(), 10),
        };
    }
}
exports.NotLeaderError = NotLeaderError;
class StreamNotFoundError extends CommandErrorBase {
    type = ErrorType.STREAM_NOT_FOUND;
    streamName;
    static nameToString = (error, streamName) => {
        const name = streamName ?? error?.metadata?.getMap()["stream-name"] ?? "";
        if (typeof name === "string")
            return name;
        return Buffer.from(name).toString("utf8");
    };
    constructor(error, streamName) {
        super(error, `${StreamNotFoundError.nameToString(error, streamName)} not found`);
        this.streamName = StreamNotFoundError.nameToString(error, streamName);
    }
}
exports.StreamNotFoundError = StreamNotFoundError;
class NoStreamError extends CommandErrorBase {
    type = ErrorType.NO_STREAM;
}
exports.NoStreamError = NoStreamError;
class AccessDeniedError extends CommandErrorBase {
    type = ErrorType.ACCESS_DENIED;
}
exports.AccessDeniedError = AccessDeniedError;
class InvalidTransactionError extends CommandErrorBase {
    type = ErrorType.INVALID_TRANSACTION;
}
exports.InvalidTransactionError = InvalidTransactionError;
class StreamDeletedError extends CommandErrorBase {
    type = ErrorType.STREAM_DELETED;
    streamName;
    static fromStreamName = (streamName) => {
        return new StreamDeletedError(undefined, streamName);
    };
    constructor(error, streamName) {
        super(error);
        if (error) {
            const metadata = error.metadata.getMap();
            this.streamName = metadata["stream-name"].toString();
        }
        else {
            this.streamName = streamName;
        }
    }
}
exports.StreamDeletedError = StreamDeletedError;
class ScavengeNotFoundError extends CommandErrorBase {
    type = ErrorType.SCAVENGE_NOT_FOUND;
    scavengeId;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.scavengeId = metadata["scavenge-id"].toString();
    }
}
exports.ScavengeNotFoundError = ScavengeNotFoundError;
class WrongExpectedVersionError extends CommandErrorBase {
    type = ErrorType.WRONG_EXPECTED_VERSION;
    streamName;
    expectedState;
    actualState;
    static fromWrongExpectedVersion = (details, streamName) => {
        let expected = "any";
        switch (true) {
            case details.hasExpectedStreamPosition(): {
                expected = BigInt(details.getExpectedStreamPosition());
                break;
            }
            case details.hasExpectedStreamExists(): {
                expected = "stream_exists";
                break;
            }
            case details.hasExpectedNoStream(): {
                expected = "no_stream";
                break;
            }
        }
        return new WrongExpectedVersionError(undefined, {
            current: details.hasCurrentStreamRevision()
                ? BigInt(details.getCurrentStreamRevision())
                : "no_stream",
            expected,
            streamName,
        });
    };
    constructor(error, versions) {
        super(error);
        if (error) {
            const metadata = error.metadata.getMap();
            this.streamName = metadata["stream-name"].toString();
            this.expectedState = BigInt(metadata["expected-version"].toString());
            this.actualState = metadata["actual-version"]
                ? BigInt(metadata["actual-version"].toString())
                : "no_stream";
        }
        else {
            this.streamName = versions.streamName;
            this.expectedState = versions.expected;
            this.actualState = versions.current;
        }
    }
}
exports.WrongExpectedVersionError = WrongExpectedVersionError;
class MaxAppendSizeExceededError extends CommandErrorBase {
    type = ErrorType.MAXIMUM_APPEND_SIZE_EXCEEDED;
    maxAppendSize;
    static fromMaxAppendSize = (maxAppendSize) => {
        return new MaxAppendSizeExceededError(undefined, maxAppendSize);
    };
    constructor(error, maxAppendSize) {
        super(error);
        if (error) {
            const metadata = error.metadata.getMap();
            this.maxAppendSize = parseInt(metadata["maximum-append-size"].toString(), 10);
        }
        else {
            this.maxAppendSize = maxAppendSize;
        }
    }
}
exports.MaxAppendSizeExceededError = MaxAppendSizeExceededError;
class RequiredMetadataPropertyMissingError extends CommandErrorBase {
    type = ErrorType.MISSING_REQUIRED_METADATA_PROPERTY;
    requiredMetadataProperties;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.requiredMetadataProperties = metadata["required-metadata-properties"]
            .toString()
            .split(",");
    }
}
exports.RequiredMetadataPropertyMissingError = RequiredMetadataPropertyMissingError;
class PersistentSubscriptionFailedError extends CommandErrorBase {
    type = ErrorType.PERSISTENT_SUBSCRIPTION_FAILED;
    streamName;
    groupName;
    reason;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.streamName = metadata["stream-name"]?.toString() ?? "";
        this.groupName = metadata["group-name"]?.toString() ?? "";
        this.reason = metadata["reason"]?.toString() ?? "";
    }
}
exports.PersistentSubscriptionFailedError = PersistentSubscriptionFailedError;
class PersistentSubscriptionDoesNotExistError extends CommandErrorBase {
    type = ErrorType.PERSISTENT_SUBSCRIPTION_DOES_NOT_EXIST;
    streamName;
    groupName;
    constructor(error, passedMetadata) {
        super(error, passedMetadata
            ? `5 NOT_FOUND: Subscription group ${passedMetadata.groupName ?? ""} on stream ${passedMetadata.streamName} does not exist.`
            : undefined);
        if (passedMetadata) {
            this.streamName = passedMetadata.streamName;
            this.groupName = passedMetadata.groupName ?? "";
        }
        else {
            const metadata = error.metadata.getMap();
            this.streamName = metadata["stream-name"]?.toString() ?? "";
            this.groupName = metadata["group-name"]?.toString() ?? "";
        }
    }
}
exports.PersistentSubscriptionDoesNotExistError = PersistentSubscriptionDoesNotExistError;
class PersistentSubscriptionExistsError extends CommandErrorBase {
    type = ErrorType.PERSISTENT_SUBSCRIPTION_EXISTS;
    streamName;
    groupName;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.streamName = metadata["stream-name"]?.toString() ?? "";
        this.groupName = metadata["group-name"]?.toString() ?? "";
    }
}
exports.PersistentSubscriptionExistsError = PersistentSubscriptionExistsError;
class PersistentSubscriptionMaximumSubscribersReachedError extends CommandErrorBase {
    type = ErrorType.MAXIMUM_SUBSCRIBERS_REACHED;
    streamName;
    groupName;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.streamName = metadata["stream-name"]?.toString() ?? "";
        this.groupName = metadata["group-name"]?.toString() ?? "";
    }
}
exports.PersistentSubscriptionMaximumSubscribersReachedError = PersistentSubscriptionMaximumSubscribersReachedError;
class PersistentSubscriptionDroppedError extends CommandErrorBase {
    type = ErrorType.PERSISTENT_SUBSCRIPTION_DROPPED;
    streamName;
    groupName;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.streamName = metadata["stream-name"]?.toString() ?? "";
        this.groupName = metadata["group-name"]?.toString() ?? "";
    }
}
exports.PersistentSubscriptionDroppedError = PersistentSubscriptionDroppedError;
class LoginNotFoundError extends CommandErrorBase {
    type = ErrorType.USER_NOT_FOUND;
    LoginName;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.LoginName = metadata["login-name"].toString();
    }
}
exports.LoginNotFoundError = LoginNotFoundError;
class LoginConflictError extends CommandErrorBase {
    type = ErrorType.USER_CONFLICT;
    LoginName;
    constructor(error) {
        super(error);
        const metadata = error.metadata.getMap();
        this.LoginName = metadata["login-name"].toString();
    }
}
exports.LoginConflictError = LoginConflictError;
class UnsupportedError extends CommandErrorBase {
    type = ErrorType.UNSUPPORTED;
    feature;
    minimumVersion;
    constructor(feature, minimumVersion) {
        super(undefined, `${feature} requires server version ${minimumVersion} or higher.`);
        this.feature = feature;
        this.minimumVersion = minimumVersion;
    }
}
exports.UnsupportedError = UnsupportedError;
class InvalidArgumentError extends CommandErrorBase {
    type = ErrorType.INVALID_ARGUMENT;
    errorMessage;
    constructor(error) {
        super(undefined, error);
        this.errorMessage = error;
    }
}
exports.InvalidArgumentError = InvalidArgumentError;
const convertToCommandError = (error) => {
    if ((0, exports.isCommandError)(error) || !isServiceError(error))
        return error;
    const exception = error.metadata?.getMap()["exception"]?.toString();
    switch (exception) {
        case ErrorType.NOT_LEADER:
            return new NotLeaderError(error);
        case ErrorType.STREAM_NOT_FOUND:
            return new StreamNotFoundError(error);
        case ErrorType.NO_STREAM:
            return new NoStreamError(error);
        case ErrorType.ACCESS_DENIED:
            return new AccessDeniedError(error);
        case ErrorType.INVALID_TRANSACTION:
            return new InvalidTransactionError(error);
        case ErrorType.STREAM_DELETED:
            return new StreamDeletedError(error);
        case ErrorType.SCAVENGE_NOT_FOUND:
            return new ScavengeNotFoundError(error);
        case ErrorType.WRONG_EXPECTED_VERSION:
            return new WrongExpectedVersionError(error);
        case ErrorType.MAXIMUM_APPEND_SIZE_EXCEEDED:
            return new MaxAppendSizeExceededError(error);
        case ErrorType.MISSING_REQUIRED_METADATA_PROPERTY:
            return new RequiredMetadataPropertyMissingError(error);
        case ErrorType.PERSISTENT_SUBSCRIPTION_FAILED:
            return new PersistentSubscriptionFailedError(error);
        case ErrorType.PERSISTENT_SUBSCRIPTION_DOES_NOT_EXIST:
            return new PersistentSubscriptionDoesNotExistError(error);
        case ErrorType.PERSISTENT_SUBSCRIPTION_EXISTS:
            return new PersistentSubscriptionExistsError(error);
        case ErrorType.PERSISTENT_SUBSCRIPTION_DROPPED:
            return new PersistentSubscriptionDroppedError(error);
        case ErrorType.MAXIMUM_SUBSCRIBERS_REACHED:
            return new PersistentSubscriptionMaximumSubscribersReachedError(error);
        case ErrorType.USER_NOT_FOUND:
            return new LoginNotFoundError(error);
        case ErrorType.USER_CONFLICT:
            return new LoginConflictError(error);
    }
    switch (error.code) {
        case grpc_js_1.status.ABORTED:
            return new TimeoutError(error);
        case grpc_js_1.status.DEADLINE_EXCEEDED:
            return new DeadlineExceededError(error);
        case grpc_js_1.status.UNAVAILABLE:
            return new UnavailableError(error);
        case grpc_js_1.status.UNAUTHENTICATED:
            return new AccessDeniedError(error);
        case grpc_js_1.status.NOT_FOUND:
            return new NotFoundError(error);
        case grpc_js_1.status.CANCELLED: {
            if ((0, _1.isClientCancellationError)(error))
                break;
            return new CancelledError(error);
        }
    }
    // This is a temporary workaround for a bug in Node.js. Must be removed when the bug is fixed.
    // https://github.com/grpc/grpc-node/issues/2502
    // and https://github.com/nodejs/node/issues/49147
    if (error.details.includes("write after end")) {
        return new UnavailableError(error);
    }
    return new UnknownError(error);
};
exports.convertToCommandError = convertToCommandError;
const isCommandError = (error) => {
    return error instanceof CommandErrorBase;
};
exports.isCommandError = isCommandError;
const isServiceError = (error) => {
    return (("metadata" in error && error.metadata instanceof grpc_js_1.Metadata) ||
        ("code" in error && typeof error.code === "number"));
};
//# sourceMappingURL=CommandError.js.map