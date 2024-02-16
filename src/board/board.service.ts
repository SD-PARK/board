import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board, ViewBoardList } from './entity/board.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BoardFilterDto, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { subDays } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { CategoryService } from 'src/category/category.service';
import { AwsService } from 'src/aws/aws.service';
import { UtilsService } from 'src/utils/utils.service';
import { ImageResponseDto } from './dto/image.dto';

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
        @InjectRepository(ViewBoardList) private readonly viewBoardListRepository: Repository<ViewBoardList>,
        private readonly categoryService: CategoryService,
        private readonly awsService: AwsService,
        private readonly utilsService: UtilsService,
        private readonly configService: ConfigService,
    ) {}
    private readonly logger: Logger = new Logger(BoardService.name);

    async getBoardList(boardFilterDto: BoardFilterDto): Promise<ViewBoardList[]> {
        const TARGET_KEY: string[] = this.configService.get('BOARD_TARGET_KEY');
        const PAGE_SIZE: number = this.configService.get('BOARD_PAGE_SIZE');

        const { target, keyword, category, sort, page } = boardFilterDto;
        
        try {
            let queryBuilder: SelectQueryBuilder<ViewBoardList> = this.viewBoardListRepository.createQueryBuilder('view_board_list');
    
            // 검색 (제목, 작성자, 전체(Default))
            if (keyword) {
                if (TARGET_KEY.includes(target))
                    queryBuilder = queryBuilder.andWhere(`view_board_list.${target} LIKE :keyword`, { keyword: `%${keyword}%` });
                else
                    queryBuilder = queryBuilder.andWhere('view_board_list.title LIKE :keyword OR view_board_list.writer LIKE :keyword', { keyword: `%${keyword}%` });
            }
    
            // 카테고리 필터
            if (category) {
                queryBuilder = queryBuilder.andWhere('view_board_list.category = :category', { category: category });
            }
    
            // 정렬(조회수, 조회수(7일), 조회수(1달), 조회수(1년), 작성일자(Default))
            switch (sort) {
                case 'view':
                    queryBuilder = queryBuilder
                        .orderBy('view_board_list.regdate', 'DESC')
                        .addOrderBy('view_board_list.views', 'DESC');
                    break;
                case 'view7d':
                    queryBuilder = queryBuilder
                        .andWhere(`view_board_list.regdate >= :daysAgo`, { daysAgo: subDays(new Date(), 7) })
                        .orderBy('view_board_list.regdate', 'DESC')
                        .addOrderBy('view_board_list.views', 'DESC');
                    break;
                case 'view30d':
                    queryBuilder = queryBuilder
                        .andWhere(`view_board_list.regdate >= :daysAgo`, { daysAgo: subDays(new Date(), 30) })
                        .orderBy('view_board_list.regdate', 'DESC')
                        .addOrderBy('view_board_list.views', 'DESC');
                    break;
                case 'view365d':
                    queryBuilder = queryBuilder
                        .andWhere(`view_board_list.regdate >= :daysAgo`, { daysAgo: subDays(new Date(), 365) })
                        .orderBy('view_board_list.regdate', 'DESC')
                        .addOrderBy('view_board_list.views', 'DESC');
                    break;
                default:
                    queryBuilder = queryBuilder.orderBy('view_board_list.regdate', 'DESC');
                    break;
            }
            
            // 페이지 구분
            queryBuilder = queryBuilder
                .skip(((page || 1) - 1) * PAGE_SIZE)
                .take(PAGE_SIZE);
    
            const cols: ViewBoardList[] = await queryBuilder.getMany();
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
        if (!(await this.categoryService.validateCategory(boardDto.categoryId)))
            throw new BadRequestException('카테고리 ID가 유효하지 않습니다');

        try {
            const result: Board = await this.boardRepository.save({
                ...boardDto,
                userId: userId,
            });
            return result;
        } catch (err) {
            if (err.status === 400) {
                throw err;
            } else {
                this.logger.error('postBoard');
                throw err;
            }
        }
    }

    async patchBoard(boardDto: UpdateBoardDto, boardId: number, userId: number): Promise<Board> {
        const col: Board = await this.verifyUserOwnership(boardId, userId);

        if (boardDto?.categoryId && !(await this.categoryService.validateCategory(boardDto.categoryId)))
            throw new BadRequestException('카테고리 ID가 유효하지 않습니다');

        try {
            const result: Board = await this.boardRepository.save({
                ...col,
                ...boardDto,
            });
            return result;
        } catch (err) {
            if (err.status === 400) {
                throw err;
            } else {
                this.logger.error('patchBoard()');
                throw err;
            }
        }
    }

    async deleteBoard(boardId: number, userId: number): Promise<void> {
        await this.verifyUserOwnership(boardId, userId);
        try {
            await this.boardRepository.softDelete(boardId);
        } catch (err) {
            this.logger.error('deleteBoard()');
            throw err;
        }
    }
      
    async imageUpload(file: Express.Multer.File): Promise<ImageResponseDto> {
        const imageName = this.utilsService.getUUID();
        const ext = file.originalname.split('.').pop();
        
        const imageUrl = await this.awsService.imageUploadToS3(
            `${imageName}.${ext}`,
            file,
            ext,
        );
        
        return { imageUrl };
    }

    /** 게시글의 변경 권한을 확인 후 해당 게시글을 반환합니다. */
    async verifyUserOwnership(boardId: number, userId: number): Promise<Board> {
        const col: Board = await this.getBoard(boardId);

        if (col.userId !== userId)
            throw new ForbiddenException('권한이 없습니다');
        else
            return col;
    }

    /** ID와 일치하는 게시글이 있으면 True, 아니면 False를 반환합니다. */
    async validateBoard(boardId: number): Promise<Boolean> {
        const col: Board = await this.boardRepository.findOne({ where: { boardId: boardId }});
        
        if (col)
            return true;
        else
            return false;
    }
}
