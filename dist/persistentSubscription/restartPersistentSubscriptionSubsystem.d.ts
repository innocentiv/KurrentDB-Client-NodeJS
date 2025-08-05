import type { BaseOptions } from "../types";
export type RestartPersistentSubscriptionSubsystemOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Restarts the persistent subscription subsystem.
         * @param options - Restart subsystem options.
         */
        restartPersistentSubscriptionSubsystem(options?: RestartPersistentSubscriptionSubsystemOptions): Promise<void>;
    }
}
