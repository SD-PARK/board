import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginResult } from './dto/login-result';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}
    private readonly logger: Logger = new Logger(AuthService.name);

    async validateUser(email: string, password: string): Promise<User> {
        const user: User = await this.userService.getUserEmailForce(email);
        try {
            if (!user)
                throw new ForbiddenException('인증 실패: 등록되지 않은 사용자입니다.');
            else if (!(await bcrypt.compare(password, user.password)))
                throw new ForbiddenException('인증 실패: 비밀번호가 일치하지 않습니다.');
            else
                return this.userService.omitPassword(user);
        } catch (err) {
            if (err.status == 403)
                throw err;
            else
                this.logger.error(err);
        }
    }

    async loginUser(user: User): Promise<LoginResult> {
        return {
            access_token: this.jwtService.sign({
                userId: user.userId,
                email: user.email,
            }),
            user: user,
        };
    }
}
