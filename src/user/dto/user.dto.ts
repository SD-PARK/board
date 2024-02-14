import { OmitType, PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @Length(1, 255)
    email: string;

    @IsString()
    @Length(1, 255)
    password: string;

    @IsString()
    @Length(1, 255)
    name: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'])) {}