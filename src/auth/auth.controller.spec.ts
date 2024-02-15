import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    loginUser: jest.fn(req => {
      return { access_token: 'access_token', refresh_token: 'refresh_token' };
    }),
    refreshToken: jest.fn(req => {
      return { access_token: 'new_access_token' };
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
    .overrideProvider(AuthService)
    .useValue(mockAuthService)
    .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  describe('postLogin Test', () => {
    const req = {
      user: {
        email: 'test1@test.com',
        password: 'test1',
      },
    };

    it('로그인 후 Token을 발급하는가?', async () => {
      expect(await controller.postLogin(req, req.user)).toEqual({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
      expect(mockAuthService.loginUser).toHaveBeenCalledWith(req.user);
    });
  });

  describe('postRefreshToken Test', () => {
    const req = {
      user: {
        email: 'test1@test.com',
        password: 'test1',
      },
    };

    it('새 Access Token을 발급하는가?', () => {
      expect(controller.postRefreshToken(req)).toEqual({
        access_token: expect.any(String),
      });
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(req.user);
    })
  });
});
