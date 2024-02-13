import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoginResult } from './dto/login-result';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async postLogin(@Req() req, @Body() loginDto: LoginDto): Promise<LoginResult> {
        return this.authService.loginUser(req.user);
    }
}
