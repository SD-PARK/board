import { IsNotEmpty, IsString } from 'class-validator';

export class ImageUploadDto {
  @IsNotEmpty()
  file: any;
}

export class ImageResponseDto {
  @IsString()
  imageUrl: string;
}