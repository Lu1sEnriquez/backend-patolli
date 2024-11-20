import { Tablero } from '@prisma/client';
import { CasillaModel } from './CasillaModel';
import { FichaModel } from './FichaModel';
import { badRequest, ok } from 'src/interface/socket-response';
import { TableroBuilder } from 'src/builders/Tablero.builder';

export class TableroModel {
  public casillas: CasillaModel[];
  public tableroSize: number;
  public meta: number;

  constructor(tablero: Tablero) {
    this.tableroSize = tablero?.tableroSize || 0;
    this.casillas =
      tablero?.casillas?.map((casilla) => new CasillaModel(casilla)) || [];
    this.meta = this.casillas.length - (this.tableroSize - 2); // la posicion correcta
  }
  // Método para crear un tablero utilizando el Builder
  static crearTablero(tableroSize: number): TableroModel {
    const builder = new TableroBuilder(tableroSize);
    builder.generarCasillas();
    return builder.build();
  }
  // Método para calcular la nueva casilla sumando la cantidad
  calcularNuevaCasilla(posisionActual: number, cantidad: number): number {
    return (posisionActual + cantidad) % this.casillas.length;
  }

  // GAME
  // Buscar una casilla por la ficha
  buscarCasillaPorFicha(ficha: FichaModel): CasillaModel | undefined {
    return this.casillas.find((c) =>
      // se realiza la busqueda por id  y color ya que no se cuenta con la id del jugador
      c.ocupantes.some((f) => f.id == ficha.id && f.color == ficha.color),
    );
  }

  // Buscar una casilla por su ID
  buscarCasillaPorId(id: number): CasillaModel | undefined {
    return this.casillas.find((c) => c.id === id);
  }

  // TableroModel.ts

  // Mover una ficha entre casillas
  moverFicha(
    ficha: FichaModel,
    casillaActual: CasillaModel,
    nuevaCasilla: CasillaModel,
    cantidad: number,
  ): FichaModel {
    // Eliminar la ficha de la casilla actual
    casillaActual.ocupantes = casillaActual.ocupantes.filter(
      (f) => f.id !== ficha.id,
    );

    // Actualizar la posición de la ficha
    ficha.posicion = nuevaCasilla.posicion;
    ficha.casillasAvanzadas =
      ficha.casillasAvanzadas + cantidad > this.meta
        ? this.meta
        : ficha.casillasAvanzadas + cantidad;

    // Agregar la ficha a la nueva casilla
    nuevaCasilla.ocupantes.push(ficha);

    // Actualizar las casillas en el tablero
    this.casillas.splice(casillaActual.id, 1, casillaActual);
    this.casillas.splice(nuevaCasilla.id, 1, nuevaCasilla);

    return ficha;
  }

  // Ingresar una ficha en la casilla de inicio de un jugador
  ingresarFicha(
    ficha: FichaModel,
    idJugador: number,
    // cantidad: number,
  ): FichaModel {
    const casillaIdInicio = this.obtenerInicioJugador(idJugador);
    const casillaInicio = this.casillas.find(
      (casilla) => casilla.id === casillaIdInicio,
    );

    // Agregar la ficha a la casilla de inicio
    casillaInicio.ocupantes.push(ficha);

    // Actualizar la posición de la ficha
    ficha.posicion = casillaInicio.posicion;
    ficha.casillasAvanzadas = 1;
    this.casillas.splice(casillaIdInicio, 1, casillaInicio);

    return ficha;
  }

  // Devolver una ficha a una casilla
  devolverFicha(
    ficha: FichaModel,
    casillaActual: CasillaModel,
    cantidad: number,
  ) {
    if (ficha.eliminada) {
      return badRequest(
        `No se puede devolver la ficha con id ${ficha.id} porque está eliminada`,
      );
    }

    const casillaDeInicio = this.buscarCasillaPorId(casillaActual.id);
    if (!casillaDeInicio) {
      return badRequest(
        `La casilla de inicio con id ${casillaActual.id} no se encontró`,
      );
    }

    // Actualizar el estado de la ficha y devolverla a su posición inicial
    ficha.casillasAvanzadas -= cantidad;
    ficha.eliminada = false;
    casillaDeInicio.ocupantes.push(ficha);

    return ok(
      this.getData(),
      `Ficha con id ${ficha.id} devuelta a la casilla con id ${casillaActual.id} correctamente`,
    );
  }

  obtenerInicioJugador(idJugador: number): number {
    switch (idJugador) {
      case 0:
        return 0;
      case 1:
        return this.tableroSize - 1;
      case 2:
        return (this.tableroSize - 1) * 2;
      case 3:
        return (this.tableroSize - 1) * 3;
      default:
        throw new Error('Jugador no válido');
    }
  }
  obtenerMeta(): number {
    return this.meta;
  }

  // se refiere ala casilla dentro del tablero
  obtenerMetaJugador(idJugador: number): number {
    switch (idJugador) {
      case 1:
        return this.tableroSize - this.casillas.length - 1;
      case 2:
        return this.tableroSize - 1 + this.casillas.length;
      case 3:
        return (this.tableroSize - 1) * 2 + this.casillas.length - 1;
      case 4:
        return (this.tableroSize - 1) * 3 + this.casillas.length - 1;
      default:
        throw new Error('Jugador no válido');
    }
  }
  // Obtener datos del tablero
  getData(): Tablero {
    return {
      tableroSize: this.tableroSize,
      casillas: this.casillas?.map((casilla) => casilla.getData()),
      meta: this.meta,
    };
  }
}
