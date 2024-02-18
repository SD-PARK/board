import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoginResult } from './dto/login-result';
import { LoginDto } from './dto/login.dto';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('로그인 API')
@Controller('v1/auths')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: '로그인 API', description: '로그인 후 Access Token과 Refresh Token을 발급한다.' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 201, description: 'AccessToken과 Refresh 토큰을 반환한다.', type: LoginResult })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 403, description: '이메일 또는 비밀번호가 유효하지 않음' })
    @UseGuards(LocalAuthGuard)
    async postLogin(@Req() req, @Body() loginDto: LoginDto): Promise<LoginResult> {
        return await this.authService.loginUser(req.user);
    }

    @Post('refresh')
    @ApiOperation({ summary: '토큰 재발급 API', description: 'Access Token을 재발급한다.' })
    @ApiCookieAuth('access_token')
    @ApiResponse({ status: 201, description: 'AccessToken을 반환한다.', type: LoginResult })
    @ApiResponse({ status: 401, description: '토큰이 유효하지 않음' })
    @UseGuards(RefreshAuthGuard)
    postRefreshToken(@Req() req): LoginResult {
        return this.authService.refreshToken(req.user);
    }
}
