import type { EventType, EventTypeToRecordedEvent, ResolvedEvent } from "../types";
import * as bridge from "@kurrent/bridge";
export declare const convertRustEvent: <T extends ResolvedEvent>(rustClient: bridge.ResolvedEvent) => T;
export declare const convertRustRecord: <E extends EventType = EventType>(rustEvent: bridge.RecordedEvent) => EventTypeToRecordedEvent<E>;
