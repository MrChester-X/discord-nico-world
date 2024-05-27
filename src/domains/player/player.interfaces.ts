import { GuildMember } from 'discord.js';
import { Player } from './entities/player.entity';

export interface PlayerUniqueInfo {
  member: GuildMember;
}

export type PlayerInfoRaw = Player & Partial<PlayerUniqueInfo> & { isFull: boolean };

export type PlayerInfo = PlayerUniqueInfo & Player & PlayerInfoRaw;
