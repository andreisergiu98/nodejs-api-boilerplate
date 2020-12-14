import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {User} from '../user';

@Entity()
export class UserSession extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	userId!: number;

	@Column({length: 256})
	deviceOS!: string;

	@Column({length: 256})
	browser!: string;

	@Column()
	enabled!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => User)
	@JoinColumn()
	user?: User;
}