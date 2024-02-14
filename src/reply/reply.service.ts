import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reply, ViewReply } from './entity/reply.entity';
import { BoardService } from 'src/board/board.service';
import { CreateReplyDto, UpdateReplyDto } from './dto/reply.dto';

@Injectable()
export class ReplyService {
    constructor(
        @InjectRepository(Reply) private readonly replyRepository: Repository<Reply>,
        @InjectRepository(ViewReply) private readonly viewReplyRepository: Repository<ViewReply>,
        private readonly boardService: BoardService,
    ) {}
    private readonly logger: Logger = new Logger(ReplyService.name)

    async getBoardReply(boardId: number): Promise<ViewReply[]> {
        try {
            const cols: ViewReply[] = await this.viewReplyRepository.find({ where: { boardId: boardId }});
            return cols;
        } catch (err) {
            this.logger.error('getReply()');
            throw err;
        }
    }

    async postReply(replyDto: CreateReplyDto, userId: number): Promise<Reply> {
        await this.validateDto(replyDto);

        try {
            const result: Reply = await this.replyRepository.save({
                ...replyDto,
                userId: userId,
            });
            return result;
        } catch (err) {
            this.logger.error('postReply');
            throw err;
        }
    }

    async patchReply(replyDto: UpdateReplyDto, replyId: number, userId: number): Promise<Reply> {
        const col: Reply = await this.verifyUserOwnership(replyId, userId);
        await this.validateDto(replyDto);

        try {
            const result: Reply = await this.replyRepository.save({
                ...col,
                ...replyDto,
            });
            return result;
        } catch (err) {
            this.logger.error('patchReply()');
            throw err;
        }
    }

    async deleteReply(replyId: number, userId: number): Promise<void> {
        const col: Reply = await this.verifyUserOwnership(replyId, userId);
        try {
            await this.replyRepository.save({
                ...col,
                deletedate: new Date(),
            });
        } catch (err) {
            this.logger.error('deleteReply()');
            throw err;
        }
    }

    /** 댓글의 변경 권한을 확인 후 해당 댓글을 반환합니다. */
    async verifyUserOwnership(replyId: number, userId: number): Promise<Reply> {
        const col: Reply = await this.replyRepository.findOne({ where: { replyId: replyId }});

        if (col.userId !== userId)
            throw new ForbiddenException('권한이 없습니다');
        else
            return col;
    }

    /** ID와 일치하는 댓글이 있으면 True, 아니면 False를 반환합니다. */
    async validateReply(replyId: number): Promise<Boolean> {
        const col: Reply = await this.replyRepository.findOne({ where: { replyId: replyId }});
        
        if (col)
            return true;
        else
            return false;
    }

    /** ReplyDto의 Board ID와 Category ID가 유효한 지 검증합니다. */
    async validateDto(replyDto: CreateReplyDto | UpdateReplyDto): Promise<void> {
        if (!(await this.boardService.validateBoard(replyDto.boardId)))
            throw new BadRequestException('게시글 ID가 유효하지 않습니다');
        if (replyDto?.parentId && !(await this.validateReply(replyDto.parentId)))
            throw new BadRequestException('부모 댓글의 ID가 유효하지 않습니다.');
    }
}
