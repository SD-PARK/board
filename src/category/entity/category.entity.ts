import { ApiProperty } from "@nestjs/swagger";
import { Board } from "src/board/entity/board.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('category')
export class Category extends BaseEntity {
    @ApiProperty({ description: '카테고리 ID', example: '1' })
    @PrimaryGeneratedColumn({ name: 'category_id' })
    categoryId: number;

    @ApiProperty({ description: '카테고리명', example: '공지사항' })
    @Column({ type: 'varchar', length: 255, unique: true })
    title: string;

    @OneToMany(() => Board, board => board.categoryId)
    boards: Board[];
}