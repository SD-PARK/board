import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImageUploadDto {
  @ApiProperty({ type: 'string', description: '이미지 파일', format: 'binary' })
  @IsNotEmpty()
  file: any;
}

export class ImageResponseDto {
  @ApiProperty({ description: '이미지 URL', example: 'https://s3.apnortheast-2.amazonaws.com/src/image.png' })
  @IsString()
  imageUrl: string;
}