import {
  CreateReq,
  UpdateReq,
} from "../../../generated/kurrentdb/protocols/v1/persistentsubscriptions_pb";

import {
  DISPATCH_TO_SINGLE,
  PINNED,
  PINNED_BY_CORRELATION,
  ROUND_ROBIN,
  UNBOUNDED,
} from "../../constants";

import type {
  PersistentSubscriptionToStreamSettings,
  PersistentSubscriptionToAllSettings,
} from "./persistentSubscriptionSettings";

type CreateGRPCSettings = typeof CreateReq.Settings;
type UpdateGRPCSettings = typeof UpdateReq.Settings;

export const settingsToCreateGRPC = <T extends CreateGRPCSettings>(
  settings:
    | PersistentSubscriptionToStreamSettings
    | PersistentSubscriptionToAllSettings,
  ReqSettings: T
): InstanceType<T> => {
  const reqSettings = new ReqSettings() as InstanceType<T>;

  reqSettings.setResolveLinks(settings.resolveLinkTos);
  reqSettings.setExtraStatistics(settings.extraStatistics);
  reqSettings.setMessageTimeoutMs(settings.messageTimeout);
  reqSettings.setCheckpointAfterMs(settings.checkPointAfter);
  reqSettings.setMaxRetryCount(settings.maxRetryCount);
  reqSettings.setMinCheckpointCount(settings.checkPointLowerBound);
  reqSettings.setMaxCheckpointCount(settings.checkPointUpperBound);

  switch (settings.maxSubscriberCount) {
    case UNBOUNDED: {
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
    case DISPATCH_TO_SINGLE: {
      reqSettings.setConsumerStrategy(DISPATCH_TO_SINGLE);
      break;
    }
    case PINNED: {
      reqSettings.setConsumerStrategy(PINNED);
      break;
    }
    case ROUND_ROBIN: {
      reqSettings.setConsumerStrategy(ROUND_ROBIN);
      break;
    }
    case PINNED_BY_CORRELATION: {
      reqSettings.setConsumerStrategy(PINNED_BY_CORRELATION);
      break;
    }
    default: {
      console.warn(
        `Unknown consumerStrategyName ${settings.consumerStrategyName}.`
      );
      break;
    }
  }

  return reqSettings;
};

export const settingsToUpdateGRPC = <T extends UpdateGRPCSettings>(
  settings:
    | PersistentSubscriptionToStreamSettings
    | PersistentSubscriptionToAllSettings,
  ReqSettings: T
): InstanceType<T> => {
  const reqSettings = new ReqSettings() as InstanceType<T>;

  reqSettings.setResolveLinks(settings.resolveLinkTos);
  reqSettings.setExtraStatistics(settings.extraStatistics);
  reqSettings.setMessageTimeoutMs(settings.messageTimeout);
  reqSettings.setCheckpointAfterMs(settings.checkPointAfter);
  reqSettings.setMaxRetryCount(settings.maxRetryCount);
  reqSettings.setMinCheckpointCount(settings.checkPointLowerBound);
  reqSettings.setMaxCheckpointCount(settings.checkPointUpperBound);

  switch (settings.maxSubscriberCount) {
    case UNBOUNDED: {
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
    case DISPATCH_TO_SINGLE: {
      reqSettings.setNamedConsumerStrategy(
        UpdateReq.ConsumerStrategy.DISPATCHTOSINGLE
      );
      break;
    }
    case PINNED: {
      reqSettings.setNamedConsumerStrategy(UpdateReq.ConsumerStrategy.PINNED);
      break;
    }
    case ROUND_ROBIN: {
      reqSettings.setNamedConsumerStrategy(
        UpdateReq.ConsumerStrategy.ROUNDROBIN
      );
      break;
    }
    case PINNED_BY_CORRELATION: {
      console.warn(
        `PinnedByCorrelation is not supported for update.`
      );
      break;
    }
    default: {
      console.warn(
        `Unknown consumerStrategyName ${settings.consumerStrategyName}.`
      );
      break;
    }
  }

  return reqSettings;
};

