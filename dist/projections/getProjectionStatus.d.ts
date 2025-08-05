import type { BaseOptions, ProjectionDetails } from "../types";
export type GetProjectionStatusOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Gets the current status of a projection.
         * @param projectionName - The name of the projection.
         * @param options - Get status options.
         */
        getProjectionStatus(projectionName: string, options?: GetProjectionStatusOptions): Promise<ProjectionDetails>;
    }
}
