import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Whitelist {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column('uuid')
  discordId: string;
}
