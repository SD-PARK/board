import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from '../board/board.controller';
import { BoardService } from './board.service';
import { ForbiddenException } from '@nestjs/common';
import { Readable } from 'stream';

describe('BoardController', () => {
  let controller: BoardController;

  const mockBoards = [
    { boardId: 1, categoryId: 1, userId: 1, title: 'title_1', content: 'content_1', regdate: new Date(), update: new Date(), views: 100 },
    { boardId: 2, categoryId: 1, userId: 2, title: 'title_2', content: 'content_2', regdate: new Date(), update: new Date(), views: 50 },
    { boardId: 3, categoryId: 1, userId: 3, title: 'title_3', content: 'content_3', regdate: new Date(), update: new Date(), views: 30 },
    { boardId: 4, categoryId: 2, userId: 1, title: 'title_4', content: 'content_4', regdate: new Date(), update: new Date(), views: 10 },
    { boardId: 5, categoryId: 2, userId: 2, title: 'title_5', content: 'content_5', regdate: new Date(), update: new Date(), views: 10 },
  ];
  const mockBoardLists = [
    { id: 1, category: '공지사항', writer: 'user_1', title: 'title_1', regdate: new Date(), views: 100 },
    { id: 2, category: '공지사항', writer: 'user_2', title: 'title_2', regdate: new Date(), views: 50 },
    { id: 3, category: '공지사항', writer: 'user_3', title: 'title_3', regdate: new Date(), views: 30 },
    { id: 4, category: 'Q&A', writer: 'user_1', title: 'title_4', regdate: new Date(), views: 10 },
    { id: 5, category: 'Q&A', writer: 'user_2', title: 'title_5', regdate: new Date(), views: 10 },
  ];

  const mockBoardService = {
    getBoardList: jest.fn().mockImplementation(() => mockBoardLists),
    getBoard: jest.fn().mockImplementation(id => {
      return Promise.resolve(
        mockBoards.find(board => board.boardId === id)
      );
    }),
    postBoard: jest.fn().mockImplementation((dto, userId) => {
      return Promise.resolve({
        boardId: 1,
        ...dto,
        userId: userId,
        regdate: new Date(),
        updatedate: new Date(),
        views: 0,
      });
    }),
    patchBoard: jest.fn().mockImplementation((dto, boardId, userId) => {
      const board = mockBoards.find(board => board.boardId === boardId);
      
      if (board.userId !== userId)
        throw new ForbiddenException('권한이 없습니다.');

      return Promise.resolve({ ...board, ...dto, updatedate: new Date() });
    }),
    deleteBoard: jest.fn(),
    imageUpload: jest.fn().mockImplementation((file) => {
      return { imageUrl: 'url' };
    })
  };

  const req = { user: { userId: 1 }};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [BoardService],
    })
      .overrideProvider(BoardService)
      .useValue(mockBoardService)
      .compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBoardList Test', () => {
    const dto = {
      target: 'all',
      keyword: 'user',
      category: '공지사항',
      sort: 'view7d',
      page: 1,
    }

    it('Board List를 반환하는가?', async () => {
      expect(await controller.getBoardList(dto.target, dto.keyword, dto.category, dto.sort, dto.page))
        .toEqual(mockBoardLists);
    });

    it('Board Filter가 온전히 전달되었는가?', () => {
      expect(mockBoardService.getBoardList).toHaveBeenCalledWith(dto);
    });
  });

  describe('getBoard Test', () => {
    const boardId = 1;

    it('Board를 반환하는가?', async () => {
      expect(await controller.getBoard(boardId)).toEqual(mockBoards[boardId-1]);
    });

    it('Board ID가 온전히 전달되었는가?', () => {
      expect(mockBoardService.getBoard).toHaveBeenCalledWith(boardId);
    });
  });

  describe('postBoard Test', () => {
    const userId = 1;
    const req = { user: { userId: userId }};
    const dto = {
      categoryId: 1,
      title: 'TestTitle',
      content: 'TestContent',
    };

    it('새 Board를 생성하고 반환하는가?', () => {
      expect(controller.postBoard(req, dto))
        .resolves.toEqual({
          boardId: expect.any(Number),
          ...dto,
          userId: userId,
          regdate: expect.any(Date),
          updatedate: expect.any(Date),
          views: 0,
        });

      expect(mockBoardService.postBoard).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('postSaveImage Test', () => {
    const file: Express.Multer.File = {
      originalname: 'file.csv',
      mimetype: 'text/csv',
      path: 'something',
      buffer: Buffer.from('one,two,three'),
      fieldname: '',
      encoding: '',
      size: 0,
      stream: new Readable,
      destination: '',
      filename: ''
    };

    it('업로드 한 이미지의 URI를 반환하는가?', async () => {
      const result = await controller.postSaveImage(file);
      expect(result).toEqual({ imageUrl: 'url' });
      expect(mockBoardService.imageUpload).toHaveBeenCalledTimes(1);
    });
  });

  describe('patchBoard Test', () => {
    const boardId = 1;
    const dto = { content: 'changed_content' };

    it('변경된 Board를 반환하는가?', () => {
      expect(controller.patchBoard(req, boardId, dto))
        .resolves.toEqual({
          ...mockBoards[boardId-1],
          ...dto,
          updatedate: expect.any(Date),
        });

      expect(mockBoardService.patchBoard).toHaveBeenCalledWith(dto, boardId, req.user.userId);
    });
  });

  describe('deleteBoard Test', () => {
    const boardId = 1;

    it('Board를 삭제하는가?', async () => {
      await controller.deleteBoard(req, boardId);
      expect(mockBoardService.deleteBoard).toHaveBeenCalledWith(boardId, req.user.userId);
    });
  });
});
