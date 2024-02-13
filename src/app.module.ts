import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from './config/typeorm-module.config';
import { ConfigModule } from '@nestjs/config';
import { configModuleConfig } from './config/config-module.config';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleConfig),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
