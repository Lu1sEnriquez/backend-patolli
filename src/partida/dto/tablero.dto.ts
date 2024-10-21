import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CasillaCreateDto } from './casilla.dto';

export class TableroCreateDto {
  @IsInt()
  @Min(1)
  numeroCasillasPorAspa: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CasillaCreateDto)
  casillas: CasillaCreateDto[];
}
