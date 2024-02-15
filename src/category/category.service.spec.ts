import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategories = [
    { categoryId: 1, title: '공지사항', },
    { categoryId: 2, title: 'Q&A', },
    { categoryId: 3, title: '1:1문의', },
  ]

  const mockCategoryRepository = {
    findOne: jest.fn().mockImplementation(option => {
      if (option.where?.categoryId)
        return Promise.resolve(mockCategories.find(category => category.categoryId === option.where.categoryId));
      else if (option.where?.title)
        return Promise.resolve(mockCategories.find(category => category.title === option.where.title));
      else
        return Promise.resolve();
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCategory Test', () => {
    const id = 1;
    const failedId = -1;

    it('카테고리의 유효성을 검사하는가?', () => {
      expect(service.validateCategory(id))
        .resolves.toEqual(true);

      expect(service.validateCategory(failedId))
        .resolves.toEqual(false);

      expect(mockCategoryRepository.findOne).toHaveBeenCalled();
    });
  });
});
