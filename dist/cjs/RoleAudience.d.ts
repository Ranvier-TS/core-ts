import { ChannelAudience } from './ChannelAudience';
export interface IRoleAudienceOptions {
    minRole: number;
}
export declare class RoleAudience extends ChannelAudience {
    minRole: number;
    constructor(options: IRoleAudienceOptions);
    getBroadcastTargets(): import("./Player").Player[];
}
