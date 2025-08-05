import type { BaseOptions } from "../types";
export type DisableProjectionOptions = BaseOptions;
export type AbortProjectionOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Disables a projection.
         * @param projectionName - The name of the projection to disable.
         * @param options - Disable projection options.
         */
        disableProjection(projectionName: string, options?: DisableProjectionOptions): Promise<void>;
        /**
         * Aborts a projection.
         * @param projectionName - The name of the projection to disable.
         * @param options - Disable projection options.
         */
        abortProjection(projectionName: string, options?: AbortProjectionOptions): Promise<void>;
    }
}
