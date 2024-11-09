import { JugadorModel } from './JugadorModel';
import { TableroModel } from './TableroModel';
import {
  badRequest,
  created,
  internalServerError,
  ok,
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
    this.tableroSize = data.tableroSize;
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

  iniciarPartida(): SocketResponse<Partida | null> {
    if (this.jugadores.length < 2)
      return badRequest('se necesitan almenos 2 jugadores');

    this.estado = estadoEnum.EN_CURSO;
    // Lógica para iniciar la partida
    return ok(this.getData(), 'inicio Partida correctamente');
  }

  moverFichaPagando(idJugador: number, idFicha: number, cantidad: number) {
    const jugador = this.buscarJugadorPorId(idJugador);
    if (!jugador)
      return badRequest(`No se encontró al jugador con id ${idJugador}`);

    // Verificar si el jugador tiene fichas para mover o ingresar
    if (jugador.fichas.every((ficha) => ficha.casillasAvanzadas > 0)) {
      return this.moverFicha(idJugador, idFicha, cantidad);
    } else if (cantidad === 1) {
      // Paga apuesta si el dado no permite movimiento
      jugador.pagarApuesta(this.montoApuesta);
    }

    return this.moverFicha(idJugador, idFicha, cantidad);
  }

  moverFichaAutomatico(
    idJugador: number,
    cantidad: number,
  ): SocketResponse<Partida | null> {
    this.siguienteTurno();
    const jugador = this.buscarJugadorPorId(idJugador);
    if (!jugador) {
      return badRequest(`No se encontró al jugador con id ${idJugador}`);
    }

    if (cantidad == 0) {
      jugador.pagarApuesta(this.montoApuesta);
      return ok(this.getData());
    }

    const ficha = jugador.getProximaFicha(cantidad, this.tablero.meta);
    console.log(ficha);

    if (!ficha) return badRequest(`No hay fichas disponibles para mover`);

    // Mover la ficha usando la cantidad tirada
    return this.moverFicha(idJugador, ficha.id, cantidad);
  }

  moverFicha(
    idJugador: number,
    idFicha: number,
    cantidad: number,
  ): SocketResponse<Partida | null> {
    const jugador = this.buscarJugadorPorId(idJugador);
    if (!jugador) {
      return badRequest(`No se encontró al jugador con id ${idJugador}`);
    }

    const ficha = jugador.buscarFichaPorId(idFicha);
    if (!ficha) {
      return badRequest(
        `No se encontró la ficha con id ${idFicha} en el jugador con id ${idJugador}`,
      );
    }

    if (ficha.eliminada) {
      return badRequest(
        `La ficha con id ${idFicha} ha sido eliminada y no puede moverse`,
      );
    }

    // Lógica para ingresar la ficha si el dado cae en 1
    if (cantidad === 1 && !ficha.dentroDelTablero()) {
      // Verifica si puede ingresar una nueva ficha
      console.log(`ingresar ficha  ${ficha.id}`);

      this.tablero.ingresarFicha(ficha, idJugador);
      return created(
        this.getData(),
        `Ficha con id ${idFicha} introducida con éxito a la casilla de inicio`,
      );
    }

    // Movimiento normal de la ficha
    if (ficha.dentroDelTablero()) {
      const casillaActual = this.tablero.buscarCasillaPorFicha(ficha);
      if (!casillaActual) {
        return badRequest(
          `No se encontró la casilla actual para la ficha con id ${idFicha}`,
        );
      }

      const idNuevaCasilla = this.tablero.calcularNuevaCasilla(
        casillaActual.id,
        cantidad,
      );
      const nuevaCasilla = this.tablero.buscarCasillaPorId(idNuevaCasilla);
      if (!nuevaCasilla) {
        return badRequest(
          `No se encontró la casilla destino con id ${idNuevaCasilla}`,
        );
      }

      if (
        nuevaCasilla.estaOtroJugador(ficha) &&
        nuevaCasilla.tipo === 'CENTRAL'
      ) {
        // Eliminar ficha ocupante
        const casilla = this.tablero.buscarCasillaPorId(nuevaCasilla.id);
        casilla.eliminarFichasOcupantes();
      } else if (
        nuevaCasilla.estaOtroJugador(ficha) &&
        nuevaCasilla.tipo !== 'CENTRAL'
      ) {
        return badRequest(
          `Ficha con id ${idFicha} no se puede movel ala  a la casilla con id ${idNuevaCasilla} por que esta ocupada por otro jugador`,
        );
      }

      // Pagar apuesta si es una casilla de triángulo
      if (nuevaCasilla.tipo === 'TRIANGULO') {
        jugador.pagarApuesta(this.montoApuesta * 2); // Pago doble
      }

      // Mover la ficha y actualizar casillas
      this.tablero.moverFicha(ficha, casillaActual, nuevaCasilla, cantidad);

      return created(
        this.getData(),
        `Ficha con id ${idFicha} movida con éxito a la casilla con id ${idNuevaCasilla}`,
      );
    }

    return badRequest(`No se puede mover la ficha con id ${idFicha}`);
  }

  // Método auxiliar para buscar jugador
  buscarJugadorPorId(idJugador: number): JugadorModel | undefined {
    return this.jugadores.find((j) => j.id === idJugador);
  }

  verificarGanador() {
    return this.jugadores.find((jugador) => jugador.gano(this.tablero.meta));
  }

  siguienteTurno(): void {
    // Filtrar jugadores conectados que aún no han perdido
    const jugadoresActivos = this.jugadores.filter(
      (jugador) => !jugador.haPerdido && !jugador.isDisconnect,
    );

    // Si no hay jugadores activos, la partida se detiene
    if (jugadoresActivos.length === 0) {
      console.log('No hay jugadores activos para continuar.');
      return;
    }

    // Buscar el índice actual en la lista de jugadores activos
    const indiceActual = jugadoresActivos.findIndex(
      (jugador) => jugador.id === this.turnoActual,
    );

    // Determinar el índice del siguiente jugador activo
    const siguienteIndice = (indiceActual + 1) % jugadoresActivos.length;
    const siguienteJugador = jugadoresActivos[siguienteIndice];

    // Actualizar el turno al siguiente jugador activo
    this.turnoActual = siguienteJugador.id;

    console.log(
      `Turno del jugador ${siguienteJugador.nombre} con ID ${siguienteJugador.id}`,
    );
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
      tableroSize: this.tableroSize,
      jugadores: this.jugadores?.map((jugador) => jugador.getData()), // Usando getData de Jugador
      tablero: this.tablero.getData(), // Usando getData de Tablero
    };
  }
}
