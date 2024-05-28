import { CategoryChannel, Guild, Message, TextBasedChannel } from 'discord.js';
import { Game } from './entities/game.entity';

export interface GameUniqueInfo {
    guild: Guild;
    category: CategoryChannel;
    channelInfo: TextBasedChannel;
    messageInfo: Message<true>;
    channelGame: TextBasedChannel;
}

export type GameInfoRaw = Game &
    Partial<GameUniqueInfo> & {
        isFull: boolean;
    };

export type GameInfo = Game & GameUniqueInfo & GameInfoRaw;
