import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { passportModuleConfig } from 'src/config/passport-module.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleConfig } from 'src/config/jwt-module.config';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { RefreshStrategy } from './strategy/refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    PassportModule.register(passportModuleConfig),
    JwtModule.registerAsync(jwtModuleConfig),
    UserModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
