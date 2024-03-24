import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Game } from '../game/entities/game.entity';
import { Team } from './entities/team.entity';
import { GameInfo, GameInfoRaw } from '../game/game.interfaces';
import { ChannelType, PermissionFlagsBits, VoiceChannel } from 'discord.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamParams, TeamInfo, TeamInfoRaw } from './team.interfaces';
import { GameService } from '../game/game.service';
import { DEFAULT_TEAMS } from './team.const';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

@Injectable()
export class TeamService {
  private logger = new Logger(TeamService.name);

  @Inject(forwardRef(() => GameService))
  private gameService: GameService;

  @InjectRepository(Team)
  private teamRepository: Repository<Team>;

  async findAllByGame(game: Game) {
    return this.teamRepository.find({
      where: {
        game: {
          uuid: game.uuid,
        },
      },
    });
  }

  async create(gameInfo: GameInfo, createTeamParams: CreateTeamParams) {
    const guild = gameInfo.guild;

    const role = await guild.roles.create({
      name: createTeamParams.name,
      color: createTeamParams.color,
    });

    const voiceChannel = await gameInfo.category.children.create({
      type: ChannelType.GuildVoice,
      name: `${createTeamParams.prefix} ${createTeamParams.name}`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Connect | PermissionFlagsBits.SendMessages,
        },
        {
          id: role.id,
          allow:
            PermissionFlagsBits.Connect | PermissionFlagsBits.SendMessages | PermissionFlagsBits.ReadMessageHistory,
        },
      ],
    });

    let team = new Team();
    team.name = createTeamParams.name;
    team.prefix = createTeamParams.prefix;
    team.color = createTeamParams.color;
    team.roleId = role.id;
    team.game = gameInfo;
    team.voiceChannelId = voiceChannel.id;

    team = await this.teamRepository.save(team);

    return team;
  }

  async createDefault(gameInfo: GameInfo) {
    const promises = DEFAULT_TEAMS.map(async (gameCreateParams) => await this.create(gameInfo, gameCreateParams));
    return Promise.all(promises);
  }

  async getInfoRaw(gameInfoRaw: Optional<GameInfoRaw, 'isFull'>, team: Team) {
    const teamInfoRaw: TeamInfoRaw = {
      isFull: true,
      ...team,
    };

    const guild = gameInfoRaw.guild;
    if (!guild) {
      return teamInfoRaw;
    }

    const voiceChannel = guild.channels.cache.get(team.voiceChannelId);
    if (voiceChannel && voiceChannel instanceof VoiceChannel) {
      teamInfoRaw.voiceChannel = voiceChannel;
    } else {
      teamInfoRaw.isFull = false;
      this.logger.warn(`${gameInfoRaw.uuid} ${team.uuid}: не нашел voiceChannel`);
    }

    const role = guild.roles.cache.get(team.roleId);
    if (role) {
      teamInfoRaw.role = role;
    } else {
      teamInfoRaw.isFull = false;
      this.logger.warn(`${gameInfoRaw.uuid} ${team.uuid}: не нашел role`);
    }

    return teamInfoRaw;
  }

  async delete(teamInfoRaw: TeamInfoRaw) {
    if (teamInfoRaw.voiceChannel) {
      await teamInfoRaw.voiceChannel.delete();
    }

    if (teamInfoRaw.role) {
      await teamInfoRaw.role.delete();
    }

    await this.teamRepository.softRemove(teamInfoRaw);
  }

  async deleteByGame(gameInfoRaw: GameInfoRaw) {
    const teams = await this.findAllByGame(gameInfoRaw);

    const promises = teams.map(async (team) => {
      const teamInfo = await this.getInfoRaw(gameInfoRaw, team);
      await this.delete(teamInfo);
    });
    return Promise.all(promises);
  }

  async getInfo(gameInfo: GameInfo, team: Team): Promise<TeamInfo | undefined> {
    const teamInfo = await this.getInfoRaw(gameInfo, team);
    if (!teamInfo.isFull) {
      await this.gameService.delete(gameInfo);

      return undefined;
    }

    return teamInfo as TeamInfo;
  }
}
