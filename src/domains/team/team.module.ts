import { Module, forwardRef } from '@nestjs/common';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { GameModule } from '../game/game.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), forwardRef(() => GameModule)],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
