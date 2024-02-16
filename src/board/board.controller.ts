import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BoardService } from './board.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Board, ViewBoardList } from './entity/board.entity';
import { BoardFilterDto, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageResponseDto } from './dto/image.dto';

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

    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(200)
    @Post('/image')
    async postSaveImage(@UploadedFile() file: Express.Multer.File): Promise<ImageResponseDto> {
        return await this.boardService.imageUpload(file);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    async patchBoard(@Req() req, @Param('id') boardId: number, @Body() boardDto: UpdateBoardDto): Promise<Board> {
        return await this.boardService.patchBoard(boardDto, boardId, req.user.userId);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    async deleteBoard(@Req() req, @Param('id') boardId: number): Promise<void> {
        await this.boardService.deleteBoard(boardId, req.user.userId);
    }
}