import { ApiProperty } from "@nestjs/swagger";
import { Token } from "src/auth/entity/token.entity";
import { Board } from "src/board/entity/board.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User extends BaseEntity {
    @ApiProperty({ description: '유저 ID', example: '1' })
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @ApiProperty({ description: '이메일', example: 'test@test.com' })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @ApiProperty({ description: '비밀번호', example: 'test123!' })
    @Column({ type: 'varchar', length: 255 })
    password?: string;

    @ApiProperty({ description: '닉네임', example: '닉네임' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({ description: '생성일자', example: '2024-01-01 00:00:00' })
    @CreateDateColumn({ type: 'timestamp' })
    regdate: Date;

    @OneToOne(() => Token, token => token.user)
    token: Token;

    @OneToMany(() => Board, board => board.categoryId)
    boards: Board[];
}