import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockTokens = [
    { userId: 1, token: 'token_1', expireIn: new Date('2030-01-30') },
    { userId: 2, token: 'token_2', expireIn: new Date('2030-01-30') },
    { userId: 3, token: 'token_3', expireIn: new Date('2030-01-30') },
  ];
  const mockUsers = [
    { userId: 1, email: 'test1@test.com', password: 'test', name: 'test1', regdate: new Date() },
    { userId: 2, email: 'test2@test.com', password: 'test', name: 'test2', regdate: new Date() },
    { userId: 3, email: 'test3@test.com', password: 'test', name: 'test3', regdate: new Date() },
  ];

  const mockTokenRepository = {
    findOne: jest.fn().mockImplementation(option => {
      const token = mockTokens.find(token => token.userId === option?.where?.userId);
      return token;
    }),
    save: jest.fn(),
  };
  const mockUserService = {
    getUserId: jest.fn().mockImplementation(id => {
      const user = mockUsers.find(user => user.userId === id);

      if (!user)
        new NotFoundException(`[ID: '${id}']에 일치하는 계정을 찾을 수 없습니다.`);

      return user;
    }),
    getUserEmailForce: jest.fn().mockImplementation(email => {
      const user = mockUsers.find(user => user.email === email);
      return user;
    }),
    omitPassword: jest.fn().mockImplementation((user: User) => {
      const { password, ...result } = user;
      return result;
    }),
  };
  const mockJwtService = {
    decode: jest.fn(() => {
      return { sub: 'sub', iat: new Date(), exp: new Date() };
    }),
    sign: jest.fn(() => 'token'),
  };
  const mockConfigService = {
    get: jest.fn((str) => '5m'),
  };

  jest.spyOn(bcrypt, 'compare').mockImplementation((pw1, pw2) => Promise.resolve(pw1 === pw2));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, UserService, JwtService, ConfigService,
        {
          provide: getRepositoryToken(Token),
          useValue: mockTokenRepository,
        },
      ],
    })
    .overrideProvider(UserService)
    .useValue(mockUserService)
    .overrideProvider(JwtService)
    .useValue(mockJwtService)
    .overrideProvider(ConfigService)
    .useValue(mockConfigService)
    .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser Test', () => {
    const testUserIndex = 0;
    const email = mockUsers[testUserIndex].email;
    const { password, ...compare } = mockUsers[testUserIndex];
    
    it('User 레코드를 받아오는가?', async () => {
      expect(await service.validateUser(email, password)).toEqual(compare);
      expect(mockUserService.getUserEmailForce).toHaveBeenCalledWith(email);
    });

    it('Email, Password의 오류를 검증하는가?', () => {
      expect(service.validateUser('', password)).rejects.toThrow(new ForbiddenException('인증 실패: 등록되지 않은 사용자입니다.'));
      expect(service.validateUser(email, '')).rejects.toThrow(new ForbiddenException('인증 실패: 비밀번호가 일치하지 않습니다.'));
    });

    it('Password 속성을 제외한 결과를 반환하는가?', async () => {
      expect(await service.validateUser(email, password)).toEqual(compare);
      expect(mockUserService.omitPassword).toHaveBeenCalled();
    });
  });

  describe('loginUser Test', () => {
    const testUserIndex = 1;
    const user = mockUsers[testUserIndex] as User;

    it('Token을 발급하는가?', async () => {
      jest.spyOn(service, 'createAccessToken');
      jest.spyOn(service, 'createRefreshToken');

      expect(await service.loginUser(user)).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });

      expect(service.createAccessToken).toHaveBeenCalledWith(user);
      expect(service.createRefreshToken).toHaveBeenCalledWith(user.userId);
      expect(mockJwtService.decode).toHaveBeenCalled();
    });

    it('Refresh Token을 등록하는가?', () => {
      jest.spyOn(service, 'setRefreshToken');

      expect(service.loginUser(user))
        .resolves.toEqual({
          access_token: expect.any(String),
          refresh_token: expect.any(String),
        });

      expect(service.setRefreshToken).toHaveBeenCalledWith({
        userId: user.userId,
        token: expect.any(String),
        expireIn: expect.any(Date),
      });
    });
  });

  describe('refreshToken Test', () => {
    const testUserIndex = 1;
    const user = mockUsers[testUserIndex] as User;

    it('새 Access Token을 발급하는가?', () => {
      jest.spyOn(service, 'createAccessToken');

      expect(service.refreshToken(user)).toEqual({ access_token: expect.any(String) });
      expect(service.createAccessToken).toHaveBeenCalledWith(user);
    });
  });

  describe('createAccessToken Test', () => {
    const testUserIndex = 1;
    const user = mockUsers[testUserIndex] as User;

    it('Token을 발급하는가?', () => {
      expect(typeof service.createAccessToken(user)).toBe('string');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: user.userId,
        email: user.email,
        name: user.name,
      }, {
        expiresIn: expect.any(String),
      });
    });
  });

  describe('createRefreshToken Test', () => {
    const testUserIndex = 1;
    const user = mockUsers[testUserIndex] as User;

    it('Token을 발급하는가?', () => {
      expect(typeof service.createRefreshToken(user.userId)).toBe('string');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: user.userId,
      }, {
        expiresIn: expect.any(String),
      });
    });
  });

  describe('setRefreshToken Test', () => {
    const dto = { userId: 1, token: 'token_1', expireIn: new Date() };

    it('Token을 DB에 저장하는가?', async () => {
      await service.setRefreshToken(dto);
      expect(mockTokenRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('matchesRefreshToken Test', () => {
    const userId = 1;
    const token = mockTokens[userId - 1];
    const { password, ...user } = mockUsers[userId - 1];

    it('Password 속성을 제외한 User 레코드를 반환하는가?', async () => {
      expect(await service.matchesRefreshToken(token.token, userId)).toEqual(user);
      expect(mockUserService.getUserId).toHaveBeenCalledWith(userId);
      expect(mockUserService.omitPassword).toHaveBeenCalled();
    });

    it('Token의 유효성 검사를 진행하는가?', () => {
      expect(service.matchesRefreshToken(token.token, -1))
        .rejects.toThrow(new UnauthorizedException());
      expect(service.matchesRefreshToken('', userId))
        .rejects.toThrow(new UnauthorizedException());
    });
  });
});
