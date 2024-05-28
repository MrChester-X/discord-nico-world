import { StringOption } from 'necord';

export class TeamDeleteDto {
  @StringOption({
    name: 'name',
    description: 'Название команды',
    required: true,
  })
  name: string;

  @StringOption({
    name: 'game_id',
    description: 'ID игры',
    required: false,
  })
  gameId?: string;
}
