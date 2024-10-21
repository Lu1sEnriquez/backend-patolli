import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { ObjectId } from 'mongodb';
import {
  badRequest,
  created,
  internalServerError,
  SocketResponse,
} from 'src/interface/socket-response';
import { JugadorClass } from './entities/Jugador';
import { PartidaClass } from './entities/Partida';
import { TableroClass } from './entities/Tablero';
import { estadoEnum, Partida } from '@prisma/client';
import { CreatePartidaDto } from './dto/partida.dto';
import { JugadorCreateDto } from './dto/jugador.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PartidaService {
  constructor(private readonly prisma: PrismaService) {}

  async crearPartida(
    data: CreatePartidaDto,
  ): Promise<SocketResponse<Partida | null>> {
    try {
      const jugadorUno = new JugadorClass({
        id: 0,
        nombre: data.creadorNombre,
        color: data.colores[0],
        fondoApuesta: data.fondoApuestaFijo,
        fichas: [],
        haPerdido: false,
        turnoFicha: 0,
      });
      jugadorUno.crearFichas(data.fichasTotales);

      const tablero = new TableroClass({
        casillas: [],
        numeroCasillasPorAspa: data.tablerosize,
      });
      tablero.generarCasillas();
      // console.log(tablero.getData());

      const turnoActual = 0;
      const nuevaPartida = new PartidaClass({
        id: new ObjectId().toString(),
        codigo: data.codigo,
        creadorNombre: data.creadorNombre,
        colores: data.colores,
        fondoApuestaFijo: data.fondoApuestaFijo,
        montoApuesta: data.montoApuesta,
        tablerosize: data.tablerosize,
        tablero: tablero.getData(),
        turnoActual: turnoActual,
        fichasTotales: data.fichasTotales,
        estado: estadoEnum.EN_ESPERA,
        jugadores: [],
      });
      nuevaPartida.agregarJugador(jugadorUno);

      // console.log(nuevaPartida.getData());

      const partida = await this.prisma.partida.create({
        data: nuevaPartida.getData(),
      });
      return created(partida, 'Partida creada exitosamente');
    } catch (error) {
      console.error('Error al crear la partida:');
      console.error(error);
      // Verifica si el error tiene una propiedad 'message' y es un string
      if (error instanceof PrismaClientKnownRequestError) {
        console.log(error.code);
        console.log(error.message);

        // Aquí puedes hacer algo basado en el valor de containsPartidaCodigoKey
        if (error.code == 'P2002') {
          return internalServerError('codigo ocupado');
        }
      }

      return internalServerError('Error interno del servidor al crear partida');
    }
  }

  async unirJugador(
    codigo: string,
    jugadorDto: Partial<JugadorCreateDto>,
  ): Promise<SocketResponse<Partida | null>> {
    try {
      // Buscar la partida en la base de datos
      const partida = await this.prisma.partida.findUnique({
        where: { codigo: codigo },
      });

      if (!partida) {
        return badRequest('Partida no encontrada');
      }

      const partidaActualizada = new PartidaClass(partida);

      const result = partidaActualizada.agregarJugador({
        nombre: jugadorDto.nombre,
      });
      // Crear el objeto JugadorClass desde el DTO

      const { id, ...data } = partidaActualizada.getData();
      const partidaGuardada = await this.prisma.partida.update({
        where: { codigo: codigo },
        data: data,
      });

      // si todo a salido bien regresamos la partida actualizada
      if (result.success) {
        return created(partidaGuardada, 'Jugador agregado exitosamente');
      }
      // si la clase devuelve un error al agregar un usuario lo retornamos al cliente
      return result;
    } catch (error) {
      console.error('Error al unir jugador:', error);
      return internalServerError('Error interno del servidor al unir jugador');
    }
  }
}

export const partidaExample = {
  creadorNombre: 'prueba',
  fondoApuestaFijo: 1000,
  montoApuesta: 100,
  tablerosize: 8,
  codigo: '1234',
  colores: ['verde', 'rojo', 'azul', 'amarillo'],
  estado: 'EN_ESPERA',
  // id: '123132131',
  jugadores: [],
  tablero: { casillas: [], numeroCasillasPorAspa: 8 },
  turnoActual: 0,
};
