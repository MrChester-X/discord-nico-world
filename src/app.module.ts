import { Module } from '@nestjs/common';
import { DatabaseModule } from './app/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { DiscordCustomModule } from './app/discord/discord.module';
import { DomainsModule } from './domains/domains.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), DatabaseModule, DiscordCustomModule, DomainsModule],
})
export class AppModule {}
