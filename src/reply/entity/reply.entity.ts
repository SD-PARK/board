import { ApiProperty } from "@nestjs/swagger";
import { Board } from "src/board/entity/board.entity";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, ViewColumn, ViewEntity } from "typeorm";

@Entity('reply')
export class Reply extends BaseEntity {
    @ApiProperty({ description: '댓글 ID', example: '1' })
    @PrimaryGeneratedColumn({ name: 'reply_id' })
    replyId: number;

    @ApiProperty({ description: '게시글 ID', example: '1' })
    @Column({ name: 'board_id' })
    boardId: number;

    @ApiProperty({ description: '작성자 ID', example: '1' })
    @Column({ name: 'user_id' })
    userId: number;

    @ApiProperty({ description: '부모 댓글 ID', example: '1' })
    @Column({ name: 'parent_id', nullable: true })
    parentId?: number;

    @ApiProperty({ description: '댓글 내용', example: '내용' })
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

    @ManyToOne(() => Board, board => board.boardId)
    @JoinColumn({ name: 'board_id' })
    board: Board;

    @ManyToOne(() => User, user => user.userId)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Reply, reply => reply.replyId)
    @JoinColumn({ name: 'parent_id' })
    reply: Reply;
}

@ViewEntity({
    name: 'view_reply',
    expression: `
    SELECT "reply"."reply_id" as "id", "reply"."board_id" as "board_id", "user"."name" as "name", "reply"."parent_id" as "parent_id",
            "reply"."content" as "content", "reply"."regdate" as "regdate", "reply"."updatedate" as "updatedate", "reply"."deletedate" as "deletedate"
    FROM "reply" "reply"
    LEFT JOIN "user" on "user"."user_id" = "reply"."user_id";
    `
})
export class ViewReply {
    @ApiProperty({ description: '댓글 ID', example: '1' })
    @ViewColumn()
    id: number;

    @ApiProperty({ description: '게시글 ID', example: '1' })
    @ViewColumn({ name: 'board_id' })
    boardId: number;

    @ApiProperty({ description: '작성자 닉네임', example: '작성자' })
    @ViewColumn()
    name: string;

    @ApiProperty({ description: '부모 댓글 ID', example: '1' })
    @ViewColumn({ name: 'parent_id' })
    parentId: number;

    @ApiProperty({ description: '댓글 내용', example: '내용' })
    @ViewColumn()
    content: string;

    @ApiProperty({ description: '작성일자', example: '2024-01-01 00:00:00' })
    @ViewColumn()
    regdate: Date;

    @ApiProperty({ description: '수정일자', example: '2024-01-01 00:00:00' })
    @ViewColumn()
    updatedate: Date;

    @ApiProperty({ description: '삭제일자', example: '2024-01-01 00:00:00' })
    @ViewColumn()
    deletedate: Date;
}

