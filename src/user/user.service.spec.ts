import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  const mockUsers = [
    { userId: 1, email: 'test1@test.com', password: 'test', name: 'test1', regdate: new Date() },
    { userId: 2, email: 'test2@test.com', password: 'test', name: 'test2', regdate: new Date() },
    { userId: 3, email: 'test3@test.com', password: 'test', name: 'test3', regdate: new Date() },
  ];

  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(option => {
      if (option.where?.userId)
        return Promise.resolve(mockUsers.find(user => user.userId === option.where.userId));
      else if (option.where?.email)
        return Promise.resolve(mockUsers.find(user => user.email === option.where.email));
      else
        return Promise.resolve();
    }),
    find: jest.fn().mockImplementation(() => mockUsers),
    save: jest.fn().mockImplementation(user => Promise.resolve({
      userId: 1,
      ...user,
      regdate: new Date(),
    })),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserId Test', () => {
    const id = 1;
    const failedId = -1;

    it('User 레코드를 반환하는가?', async () => {
      const { password, ...compare } = mockUsers[id-1];
      expect(service.getUserId(id))
        .resolves.toEqual(compare);
    });

    it('User 레코드의 유효성을 검사하는가?', async () => {
      expect(service.getUserId(failedId))
        .rejects.toThrow(new NotFoundException(`[ID: '${failedId}']에 일치하는 계정을 찾을 수 없습니다.`));
    });
  });

  describe('getUserEmail Test', () => {
    const id = 1;
    const email = mockUsers[id].email;
    const failedEmail = '~!@#$%^&*()_+';

    it('User 레코드를 반환하는가?', async () => {
      const { password, ...compare } = mockUsers[id];
      expect(service.getUserEmail(email))
        .resolves.toEqual(compare);
    });

    it('User 레코드의 유효성을 검사하는가?', async () => {
      expect(service.getUserEmail(failedEmail))
        .rejects.toThrow(new NotFoundException(`[Email: '${failedEmail}']에 일치하는 계정을 찾을 수 없습니다.`));
    });
  });

  describe('getUserAll Test', () => {
    it('User 레코드를 반환하는가?', async () => {
      const compare = mockUsers.map(user => {
        const { password, ...result } = user;
        return result;
      });

      expect(service.getUserAll())
        .resolves.toEqual(compare);
    });
  });

  describe('getUserEmailForce Test', () => {
    const id = 1;
    const email = mockUsers[id].email;
    const failedEmail = '~!@#$%^&*()_+';

    it('password를 포함한 User 레코드를 반환하는가?', async () => {
      const getUserEmailForce = service.getUserEmailForce(email);
      expect(getUserEmailForce)
        .resolves.toEqual(mockUsers[id]);
      expect(getUserEmailForce)
        .resolves.toHaveProperty('password');
    });

    it('유효하지 않은 Email이 입력되어도 동작하는가?', async () => {
      expect(service.getUserEmailForce(failedEmail))
        .resolves.toBeUndefined();
    });
  });

  describe('createUser Test', () => {
    const dto = {
      email: 'email',
      password: 'password',
      name: 'name',
    }

    it('생성된 User 레코드를 반환하는가?', () => {
      const { password, ...compare } = {
        userId: expect.any(Number),
        ...dto,
        regdate: expect.any(Date),
      };

      expect(service.createUser(dto))
        .resolves.toEqual(compare);
    });
    
    it('입력한 Password와 저장된 Password가 다른가? (암호화되는가?)', () => {
      expect(mockUserRepository.save).not.toHaveBeenCalledWith(dto);
    });

    it('Email의 유효성을 검사하는가?', () => {
      const failedEmail = mockUsers[0].email;

      expect(service.createUser({ ...dto, email: failedEmail }))
        .rejects.toThrow(new ConflictException('이미 존재하는 계정입니다'));
    });
  });

  describe('patchUser Test', () => {
    const id = 1;
    const dto = {
      name: 'Patch Name',
    };

    it('변경된 User 레코드를 반환하는가?', () => {
      const { password, ...compare } = {
        ...mockUsers[id-1],
        ...dto,
      };

      expect(service.patchUser(id, dto))
        .resolves.toEqual({ ...compare, regdate: expect.any(Date) });
    });

    it('User 레코드를 검색하는가?', () => {
      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });
    
    it('입력한 Password와 저장된 Password가 다른가? (암호화되는가?)', () => {
      expect(mockUserRepository.save).not.toHaveBeenCalledWith({
        ...mockUsers[id-1],
        ...dto,
      });
    });
  });

  describe('omitPassword Test', () => {
    it ('Password를 제외한 객체를 반환하는가?', () => {
      const id = 1;
      expect(service.omitPassword(mockUsers[id] as User))
        .not.toHaveProperty('password');
    })
  });
});