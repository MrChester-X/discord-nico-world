import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Player } from '../../player/entities/player.entity';
import { Game } from '../../game/entities/game.entity';
import { Building } from '../../building/entities/building.entity';

@Entity({ name: 'teams' })
export class Team {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    prefix: string;

    @Column({ type: 'int' })
    color: number;

    @ManyToOne(() => Game, (game) => game.teams)
    game: Game;

    @OneToMany(() => Player, (player) => player.team)
    players: Player[];

    @OneToMany(() => Building, (building) => building.team, { cascade: true })
    buildings: Building[];

    @Column({ type: 'varchar' })
    roleId: string;

    @Column({ type: 'varchar' })
    voiceChannelId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
