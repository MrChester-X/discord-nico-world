import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Whitelist, WhitelistType } from './entities/whitelist.entitiy';
import { GuildMember } from 'discord.js';

@Injectable()
export class WhitelistService {
    private whitelistRepository: Repository<Whitelist>;

    async getAllMain() {
        return this.whitelistRepository.find({
            where: {
                type: WhitelistType.Main,
            },
        });
    }

    async hasGuildMember(member: GuildMember) {
        const whitelist = await this.whitelistRepository.findOne({
            where: {
                discordId: member.id,
                guildId: member.guild.id,
            },
        });

        return !!whitelist;
    }
}
