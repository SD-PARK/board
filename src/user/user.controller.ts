import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
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

    @Patch()
    @UseGuards(JwtAuthGuard)
    async patchUser(@Req() req, @Body() userDto: UpdateUserDto): Promise<User> {
        return this.userService.patchUser(req.user.userId, userDto);
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Req() req): Promise<void> {
        return this.userService.deleteUser(req.user.userId);
    }
}
