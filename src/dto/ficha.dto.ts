import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Coordenadas, Ficha } from '@prisma/client';

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

  @IsBoolean()
  haLlegadoAMeta: boolean;
  
  @IsBoolean()
  regresarAInicio: boolean;
}
