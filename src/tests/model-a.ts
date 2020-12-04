import {IsInt, IsOptional, IsString, Length} from 'class-validator';
import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {ModelD} from './model-d';

@Entity()
export class ModelA extends BaseEntity {
    @PrimaryGeneratedColumn()
    @IsInt()
    @IsOptional()
    id!: number;

    @Column('varchar', {length: 50, unique: true})
    @IsString()
    @Length(1, 50)
    column1!: string;

    @Column('varchar', {length: 256, nullable: true})
    @IsString()
    @IsOptional()
    @Length(1, 256)
    column2!: string | null;

    @Column({nullable: true})
    @IsInt()
    @IsOptional()
    modelDId?: number | null;

    @ManyToOne(() => ModelA)
    modelD?: ModelD;
}

