"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsToUpdateGRPC = exports.settingsToCreateGRPC = void 0;
const persistent_pb_1 = require("../../../generated/persistent_pb");
const constants_1 = require("../../constants");
const settingsToCreateGRPC = (settings, ReqSettings) => {
    const reqSettings = new ReqSettings();
    reqSettings.setResolveLinks(settings.resolveLinkTos);
    reqSettings.setExtraStatistics(settings.extraStatistics);
    reqSettings.setMessageTimeoutMs(settings.messageTimeout);
    reqSettings.setCheckpointAfterMs(settings.checkPointAfter);
    reqSettings.setMaxRetryCount(settings.maxRetryCount);
    reqSettings.setMinCheckpointCount(settings.checkPointLowerBound);
    reqSettings.setMaxCheckpointCount(settings.checkPointUpperBound);
    switch (settings.maxSubscriberCount) {
        case constants_1.UNBOUNDED: {
            reqSettings.setMaxSubscriberCount(0);
            break;
        }
        default: {
            reqSettings.setMaxSubscriberCount(settings.maxSubscriberCount);
            break;
        }
    }
    reqSettings.setLiveBufferSize(settings.liveBufferSize);
    reqSettings.setReadBatchSize(settings.readBatchSize);
    reqSettings.setHistoryBufferSize(settings.historyBufferSize);
    switch (settings.consumerStrategyName) {
        case constants_1.DISPATCH_TO_SINGLE: {
            reqSettings.setConsumerStrategy(constants_1.DISPATCH_TO_SINGLE);
            break;
        }
        case constants_1.PINNED: {
            reqSettings.setConsumerStrategy(constants_1.PINNED);
            break;
        }
        case constants_1.ROUND_ROBIN: {
            reqSettings.setConsumerStrategy(constants_1.ROUND_ROBIN);
            break;
        }
        case constants_1.PINNED_BY_CORRELATION: {
            reqSettings.setConsumerStrategy(constants_1.PINNED_BY_CORRELATION);
            break;
        }
        default: {
            console.warn(`Unknown consumerStrategyName ${settings.consumerStrategyName}.`);
            break;
        }
    }
    return reqSettings;
};
exports.settingsToCreateGRPC = settingsToCreateGRPC;
const settingsToUpdateGRPC = (settings, ReqSettings) => {
    const reqSettings = new ReqSettings();
    reqSettings.setResolveLinks(settings.resolveLinkTos);
    reqSettings.setExtraStatistics(settings.extraStatistics);
    reqSettings.setMessageTimeoutMs(settings.messageTimeout);
    reqSettings.setCheckpointAfterMs(settings.checkPointAfter);
    reqSettings.setMaxRetryCount(settings.maxRetryCount);
    reqSettings.setMinCheckpointCount(settings.checkPointLowerBound);
    reqSettings.setMaxCheckpointCount(settings.checkPointUpperBound);
    switch (settings.maxSubscriberCount) {
        case constants_1.UNBOUNDED: {
            reqSettings.setMaxSubscriberCount(0);
            break;
        }
        default: {
            reqSettings.setMaxSubscriberCount(settings.maxSubscriberCount);
            break;
        }
    }
    reqSettings.setLiveBufferSize(settings.liveBufferSize);
    reqSettings.setReadBatchSize(settings.readBatchSize);
    reqSettings.setHistoryBufferSize(settings.historyBufferSize);
    switch (settings.consumerStrategyName) {
        case constants_1.DISPATCH_TO_SINGLE: {
            reqSettings.setNamedConsumerStrategy(persistent_pb_1.UpdateReq.ConsumerStrategy.DISPATCHTOSINGLE);
            break;
        }
        case constants_1.PINNED: {
            reqSettings.setNamedConsumerStrategy(persistent_pb_1.UpdateReq.ConsumerStrategy.PINNED);
            break;
        }
        case constants_1.ROUND_ROBIN: {
            reqSettings.setNamedConsumerStrategy(persistent_pb_1.UpdateReq.ConsumerStrategy.ROUNDROBIN);
            break;
        }
        case constants_1.PINNED_BY_CORRELATION: {
            console.warn(`PinnedByCorrelation is not supported for update.`);
            break;
        }
        default: {
            console.warn(`Unknown consumerStrategyName ${settings.consumerStrategyName}.`);
            break;
        }
    }
    return reqSettings;
};
exports.settingsToUpdateGRPC = settingsToUpdateGRPC;
//# sourceMappingURL=settingsToGRPC.js.map