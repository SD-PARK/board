import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsNumber, IsString, Length, MinLength } from "class-validator";

export class CreateBoardDto {
    @IsNumber()
    categoryId: number;

    @IsString()
    @Length(1, 255)
    title: string;

    @IsString()
    @MinLength(1)
    content: string;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

export class BoardFilterDto {
    target?: string; // 글 검색 기준
    keyword?: string; // 검색 키워드
    category?: string; // 카테고리
    sort?: string; // 정렬 기준
    page?: number; // 페이지
}