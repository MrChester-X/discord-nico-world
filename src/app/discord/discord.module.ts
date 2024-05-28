import { Module } from '@nestjs/common';
import DiscordConfig from './discord.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { NecordModule } from 'necord';
import { DiscordExceptionFilter } from './discord.filter';

@Module({
    imports: [
        NecordModule.forRootAsync({
            inject: [DiscordConfig.KEY],
            imports: [ConfigModule.forFeature(DiscordConfig)],
            useFactory: (config: ConfigType<typeof DiscordConfig>) => config,
        }),
    ],
    providers: [DiscordService, DiscordExceptionFilter],
})
export class DiscordCustomModule {}
