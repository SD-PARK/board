import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}
    private readonly logger: Logger = new Logger(AuthService.name);

    async validateUser(email: string, password: string): Promise<User> {
        const user: User = await this.userService.getUserEmailForce(email);
        try {
            if (!email)
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
}
