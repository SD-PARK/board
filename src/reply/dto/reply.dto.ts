import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateReplyDto {
    @ApiProperty({ description: '게시글 ID', example: '1' })
    @IsNumber()
    boardId: number;

    @ApiProperty({ description: '부모 댓글 ID', example: '1' })
    @IsNumber()
    @IsOptional()
    parentId?: number;

    @ApiProperty({ description: '댓글 내용', example: '내용' })
    @IsString()
    @Length(1, 2000)
    content: string;
}

export class UpdateReplyDto extends PartialType(CreateReplyDto) {}