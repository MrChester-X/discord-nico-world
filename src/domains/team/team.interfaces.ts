import { Role, VoiceChannel } from 'discord.js';
import { Team } from './entities/team.entity';

export interface CreateTeamParams {
    name: string;
    prefix: string;
    color: number;
    buildings: string[];
}

export interface TeamUniqueInfo {
    role: Role;
    voiceChannel: VoiceChannel;
}

export type TeamInfoRaw = Team &
    Partial<TeamUniqueInfo> & {
        isFull: boolean;
    };

export type TeamInfo = TeamUniqueInfo & Team & TeamInfoRaw;
