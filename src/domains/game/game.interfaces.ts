import { CategoryChannel, Guild, Message, TextChannel, VoiceChannel } from 'discord.js';
import { Game } from './entities/game.entity';

export interface GameUniqueInfo {
    guild: Guild;
    category: CategoryChannel;
    channelInfo: TextChannel;
    messageInfo: Message<true>;
    channelGame: TextChannel;
    mainVoiceChannel: VoiceChannel;
}

export type GameInfoRaw = Game &
    Partial<GameUniqueInfo> & {
        isFull: boolean;
    };

export type GameInfo = Game & GameUniqueInfo & GameInfoRaw;
