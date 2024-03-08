import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameCommands } from './game.commands';
import { PlayerModule } from '../player/player.module';
import { UtilsModule } from '../utils/utils.module';
import { GameCheckerService } from './game-checker.service';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), PlayerModule, UtilsModule, forwardRef(() => TeamModule)],
  providers: [GameService, GameCommands, GameCheckerService],
  exports: [GameService],
})
export class GameModule {}
