import { Injectable } from '@nestjs/common';
import { GameCommandGroup } from './game.decorator';
import { Button, ButtonContext, Context, Options, SlashCommandContext, Subcommand } from 'necord';
import { GameCreateDto } from './dto/game-create.dto';
import { GameDeleteDto } from './dto/game-delete.dto';
import { GAME_JOIN_BUTTON, GAME_LEAVE_BUTTON, GAME_PLAYERS_BUTTON } from './game.const';
import { GameInteractionService } from './game-interaction.service';

@GameCommandGroup()
@Injectable()
export class GameCommands {
  constructor(private gameInteractionService: GameInteractionService) {}

  @Subcommand({
    name: 'create',
    description: 'Создать игру',
  })
  async create(@Context() [interaction]: SlashCommandContext, @Options() gameCreateDto: GameCreateDto) {
    return this.gameInteractionService.createInteraction(interaction, gameCreateDto);
  }

  @Subcommand({
    name: 'delete',
    description: 'Удалить игру',
  })
  async delete(@Context() [interaction]: SlashCommandContext, @Options() gameDeleteDto: GameDeleteDto) {
    return this.gameInteractionService.deleteInteraction(interaction, gameDeleteDto);
  }

  @Button(GAME_JOIN_BUTTON)
  async onJoinButton(@Context() [interaction]: ButtonContext) {
    return this.gameInteractionService.joinButtonInteraction(interaction);
  }

  @Button(GAME_LEAVE_BUTTON)
  async onLeaveButton(@Context() [interaction]: ButtonContext) {
    return this.gameInteractionService.leaveButtonInteraction(interaction);
  }

  @Button(GAME_PLAYERS_BUTTON)
  async onPlayersButton(@Context() [interaction]: ButtonContext) {
    return this.gameInteractionService.playersButtonInteraction(interaction);
  }
}
