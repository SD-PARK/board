import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    @Length(1, 255)
    email: string;

    @IsString()
    @Length(1, 255)
    password: string;

    @IsString()
    @Length(1, 255)
    name: string;
}

export class UpdateUserDto extends PickType(CreateUserDto, ['password', 'name']) {}