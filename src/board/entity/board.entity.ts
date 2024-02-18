import { ApiProperty } from "@nestjs/swagger";
import { Category } from "src/category/entity/category.entity";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, ViewColumn, ViewEntity } from "typeorm";

@Entity('board')
export class Board extends BaseEntity {
    @ApiProperty({ description: '게시글 ID', example: '1' })
    @PrimaryGeneratedColumn({ name: 'board_id' })
    boardId: number;

    @ApiProperty({ description: '카테고리 ID', example: '1' })
    @Column({ name: 'category_id' })
    categoryId: number;

    @ApiProperty({ description: '작성자 ID', example: '1' })
    @Column({ name: 'user_id' })
    userId: number;

    @ApiProperty({ description: '게시글 제목', example: '제목' })
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @ApiProperty({ description: '게시글 내용', example: '내용' })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({ description: '작성일자', example: '2024-01-01 00:00:00' })
    @CreateDateColumn({ type: 'timestamp' })
    regdate: Date;

    @ApiProperty({ description: '수정일자', example: '2024-01-01 00:00:00' })
    @UpdateDateColumn({ type: 'timestamp' })
    updatedate: Date;

    @ApiProperty({ description: '삭제일자', example: '2024-01-01 00:00:00' })
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedate?: Date;

    @ApiProperty({ description: '조회수', example: '0' })
    @Column({ type: 'int', default: 0 })
    views: number;

    @ManyToOne(() => Category, category => category.categoryId)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => User, user => user.userId)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

@ViewEntity({
    name: 'view_board_list',
    expression: `
    SELECT "board"."board_id" as "id", "category"."title" as "category", "user"."name" as "writer", "board"."title" as "title", "board"."regdate" as "regdate", "board"."views" as "views"
    FROM "board" "board"
    LEFT JOIN "category" "category" ON "category"."category_id" = "board"."category_id"
    LEFT JOIN "user" "user" ON "user"."user_id" = "board"."user_id"
    WHERE "board"."deletedate" IS NULL
    `
})
export class ViewBoardList {
    @ApiProperty({ description: '게시글 ID', example: '1' })
    @ViewColumn()
    id: number;

    @ApiProperty({ description: '카테고리', example: '공지사항' })
    @ViewColumn()
    category: string;

    @ApiProperty({ description: '작성자 닉네임', example: '작성자' })
    @ViewColumn()
    writer: string;

    @ApiProperty({ description: '게시글 제목', example: '제목' })
    @ViewColumn()
    title: string;

    @ApiProperty({ description: '작성일자', example: '2024-01-01 00:00:00' })
    @ViewColumn()
    regdate: Date;

    @ApiProperty({ description: '조회수', example: '0' })
    @ViewColumn()
    views: number;
}