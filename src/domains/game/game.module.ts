import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameCommands } from './game.commands';
import { PlayerModule } from '../player/player.module';
import { UtilsModule } from '../utils/utils.module';
import { GameCheckerService } from './game-checker.service';
import { TeamModule } from '../team/team.module';
import { WhitelistModule } from '../whitelist/whitelist.module';
import { GameInteractionService } from './game-interaction.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Game]),
        PlayerModule,
        UtilsModule,
        forwardRef(() => TeamModule),
        WhitelistModule,
    ],
    providers: [GameService, GameCommands, GameCheckerService, GameInteractionService],
    exports: [GameService],
})
export class GameModule {}
