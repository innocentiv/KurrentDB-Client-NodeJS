import type { BaseOptions, DeleteResult, StreamState } from "../types";
export interface DeleteStreamOptions extends BaseOptions {
    /**
     * Asks the server to check the stream is at specific revision before deleting.
     * @defaultValue ANY
     */
    expectedRevision?: StreamState;
}
declare module "../Client" {
    interface Client {
        /**
         * Soft-deletes a stream.
         * @param streamName - A stream name.
         * @param options - Deletion options.
         */
        deleteStream(streamName: string, options?: DeleteStreamOptions): Promise<DeleteResult>;
    }
}
