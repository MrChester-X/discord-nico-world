import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Whitelist } from './entities/whitelist.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist])],
})
export class WhitelistModule {}
