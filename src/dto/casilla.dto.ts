import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  CasillaTypeEnum,
  OrientacionCasilla,
  Coordenadas,
} from '@prisma/client';

export class CasillaCreateDto {
  @IsString()
  id: string;

  @IsEnum(CasillaTypeEnum)
  tipo: CasillaTypeEnum;

  @IsEnum(OrientacionCasilla)
  orientacion: OrientacionCasilla;

  @IsOptional()
  posicion: Coordenadas | null;

  @IsInt()
  @IsOptional()
  ocupanteId: number | null;
}
