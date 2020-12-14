import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {ModelB} from './model-b';

@Entity()
export class ModelC extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', {length: 50, unique: true})
	tag!: string;

	@Column('varchar', {length: 256, nullable: true})
	description!: string;

	@Column({default: 0})
	rank!: number;

	@OneToMany(() => ModelB, b => b.modelC)
	modelB?: ModelB[];
}