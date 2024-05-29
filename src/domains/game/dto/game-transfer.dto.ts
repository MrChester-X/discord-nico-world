import { StringOption } from 'necord';

export class GameTransferDto {
    @StringOption({
        name: 'type',
        description: 'Вид перемещения',
        required: true,
        choices: [
            { name: 'Общее собрание', value: 'main' },
            { name: 'По каналам', value: 'team' },
        ],
    })
    type: string;

    @StringOption({
        name: 'id',
        description: 'ID игры',
        required: false,
    })
    id?: string;
}
