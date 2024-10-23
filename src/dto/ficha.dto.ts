import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Coordenadas } from '@prisma/client';
import { Ficha } from '../../dist/interface/Patolli';

export class FichaCreateDto implements Ficha {
  @IsInt()
  id: number;

  @IsString()
  color: string;

  @IsOptional()
  posicion: Coordenadas | null;

  @IsBoolean()
  eliminada: boolean;

  @IsOptional()
  casillasAvanzadas: number;
}
