import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { User } from "src/user/entity/user.entity";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET_KEY'),
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                return req?.cookies?.refreshToken
            }]),
            passReqToCallback: true,
            algorithms: ['HS256'],
        });
    }

    async validate(req: Request, payload: any) {
        const refreshToken: string = req?.cookies['refreshToken'];
        const user: User = await this.authService.matchesRefreshToken(refreshToken, payload.userId);

        if (!user)
            throw new UnauthorizedException();

        return user;
      }
}