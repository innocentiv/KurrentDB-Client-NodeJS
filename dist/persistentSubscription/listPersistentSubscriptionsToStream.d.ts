import type { BaseOptions } from "../types";
import { PersistentSubscriptionToStreamInfo } from "./utils/mapPersistentSubscriptionInfo";
type ListPersistentSubscriptionsToStreamOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Lists persistent subscriptions to a stream.
         * @param streamName - A stream name.
         * @param options - List persistent subscriptions options.
         */
        listPersistentSubscriptionsToStream(streamName: string, options?: ListPersistentSubscriptionsToStreamOptions): Promise<PersistentSubscriptionToStreamInfo[]>;
    }
}
export {};
