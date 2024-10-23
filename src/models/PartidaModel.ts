import { JugadorModel } from './JugadorModel';
import { TableroModel } from './TableroModel';
import {
  badRequest,
  created,
  internalServerError,
  SocketResponse,
} from 'src/interface/socket-response';
import { JugadorCreateDto } from '../dto/jugador.dto';
import { estadoEnum, Jugador, Partida } from '@prisma/client';

export class PartidaModel {
  public jugadores: JugadorModel[] = [];
  public estado: estadoEnum = estadoEnum.EN_CURSO;
  public id: string;
  public codigo: string;
  public creadorNombre: string;
  public colores: string[];
  public fondoApuestaFijo: number;
  public montoApuesta: number;
  public tableroSize: number;
  public fichasTotales: number;
  public tablero: TableroModel;
  public turnoActual: number;
  constructor(data: Partial<Partida>) {
    this.id = data.id;
    this.jugadores = data.jugadores?.map(
      (jugador) => new JugadorModel(jugador),
    );
    this.estado = data.estado;
    this.codigo = data.codigo;
    this.creadorNombre = data.creadorNombre;
    this.colores = data.colores;
    this.fondoApuestaFijo = data.fondoApuestaFijo;
    this.montoApuesta = data.montoApuesta;
    this.tableroSize = data.tablerosize;
    this.fichasTotales = data.fichasTotales;
    this.turnoActual = data.turnoActual;
    this.tablero = new TableroModel(data.tablero);
  }

  agregarJugador(
    jugadorData: Partial<JugadorCreateDto>,
  ): SocketResponse<Partida | null> {
    try {
      // Verificar si el número de jugadores ya ha alcanzado el límite
      if (this?.jugadores?.length >= 4) {
        return badRequest('Se alcanzó el límite de jugadores');
      }
      // Verificar si el nombre del jugador ya existe en la partida
      if (
        this?.jugadores?.some(
          (j) => j.nombre === jugadorData.nombre && !j.isDisconnect,
        )
      ) {
        return badRequest('El nombre de este usuario ya existe en la partida');
      }
      // Verificar si el jugador que se esta intentando unir ya pertencia a la partida
      if (
        this?.jugadores?.some(
          (j) => j.nombre === jugadorData.nombre && j.isDisconnect,
        )
      ) {
        //actualizar el estado del usuario
        const usuarioToReconect = this?.jugadores?.find(
          (j) => j.nombre === jugadorData.nombre && j.isDisconnect,
        );
        return this.reintegrarJugador(usuarioToReconect);
      }

      const idJugador = this.jugadores?.length; // Asignar ID basado en el tamaño actual de jugadores
      const colorJugador = this.colores[idJugador] || null; // Asignar color al jugador

      const data: Jugador = {
        id: idJugador,
        haPerdido: jugadorData.haPerdido,
        turnoFicha: jugadorData.turnoFicha | 0,
        nombre: jugadorData.nombre,
        fondoApuesta: jugadorData.fondoApuesta | this.fondoApuestaFijo,
        color: colorJugador,
        fichas: [],
        isDisconnect: jugadorData.isDisconnect,
      };
      // Crear un nuevo jugador
      const jugador = new JugadorModel(data);

      jugador.crearFichas(this.fichasTotales);
      // Agregar el jugador a la partida
      this.jugadores?.push(jugador);

      // Aquí podrías realizar la actualización en la base de datos
      // const updatedPartida = await prisma.partida.update({...}); // Lógica de actualización en la base de datos

      return created(this.getData(), 'Jugador agregado correctamente'); // Retornar la partida actualizada
    } catch (error) {
      console.error('Error al agregar jugador:', error);
      return internalServerError('Error interno al agregar jugador');
    }
  }

