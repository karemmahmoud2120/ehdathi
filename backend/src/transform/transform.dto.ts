import { IsArray, IsInt, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PointDto {
  @IsNumber() x!: number;
  @IsNumber() y!: number;
}

export class TransformDto {
  @IsInt() sourceSrid!: number;
  @IsInt() targetSrid!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points!: PointDto[];
}
