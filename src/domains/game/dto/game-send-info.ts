import { StringOption } from 'necord';

export class GameSendInfoDto {
    @StringOption({
        name: 'id',
        description: 'ID игры',
        required: false,
    })
    id?: string;
}
