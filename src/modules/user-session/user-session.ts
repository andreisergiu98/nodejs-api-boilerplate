import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import {User} from '../user';

@Entity()
export class UserSession extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('text')
    idToken!: string;

    @Column('text')
    accessToken!: string;

    @Column('text', {array: true})
    scope!: string[];

    @Column('text')
    tokenType!: string;

    @Column()
    expiresAt!: Date;

    @Column({default: true})
    enabled!: boolean;

    @Column('text', {default: 'unknown'})
    deviceOs!: string;

    @Column('text', {default: 'unknown'})
    deviceBrowser!: string;

    @Column()
    userId!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => User)
    @JoinColumn()
    user?: User;
}