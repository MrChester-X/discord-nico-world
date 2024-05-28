import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    CategoryChannel,
    Client,
    EmbedBuilder,
} from 'discord.js';
import { Game, GameStatus } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameInfo, GameInfoRaw } from './game.interfaces';
import { GAME_JOIN_BUTTON, GAME_PLAYERS_BUTTON } from './game.const';
import { UtilsService } from '../utils/utils.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class GameService {
    private logger = new Logger(GameService.name);

    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService;

    @InjectRepository(Game)
    private gameRepository: Repository<Game>;

    constructor(
        private client: Client,
        private utilsService: UtilsService,
    ) {}

    async findActiveByOptionalUuid(uuid?: string) {
        return this.gameRepository.findOne({ where: { status: Not(GameStatus.Finished), uuid } });
    }

    async findByChannelInfoId(channelInfoId: string, playersRelation = false) {
        return this.gameRepository.findOne({ relations: { players: playersRelation }, where: { channelInfoId } });
    }

    getMessageInfo(game: Game): BaseMessageOptions {
        const embed = new EmbedBuilder({
            title: 'Мировое Господство | Информация',
            description: `Тут будет много инфы и кнопка для реги\n\nКоличество игроков в стране: ${game.playersInTeam}\nКоличество стран: ${game.teamsCount}`,
            fields: [{ name: 'Организатор', value: `<@${game.creatorId}>` }],
            color: 0x0379ff,
        });

        const joinButton = new ButtonBuilder({
            customId: GAME_JOIN_BUTTON,
            label: 'Участвовать',
            style: ButtonStyle.Success,
        });

        const playersButton = new ButtonBuilder({
            customId: GAME_PLAYERS_BUTTON,
            label: 'Игроки',
            style: ButtonStyle.Secondary,
        });

        const row = new ActionRowBuilder<ButtonBuilder>({ components: [joinButton, playersButton] });

        return {
            content: '',
            embeds: [embed],
            components: [row],
        };
    }

    async getInfoRaw(game: Game): Promise<GameInfoRaw> {
        const gameInfoRaw: GameInfoRaw = { isFull: true, ...game };

        // TODO: мб нормально переписать <3

        const guild = this.client.guilds.cache.get(game.guildId);
        if (guild) {
            gameInfoRaw.guild = guild;

            const category = guild.channels.cache.get(game.categoryId);
            if (category && category instanceof CategoryChannel) {
                gameInfoRaw.category = category;
            } else {
                gameInfoRaw.isFull = false;
                this.logger.warn(`${game.uuid}: не нашел category`);
            }

            const channelInfo = guild.channels.cache.get(game.channelInfoId);
            if (channelInfo && channelInfo.isTextBased()) {
                gameInfoRaw.channelInfo = channelInfo;

                const messageInfo = await this.utilsService.fetchSafeMessage(channelInfo, game.messageInfoId);
                if (messageInfo) {
                    gameInfoRaw.messageInfo = messageInfo;
                } else {
                    gameInfoRaw.isFull = false;
                    this.logger.warn(`${game.uuid}: не нашел messageInfo`);
                }
            } else {
                gameInfoRaw.isFull = false;
                this.logger.warn(`${game.uuid}: не нашел channelInfo`);
            }
        } else {
            gameInfoRaw.isFull = false;
            this.logger.warn(`${game.uuid}: не нашел guild`);
        }

        return gameInfoRaw;
    }

    async getInfo(game: Game): Promise<GameInfo | undefined> {
        const gameInfoRaw = await this.getInfoRaw(game);

        if (!gameInfoRaw.isFull) {
            await this.delete(game);
            this.logger.warn(`Удалил игру с ID: ${game.uuid}`);

            return undefined;
        }

        return gameInfoRaw as GameInfo;
    }

    async delete(game: Game) {
        const gameInfoRaw = await this.getInfoRaw(game);

        await this.teamService.deleteByGame(gameInfoRaw);

        if (gameInfoRaw.category) {
            await gameInfoRaw.category.delete();
        }

        if (gameInfoRaw.channelInfo) {
            await gameInfoRaw.channelInfo.delete();
        }

        await this.gameRepository.softRemove(game);
    }
}
