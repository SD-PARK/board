import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password?: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @CreateDateColumn({ type: 'timestamp' })
    regdate: Date;
}