import { PartialType } from "@nestjs/mapped-types";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateReplyDto {
    @IsNumber()
    boardId: number;

    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsString()
    @Length(1, 2000)
    content: string;
}

export class UpdateReplyDto extends PartialType(CreateReplyDto) {}