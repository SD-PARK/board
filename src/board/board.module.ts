import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, BoardList } from './entity/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardList])],
  controllers: [BoardController],
  providers: [BoardService]
})
export class BoardModule {}
