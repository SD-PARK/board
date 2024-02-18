import { ApiProperty } from "@nestjs/swagger";

export class TokenDto {
    @ApiProperty({ description: '유저 ID', example: '1' })
    userId: number;
    
    @ApiProperty({ description: 'Refresh Token' })
    token: string;
    
    @ApiProperty({ description: '토큰 만료 기한', example: '2024-01-01 00:00:00' })
    expireIn?: Date;
}