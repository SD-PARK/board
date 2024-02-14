import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { Token } from "src/auth/entity/token.entity";
import { Board, ViewBoardList } from "src/board/entity/board.entity";
import { Category } from "src/board/entity/category.entity";
import { User } from "src/user/entity/user.entity";

export const typeOrmModuleConfig: TypeOrmModuleAsyncOptions = {
    useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Token, Category, Board, ViewBoardList],
    }),
    inject: [ConfigService],
}