import { CasillaTypeEnum, OrientacionCasilla, Tablero } from '@prisma/client';
import { CasillaModel } from './CasillaModel';
import { FichaModel } from './FichaModel';
import { badRequest, ok } from 'src/interface/socket-response';

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

  // Método para calcular la nueva casilla sumando la cantidad
  calcularNuevaCasilla(posisionActual: number, cantidad: number): number {
    return (posisionActual + cantidad) % this.casillas.length;
  }
  // Genera las posiciones de las casillas que corresponden a la cruz
  // Genera las posiciones de las casillas que corresponden a la cruz
  private generarPuntosCruz(size: number): { X: number; Y: number }[] {
    const puntosCruz: { X: number; Y: number }[] = [];
    const centro1 = Math.floor(size / 2) - 1;
    const centro2 = Math.floor(size / 2);

    // Aspa Superior
    for (let x = centro1 - 1; x >= 0; --x) {
      puntosCruz.push({ X: x, Y: centro1 }); // Casillas superiores izquierda
    }

    // Aspa Derecha
    for (let x = centro1 + 1; x <= centro2; ++x) {
      puntosCruz.push({ X: 0, Y: x }); // Agrega casillas en la fila 0

      for (let y = 1; y <= centro1; ++y) {
        puntosCruz.push({ X: y, Y: x }); // Agrega casillas en la columna x
      }
    }

    for (let x = centro2 + 1; x < size; ++x) {
      puntosCruz.push({ X: centro1, Y: x }); // Casillas en la fila centro1
    }

    // Aspa Inferior
    for (let x = centro1 + 1; x <= centro2; ++x) {
      puntosCruz.push({ X: x, Y: size - 1 }); // Casillas en la última fila

      for (let y = size - 2; y >= centro2; --y) {
        puntosCruz.push({ X: x, Y: y }); // Agrega casillas en la fila x
      }
    }

    for (let x = centro2 + 1; x < size; ++x) {
      puntosCruz.push({ X: x, Y: centro2 }); // Casillas en la columna centro2
    }

    // Aspa Izquierda
    for (let x = centro2 - 1; x >= centro1; --x) {
      puntosCruz.push({ X: size - 1, Y: x }); // Casillas en la última fila

      for (let y = size - 2; y >= centro2; --y) {
        puntosCruz.push({ X: y, Y: x }); // Agrega casillas en la fila x
      }
    }

    for (let x = centro1 - 1; x >= 0; --x) {
      puntosCruz.push({ X: centro2, Y: x }); // Casillas en la columna centro2
    }

    for (let x = centro2 - 1; x >= centro1; --x) {
      puntosCruz.push({ X: x, Y: 0 }); // Casillas en la primera columna

      for (let y = 1; y <= centro1; ++y) {
        puntosCruz.push({ X: x, Y: y }); // Agrega casillas en la fila x
      }
    }

    return puntosCruz;
  }

  // Generar el tablero completo basándose en los puntos de la cruz
  public generarCasillas(size: number = this.tableroSize): CasillaModel[] {
    const puntosCruz = this.generarPuntosCruz(size);
    const casillas: CasillaModel[] = [];

    puntosCruz.forEach((punto, index) => {
      const tipo = this.getTipoCasilla(punto.X, punto.Y, size);
      const orientacion = this.getOrientacion(punto.X, punto.Y, size);
      const casilla = new CasillaModel({
        id: index,
        ocupantes: [],
        orientacion,
        posicion: { X: punto.X, Y: punto.Y },
        tipo,
      });

      casillas.push(casilla);
    });

    this.casillas = casillas;

    this.meta = casillas.length;
    return casillas;
  }

  // Determinar el tipo de casilla en base a la posición
  private getTipoCasilla(
    fila: number,
    columna: number,
    size: number,
  ): CasillaTypeEnum {
    const centro1 = Math.floor(size / 2) - 1;
    const centro2 = Math.floor(size / 2);

    if (this.esCentro(fila, columna, centro1, centro2)) {
      return CasillaTypeEnum.CENTRAL;
    } else if (this.esFinal(fila, columna, centro1, centro2, size)) {
      return CasillaTypeEnum.FINAL;
    } else if (this.esInicio(fila, columna, centro1, centro2, size)) {
      return CasillaTypeEnum.INICIO;
    } else if (this.esSalida(fila, columna, centro1, centro2)) {
      // Verificar si es salida
      return CasillaTypeEnum.SALIDA; // Añadir lógica de salida
    } else if (this.esTriangulo(fila, columna, size, centro1, centro2)) {
      return CasillaTypeEnum.TRIANGULO;
    } else {
      return CasillaTypeEnum.NORMAL;
    }
  }

  // Métodos para determinar el tipo de casilla basado en la posición
  private esCentro(
    fila: number,
    columna: number,
    centro1: number,
    centro2: number,
  ): boolean {
    return (
      (fila === centro1 || fila === centro2) &&
      (columna === centro1 || columna === centro2)
    );
  }
  private esSalida(
    fila: number,
    columna: number,
    centro1: number,
    centro2: number,
  ): boolean {
    // Aquí defines tus condiciones para determinar si es salida
    // Por ejemplo, podría ser que esté en una de las esquinas
    return (
      (columna === centro1 && fila === centro1 - 1) || // Esquinas superiores
      (fila === centro1 && columna === centro2 + 1) || // Esquinas inferiores
      (fila === centro2 + 1 && columna === centro2) || // Esquinas inferiores
      (fila === centro2 && columna === centro1 - 1) // Esquinas inferiores
    );
  }
  private esFinal(
    fila: number,
    columna: number,
    centro1: number,
    centro2: number,
    size: number,
  ): boolean {
    return (
      (fila === 0 && columna === centro2) ||
      (fila === centro1 && columna === size - 1) ||
      (fila === size - 1 && columna === centro1) ||
      (fila === centro2 && columna === 0)
    );
  }

  private esInicio(
    fila: number,
    columna: number,
    centro1: number,
    centro2: number,
    size: number,
  ): boolean {
    return (
      (fila === size - 1 && columna === centro2) ||
      (fila === centro1 && columna === 0) ||
      (fila === centro2 && columna === size - 1) ||
      (fila === 0 && columna === centro1)
    );
  }
  private esSemicircular(
    fila: number,
    columna: number,
    centro1: number,
    centro2: number,
    size: number,
  ): boolean {
    return (
      (fila == 0 && (columna == centro1 || columna == centro2)) ||
      (fila == size - 1 && (columna == centro1 || columna == centro2)) ||
      (columna == 0 && (fila == centro1 || fila == centro2)) ||
      (columna == size - 1 && (fila == centro1 || fila == centro2))
    );
  }

  private esTriangulo(
    fila: number,
    columna: number,
    size: number,
    centro1: number,
    centro2: number,
  ): boolean {
    return (
      (fila === 2 && (columna === centro1 || columna === centro2)) ||
      (fila === size - 3 && (columna === centro1 || columna === centro2)) ||
      (columna === 2 && (fila === centro1 || fila === centro2)) ||
      (columna === size - 3 && (fila === centro1 || fila === centro2))
    );
  }

  // Determinar la orientación de la casilla según su posición
  private getOrientacion(
    fila: number,
    columna: number,
    size: number,
  ): OrientacionCasilla {
    const centro1 = Math.floor(size / 2) - 1;
    const centro2 = Math.floor(size / 2);

    if (fila == centro1 && columna <= centro1) {
      return OrientacionCasilla.IzquierdaSuperior;

      // Condiciones para IzquierdaSuperior
    }

    if (fila == centro2 && columna <= centro1) {
      return OrientacionCasilla.IzquierdaInferior;

      // Condiciones para IzquierdaInferior
    }
    if (fila == centro1 && columna >= centro1) {
      return OrientacionCasilla.DerechaSuperior;

      // Condiciones para DerechaSuperior
    }

    if (fila == centro2 && columna >= centro1) {
      return OrientacionCasilla.DerechaInferior;

      // Condiciones para DerechaInferior
    }

    // Condiciones para SuperiorIzquierda
    if (fila <= centro1 && columna <= centro1) {
      return OrientacionCasilla.SuperiorIzquierda;

      // Condiciones para SuperiorDerecha
    } else if (fila <= centro1 && columna >= centro2) {
      return OrientacionCasilla.SuperiorDerecha;

      // Condiciones para InferiorIzquierda
    } else if (fila >= centro2 && columna <= centro1) {
      return OrientacionCasilla.InferiorIzquierda;

      // Condiciones para InferiorDerecha
    } else {
      return OrientacionCasilla.InferiorDerecha;
    }
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
  ingresarFicha(ficha: FichaModel, idJugador: number): FichaModel {
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
