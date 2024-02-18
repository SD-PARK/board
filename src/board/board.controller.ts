import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BoardService } from './board.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Board, ViewBoardList } from './entity/board.entity';
import { BoardFilterDto, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageResponseDto, ImageUploadDto } from './dto/image.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('게시글 API')
@Controller('v1/boards')
export class BoardController {
    constructor(private readonly boardService: BoardService) {}

    @Get()
    @ApiOperation({ summary: '게시글 목록 조회 API', description: '게시글 목록을 조회한다.' })
    @ApiBearerAuth('access-token')
    @ApiQuery({ name: 'target', description: '검색 기준', example: 'all || title || writer', required: false })
    @ApiQuery({ name: 'keyword', description: '검색 키워드', example: '키워드', required: false })
    @ApiQuery({ name: 'category', description: '카테고리', example: '공지사항', required: false })
    @ApiQuery({ name: 'sort', description: '정렬 기준', example: 'view || view7d || view30d || view365d', required: false })
    @ApiQuery({ name: 'page', description: '페이지', example: '1', required: false })
    @ApiResponse({ status: 200, description: '조회된 게시글 목록', type: Array<ViewBoardList> })
    @ApiResponse({ status: 401, description: '권한 없음' })
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
    @ApiOperation({ summary: '게시글 조회 API', description: '특정 게시글을 조회한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '게시글 ID', example: '1', required: true })
    @ApiResponse({ status: 200, description: '조회된 게시글', type: Board })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '게시글이 존재하지 않음' })
    @UseGuards(JwtAuthGuard)
    async getBoard(@Param('id') boardId: number): Promise<Board> {
        return await this.boardService.getBoard(boardId);
    }

    @Post()
    @ApiOperation({ summary: '게시글 작성 API', description: '게시글을 작성한다.' })
    @ApiBearerAuth('access-token')
    @ApiBody({ type: CreateBoardDto })
    @ApiResponse({ status: 201, description: '작성된 게시글', type: Board })
    @ApiResponse({ status: 400, description: '카테고리 ID가 유효하지 않음' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @UseGuards(JwtAuthGuard)
    async postBoard(@Req() req, @Body() boardDto: CreateBoardDto): Promise<Board> {
        return await this.boardService.postBoard(boardDto, req.user.userId);
    }

    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(200)
    @Post('/image')
    @ApiOperation({ summary: '이미지 업로드 API', description: '이미지를 업로드한다.' })
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ description: '업로드할 파일', type: ImageUploadDto })
    @ApiResponse({ status: 201, description: '업로드된 이미지 URL', type: ImageResponseDto })
    @UseGuards(JwtAuthGuard)
    async postSaveImage(@UploadedFile() file: Express.Multer.File): Promise<ImageResponseDto> {
        return await this.boardService.imageUpload(file);
    }

    @Patch('/:id')
    @ApiOperation({ summary: '게시글 수정 API', description: '게시글을 수정한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '게시글 ID', example: '1', required: true })
    @ApiBody({ type: UpdateBoardDto })
    @ApiResponse({ status: 200, description: '수정된 게시글', type: Board })
    @ApiResponse({ status: 400, description: '카테고리 ID가 유효하지 않음' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '게시글 ID가 유효하지 않음' })
    @UseGuards(JwtAuthGuard)
    async patchBoard(@Req() req, @Param('id') boardId: number, @Body() boardDto: UpdateBoardDto): Promise<Board> {
        return await this.boardService.patchBoard(boardDto, boardId, req.user.userId);
    }

    @Delete('/:id')
    @ApiOperation({ summary: '게시글 삭제 API', description: '게시글을 삭제한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '게시글 ID', example: '1', required: true })
    @ApiResponse({ status: 200, description: '삭제 완료' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '게시글 ID가 유효하지 않음' })
    @UseGuards(JwtAuthGuard)
    async deleteBoard(@Req() req, @Param('id') boardId: number): Promise<void> {
        await this.boardService.deleteBoard(boardId, req.user.userId);
    }
}