import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Reply, ViewReply } from './entity/reply.entity';
import { CreateReplyDto, UpdateReplyDto } from './dto/reply.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('댓글 API')
@Controller('v1/replys')
export class ReplyController {
    constructor(private readonly replyService: ReplyService) {}
    
    @Get('/:id')
    @ApiOperation({ summary: '댓글 조회 API', description: '게시글의 댓글을 조회한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '게시글 ID', example: '1', required: true })
    @ApiResponse({ status: 200, description: '조회된 댓글', type: ViewReply, isArray: true })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @UseGuards(JwtAuthGuard)
    async getBoardReply(@Param('id') boardId: number): Promise<ViewReply[]> {
        return await this.replyService.getBoardReply(boardId);
    }

    @Post()
    @ApiOperation({ summary: '댓글 작성 API', description: '댓글을 작성한다.' })
    @ApiBearerAuth('access-token')
    @ApiBody({ type: CreateReplyDto })
    @ApiResponse({ status: 201, description: '작성된 댓글', type: Reply })
    @ApiResponse({ status: 400, description: '게시글 ID가 유효하지 않음' })
    @ApiResponse({ status: 400, description: '부모 댓글 ID가 유효하지 않음' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @UseGuards(JwtAuthGuard)
    async postReply(@Req() req, @Body() replyDto: CreateReplyDto): Promise<Reply> {
        return await this.replyService.postReply(replyDto, req.user.userId);
    }

    @Patch('/:id')
    @ApiOperation({ summary: '댓글 수정 API', description: '댓글을 수정한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '댓글 ID', example: '1', required: true })
    @ApiBody({ type: UpdateReplyDto })
    @ApiResponse({ status: 200, description: '수정된 댓글', type: Reply })
    @ApiResponse({ status: 400, description: '게시글 ID가 유효하지 않음' })
    @ApiResponse({ status: 400, description: '부모 댓글 ID가 유효하지 않음' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '댓글 ID가 유효하지 않음' })
    @UseGuards(JwtAuthGuard)
    async patchReply(@Req() req, @Param('id') replyId: number, @Body() replyDto: UpdateReplyDto): Promise<Reply> {
        return await this.replyService.patchReply(replyDto, replyId, req.user.userId);
    }

    @Delete('/:id')
    @ApiOperation({ summary: '댓글 삭제 API', description: '댓글을 삭제한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '댓글 ID', example: '1', required: true })
    @ApiResponse({ status: 200, description: '삭제 완료' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '댓글 ID가 유효하지 않음' })
    @UseGuards(JwtAuthGuard)
    async deleteReply(@Req() req, @Param('id') replyId: number): Promise<void> {
        await this.replyService.deleteReply(replyId, req.user.userId);
    }
}
