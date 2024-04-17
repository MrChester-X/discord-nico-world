import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Whitelist } from './entities/whitelist.entitiy';
import { WhitelistService } from './whitelist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist])],
  providers: [WhitelistService],
  exports: [WhitelistService],
})
export class WhitelistModule {}
