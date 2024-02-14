import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from './config/typeorm-module.config';
import { ConfigModule } from '@nestjs/config';
import { configModuleConfig } from './config/config-module.config';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleConfig),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    UserModule, AuthModule, BoardModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