  sacarJugador(
    jugadorData: Partial<JugadorCreateDto>,
  ): SocketResponse<Partida | null> {
    try {
      const result = this.jugadores?.find(
        (jugador) => jugador.id === jugadorData.id,
      );

      if (result === null) {
        return badRequest(`Usuario con id ${jugadorData.id} no encontrado`);
      }

      this.jugadores = this.jugadores.splice(jugadorData.id, 1);
      return created(
        this.getData(),
        `Jugador con id ${jugadorData.id} sacado correctamente`,
      ); // Retornar la partida actualizada
    } catch (error) {
      console.error('Error al sacar jugador:', error);
      return internalServerError('Error interno al sacar al jugador');
    }
  }

  suspenderJugador(
    jugadorData: Partial<JugadorCreateDto>,
  ): SocketResponse<Partida | null> {
    try {
      const result = this.jugadores?.find(
        (jugador) => jugador.nombre === jugadorData.nombre,
      );

      if (result === null) {
        return badRequest(
          `Nombre de Usuario ${jugadorData.nombre} no encontrado`,
        );
      }

      //actualizar el estado del usuario
      this.jugadores = this.jugadores.map((jugador) => {
        if (jugador.nombre === jugadorData.nombre) {
          jugador.isDisconnect = true;
          return jugador;
        }
        return jugador;
      });

      return created(
        this.getData(),
        `El Jugador ${jugadorData.nombre} se ha desconectado`,
      ); // Retornar la partida actualizada
    } catch (error) {
      console.error('Error al desconectar jugador:', error);
      return internalServerError('Error interno al desconectar al jugador');
    }
  }

  reintegrarJugador(
    jugadorData: Partial<JugadorCreateDto>,
  ): SocketResponse<Partida | null> {
    // const idJugador = this.jugadores?.length; // Asignar ID basado en el tamaño actual de jugadores
    // const colorJugador = this.colores[idJugador] || null; // Asignar color al jugador

    // const data: Jugador = {
    //   id: jugadorData.id,
    //   haPerdido: jugadorData.haPerdido,
    //   turnoFicha: jugadorData.turnoFicha,
    //   nombre: jugadorData.nombre,
    //   fondoApuesta: jugadorData.fondoApuesta,
    //   color: jugadorData.color,
    //   fichas: jugadorData.fichas,
    //   isDisconnect: false,
    // };

    //actualizar el estado del usuario de la partida
    this.jugadores = this.jugadores.map((jugador) => {
      if (jugador.nombre === jugadorData.nombre) {
        jugador.isDisconnect = false;
        return jugador;
      }
      return jugador;
    });

    return created(this.getData(), 'Jugador reconectado correctamente'); // Retornar la partida actualizada
  }

  pagarApuesta(
    jugadorData: Partial<JugadorCreateDto>,
  ): SocketResponse<Partida | null> {
    this.jugadores = this.jugadores.map((jugador) => {
      if (jugador.nombre === jugadorData.nombre) {
        if (jugador.fondoApuesta - this.montoApuesta < 0) {
          jugador.haPerdido = true;
          return jugador;
        }
        jugador.fondoApuesta -= this.montoApuesta;
        return jugador;
      }
      return jugador;
    });

    return created(this.getData(), 'Se pago la apuesta correctamente'); // Retornar la partida actualizada
  }

  // generarTablero() {
  //   this.tablero = new TableroClass({
  //     numeroCasillasPorAspa: this.tableroSize,
  //     casillas: [],
  //   });

  //   this.tablero.generarCasillas(this.tableroSize);
  // }

  iniciarPartida() {
    this.estado = estadoEnum.EN_CURSO;
    // Lógica para iniciar la partida
  }

  getData(): Partida {
    return {
      id: this.id,
      codigo: this.codigo,
      creadorNombre: this.creadorNombre,
      colores: this.colores,
      fondoApuestaFijo: this.fondoApuestaFijo,
      montoApuesta: this.montoApuesta,
      turnoActual: this.turnoActual,
      estado: this.estado,
      fichasTotales: this.fichasTotales,
      tablerosize: this.tableroSize,
      jugadores: this.jugadores?.map((jugador) => jugador.getData()), // Usando getData de Jugador
      tablero: this.tablero.getData(), // Usando getData de Tablero
    };
  }
}
