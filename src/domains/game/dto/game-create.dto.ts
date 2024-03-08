import { StringOption } from 'necord';

export class GameCreateDto {
  @StringOption({
    name: 'players',
    description: 'Максимальное количество людей в стране',
    required: true,
  })
  playersInTeam: number;

  @StringOption({
    name: 'teams',
    description: 'Максимальное количество стран',
    required: true,
  })
  teamsCount: number;
}
