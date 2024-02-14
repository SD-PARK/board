import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entity/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
