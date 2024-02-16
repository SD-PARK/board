import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, ViewBoardList } from './entity/board.entity';
import { CategoryModule } from 'src/category/category.module';
import { AwsModule } from 'src/aws/aws.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, ViewBoardList]),
    CategoryModule, AwsModule, UtilsModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
