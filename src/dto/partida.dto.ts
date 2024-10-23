import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { estadoEnum, Partida, Tablero } from '@prisma/client';
import { TableroCreateDto } from './tablero.dto';

import { Type } from 'class-transformer';
import { JugadorCreateDto } from './jugador.dto';

export class CreatePartidaDto implements Partida {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  codigo: string;

  @IsInt()
  @Min(1)
  fondoApuestaFijo: number;

  @IsInt()
  @Min(8)
  @Min(14)
  tableroSize: number;

  @IsInt()
  @Min(1)
  @Max(6)
  fichasTotales: number;

  @IsString()
  creadorNombre: string;

  @IsArray()
  @IsString({ each: true }) // Cada elemento debe ser una string
  colores: string[];

  @IsInt()
  @Min(1)
  montoApuesta: number;

  @IsInt()
  @IsOptional()
  turnoActual: number;

  @IsEnum(estadoEnum)
  @IsOptional()
  estado: estadoEnum;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JugadorCreateDto)
  jugadores: JugadorCreateDto[];

  @IsOptional()
  @ValidateNested() // Validación del objeto tablero usando DTO
  @Type(() => TableroCreateDto)
  tablero: Tablero;
}
