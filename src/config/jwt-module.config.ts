import { ConfigService } from "@nestjs/config";
import { JwtModuleAsyncOptions } from "@nestjs/jwt";

export const jwtModuleConfig: JwtModuleAsyncOptions = {
    useFactory: (configService: ConfigService) => {
        return {
            secret: configService.get('JWT_SECRET_KEY'),
            signOptions: {
                expiresIn: configService.get('JWT_EXPIRES_IN'),
                algorithm: 'HS256',
            },
        }
    },
    inject: [ConfigService],
}