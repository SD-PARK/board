import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUserAll(): Promise<User[]> {
        return this.userService.getUserAll();
    }
    
    @Post()
    async postSignUp(@Body() userDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(userDto);
    }
}
