import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUUID Test', () => {
    it('생성된 UUID를 반환하는가?', () => {
      const result = service.getUUID();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(36);
    });
  });
});
