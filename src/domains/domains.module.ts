import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { PlayerModule } from './player/player.module';
import { UtilsModule } from './utils/utils.module';
import { TeamModule } from './team/team.module';
import { BuildingModule } from './building/building.module';

@Module({
    imports: [GameModule, PlayerModule, UtilsModule, TeamModule, BuildingModule],
})
export class DomainsModule {}
