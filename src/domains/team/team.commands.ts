import { GameCommandGroup } from '../game/game.decorator';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Context, Options, SlashCommandContext, Subcommand } from 'necord';
import { TeamCreateDto } from './dto/team-create.dto';
import { TeamCreateAutocompleteInterceptor } from './team-create.interceptor';
import { TeamDeleteDto } from './dto/team-delete.dto';
import { TeamInteractionService } from './team-interaction.service';
import { TeamSetDto } from './dto/team-set.dto';

@GameCommandGroup({
  name: 'team',
  description: 'Раздел команд, связанных с управлением командами',
})
@Injectable()
export class TeamCommands {
  constructor(private teamInteractionService: TeamInteractionService) {}

  @Subcommand({
    name: 'create',
    description: 'Создать команду',
  })
  @UseInterceptors(TeamCreateAutocompleteInterceptor)
  async create(@Context() [interaction]: SlashCommandContext, @Options() teamCreateDto: TeamCreateDto) {
    return this.teamInteractionService.create(interaction, teamCreateDto);
  }

  @Subcommand({
    name: 'delete',
    description: 'Удалить команду',
  })
  async delete(@Context() [interaction]: SlashCommandContext, @Options() teamDeleteDto: TeamDeleteDto) {
    return this.teamInteractionService.delete(interaction, teamDeleteDto);
  }

  @Subcommand({
    name: 'set',
    description: 'Установить игроку команду',
  })
  async set(@Context() [interaction]: SlashCommandContext, @Options() teamSetDto: TeamSetDto) {
    return this.teamInteractionService.set(interaction, teamSetDto);
  }
}
