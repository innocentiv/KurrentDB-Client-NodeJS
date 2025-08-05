import { CreateReq, UpdateReq } from "../../../generated/persistent_pb";
import type { PersistentSubscriptionToStreamSettings, PersistentSubscriptionToAllSettings } from "./persistentSubscriptionSettings";
type CreateGRPCSettings = typeof CreateReq.Settings;
type UpdateGRPCSettings = typeof UpdateReq.Settings;
export declare const settingsToCreateGRPC: <T extends CreateGRPCSettings>(settings: PersistentSubscriptionToStreamSettings | PersistentSubscriptionToAllSettings, ReqSettings: T) => InstanceType<T>;
export declare const settingsToUpdateGRPC: <T extends UpdateGRPCSettings>(settings: PersistentSubscriptionToStreamSettings | PersistentSubscriptionToAllSettings, ReqSettings: T) => InstanceType<T>;
export {};
