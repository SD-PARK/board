import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board, BoardList } from './entity/board.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BoardFilterDto, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { subDays } from 'date-fns';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
        @InjectRepository(BoardList) private readonly boardListRepository: Repository<BoardList>,
        private readonly configService: ConfigService,
    ) {}
    private readonly logger: Logger = new Logger(BoardService.name);

    async getBoardList(boardFilterDto: BoardFilterDto): Promise<BoardList[]> {
        const TARGET_KEY: string[] = this.configService.get('BOARD_TARGET_KEY');
        const PAGE_SIZE: number = this.configService.get('BOARD_PAGE_SIZE');

        const { target, keyword, category, sort, page } = boardFilterDto;
        
        try {
            let queryBuilder: SelectQueryBuilder<BoardList> = this.boardListRepository.createQueryBuilder('board_list');
    
            // 검색 (제목, 작성자, 전체(Default))
            if (keyword) {
                if (TARGET_KEY.includes(target))
                    queryBuilder = queryBuilder.andWhere(`board_list.${target} LIKE :keyword`, { target: target, keyword: `%${keyword}%` });
                else
                    queryBuilder = queryBuilder.andWhere('board_list.title LIKE :keyword OR board_list.writer LIKE :keyword', { keyword: `%${keyword}%` });
            }
    
            // 카테고리 필터
            if (category) {
                queryBuilder = queryBuilder.andWhere('board_list.category = :category', { category: category });
            }
    
            // 정렬(조회수, 조회수(7일), 조회수(1달), 조회수(1년), 작성일자(Default))
            switch (sort) {
                case 'view':
                    queryBuilder = queryBuilder
                        .orderBy('board_list.regdate', 'DESC')
                        .addOrderBy('board_list.views', 'DESC');
                    break;
                case 'view7d':
                    queryBuilder = queryBuilder
                        .andWhere(`board_list.regdate >= :daysAgo`, { daysAgo: subDays(new Date(), 7) })
                        .orderBy('board_list.regdate', 'DESC')
                        .addOrderBy('board_list.views', 'DESC');
                    break;
                case 'view30d':
                    queryBuilder = queryBuilder
                        .andWhere(`board_list.regdate >= :daysAgo`, { daysAgo: subDays(new Date(), 30) })
                        .orderBy('board_list.regdate', 'DESC')
                        .addOrderBy('board_list.views', 'DESC');
                    break;
                case 'view365d':
                    queryBuilder = queryBuilder
                        .andWhere(`board_list.regdate >= :daysAgo`, { daysAgo: subDays(new Date(), 365) })
                        .orderBy('board_list.regdate', 'DESC')
                        .addOrderBy('board_list.views', 'DESC');
                    break;
                default:
                    queryBuilder = queryBuilder.orderBy('board_list.regdate', 'DESC');
                    break;
            }
            
            // 페이지 구분
            queryBuilder = queryBuilder
                .skip(((page || 1) - 1) * PAGE_SIZE)
                .take(PAGE_SIZE);
    
            const cols: BoardList[] = await queryBuilder.getMany();
            return cols;
        } catch (err) {
            this.logger.error('getBoardList()');
            throw err;
        }
    }

    async getBoard(boardId: number): Promise<Board> {
        try {
            const col: Board = await this.boardRepository.findOne({ where: { boardId: boardId }});
            if (!col || col.deletedate) {
                throw new NotFoundException('존재하지 않는 게시글입니다');
            } else {
                await this.boardViewIncrement(col);
                return col;
            }
        } catch (err) {
            if (err.status === 404) {
                throw err;
            } else {
                this.logger.error('getBoard()');
                throw err;
            }
        }
    }

    async boardViewIncrement(board: Board): Promise<void> {
        try {
            await this.boardRepository.save({
                ...board,
                views: board.views + 1,
            });
        } catch (err) {
            this.logger.error(err);
        }
    }

    async postBoard(boardDto: CreateBoardDto, userId: number): Promise<Board> {
        try {
            const result: Board = await this.boardRepository.save({
                ...boardDto,
                userId: userId,
            });
            return result;
        } catch (err) {
            this.logger.error('postBoard');
            throw err;
        }
    }

    async patchBoard(boardDto: UpdateBoardDto, boardId: number, userId: number): Promise<Board> {
        const col: Board = await this.verifyUserOwnership(boardId, userId);
        try {
            const result: Board = await this.boardRepository.save({
                ...col,
                ...boardDto,
            });
            return result;
        } catch (err) {
            this.logger.error('patchBoard()');
            throw err;
        }
    }

    async deleteBoard(boardId: number, userId: number): Promise<void> {
        const col: Board = await this.verifyUserOwnership(boardId, userId);
        try {
            await this.boardRepository.save({
                ...col,
                deletedate: new Date(),
            });
        } catch (err) {
            this.logger.error('deleteBoard()');
            throw err;
        }
    }

    async verifyUserOwnership(boardId: number, userId: number): Promise<Board> {
        const col: Board = await this.getBoard(boardId);

        if (col.userId !== userId)
            throw new ForbiddenException('권한이 없습니다');
        else
            return col;
    }
}
