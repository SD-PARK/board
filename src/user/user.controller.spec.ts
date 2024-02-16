import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user/user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const mockUsers = [
    { userId: 1, email: 'test@test.com', password: 'test', name: 'test', regdate: new Date() },
    { userId: 2, email: 'test@test.com', password: 'test', name: 'test', regdate: new Date() },
    { userId: 3, email: 'test@test.com', password: 'test', name: 'test', regdate: new Date() },
  ];
  
  const mockUserService = {
    getUserAll: jest.fn(() => {
      return Promise.resolve(mockUsers.map(user => {
        const { password, ...result } = user;
        return result;
      }));
    }),

    createUser: jest.fn(dto => {
      const { password, ...result } = dto;
      return Promise.resolve({
        ...result,
        userId: 1,
        regdate: new Date(),
      });
    }),

    patchUser: jest.fn().mockImplementation((id, dto) => {
      if (!mockUsers.some(user => user.userId === id))
        throw new NotFoundException();
      else {
        const user = { ...mockUsers[id-1], ...dto };
        const { password, ...result } = user;
        return Promise.resolve(result);
      }
    }),

    deleteUser: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserAll Test', () => {
    it('User 목록을 읽어와 반환하는가?', () => {
      expect(controller.getUserAll())
        .resolves.toEqual(
          mockUsers.map(user => {
            const { password, ...result } = user;
            return result;
        }));

      expect(mockUserService.getUserAll).toHaveBeenCalled();
    });
  });

  describe('postSignUp Test', () => {
    it('새 User를 생성하고 반환하는가?', () => {
      const dto = {
        email: 'test@test.com',
        password: 'test',
        name: 'testman',
      };

      expect(controller.postSignUp(dto))
        .resolves.toEqual({
          email: dto.email,
          name: dto.name,
          userId: expect.any(Number),
          regdate: expect.any(Date),
        });

      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('patchUser Test', () => {
    const req = { user: { userId: 2 }};
    const failedReq = { user: { userId: -1 }};
    const dto = {
      name: 'name',
    }

    it('User 정보가 변경되는가?', () => {
      expect(controller.patchUser(req, dto))
        .resolves.toEqual({
          userId: req.user.userId,
          email: expect.any(String),
          name: expect.any(String),
          regdate: expect.any(Date),
          ...dto,
        });
      
      expect(mockUserService.patchUser).toHaveBeenCalledWith(req.user.userId, dto);
    });
    
    it('User ID의 유효성을 검사하는가?', () => {
      expect(controller.patchUser(failedReq, dto))
        .rejects.toThrow(new NotFoundException());
    });
  })

  describe('deleteUser Test', () => {
    const req = { user: { userId: 1 }};
    it('User 레코드 삭제가 진행되는가?', async () => {
      await controller.deleteUser(req);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(req.user.userId);
    });
  });
});
