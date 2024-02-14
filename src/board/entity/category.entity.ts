import { Board } from "src/board/entity/board.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('category')
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'category_id' })
    categoryId: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    title: string;

    @OneToMany(() => Board, board => board.categoryId)
    boards: Board[];
}