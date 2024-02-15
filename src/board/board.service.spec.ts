import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { CategoryService } from 'src/category/category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board, ViewBoardList } from './entity/board.entity';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BoardService', () => {
  let service: BoardService;

  const mockBoards = [
    { boardId: 1, categoryId: 1, userId: 1, title: 'title_1', content: 'content_1', regdate: new Date(), updatedate: new Date(), views: 100 },
    { boardId: 2, categoryId: 1, userId: 2, title: 'title_2', content: 'content_2', regdate: new Date(), updatedate: new Date(), views: 50 },
    { boardId: 3, categoryId: 1, userId: 3, title: 'title_3', content: 'content_3', regdate: new Date(), updatedate: new Date(), deletedate: new Date(), views: 30 },
    { boardId: 4, categoryId: 2, userId: 1, title: 'title_4', content: 'content_4', regdate: new Date(), updatedate: new Date(), views: 10 },
    { boardId: 5, categoryId: 2, userId: 2, title: 'title_5', content: 'content_5', regdate: new Date(), updatedate: new Date(), deletedate: new Date(), views: 10 },
  ];
  const mockBoardLists = [
    { id: 1, category: '공지사항', writer: 'user_1', title: 'title_1', regdate: new Date(), views: 100 },
    { id: 2, category: '공지사항', writer: 'user_2', title: 'title_2', regdate: new Date(), views: 50 },
    { id: 3, category: '공지사항', writer: 'user_3', title: 'title_3', regdate: new Date(), views: 30 },
    { id: 4, category: 'Q&A', writer: 'user_1', title: 'title_4', regdate: new Date(), views: 10 },
    { id: 5, category: 'Q&A', writer: 'user_2', title: 'title_5', regdate: new Date(), views: 10 },
  ];

  const mockBoardRepository = {
    findOne: jest.fn().mockImplementation(option => {
      if (option?.where?.boardId)
        return Promise.resolve(mockBoards.find(board => board.boardId === option.where.boardId));
      else
        return Promise.resolve();
    }),
    find: jest.fn().mockImplementation(() => mockBoards),
    save: jest.fn().mockImplementation(board => {
      if (board?.boardId) {
        const foundElement = mockBoards.find(element => element.boardId === board.boardId);
        return { ...foundElement, ...board };
      } else {
        return Promise.resolve({
          boardId: 1,
          views: 0,
          ...board,
          regdate: new Date(),
          updatedate: new Date(),
        });
      }
    }),
    softDelete: jest.fn(),
  };
  const mockViewBoardListRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue(mockBoardLists),
    }),
  };
  const mockCategoryService = {
    validateCategory: jest.fn().mockImplementation(id => (id > 0)),
  };
  const mockConfigService = {
    get: jest.fn((str) => {
      if (str == 'BOARD_TARGET_KEY')
        return ['title', 'writer'];
      else if (str == 'BOARD_PAGE_SIZE')
        return 10;
      else
        return str;
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService, CategoryService, ConfigService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
        {
          provide: getRepositoryToken(ViewBoardList),
          useValue: mockViewBoardListRepository,
        }
      ],
    })
      .overrideProvider(CategoryService)
      .useValue(mockCategoryService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBoardList Test', () => {
    const dto = {
      target: 'all',
      keyword: 'user',
      category: '공지사항',
      sort: 'view7d',
      page: 1,
    }

    it('ViewBoardList가 반환되는가?', async () => {
      expect(await service.getBoardList(dto)).toBeInstanceOf(Array<ViewBoardList>);
      expect(mockViewBoardListRepository.createQueryBuilder().andWhere).toHaveBeenCalledTimes(3);
      expect(mockViewBoardListRepository.createQueryBuilder().orderBy).toHaveBeenCalledTimes(1);
      expect(mockViewBoardListRepository.createQueryBuilder().addOrderBy).toHaveBeenCalledTimes(1);
      expect(mockViewBoardListRepository.createQueryBuilder().skip).toHaveBeenCalledTimes(1);
      expect(mockViewBoardListRepository.createQueryBuilder().take).toHaveBeenCalledTimes(1);
      expect(mockViewBoardListRepository.createQueryBuilder().getMany).toHaveBeenCalledTimes(1);
    });
    
    it('Keyword 검색이 진행되는가?', async () => {
      expect(mockViewBoardListRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(expect.any(String), { keyword: `%${dto.keyword}%` });
    });
    
    it('Category 검색이 진행되는가?', async () => {
      expect(mockViewBoardListRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(expect.any(String), { category: dto.category });
    });
    
    it('정렬이 진행되는가?', async () => {
      expect(mockViewBoardListRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(expect.any(String), { daysAgo: expect.any(Date) });
      expect(mockViewBoardListRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith(expect.any(String), expect.any(String));
      expect(mockViewBoardListRepository.createQueryBuilder().addOrderBy).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });
    
    it('페이지 나누기가 진행되는가?', async () => {
      expect(mockViewBoardListRepository.createQueryBuilder().skip).toHaveBeenCalledWith(expect.any(Number));
      expect(mockViewBoardListRepository.createQueryBuilder().take).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('getBoard Test', () => {
    const boardId = 1;

    it('Board 레코드를 반환하는가?', async () => {
      expect(await service.getBoard(boardId)).toEqual(mockBoards[boardId-1]);
    });

    it('Board ID의 유효성을 검사하는가?', () => {
      expect(service.getBoard(-1)).rejects.toThrow(new NotFoundException('존재하지 않는 게시글입니다'));
      expect(service.getBoard(3)).rejects.toThrow(new NotFoundException('존재하지 않는 게시글입니다'));
    });
  });

  describe('boardViewIncrement Test', () => {
    const boardId = 1;
    const viewsIncrementBoard = {
      ...mockBoards[boardId-1],
      views: mockBoards[boardId-1].views + 1,
    }

    it ('Board의 조회수가 증가하는가?', () => {
      expect(mockBoardRepository.save).toHaveBeenCalledWith(viewsIncrementBoard)
    });
  });

  describe('postBoard Test', () => {
    const dto = {
      categoryId: 1,
      title: 'testTitle',
      content: 'testContent',
    };
    const failedDto = {
      ...dto,
      categoryId: -1,
    };
    const userId = 1;

    it('Board를 생성하고 반환하는가?', async () => {
      expect(await service.postBoard(dto, userId))
        .toEqual({
          boardId: expect.any(Number),
          ...dto,
          userId: userId,
          regdate: expect.any(Date),
          updatedate: expect.any(Date),
          views: 0,
        });
      expect(mockBoardRepository.save).toHaveBeenCalledWith({
        ...dto,
        userId: userId,
      });
    });

    it('Category ID의 유효성을 검사하는가?', () => {
      expect(service.postBoard(failedDto, userId)).rejects.toThrow(new BadRequestException('카테고리 ID가 유효하지 않습니다'));
    });
  });

  describe('patchBoard Test', () => {
    const dto = {
      content: 'Changed Content',
    };
    const failedDto = {
      ...dto,
      categoryId: -1,
    };
    const boardId = 1;
    const userId = 1;

    it('Board 레코드를 변경하고 반환하는가?', async () => {
      const compare = {
        ...mockBoards[boardId-1],
        ...dto,
        updatedate: expect.any(Date),
      }

      expect(await service.patchBoard(dto, boardId, userId)).toEqual(compare);
      expect(mockBoardRepository.save).toHaveBeenCalledWith({
        ...mockBoards[boardId-1],
        ...dto,
      });
    });

    it('Category ID의 유효성을 검사하는가?', () => {
      expect(service.patchBoard(failedDto, boardId, userId)).rejects.toThrow(new BadRequestException('카테고리 ID가 유효하지 않습니다'));
    });
  });

  describe('deleteBoard Test', () => {
    const BoardId = 1;
    const userId = 1;

    it('Board 레코드에 대해 softDelete를 실행하는가?', async () => {
      await service.deleteBoard(BoardId, userId);
      expect(mockBoardRepository.softDelete).toHaveBeenCalledWith(BoardId);
    });
  });

  describe('verifyUserOwnership Test', () => {
    const boardId = 1;
    const userId = mockBoards[boardId-1].userId;

    it('Board 레코드를 읽어오는가?', async () => {
      expect(await service.verifyUserOwnership(boardId, userId)).toEqual(mockBoards[boardId-1]);
      expect(mockBoardRepository.findOne).toHaveBeenCalledWith({ where: { boardId: boardId }});
    });

    it('User의 권한을 검사하는가?', () => {
      expect(service.verifyUserOwnership(boardId, -1))
        .rejects.toThrow(new ForbiddenException('권한이 없습니다'));
    });
  });

  describe('validateBoard Test', () => {
    const boardId = 1;

    it('올바른 값을 반환하는가?', async () => {
      expect(await service.validateBoard(boardId)).toEqual(true);
      expect(await service.validateBoard(-1)).toEqual(false);
    });

    it('Board 레코드를 읽어오는가?', () => {
      expect(mockBoardRepository.findOne).toHaveBeenCalledWith({ where: { boardId: boardId }});
    });
  });
});
