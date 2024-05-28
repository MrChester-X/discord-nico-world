import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CategoryChannel,
    ChannelType,
    Client,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
} from 'discord.js';
import { GameCreateDto } from './dto/game-create.dto';
import { Game, GameStatus } from './entities/game.entity';
import { UtilsService } from '../utils/utils.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamService } from '../team/team.service';
import { GameDeleteDto } from './dto/game-delete.dto';
import { WhitelistService } from '../whitelist/whitelist.service';
import { GAME_LEAVE_BUTTON } from './game.const';
import { PlayerService } from '../player/player.service';

@Injectable()
export class GameInteractionService {
    @InjectRepository(Game)
    private gameRepository: Repository<Game>;

    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService;

    private logger = new Logger(GameInteractionService.name);

    constructor(
        private client: Client,
        private gameService: GameService,
        private utilsService: UtilsService,
        private whitelistService: WhitelistService,
        private playerService: PlayerService,
    ) {}

    async createInteraction(interaction: CommandInteraction, gameCreateDto: GameCreateDto) {
        if (!interaction.guild || !interaction.channel) {
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        if (gameCreateDto.playersInTeam < 2) {
            return this.utilsService.replyErrorMessage(
                interaction,
                'Блять, просто иди нахуй, ну какого хуя в стране может быть меньше 2 людей, головой думай несчастный нахуй ты',
            );
        }
        if (gameCreateDto.teamsCount < 2) {
            return this.utilsService.replyErrorMessage(
                interaction,
                'Совсем крытый нахуй??? У тебя блять минимум 2 страны должно быть нахуй, иначе какая блять мировая арена образуется, думать вообще планируешь в этой жизни сука??, если ты еще минус написал, то ты вообще еблан последний блять...',
            );
        }

        const guild = interaction.guild;

        const mainCategory = guild.channels.cache.find(
            (channel) =>
                channel.type === ChannelType.GuildCategory &&
                channel.name.toLowerCase() === 'мировое господство'.toLowerCase(),
        ) as CategoryChannel | undefined;

        const category = await guild.channels.create({
            name: 'Мировое Господство - LIVE',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                { id: guild.id, deny: PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Connect },
            ],
            position: mainCategory ? mainCategory.position - 1 : undefined,
        });

        const channelInfo = await category.children.create({ name: 'info' });

        let game = new Game();
        game.playersInTeam = gameCreateDto.playersInTeam;
        game.teamsCount = gameCreateDto.teamsCount;
        game.guildId = guild.id;
        game.creatorId = interaction.user.id;
        game.categoryId = category.id;
        game.channelInfoId = channelInfo.id;

        const messageInfoOptions = this.gameService.getMessageInfo(game);
        const messageInfo = await channelInfo.send(messageInfoOptions);

        game.messageInfoId = messageInfo.id;
        game = await this.gameRepository.save(game);

        const gameInfo = await this.gameService.getInfo(game);
        if (!gameInfo) {
            return;
        }

        await this.teamService.createDefault(gameInfo);

        await this.utilsService.replySuccessMessage(interaction, `Игра создана, ID: \`${game.uuid}\``);
    }

    async deleteInteraction(interaction: CommandInteraction, gameDeleteDto: GameDeleteDto) {
        if (!interaction.guild || !interaction.channel || !(interaction.member instanceof GuildMember)) {
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const isInWhitelist = await this.whitelistService.hasGuildMember(interaction.member);
        if (!isInWhitelist) {
            // TODO: отписывать в беседу
            const whitelists = await this.whitelistService.getAllMain();
            for (const whitelist of whitelists) {
                const whitelistUser = await this.client.users.fetch(whitelist.discordId);

                try {
                    await whitelistUser.send(
                        `Чел на ${interaction.user.id} (${interaction.user}) попробовал удалить игру (${gameDeleteDto.id || 'no'})`,
                    );
                } catch (error) {
                    this.logger.error(
                        'Не получилось отправить сообщение игроку',
                        error instanceof Error ? error.stack : undefined,
                        error,
                    );
                }
            }

            return this.utilsService.replyErrorMessage(
                interaction,
                'Охуел??? Тебе нахуя игру удалять? я уже передал всему стаффу какой ты еблан блять',
            );
        }

        const game = await this.gameService.findActiveByOptionalUuid(gameDeleteDto.id);
        if (!game) {
            return this.utilsService.replyErrorMessage(interaction, 'Не нашел игры =(');
        }

        await this.gameService.delete(game);
        return this.utilsService.replySuccessMessage(interaction, `Удалил игру с ID: \`${game.uuid}\``);
    }

    async joinButtonInteraction(interaction: ButtonInteraction) {
        if (!(interaction.member instanceof GuildMember)) {
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const game = await this.gameService.findByChannelInfoId(interaction.channelId);
        if (!game || game.status !== GameStatus.Preparing) {
            return this.utilsService.replyErrorMessage(interaction, 'В эту игру больше нельзя вступить');
        }

        let player = await this.playerService.findByGameAndDiscordId(game, interaction.member.id);
        if (player) {
            const leaveButton = new ButtonBuilder({
                customId: GAME_LEAVE_BUTTON,
                label: 'Покинуть игру',
                style: ButtonStyle.Danger,
            });

            const row = new ActionRowBuilder<ButtonBuilder>({ components: [leaveButton] });

            const embed = new EmbedBuilder({
                title: 'Выход из игры',
                description: 'Вы уже участвуете в этой игре. Нажмите кнопку ниже, если хотите покинуть ее',
                color: 0xff3300,
            });

            return interaction.editReply({ content: '', embeds: [embed], components: [row] });
        }

        player = await this.playerService.create(interaction.member, game);

        await this.utilsService.replySuccessMessage(interaction, 'Вы успешно вступили в игру');
    }

    async leaveButtonInteraction(interaction: ButtonInteraction) {
        if (!(interaction.member instanceof GuildMember)) {
            return;
        }

        await interaction.deferUpdate();

        const game = await this.gameService.findByChannelInfoId(interaction.channelId);
        if (!game || game.status !== GameStatus.Preparing) {
            return this.utilsService.replyErrorMessage(interaction, 'Из этой игры больше нельзя выйти');
        }

        const player = await this.playerService.findByGameAndDiscordId(game, interaction.member.id);
        if (!player) {
            return this.utilsService.replyErrorMessage(interaction, 'Вы и так не участвуете в этой игре');
        }

        await this.playerService.delete(player);

        await this.utilsService.replySuccessMessage(interaction, 'Вы успешно вышли из игры');
    }

    async playersButtonInteraction(interaction: ButtonInteraction) {
        if (!(interaction.member instanceof GuildMember)) {
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const game = await this.gameService.findByChannelInfoId(interaction.channelId, true);
        if (!game) {
            return this.utilsService.replyErrorMessage(interaction, 'Этой игры больше не существует =(');
        }

        let participantsText = game.players.map((player) => `<@${player.discordId}>`).join(', ');
        if (!game.players.length) {
            participantsText = 'Еще нет игроков =(';
        }

        const embed = new EmbedBuilder({
            title: 'Текущие игроки:',
            description: `${participantsText}`,
            footer: {
                text: `Сейчас игроков: ${game.players.length} чел.`,
            },
        });

        return interaction.editReply({
            content: '',
            embeds: [embed],
        });
    }
}
