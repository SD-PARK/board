import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, ViewBoardList } from './entity/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, ViewBoardList])],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
