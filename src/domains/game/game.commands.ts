import { Injectable } from '@nestjs/common';
import { GameCommandGroup } from './game.decorator';
import { GameService } from './game.service';
import { Button, ButtonContext, Context, Options, SlashCommandContext, Subcommand } from 'necord';
import { GameCreateDto } from './dto/game-create.dto';
import { GameDeleteDto } from './dto/game-delete.dto';
import { GAME_JOIN_BUTTON, GAME_LEAVE_BUTTON, GAME_PLAYERS_BUTTON } from './game.const';

@GameCommandGroup()
@Injectable()
export class GameCommands {
  constructor(private gameService: GameService) {}

  @Subcommand({
    name: 'create',
    description: 'Создать игру',
  })
  async create(@Context() [interaction]: SlashCommandContext, @Options() gameCreateDto: GameCreateDto) {
    await this.gameService.createInteraction(interaction, gameCreateDto);
  }

  @Subcommand({
    name: 'delete',
    description: 'Удалить игру',
  })
  async delete(@Context() [interaction]: SlashCommandContext, @Options() gameDeleteDto: GameDeleteDto) {
    await this.gameService.deleteInteraction(interaction, gameDeleteDto);
  }

  @Button(GAME_JOIN_BUTTON)
  async onJoinButton(@Context() [interaction]: ButtonContext) {
    this.gameService.joinButtonInteraction(interaction);
  }

  @Button(GAME_LEAVE_BUTTON)
  async onLeaveButton(@Context() [interaction]: ButtonContext) {
    this.gameService.leaveButtonInteraction(interaction);
  }

  @Button(GAME_PLAYERS_BUTTON)
  async onPlayersButton(@Context() [interaction]: ButtonContext) {
    this.gameService.playersButtonInteraction(interaction);
  }
}
