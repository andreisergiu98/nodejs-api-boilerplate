import {IsInt, IsOptional, IsString, Length} from 'class-validator';
import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {ModelD} from './model-d';

@Entity()
export class ModelA extends BaseEntity {
    @IsInt()
    @IsOptional()
    @PrimaryGeneratedColumn()
    id!: number;

    @IsString()
    @Length(1, 50)
    @Column('varchar', {length: 50, unique: true})
    column1!: string;

    @IsString()
    @IsOptional()
    @Length(1, 256)
    @Column('varchar', {length: 256, nullable: true})
    column2!: string | null;

    @ManyToOne(() => ModelA)
    modelD?: ModelD;
}