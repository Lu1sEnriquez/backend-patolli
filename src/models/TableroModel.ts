import { CasillaTypeEnum, OrientacionCasilla, Tablero } from '@prisma/client';
import { CasillaModel } from './CasillaModel';

export class TableroModel {
  casillas: CasillaModel[];
  numeroCasillasPorAspa: number;

  constructor(tablero: Tablero) {
    this.numeroCasillasPorAspa = tablero?.numeroCasillasPorAspa || 0;
    this.casillas =
      tablero?.casillas?.map((casilla) => new CasillaModel(casilla)) || [];
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
  public generarCasillas(
    size: number = this.numeroCasillasPorAspa,
  ): CasillaModel[] {
    const puntosCruz = this.generarPuntosCruz(size);
    const casillas: CasillaModel[] = [];

    puntosCruz.forEach((punto, index) => {
      const tipo = this.getTipoCasilla(punto.X, punto.Y, size);
      const orientacion = this.getOrientacion(punto.X, punto.Y, size);
      const casilla = new CasillaModel({
        id: index,
        ocupanteId: null,
        orientacion,
        posicion: { X: punto.X, Y: punto.Y },
        tipo,
      });

      casillas.push(casilla);
    });

    this.casillas = casillas;
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

  // Obtener datos del tablero
  getData(): Tablero {
    return {
      numeroCasillasPorAspa: this.numeroCasillasPorAspa,
      casillas: this.casillas?.map((casilla) => casilla.getData()),
    };
  }
}
