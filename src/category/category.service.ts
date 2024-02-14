import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entity/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    ) {}

    /** ID와 일치하는 카테고리가 있으면 True, 아니면 False를 반환합니다. */
    async validateCategory(categoryId: number): Promise<Boolean> {
        const col: Category = await this.categoryRepository.findOne({ where: { categoryId: categoryId }});
        
        if (col)
            return true;
        else
            return false;
    }
}
