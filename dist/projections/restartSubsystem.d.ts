import type { BaseOptions } from "../types";
export type RestartSubsystemOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Restarts the entire projection subsystem.
         * @param options - Restart subsystem options.
         */
        restartSubsystem(options?: RestartSubsystemOptions): Promise<void>;
    }
}
