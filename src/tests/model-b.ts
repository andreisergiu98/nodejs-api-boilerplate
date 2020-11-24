import {BaseEntity, Column, Entity, ManyToOne} from 'typeorm';
import {ModelA} from './model-a';
import {ModelC} from './model-c';

@Entity()
export class ModelB extends BaseEntity {
    @Column({primary: true})
    column1!: number;

    @Column({primary: true})
    column2!: number;

    @Column('boolean', {default: false})
    column3!: boolean;

    @Column('boolean', {default: false})
    column4!: boolean;

    @Column('boolean', {default: false})
    column5!: boolean;

    @Column('boolean', {default: false})
    column6!: boolean;

    @ManyToOne(() => ModelA)
    modelA?: ModelA;

    @ManyToOne(() => ModelC)
    modelC?: ModelC;
}