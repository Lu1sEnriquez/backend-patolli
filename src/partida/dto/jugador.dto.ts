import {
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FichaCreateDto } from './ficha.dto';
import { Jugador } from '@prisma/client';

export class JugadorCreateDto implements Jugador {
  @IsInt()
  id: number;

  @IsString()
  nombre: string;

  @IsInt()
  @Min(0)
  fondoApuesta: number;

  @IsBoolean()
  haPerdido: boolean;

  @IsString()
  color: string;

  @IsInt()
  turnoFicha: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FichaCreateDto)
  fichas: FichaCreateDto[];
}
