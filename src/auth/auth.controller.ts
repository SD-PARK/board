import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoginResult } from './dto/login-result';
import { LoginDto } from './dto/login.dto';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async postLogin(@Req() req, @Body() loginDto: LoginDto): Promise<LoginResult> {
        return await this.authService.loginUser(req.user);
    }

    @Post('refresh')
    @UseGuards(RefreshAuthGuard)
    postRefreshToken(@Req() req): LoginResult {
        return this.authService.refreshToken(req.user);
    }
}
