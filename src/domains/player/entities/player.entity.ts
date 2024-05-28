import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Game } from '../../game/entities/game.entity';
import { Team } from '../../team/entities/team.entity';

@Entity({ name: 'players' })
export class Player {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    discordId: string;

    @ManyToOne(() => Game, (game) => game.players)
    game: Game;

    @ManyToOne(() => Team, (team) => team.players, { nullable: true })
    team?: Team;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
