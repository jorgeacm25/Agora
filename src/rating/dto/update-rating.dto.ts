import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  quantity?: number;
}