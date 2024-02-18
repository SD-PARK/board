import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('v1/users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiOperation({ summary: '유저 조회 API', description: '유저를 조회한다.' })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 200, description: '조회된 유저', type: Array<User> })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @UseGuards(JwtAuthGuard)
    async getUserAll(): Promise<User[]> {
        return this.userService.getUserAll();
    }
    
    @Post()
    @ApiOperation({ summary: '유저 생성 API', description: '유저를 생성한다.' })
    @ApiBearerAuth('access-token')
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: '생성된 유저', type: User })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 409, description: '이미 존재하는 계정' })
    async postSignUp(@Body() userDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(userDto);
    }

    @Patch()
    @ApiOperation({ summary: '유저 정보 수정 API', description: '유저 정보를 수정한다.' })
    @ApiBearerAuth('access-token')
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: '수정된 유저 정보', type: User })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '유저 ID가 유효하지 않음' })
    @UseGuards(JwtAuthGuard)
    async patchUser(@Req() req, @Body() userDto: UpdateUserDto): Promise<User> {
        return this.userService.patchUser(req.user.userId, userDto);
    }

    @Delete()
    @ApiOperation({ summary: '유저 삭제 API', description: '유저를 삭제한다.' })
    @ApiBearerAuth('access-token')
    @ApiParam({ name: 'id', description: '유저 ID', example: '1', required: true })
    @ApiResponse({ status: 200, description: '삭제 완료' })
    @ApiResponse({ status: 401, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '유저 ID가 유효하지 않음' })
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Req() req): Promise<void> {
        return this.userService.deleteUser(req.user.userId);
    }
}
