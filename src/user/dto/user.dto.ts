import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ description: '이메일', example: 'test@test.com' })
    @IsEmail()
    @Length(1, 255)
    email: string;

    @ApiProperty({ description: '비밀번호', example: 'test123!' })
    @IsString()
    @Length(1, 255)
    password: string;

    @ApiProperty({ description: '닉네임', example: '닉네임' })
    @IsString()
    @Length(1, 255)
    name: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'])) {}