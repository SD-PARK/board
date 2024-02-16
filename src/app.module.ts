import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from './config/typeorm-module.config';
import { ConfigModule } from '@nestjs/config';
import { configModuleConfig } from './config/config-module.config';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { ReplyModule } from './reply/reply.module';
import { CategoryModule } from './category/category.module';
import { AwsModule } from './aws/aws.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleConfig),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    UserModule, AuthModule, BoardModule, ReplyModule, CategoryModule, AwsModule, UtilsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
