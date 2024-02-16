import { Test, TestingModule } from '@nestjs/testing';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

describe('AwsService', () => {
  let service: AwsService;
  
  const mockConfigService = {
    get: jest.fn()
      .mockResolvedValueOnce('AWS_REGION')
      .mockResolvedValueOnce('AWS_S3_ACCESS_KEY')
      .mockResolvedValueOnce('AWS_S3_SECRET_ACCESS_KEY')
      .mockResolvedValueOnce('AWS_S3_BUCKET_NAME')
      .mockResolvedValueOnce('AWS_S3_DIRECTORY'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsService, ConfigService],
    })
    .compile();

    service = module.get<AwsService>(AwsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe('iimageUploadToS3 Test', () => {
    it('이미지 업로드 후 URI를 반환하는가?', async () => {
      
    });
  });
});
