import { Test, TestingModule } from '@nestjs/testing';
import { ReplyController } from '../reply/reply.controller';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReplyService } from './reply.service';

describe('ReplyController', () => {
  let controller: ReplyController;

  const mockReplies = [
    { replyId: 1, boardId: 1, userId: 1, content: 'reply_1', regdate: new Date(), updatedate: new Date() },
    { replyId: 2, boardId: 1, userId: 2, parentId: 1, content: 'reply_1_1', regdate: new Date(), updatedate: new Date() },
    { replyId: 3, boardId: 1, userId: 1, parentId: 2, content: 'reply_1_2', regdate: new Date(), updatedate: new Date() },
    { replyId: 4, boardId: 2, userId: 1, content: 'reply_2', regdate: new Date(), updatedate: new Date() },
    { replyId: 5, boardId: 2, userId: 1, content: 'reply_delete', regdate: new Date(), updatedate: new Date(), deletedate: new Date() },
  ]

  const mockReplyService = {
    getBoardReply: jest.fn(() => {
      return Promise.resolve(mockReplies);
    }),
    postReply: jest.fn((dto, userId) => {
      return Promise.resolve({
        replyId: 1,
        ...dto,
        userId: userId,
        regdate: new Date(),
        updatedate: new Date(),
      });
    }),
    patchReply: jest.fn().mockImplementation((dto, replyId, userId) => {
      const reply = mockReplies.find(reply => reply.replyId === replyId);
      
      if (reply.userId !== userId)
        throw new ForbiddenException('권한이 없습니다.');

      return Promise.resolve({ ...reply, ...dto, updatedate: new Date() });
    }),
    deleteReply: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplyController],
      providers: [ReplyService],
    })
      .overrideProvider(ReplyService)
      .useValue(mockReplyService)
      .compile();

    controller = module.get<ReplyController>(ReplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserAll Test', () => {
    const boardId = 1;

    it('댓글 목록을 읽어와 반환하는가?', () => {
      expect(controller.getBoardReply(boardId))
        .resolves.toEqual(mockReplies);

      expect(mockReplyService.getBoardReply).toHaveBeenCalled();
    });
  });

  describe('postSignUp Test', () => {
    const dto = {
      boardId: 1,
      content: 'Test Reply',
    };
    const userId = 1;
    const req = { user: { userId: userId }};

    it('새 댓글를 생성하고 반환하는가?', () => {
      expect(controller.postReply(req, dto))
        .resolves.toEqual({
          userId: userId,
          replyId: expect.any(Number),
          ...dto,
          regdate: expect.any(Date),
          updatedate: expect.any(Date),
        });

      expect(mockReplyService.postReply).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('patchUser Test', () => {
    const replyId = 1;
    const req = { user: { userId: 1 }};
    const failedReq = { user: { userId: 2 }};
    const dto = { content: 'name' };

    it('유저 정보가 변경되는가?', () => {
      expect(controller.patchReply(req, replyId, dto))
        .resolves.toEqual({
          ...mockReplies[replyId-1],
          ...dto,
          updatedate: expect.any(Date),
        });

      expect(mockReplyService.patchReply).toHaveBeenCalledWith(dto, replyId, req.user.userId);
    });
    
    it('유저 ID의 유효성을 검사하는가?', () => {
      expect(controller.patchReply(failedReq, replyId, dto))
        .rejects.toThrow(new ForbiddenException('권한이 없습니다.'));
    });
  })

  describe('deleteReply Test', () => {
    const replyId = 1;
    const req = { user: { userId: 1 }};

    it('유저 정보를 삭제하는가?', async () => {
      await controller.deleteReply(req, replyId);
      expect(mockReplyService.deleteReply).toHaveBeenCalledWith(replyId, req.user.userId);
    });
  })
});
