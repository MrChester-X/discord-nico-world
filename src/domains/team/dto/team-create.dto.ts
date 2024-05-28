import { StringOption } from 'necord';

export class TeamCreateDto {
    @StringOption({
        name: 'name',
        description: 'Название команды',
        required: true,
        autocomplete: true,
    })
    name: string;

    @StringOption({
        name: 'game_id',
        description: 'ID игры',
        required: false,
    })
    gameId?: string;
}
