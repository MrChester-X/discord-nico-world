import { forwardRef, Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { GameModule } from '../game/game.module';
import { TeamCommands } from './team.commands';
import { UtilsModule } from '../utils/utils.module';
import { TeamInteractionService } from './team-interaction.service';
import { PlayerModule } from '../player/player.module';

@Module({
    imports: [TypeOrmModule.forFeature([Team]), forwardRef(() => GameModule), UtilsModule, PlayerModule],
    providers: [TeamService, TeamCommands, TeamInteractionService],
    exports: [TeamService],
})
export class TeamModule {}
