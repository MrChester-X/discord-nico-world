import { Injectable } from '@nestjs/common';
import { GuildMember } from 'discord.js';
import { Game } from '../game/entities/game.entity';
import { Player } from './entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
  @InjectRepository(Player)
  private playerRepository: Repository<Player>;

  async create(member: GuildMember, game: Game) {
    let player = new Player();
    player.discordId = member.id;
    player.game = game;

    player = await this.playerRepository.save(player);

    return player;
  }

  async delete(player: Player) {
    return this.playerRepository.softRemove(player);
  }

  async findByGame(game: Game) {
    return this.playerRepository.findOne({ where: { game: { uuid: game.uuid } } });
  }
}
