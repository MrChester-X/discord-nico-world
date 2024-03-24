import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'discord.js';
import { Game, GameStatus } from './entities/game.entity';
import { Not, Repository } from 'typeorm';
import { GameService } from './game.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class GameCheckerService {
  @InjectRepository(Game)
  private gameRepository: Repository<Game>;

  constructor(
    private client: Client,
    private gameService: GameService,
    private teamService: TeamService,
  ) {}

  @Cron('*/60 * * * * *')
  async checkGames() {
    if (!this.client.isReady()) {
      return;
    }

    const games = await this.gameRepository.find({
      relations: {
        teams: true,
      },
      where: {
        status: Not(GameStatus.Finished),
      },
    });

    for (const game of games) {
      const gameInfo = await this.gameService.getInfo(game);
      if (!gameInfo) {
        return;
      }

      for (const team of game.teams) {
        await this.teamService.getInfo(gameInfo, team);
      }
    }
  }
}
