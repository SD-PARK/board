import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, IsString, Length, MinLength } from "class-validator";

export class CreateBoardDto {
    @ApiProperty({ description: '카테고리 ID', example: '1' })
    @IsNumber()
    categoryId: number;

    @ApiProperty({ description: '글 제목', example: 'title' })
    @IsString()
    @Length(1, 255)
    title: string;

    @ApiProperty({ description: '글 본문', example: 'content' })
    @IsString()
    @MinLength(1)
    content: string;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

export class BoardFilterDto {
    @ApiProperty({ description: '검색 기준', example: 'all || title || writer' })
    target?: string;
    
    @ApiProperty({ description: '검색 키워드', example: 'keyword' })
    keyword?: string;
    
    @ApiProperty({ description: '카테고리', example: '공지사항' })
    category?: string;
    
    @ApiProperty({ description: '정렬 기준', example: 'view || view7d || view30d || view365d' })
    sort?: string;
    
    @ApiProperty({ description: '페이지', example: '1' })
    page?: number;
}