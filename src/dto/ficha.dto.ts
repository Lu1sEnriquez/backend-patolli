import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Coordenadas } from '@prisma/client';

export class FichaCreateDto {
  @IsInt()
  id: number;

  @IsString()
  color: string;

  @IsOptional()
  posicion: Coordenadas | null;

  @IsBoolean()
  eliminada: boolean;
}
