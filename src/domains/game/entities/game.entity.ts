import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Player } from '../../player/entities/player.entity';
import { Team } from '../../team/entities/team.entity';

export enum GameStatus {
    Preparing = 'preparing',
    InProgress = 'in_progress',
    Finished = 'finished',
}

@Entity({ name: 'games' })
export class Game {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'enum', enum: GameStatus, default: GameStatus.Preparing })
    status: GameStatus;

    @OneToMany(() => Player, (player) => player.game)
    players: Player[];

    @OneToMany(() => Team, (team) => team.game)
    teams: Team[];

    @Column({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'varchar' })
    creatorId: string;

    @Column({ type: 'varchar' })
    categoryId: string;

    @Column({ type: 'varchar' })
    channelInfoId: string;

    @Column({ type: 'varchar' })
    messageInfoId: string;

    @Column({ type: 'varchar' })
    channelGameId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
