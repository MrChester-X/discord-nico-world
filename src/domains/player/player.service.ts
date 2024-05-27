import { Injectable, Logger } from '@nestjs/common';
import { GuildMember } from 'discord.js';
import { Game } from '../game/entities/game.entity';
import { Player } from './entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameInfoRaw } from '../game/game.interfaces';
import { PlayerInfo, PlayerInfoRaw } from './player.interfaces';
import { Team } from '../team/entities/team.entity';

@Injectable()
export class PlayerService {
  private logger = new Logger(PlayerService.name);

  @InjectRepository(Player)
  private playerRepository: Repository<Player>;

  async create(member: GuildMember, game: Game) {
    let player = new Player();
    player.discordId = member.id;
    player.game = game;

    player = await this.playerRepository.save(player);

    return player;
  }

  async findByGameAndDiscordId(game: Game, discordId: string) {
    return this.playerRepository.findOne({ where: { game: { uuid: game.uuid }, discordId } });
  }

  async setTeam(player: Player, team: Team) {
    player.team = team;

    await this.playerRepository.save(player);
  }

  async getInfoRaw(gameInfoRaw: GameInfoRaw, player: Player) {
    const playerInfoRaw: PlayerInfoRaw = {
      isFull: true,
      ...player,
    };

    const guild = gameInfoRaw.guild;
    if (!guild) {
      playerInfoRaw.isFull = false;
      return playerInfoRaw;
    }

    // TODO: вроде может выдать ошибку
    const member = await guild.members.fetch(playerInfoRaw.discordId);
    if (member) {
      playerInfoRaw.member = member;
    } else {
      playerInfoRaw.isFull = false;
      this.logger.warn(`${gameInfoRaw.uuid} player ${player.uuid}: не нашел member`);
    }

    return playerInfoRaw;
  }

  async delete(player: Player) {
    // TODO: придумать, как рольки удалять, если есть

    await this.playerRepository.softRemove(player);
  }

  async getInfo(gameInfoRaw: GameInfoRaw, player: Player) {
    const playerInfoRaw = await this.getInfoRaw(gameInfoRaw, player);
    if (!playerInfoRaw.isFull) {
      await this.delete(playerInfoRaw);

      return undefined;
    }

    return playerInfoRaw as PlayerInfo;
  }
}
