import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn } from "typeorm";

@Entity('token')
export class Token extends BaseEntity {
    @PrimaryColumn({ name: 'user_id' })
    userId: number;

    @Column({ length: 255, unique: true })
    token: string;

    @Column({ name: 'expire_in' })
    expireIn: Date;

    @OneToOne(() => User, user => user.userId)
    user: User;
}