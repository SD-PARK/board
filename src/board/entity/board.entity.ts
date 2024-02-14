import { Category } from "src/board/entity/category.entity";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, ViewColumn, ViewEntity } from "typeorm";

@Entity('board')
export class Board extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'board_id' })
    boardId: number;

    @Column({ name: 'category_id' })
    categoryId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ type: 'timestamp' })
    regdate: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedate: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedate?: Date;

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
    @ViewColumn()
    id: number;

    @ViewColumn()
    category: string;

    @ViewColumn()
    writer: string;

    @ViewColumn()
    title: string;

    @ViewColumn()
    regdate: Date;

    @ViewColumn()
    views: number;
}