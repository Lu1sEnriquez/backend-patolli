import { JugadorClass } from './Jugador';
import { TableroClass } from './Tablero';
import {
  badRequest,
  created,
  internalServerError,
  SocketResponse,
} from 'src/interface/socket-response';
import { JugadorCreateDto } from '../dto/jugador.dto';
import { estadoEnum, Ficha, Jugador, Partida } from '@prisma/client';

export class PartidaClass {
  public jugadores: JugadorClass[] = [];
  public estado: estadoEnum = estadoEnum.EN_CURSO;
  public id: string;
  public codigo: string;
  public creadorNombre: string;
  public colores: string[];
  public fondoApuestaFijo: number;
  public montoApuesta: number;
  public tableroSize: number;
  public fichasTotales: number;
  public tablero: TableroClass;
  public turnoActual: number;
  constructor(data: Partial<Partida>) {
    this.id = data.id;
    this.jugadores = data.jugadores?.map(
      (jugador) => new JugadorClass(jugador),
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
    this.tablero = new TableroClass(data.tablero);
  }

  agregarJugador(
    jugadorData: Partial<JugadorCreateDto>,
  ): SocketResponse<Partida | null> {
    try {
      // Verificar si el número de jugadores ya ha alcanzado el límite
      if (this?.jugadores?.length >= 4) {
        return badRequest('Se alcanzó el límite de jugadores');
      }

      const idJugador = this.jugadores?.length; // Asignar ID basado en el tamaño actual de jugadores
      const colorJugador = this.colores[idJugador] || null; // Asignar color al jugador

      // Crear fichas para el jugador
      const fichas: Ficha[] = [
        { id: 1, color: colorJugador, eliminada: false, posicion: null },
        { id: 2, color: colorJugador, eliminada: false, posicion: null },
        { id: 3, color: colorJugador, eliminada: false, posicion: null },
        { id: 4, color: colorJugador, eliminada: false, posicion: null },
      ];

      const data: Jugador = {
        id: idJugador,
        haPerdido: jugadorData.haPerdido,
        turnoFicha: jugadorData.turnoFicha,
        nombre: jugadorData.nombre,
        fondoApuesta: jugadorData.fondoApuesta | this.fondoApuestaFijo,
        color: colorJugador,
        fichas: fichas,
      };
      // Crear un nuevo jugador
      const jugador = new JugadorClass(data);
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
