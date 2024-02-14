import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginResult } from './dto/login-result';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenDto } from './dto/token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/token.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
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
        const result: LoginResult = {
            access_token: this.createAccessToken(user),
            refresh_token: this.createRefreshToken(user.userId),
        };

        const expireIn: number = this.jwtService.decode(result.refresh_token).exp;
        await this.setRefreshToken({
            userId: user.userId,
            token: result.refresh_token,
            expireIn: new Date(expireIn * 1000),
        });

        return result;
    }

    refreshToken(user: User): LoginResult {
        const result: LoginResult = { access_token: this.createAccessToken(user) };
        return result;
    }

    /** Access Token 생성 */
    createAccessToken(user: User): string {
        return this.jwtService.sign({
            email: user.email,
            name: user.name,
        }, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        });
    }

    /** Refresh Token 생성*/
    createRefreshToken(userId: number): string {
        const refreshToken: string = this.jwtService.sign({
            userId: userId,
        }, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN_REFRESH'),
        });

        return refreshToken;
    }

    /** DB에 Refresh Token 저장 */
    async setRefreshToken(tokenDto: TokenDto): Promise<void> {
        try {
            await this.tokenRepository.save(tokenDto);
        } catch (err) {
            this.logger.error(err);
        }
    }

    /** 입력받은 Token과 DB에 저장된 Token의 일치 여부 확인 */
    async matchesRefreshToken(token: string, userId: number): Promise<User>{
        const col: Token = await this.tokenRepository.findOne({ where: { userId: userId }});
        if (!col)
            throw new UnauthorizedException();
        
        const isMatches: Boolean = (token == col.token && new Date() < new Date(col.expireIn));
        if (!isMatches)
            throw new UnauthorizedException();

        const user: User = await this.userService.getUserId(userId);
        return this.userService.omitPassword(user);
    }
}
