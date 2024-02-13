import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getUserAll(): Promise<User[]> {
        return this.userService.getUserAll();
    }
    
    @Post()
    async postSignUp(@Body() userDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(userDto);
    }
}
