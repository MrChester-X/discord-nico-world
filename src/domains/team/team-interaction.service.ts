import { CommandInteraction, GuildMember } from 'discord.js';
import { TeamCreateDto } from './dto/team-create.dto';
import { DefaultTeams } from './team.const';
import { GameService } from '../game/game.service';
import { UtilsService } from '../utils/utils.service';
import { TeamService } from './team.service';
import { TeamDeleteDto } from './dto/team-delete.dto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TeamSetDto } from './dto/team-set.dto';
import { PlayerService } from '../player/player.service';

@Injectable()
export class TeamInteractionService {
  @Inject(forwardRef(() => GameService))
  private gameService: GameService;

  constructor(
    private teamService: TeamService,
    private utilsService: UtilsService,
    private playerService: PlayerService,
  ) {}

  async create(interaction: CommandInteraction, teamCreateDto: TeamCreateDto) {
    await interaction.deferReply({ ephemeral: true });

    // TODO: сделать чуть адекватнее
    const game = await this.gameService.findActiveByOptionalUuid(teamCreateDto.gameId);
    if (!game) {
      return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
    }

    const gameInfo = await this.gameService.getInfo(game);
    if (!gameInfo) {
      return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
    }

    const team = await this.teamService.findByName(game, teamCreateDto.name);
    if (team) {
      return this.utilsService.replyErrorMessage(interaction, 'Данная команда уже существует');
    }

    const createTeamParams = DefaultTeams.find((team) => team.name === teamCreateDto.name);
    if (!createTeamParams) {
      return this.utilsService.replyErrorMessage(interaction, 'Данная команда не найдена');
    }

    await this.teamService.create(gameInfo, createTeamParams);

    return this.utilsService.replySuccessMessage(interaction, 'Команда успешно создана');
  }

  async delete(interaction: CommandInteraction, teamDeleteDto: TeamDeleteDto) {
    await interaction.deferReply({ ephemeral: true });

    // TODO: сделать чуть адекватнее
    const game = await this.gameService.findActiveByOptionalUuid(teamDeleteDto.gameId);
    if (!game) {
      return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
    }

    const gameInfo = await this.gameService.getInfo(game);
    if (!gameInfo) {
      return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
    }

    const team = await this.teamService.findByName(game, teamDeleteDto.name);
    if (!team) {
      return this.utilsService.replyErrorMessage(interaction, 'Данной команды не существует');
    }

    const teamRaw = await this.teamService.getInfoRaw(gameInfo, team);
    await this.teamService.delete(teamRaw);

    return this.utilsService.replySuccessMessage(interaction, 'Команда успешно удалена');
  }

  async set(interaction: CommandInteraction, teamSetDto: TeamSetDto) {
    if (!(interaction.member instanceof GuildMember)) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    // TODO: сделать чуть адекватнее
    const game = await this.gameService.findActiveByOptionalUuid(teamSetDto.gameId);
    if (!game) {
      return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
    }

    const gameInfo = await this.gameService.getInfo(game);
    if (!gameInfo) {
      return this.utilsService.replyErrorMessage(interaction, 'Игра не найдена');
    }

    const player = await this.playerService.findByGameAndDiscordId(game, teamSetDto.player.id);
    if (!player) {
      return this.utilsService.replyErrorMessage(interaction, 'Игрок не участвует в игре');
    }

    const playerInfo = await this.playerService.getInfo(gameInfo, player);
    if (!playerInfo) {
      return this.utilsService.replyErrorMessage(interaction, 'Игрок не участвует в игре');
    }

    const team = await this.teamService.findByName(gameInfo, teamSetDto.name);
    if (!team) {
      return this.utilsService.replyErrorMessage(interaction, 'Данной команды не существует');
    }

    const teamInfo = await this.teamService.getInfo(gameInfo, team);
    if (!teamInfo) {
      return this.utilsService.replyErrorMessage(interaction, 'Данной команды не существует');
    }

    await this.teamService.setPlayerTeam(gameInfo, playerInfo, teamInfo);

    return this.utilsService.replySuccessMessage(interaction, 'Команда была успешна установлена');
  }
}
