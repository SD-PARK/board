import { Module } from '@nestjs/common';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reply, ViewReply } from './entity/reply.entity';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reply, ViewReply]),
    BoardModule,
  ],
  controllers: [ReplyController],
  providers: [ReplyService]
})
export class ReplyModule {}
