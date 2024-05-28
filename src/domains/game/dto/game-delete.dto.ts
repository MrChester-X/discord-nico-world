import { StringOption } from 'necord';

export class GameDeleteDto {
    @StringOption({
        name: 'id',
        description: 'ID игры, которую необходимо удалить',
        required: false,
    })
    id?: string;
}
