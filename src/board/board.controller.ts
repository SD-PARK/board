import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Board, ViewBoardList } from './entity/board.entity';
import { BoardFilterDto, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Controller('board')
export class BoardController {
    constructor(private readonly boardService: BoardService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getBoardList(
        @Query('target') target?: string, // 글 검색 기준
        @Query('keyword') keyword?: string, // 검색 키워드
        @Query('category') category?: string, // 카테고리
        @Query('sort') sort?: string, // 정렬 기준
        @Query('page') page?: number, // 페이지
    ): Promise<ViewBoardList[]> {
        const boardFilterDto: BoardFilterDto = {
            target: target,
            keyword: keyword,
            category: category,
            sort: sort,
            page: page,
        }
        return await this.boardService.getBoardList(boardFilterDto);
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    async getBoard(@Param('id') boardId: number) {
        return await this.boardService.getBoard(boardId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async postBoard(@Req() req, @Body() boardDto: CreateBoardDto): Promise<Board> {
        return await this.boardService.postBoard(boardDto, req.user.userId);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    async patchBoard(@Req() req, @Param('id') boardId: number, @Body() boardDto: UpdateBoardDto): Promise<Board> {
        return await this.boardService.patchBoard(boardDto, boardId, req.user.userId);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBoard(@Req() req, @Param('id') boardId: number) {
        return await this.boardService.deleteBoard(boardId, req.user.userId);
    }
}