import type { BaseOptions } from "../types";
import { PersistentSubscriptionToEitherInfo } from "./utils/mapPersistentSubscriptionInfo";
type ListPersistentSubscriptionsOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Lists all persistent subscriptions.
         * @param options - List persistent subscriptions options.
         */
        listAllPersistentSubscriptions(options?: ListPersistentSubscriptionsOptions): Promise<PersistentSubscriptionToEitherInfo[]>;
    }
}
export {};
