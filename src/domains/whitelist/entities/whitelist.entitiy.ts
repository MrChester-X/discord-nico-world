import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum WhitelistType {
    Default = 'default',
    Main = 'main',
}

@Entity()
export class Whitelist {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    discordId: string;

    @Column({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'enum', enum: WhitelistType })
    type: WhitelistType;
}
