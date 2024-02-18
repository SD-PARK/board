import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity('token')
export class Token extends BaseEntity {
    @ApiProperty({ description: '유저 ID', example: '1' })
    @PrimaryColumn({ name: 'user_id' })
    userId: number;

    @ApiProperty({ description: 'Refresh Token' })
    @Column({ length: 255, unique: true })
    token: string;

    @ApiProperty({ description: '토큰 만료 기한', example: '2024-01-01 00:00:00' })
    @Column({ name: 'expire_in' })
    expireIn: Date;

    @OneToOne(() => User, user => user.token)
    @JoinColumn({ name: 'user_id' })
    user: User;
}