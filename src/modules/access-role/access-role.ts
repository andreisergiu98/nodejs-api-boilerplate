import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {IsBoolean, IsInt, IsOptional, IsString, Length} from 'class-validator';
import {AccessRolePermissions} from '../access-role-permissions';

@Entity()
export class AccessRole extends BaseEntity {
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

	@Column({default: 0})
	@IsInt()
	@IsOptional()
	rank!: number;

	@Column({default: true})
	@IsBoolean()
	@IsOptional()
	isStatus!: boolean;

	@OneToMany(() => AccessRolePermissions, permission => permission.role)
	permissions?: AccessRolePermissions[];
}