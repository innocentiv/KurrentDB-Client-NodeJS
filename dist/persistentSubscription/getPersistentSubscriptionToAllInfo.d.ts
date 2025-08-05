import type { BaseOptions } from "../types";
import { PersistentSubscriptionToAllInfo } from "./utils/mapPersistentSubscriptionInfo";
export type GetPersistentSubscriptionToAllInfoOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Gets information and statistics on the specified persistent subscription to $all and its connections.
         * @param groupName - A group name.
         * @param options - Get persistent subscription to all options.
         */
        getPersistentSubscriptionToAllInfo(groupName: string, options?: GetPersistentSubscriptionToAllInfoOptions): Promise<PersistentSubscriptionToAllInfo>;
    }
}
