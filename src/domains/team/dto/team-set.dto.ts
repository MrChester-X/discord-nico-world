import { MemberOption, StringOption } from 'necord';
import { GuildMember } from 'discord.js';

export class TeamSetDto {
  @StringOption({
    name: 'name',
    description: 'Название команды',
    required: true,
  })
  name: string;

  @MemberOption({
    name: 'players',
    description: 'Игрок',
    required: true,
  })
  player: GuildMember;

  @StringOption({
    name: 'game_id',
    description: 'ID игры',
    required: false,
  })
  gameId?: string;
}
