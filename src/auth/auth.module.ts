import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { passportModuleConfig } from 'src/config/passport-module.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleConfig } from 'src/config/jwt-module.config';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register(passportModuleConfig),
    JwtModule.registerAsync(jwtModuleConfig),
    UserModule],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
