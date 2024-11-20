import { Injectable } from '@nestjs/common';

import { ObjectId } from 'mongodb';
import {
  badIntent,
  badRequest,
  created,
  internalServerError,
  ok,
  SocketResponse,
} from 'src/interface/socket-response';
import { JugadorModel } from '../models/JugadorModel';
import { PartidaModel } from '../models/PartidaModel';
import { TableroModel } from '../models/TableroModel';
import { estadoEnum, Jugador, Partida } from '@prisma/client';
import { CreatePartidaDto } from '../dto/partida.dto';
import { JugadorCreateDto } from '../dto/jugador.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PartidaRepository } from './partida.repository';

@Injectable()
export class PartidaService {
  constructor(private readonly partidaRepo: PartidaRepository) {}

  async crearPartida(
    data: CreatePartidaDto,
  ): Promise<SocketResponse<Partida | null>> {
    try {
      const jugadorUno = new JugadorModel({
        id: 0,
        nombre: data.creadorNombre,
        color: data.colores[0],
        fondoApuesta: data.fondoApuestaFijo,
        fichas: [],
        haPerdido: false,
        turnoFicha: 0,
        isDisconnect: false,
      });

      jugadorUno.crearFichas(data.fichasTotales);

      const tablero = TableroModel.crearTablero(data.tableroSize);
      // console.log(tablero.getData());

      const turnoActual = 0;
      const nuevaPartida = new PartidaModel({
        id: new ObjectId().toString(),
        codigo: data.codigo,
        creadorNombre: data.creadorNombre,
        colores: data.colores,
        fondoApuestaFijo: data.fondoApuestaFijo,
        montoApuesta: data.montoApuesta,
        tableroSize: data.tableroSize,
        tablero: tablero.getData(),
        turnoActual: turnoActual,
        fichasTotales: data.fichasTotales,
        estado: estadoEnum.EN_ESPERA,
        jugadores: [],
      });
      nuevaPartida.agregarJugador(jugadorUno);

      // console.log(nuevaPartida.getData());

      const partida = await this.partidaRepo.create(nuevaPartida.getData());
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
      const partida = await this.partidaRepo.findByCodigo(codigo);
      if (!partida) {
        return badRequest('Partida no encontrada');
      }

      const partidaActualizada = new PartidaModel(partida);

      const result = partidaActualizada.agregarJugador({
        nombre: jugadorDto.nombre,
      });
      // Crear el objeto JugadorClass desde el DTO

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = partidaActualizada.getData();

      const partidaGuardada = await this.partidaRepo.update(codigo, data);

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

  async salirJugador(codigo: string, jugadorDto: Partial<JugadorCreateDto>) {
    try {
      // Buscar la partida en la base de datos
      const partida = await this.partidaRepo.findByCodigo(codigo);
      if (!partida) {
        return badRequest('Partida no encontrada');
      }

      const partidaActualizada = new PartidaModel(partida);

      const result = partidaActualizada.sacarJugador({
        nombre: jugadorDto.nombre,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = partidaActualizada.getData();

      const partidaGuardada = await this.partidaRepo.update(codigo, data);

      // si todo a salido bien regresamos la partida actualizada
      if (result.success) {
        return created(partidaGuardada, 'Jugador sacado exitosamente');
      }
      // si la clase devuelve un error al agregar un usuario lo retornamos al cliente
      return result;
    } catch (error) {
      console.error('Error al sacar al jugador:', error);
      return internalServerError('Error interno del servidor al sacar jugador');
    }
  }

  async suspenderJugador(
    codigo: string,
    jugadorNombre: string,
  ): Promise<SocketResponse<Partida | null>> {
    try {
      // Buscar la partida en la que está el jugador por su nombre
      const partida = await this.partidaRepo.findByCodigo(codigo);

      if (!partida) {
        return badRequest('Partida no encontrada');
      }

      const partidaActualizada = new PartidaModel(partida);

      const result = partidaActualizada.suspenderJugador({
        nombre: jugadorNombre,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = partidaActualizada.getData();

      const partidaGuardada = await this.partidaRepo.update(codigo, data);

      // si todo a salido bien regresamos la partida actualizada
      if (result.success) {
        return created(
          partidaGuardada,
          `Jugador ${jugadorNombre} se ha desconectado`,
        );
      }

      return result;
    } catch (error) {
      console.error('Error al desconectar al jugador:', error);
      return internalServerError(
        'Error interno del servidor al desconectar jugador',
      );
    }
  }

  async pagarApuesta(
    codigo: string,
    nombreJugador: string,
  ): Promise<SocketResponse<Partida | null>> {
    try {
      const partida = await this.partidaRepo.findByCodigo(codigo);

      if (!partida) {
        return badRequest('Partida no encontrada');
      }

      const partidaActualizada = new PartidaModel(partida);

      const result = partidaActualizada.pagarApuesta({
        nombre: nombreJugador,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = partidaActualizada.getData();

      const partidaGuardada = await this.partidaRepo.update(codigo, data);

      // si todo a salido bien regresamos la partida actualizada
      if (result.success) {
        if (
          result.data.jugadores.find((j) => j.nombre === nombreJugador)
            .haPerdido
        ) {
          return created(
            partidaGuardada,
            `El jugador ${nombreJugador} ha perdido`,
          );
        }
        return created(
          partidaGuardada,
          `Se ha pagado la apuesta del jugador ${nombreJugador}`,
        );
      }

      return result;
    } catch (error) {
      console.error(
        `Error al pagar la apuesta del jugador ${nombreJugador}`,
        error,
      );
      return internalServerError('Error interno del servidor al pagar apuesta');
    }
  }
  // Movimientos de juego
  async moverFichaPagandoEnPartida(
    codigo: string,
    idJugador: number,
    idFicha: number,
    cantidad: number,
  ): Promise<SocketResponse<Partida | null>> {
    // Buscar la partida en la base de datos
    const partida = await this.partidaRepo.findByCodigo(codigo);

    if (!partida) {
      return badRequest(`No se encontró la partida con código ${codigo}`);
    }
    const partidaActualizada = new PartidaModel(partida);

    const result = partidaActualizada.moverFichaPagando(
      idJugador,
      idFicha,
      cantidad,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = partidaActualizada.getData();

    const partidaGuardada = await this.partidaRepo.update(codigo, data);

    // si todo a salido bien regresamos la partida actualizada
    if (result.success) {
      return created(partidaGuardada, 'Se movio la ficha Exitosamente');
    }
    // si la clase devuelve un error al agregar un usuario lo retornamos al cliente
    return result;
  }

  // Movimientos de juego
  async moverFichaAutomaticoEnPartida(
    codigo: string,
    idJugador: number,
    cantidad: number,
  ): Promise<SocketResponse<Partida | null>> {
    // Buscar la partida en la base de datos
    const partida = await this.partidaRepo.findByCodigo(codigo);

    if (!partida) {
      return badRequest(`No se encontró la partida con código ${codigo}`);
    }
    const partidaActualizada = new PartidaModel(partida);

    const result = partidaActualizada.moverFichaAutomatico(idJugador, cantidad);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = partidaActualizada.getData();

    const partidaGuardada = await this.partidaRepo.update(codigo, data);

    // si todo a salido bien regresamos la partida actualizada
    if (result.success) {
      return created(partidaGuardada, 'Se movio la ficha Exitosamente');
    }
    // si todo a salido bien regresamos la partida actualizada
    if (result) {
      return badIntent(partidaGuardada, result.message);
    }
  }

  async iniciarPartida(codigo: string) {
    // Buscar la partida en la base de datos
    const partida = await this.partidaRepo.findByCodigo(codigo);

    if (!partida) {
      return badRequest(`No se encontró la partida con código ${codigo}`);
    }
    const partidaActualizada = new PartidaModel(partida);

    const result = partidaActualizada.iniciarPartida();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = partidaActualizada.getData();

    const partidaGuardada = await this.partidaRepo.update(codigo, data);

    // si todo a salido bien regresamos la partida actualizada
    if (result.success) {
      return created(partidaGuardada, 'Partida Iniciada Correctamente');
    }
    // si la clase devuelve un error al agregar un usuario lo retornamos al cliente
    return result;
  }

  async verificarGanador(
    codigo: string,
  ): Promise<SocketResponse<Jugador | null>> {
    const partida = await this.partidaRepo.findByCodigo(codigo);

    if (!partida) {
      return badRequest(`No se encontró la partida con código ${codigo}`);
    }
    const partidaActualizada = new PartidaModel(partida);

    const ganador = partidaActualizada.verificarGanador();
    // si todo a salido bien regresamos la partida actualizada
    if (ganador) {
      return ok(ganador.getData(), 'hay ganador');
    }
    // si la clase devuelve un error al agregar un usuario lo retornamos al cliente
    return badRequest('no hay ganador');
  }

  async verificarPerdedores(
    codigo: string,
  ): Promise<SocketResponse<Jugador[] | null>> {
    const partida = await this.partidaRepo.findByCodigo(codigo);
    if (!partida) {
      return badRequest(`No se encontró la partida con código ${codigo}`);
    }
    const partidaActualizada = new PartidaModel(partida);

    const perdedores = partidaActualizada
      .verificarPerdedores()
      .map((j) => j.getData());
    // si todo a salido bien regresamos la partida actualizada
    if (perdedores) {
      return badIntent(perdedores, 'hay ganador');
    }
    // si la clase devuelve un error al agregar un usuario lo retornamos al cliente
    return ok(perdedores, 'no hay perdedores');
  }

  async terminarPartida(
    codigo: string,
  ): Promise<SocketResponse<Partida | null>> {
    const partidaDeleted = await this.partidaRepo.delete(codigo);

    if (!partidaDeleted) {
      return badRequest(`No se encontró la partida con código ${codigo}`);
    }

    return ok(partidaDeleted, 'partida eliminada');
  }
}
