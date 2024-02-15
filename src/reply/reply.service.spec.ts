import { Test, TestingModule } from '@nestjs/testing';
import { ReplyService } from './reply.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reply, ViewReply } from './entity/reply.entity';
import { BoardService } from 'src/board/board.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('ReplyService', () => {
  let service: ReplyService;

  const mockReplies = [
    { replyId: 1, boardId: 1, userId: 1, content: 'reply_1', regdate: new Date(), updatedate: new Date() },
    { replyId: 2, boardId: 1, userId: 2, parentId: 1, content: 'reply_1_1', regdate: new Date(), updatedate: new Date() },
    { replyId: 3, boardId: 1, userId: 1, parentId: 2, content: 'reply_1_2', regdate: new Date(), updatedate: new Date() },
    { replyId: 4, boardId: 2, userId: 1, content: 'reply_2', regdate: new Date(), updatedate: new Date() },
    { replyId: 5, boardId: 2, userId: 1, content: 'reply_delete', regdate: new Date(), updatedate: new Date(), deletedate: new Date() },
  ];
  const mockViewReplies = [
    { replyId: 1, boardId: 1, name: 'user_1', content: 'reply_1', regdate: new Date(), updatedate: new Date() },
    { replyId: 2, boardId: 1, name: 'user_2', parentId: 1, content: 'reply_1_1', regdate: new Date(), updatedate: new Date() },
    { replyId: 3, boardId: 1, name: 'user_1', parentId: 2, content: 'reply_1_2', regdate: new Date(), updatedate: new Date() },
    { replyId: 4, boardId: 2, name: 'user_1', content: 'reply_2', regdate: new Date(), updatedate: new Date() },
    { replyId: 5, boardId: 2, name: 'user_1', content: 'reply_delete', regdate: new Date(), updatedate: new Date(), deletedate: new Date() },
  ]

  const mockReplyRepository = {
    findOne: jest.fn().mockImplementation(option => {
      if (option.where?.replyId)
        return Promise.resolve(mockReplies.find(reply => reply.replyId === option.where.replyId));
      else
        return Promise.resolve();
    }),
    find: jest.fn().mockImplementation(() => mockReplies),
    save: jest.fn().mockImplementation(reply => {
      if (reply?.replyId) {
        const foundReply = mockReplies.find(element => element.replyId === reply.replyId);
        return { ...foundReply, ...reply };
      } else
          return Promise.resolve({
            replyId: 1,
            ...reply,
            regdate: new Date(),
            updatedate: new Date(),
          });
    }),
    softDelete: jest.fn(),
  };
  const mockViewReplyRepository = {
    find: jest.fn().mockImplementation((option) => {
      if (option?.where?.boardId)
        return Promise.resolve(mockViewReplies.filter(viewReply => viewReply.boardId === option.where.boardId));
      else
        return Promise.resolve();
    }),
  };
  const mockBoardService = {
    validateBoard: jest.fn(boardId => {
      if (boardId > 0)
        return Promise.resolve(true);
      else
        return Promise.resolve(false);
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReplyService, BoardService,
        {
          provide: getRepositoryToken(Reply),
          useValue: mockReplyRepository,
        },
        {
          provide: getRepositoryToken(ViewReply),
          useValue: mockViewReplyRepository,
        },
      ],
    })
      .overrideProvider(BoardService)
      .useValue(mockBoardService)
      .compile();

    service = module.get<ReplyService>(ReplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBoardReply Test', () => {
    const boardId = 1;

    it('ViewReply 레코드를 반환하는가?', async () => {
      expect(await service.getBoardReply(boardId)).toBeInstanceOf(Array<ViewReply>);
    });
  });

  describe('postReply Test', () => {
    const dto = {
      boardId: 1,
      content: 'text',
    }
    const userId = 1;

    it('Board 레코드를 생성하고 반환하는가?', async () => {
      const reply = {
        replyId: expect.any(Number),
        ...dto,
        userId: expect.any(Number),
        regdate: expect.any(Date),
        updatedate: expect.any(Date),
      };

      expect(await service.postReply(dto, userId)).toEqual(reply);
      expect(mockReplyRepository.save).toHaveBeenCalledWith({
        ...dto,
        userId: userId,
      });
    });
  });

  describe('patchReply Test', () => {
    const dto = {
      boardId: 1,
      content: 'text',
    }
    const replyId = 1;
    const userId = 1;

    it('Board 레코드를 변경하고 반환하는가?', async () => {
      const compare = {
        ...mockReplies[replyId-1],
        ...dto,
        updatedate: expect.any(Date),  
      }

      expect(await service.patchReply(dto, replyId, userId)).toEqual(compare);
      expect(mockReplyRepository.save).toHaveBeenCalledWith({
        ...mockReplies[replyId-1],
        ...dto,
      });
    });
  });

  describe('deleteReply Test', () => {
    const replyId = 1;
    const userId = 1;

    it('Reply 레코드에 대해 softDelete를 실행하는가?', async () => {
      await service.deleteReply(replyId, userId);
      expect(mockReplyRepository.softDelete).toHaveBeenCalledWith(replyId);
    });
  });

  describe('verifyUserOwnership Test', () => {
    const replyId = 1;
    const userId = mockReplies[replyId-1].userId;

    it('Reply 레코드를 읽어오는가?', async () => {
      expect(await service.verifyUserOwnership(replyId, userId)).toEqual(mockReplies[replyId-1]);
      expect(mockReplyRepository.findOne).toHaveBeenCalledWith({ where: { replyId: replyId }});
    });

    it('User의 권한을 검사하는가?', () => {
      expect(service.verifyUserOwnership(replyId, -1))
        .rejects.toThrow(new ForbiddenException('권한이 없습니다'));
    });
  });

  describe('validateReply Test', () => {
    const replyId = 1;

    it('올바른 값을 반환하는가?', async () => {
      expect(await service.validateReply(replyId)).toEqual(true);
      expect(await service.validateReply(-1)).toEqual(false);
    });

    it('Reply 레코드를 읽어오는가?', () => {
      expect(mockReplyRepository.findOne).toHaveBeenCalledWith({ where: { replyId: replyId }});
    });
  });

  describe('validateDto Test', () => {
    const dto = {
      boardId: 1,
      parentId: 1,
      content: 'test',
    };
    const failedDto = {
      ...dto,
      parentId: -1,
    }

    it('Parent ID의 유효성을 검사하는가?', () => {
      expect(service.validateDto(dto)).resolves.toBeUndefined();
      expect(service.validateDto(failedDto)).rejects.toThrow(new BadRequestException('부모 댓글의 ID가 유효하지 않습니다.'));
    });
  });
});
