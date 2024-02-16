import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
    s3Client: S3Client;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
                secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
            },
        });
    }

    async imageUploadToS3(
        fileName: string, // 파일명
        file: Express.Multer.File, // 업로드 파일
        ext: string, // 파일 확장자
    ) {
        const cmd = new PutObjectCommand({
            Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
            Key: `${process.env.AWS_S3_DIRECTORY}/${fileName}`,
            Body: file.buffer,
            ContentType: `image/${ext}`,
        });

        await this.s3Client.send(cmd);

        return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${process.env.AWS_S3_DIRECTORY}/${fileName}`;
    }
}
