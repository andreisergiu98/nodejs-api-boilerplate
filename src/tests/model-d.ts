import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class ModelD extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', {length: 50, unique: true})
	column1!: string;

	@Column('varchar', {length: 256, nullable: true})
	column2!: string;
}