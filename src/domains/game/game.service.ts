import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import {
  ActionRowBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildBasedChannel,
  GuildChannel,
  GuildChannelCreateOptions,
  GuildMember,
  Message,
  OverwriteType,
  PermissionFlagsBits,
  TextBasedChannel,
} from 'discord.js';
import { GameCreateDto } from './dto/game-create.dto';
import { Game, GameStatus } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameInfo, GameInfoRaw, GameUniqueInfo } from './game.interfaces';
import { GameDeleteDto } from './dto/game-delete.dto';
import { GAME_JOIN_BUTTON, GAME_LEAVE_BUTTON, GAME_PLAYERS_BUTTON } from './game.const';
import { PlayerService } from '../player/player.service';
import { UtilsService } from '../utils/utils.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class GameService {
  private logger = new Logger(GameService.name);

  @Inject(forwardRef(() => TeamService))
  private teamService: TeamService;

  @InjectRepository(Game)
  private gameRepository: Repository<Game>;

  constructor(private client: Client, private playerService: PlayerService, private utilsService: UtilsService) {}

  async findByChannelInfoId(channelInfoId: string, playersRelation: boolean = false) {
    return this.gameRepository.findOne({ relations: { players: playersRelation }, where: { channelInfoId } });
  }

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

    
    const mainCategory = guild.channels.cache.find( channel => (
      channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === 'мировое господство'.toLowerCase()
    )) as CategoryChannel | undefined
      
    const category = await guild.channels.create({
      name: 'Мировое Господство - LIVE',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [{ id: guild.id, deny: PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Connect }],
      position: mainCategory ? mainCategory.position - 1 : undefined
    });

    const channelInfo = await category.children.create({ name: 'info' });

    const embed = new EmbedBuilder({
      title: 'Мировое Господство | Информация',
      description: `Тут будет много инфы и кнопка для реги\n\nКоличество игроков в стране: ${gameCreateDto.teamsCount}\nКоличество стран: ${gameCreateDto.teamsCount}`,
      fields: [{ name: 'Организатор', value: `${interaction.member}` }],
      color: 0x0000ff,
    });

    let game = new Game();
    game.playersInTeam = gameCreateDto.playersInTeam;
    game.teamsCount = gameCreateDto.teamsCount;
    game.guildId = guild.id;
    game.creatorId = interaction.user.id;
    game.categoryId = category.id;
    game.channelInfoId = channelInfo.id;

    const messageInfoOptions = this.getMessageInfo(game);
    const messageInfo = await channelInfo.send(messageInfoOptions);

    game.messageInfoId = messageInfo.id;
    game = await this.gameRepository.save(game);

    const gameInfo = await this.getInfo(game);
    if (!gameInfo) {
      return;
    }

    await this.teamService.createDefault(gameInfo);

    await this.utilsService.replySuccessMessage(interaction, `Игра создана, ID: \`${game.uuid}\``);
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

  async deleteInteraction(interaction: CommandInteraction, gameDeleteDto: GameDeleteDto) {
    if (!interaction.guild || !interaction.channel) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    if (interaction.user.id !== '347799772096102405') {
      // TODO: отписывать в беседу
      const adminUser = await this.client.users.fetch('347799772096102405');
      await adminUser.send(
        `Чел на ${interaction.user.id} (${interaction.user}) попробовал удалить игру (${gameDeleteDto.id || 'no'})`,
      );

      return this.utilsService.replyErrorMessage(
        interaction,
        'Охуел??? Тебе нахуя игру удалять? я уже передал всему стаффу какой ты еблан блять',
      );
    }

    const game = await this.gameRepository.findOne({
      where: { status: Not(GameStatus.Finished), uuid: gameDeleteDto.id },
    });
    if (!game) {
      return this.utilsService.replyErrorMessage(interaction, 'Не нашел игры =(');
    }

    await this.delete(game);
    return this.utilsService.replySuccessMessage(interaction, `Удалил игру с ID: \`${game.uuid}\``);
  }

  async joinButtonInteraction(interaction: ButtonInteraction) {
    if (!(interaction.member instanceof GuildMember)) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const game = await this.findByChannelInfoId(interaction.channelId);
    if (!game || game.status !== GameStatus.Preparing) {
      return this.utilsService.replyErrorMessage(interaction, 'В эту игру больше нельзя вступить');
    }

    let player = await this.playerService.findByGame(game);
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

    const game = await this.findByChannelInfoId(interaction.channelId);
    if (!game || game.status !== GameStatus.Preparing) {
      return this.utilsService.replyErrorMessage(interaction, 'Из этой игры больше нельзя выйти');
    }

    let player = await this.playerService.findByGame(game);
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

    const game = await this.findByChannelInfoId(interaction.channelId, true);
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
