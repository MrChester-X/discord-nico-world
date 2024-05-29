import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Team } from '../../team/entities/team.entity';

@Entity()
export class Building {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('varchar')
    name: string;

    @Column('boolean', { default: true })
    isAlive: boolean;

    @ManyToOne(() => Team, (team) => team.buildings)
    team: Team;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
