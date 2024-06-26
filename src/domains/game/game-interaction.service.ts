import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
} from 'discord.js';
import { GameStatus } from './entities/game.entity';
import { UtilsService } from '../utils/utils.service';
import { GameDeleteDto } from './dto/game-delete.dto';
import { WhitelistService } from '../whitelist/whitelist.service';
import { GAME_LEAVE_BUTTON } from './game.const';
import { PlayerService } from '../player/player.service';
import { GameSendInfoDto } from './dto/game-send-info';
import { GameTransferDto } from './dto/game-transfer.dto';
import { TeamService } from '../team/team.service';

@Injectable()
export class GameInteractionService {
    private logger = new Logger(GameInteractionService.name);

    constructor(
        private client: Client,
        private gameService: GameService,
        private utilsService: UtilsService,
        private whitelistService: WhitelistService,
        private playerService: PlayerService,
    ) {}

    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService;

    async createInteraction(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.channel || !(interaction.member instanceof GuildMember)) {
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const game = await this.gameService.create(interaction.guild, interaction.member);

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

    async sendInfo(interaction: CommandInteraction, gameSendInfoDto: GameSendInfoDto) {
        await interaction.deferReply({ ephemeral: true });

        const game = await this.gameService.findActiveByOptionalUuid(gameSendInfoDto.id);
        if (!game) {
            return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
        }

        const gameInfo = await this.gameService.getInfo(game);
        if (!gameInfo) {
            return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
        }

        await this.gameService.sendGameInfo(gameInfo);

        return this.utilsService.replySuccessMessage(interaction, 'Информация отправлена');
    }

    async transfer(interaction: CommandInteraction, gameTransferDto: GameTransferDto) {
        await interaction.deferReply({ ephemeral: true });

        const game = await this.gameService.findActiveByOptionalUuid(gameTransferDto.id);
        if (!game) {
            return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
        }

        const gameInfo = await this.gameService.getInfo(game);
        if (!gameInfo) {
            return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
        }

        for (const team of gameInfo.teams) {
            const teamInfo = await this.teamService.getInfo(gameInfo, team);
            if (!teamInfo) {
                continue;
            }

            await this.gameService.setAccessForTeam(gameInfo, team, gameTransferDto.type === 'main');
            await this.teamService.setAccessForVoiceChannel(teamInfo, gameTransferDto.type === 'team');

            for (const player of team.players) {
                const playerInfo = await this.playerService.getInfo(gameInfo, player);
                if (!playerInfo) {
                    continue;
                }

                if (playerInfo.member.voice.channel) {
                    await playerInfo.member.voice.setChannel(
                        gameTransferDto.type === 'main' ? gameInfo.mainVoiceChannel : teamInfo.voiceChannel,
                    );
                }
            }
        }

        return this.utilsService.replySuccessMessage(interaction, 'Трансфер успешно выполнен');
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
