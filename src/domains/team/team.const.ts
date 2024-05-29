import { CreateTeamParams } from './team.interfaces';

export const DefaultTeams: CreateTeamParams[] = [
    {
        name: 'Япония',
        prefix: '🇯🇵',
        color: 0xff3300,
        buildings: ['Токио', 'Осака', 'Киото', 'Никко'],
    },
    {
        name: 'США',
        prefix: '🇺🇸',
        color: 0x1c4587,
        buildings: ['Нью-Йорк', 'Лос-Анджелес', 'Чикаго', 'Майами'],
    },
    {
        name: 'Россия',
        prefix: '🇷🇺',
        color: 0x4c1130,
        buildings: ['Москва', 'Санкт-Петербург', 'Казань', 'Сочи'],
    },
    // {
    //     name: 'Великобритания',
    //     prefix: '🇬🇧',
    //     color: 0x6d9eeb,
    // },
    // {
    //     name: 'Франция',
    //     prefix: '🇫🇷',
    //     color: 0x736c6b,
    // },
    // {
    //     name: 'Италия',
    //     prefix: '🇮🇹',
    //     color: 0x33cc99,
    // },
];
