import { Board } from "src/board/entity/board.entity";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, ViewColumn, ViewEntity } from "typeorm";

@Entity('reply')
export class Reply extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'reply_id' })
    replyId: number;

    @Column({ name: 'board_id' })
    boardId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'parent_id', nullable: true })
    parentId?: number;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ type: 'timestamp' })
    regdate: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedate: Date;

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
    @ViewColumn()
    id: number;

    @ViewColumn({ name: 'board_id' })
    boardId: number;

    @ViewColumn()
    name: string;

    @ViewColumn({ name: 'parent_id' })
    parentId: number;

    @ViewColumn()
    content: string;

    @ViewColumn()
    regdate: Date;

    @ViewColumn()
    updatedate: Date;

    @ViewColumn()
    deletedate: Date;
}

