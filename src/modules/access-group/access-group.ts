import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {IsInt, IsOptional, IsString, Length} from 'class-validator';

@Entity()
export class AccessGroup extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsInt()
	@IsOptional()
	id!: number;

	@Column('varchar', {length: 50, unique: true})
	@IsString()
	@Length(1, 50)
	tag!: string;

	@Column('varchar', {length: 256, nullable: true})
	@IsString()
	@IsOptional()
	@Length(1, 256)
	description!: string;
}