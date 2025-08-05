import type { BaseOptions, ProjectionDetails } from "../types";
type ListProjectionsOptions = BaseOptions;
declare module "../Client" {
    interface Client {
        /**
         * Lists projections.
         * @param options - List projections options.
         */
        listProjections(options?: ListProjectionsOptions): Promise<ProjectionDetails[]>;
    }
}
export {};
