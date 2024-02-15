import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Reply, ViewReply } from './entity/reply.entity';
import { CreateReplyDto, UpdateReplyDto } from './dto/reply.dto';

@Controller('reply')
export class ReplyController {
    constructor(private readonly replyService: ReplyService) {}
    
    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    async getBoardReply(@Param('id') boardId: number): Promise<ViewReply[]> {
        return await this.replyService.getBoardReply(boardId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async postReply(@Req() req, @Body() replyDto: CreateReplyDto): Promise<Reply> {
        return await this.replyService.postReply(replyDto, req.user.userId);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    async patchReply(@Req() req, @Param('id') replyId: number, @Body() replyDto: UpdateReplyDto): Promise<Reply> {
        return await this.replyService.patchReply(replyDto, replyId, req.user.userId);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    async deleteReply(@Req() req, @Param('id') replyId: number): Promise<void> {
        await this.replyService.deleteReply(replyId, req.user.userId);
    }
}
