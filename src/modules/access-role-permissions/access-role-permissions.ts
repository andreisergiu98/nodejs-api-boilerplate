import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {IsBoolean, IsInt, IsOptional} from 'class-validator';

import {AccessRole} from '../access-role';
import {AccessGroup} from '../access-group';

@Entity()
@Unique(['roleId', 'groupId'])
export class AccessRolePermissions extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsInt()
	@IsOptional()
	id!: number;

	@Column()
	@IsInt()
	roleId!: number;

	@Column()
	@IsInt()
	groupId!: number;

	@Column('boolean', {default: false})
	@IsBoolean()
	@IsOptional()
	read!: boolean;

	@Column('boolean', {default: false})
	@IsBoolean()
	@IsOptional()
	create!: boolean;

	@Column('boolean', {default: false})
	@IsBoolean()
	@IsOptional()
	update!: boolean;

	@Column('boolean', {default: false})
	@IsBoolean()
	@IsOptional()
	delete!: boolean;

	@ManyToOne(() => AccessRole, role => role.permissions)
	@JoinColumn()
	role?: AccessRole;

	@ManyToOne(() => AccessGroup)
	@JoinColumn()
	group?: AccessGroup;
}