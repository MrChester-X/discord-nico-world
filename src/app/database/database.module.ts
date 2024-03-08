import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import DatabaseConfig from './database.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [DatabaseConfig.KEY],
      imports: [ConfigModule.forFeature(DatabaseConfig)],
      useFactory: (config: ConfigType<typeof DatabaseConfig>) => config,
    }),
  ],
})
export class DatabaseModule {}
