import {BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import {IsDate, IsEmail, IsInt, IsOptional, IsString, Length, MaxLength} from 'class-validator';

import {AccessRole} from '../access-role';

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsInt()
	@IsOptional()
	id!: number;

	@Column({length: 256, unique: true})
	googleId!: string;

	@Column({length: 50, unique: true})
	@IsEmail()
	@Length(5, 50)
	email!: string;

	@Column('varchar', {length: 512, nullable: true})
	@IsString()
	@IsOptional()
	@MaxLength(512)
	picture!: string | null;

	@Column({length: 256})
	@IsString()
	@MaxLength(256)
	givenName!: string;

	@Column({length: 256})
	@IsString()
	@MaxLength(256)
	familyName!: string;

	@Column('date', {nullable: true})
	@IsDate()
	birthday!: Date | null;

	@Column('varchar', {length: 50, nullable: true})
	@IsString()
	@MaxLength(50)
	phoneNumber!: string | null;

	@ManyToMany(() => AccessRole, {
		persistence: false,
	})
	@JoinTable({
		name: 'user_access_roles',
	})
	roles?: AccessRole[];
}