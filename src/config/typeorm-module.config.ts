import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { Token } from "src/auth/entity/token.entity";
import { Board, ViewBoardList } from "src/board/entity/board.entity";
import { Category } from "src/category/entity/category.entity";
import { Reply, ViewReply } from "src/reply/entity/reply.entity";
import { User } from "src/user/entity/user.entity";

export const typeOrmModuleConfig: TypeOrmModuleAsyncOptions = {
    useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Token, Category, Board, ViewBoardList, ViewReply, Reply],
    }),
    inject: [ConfigService],
}