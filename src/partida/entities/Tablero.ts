import { CasillaTypeEnum, OrientacionCasilla, Tablero } from '@prisma/client';
import { CasillaClass } from './Casilla';

export class TableroClass {
  casillas: CasillaClass[];
  numeroCasillasPorAspa: number;

  constructor(tablero: Tablero) {
    this.numeroCasillasPorAspa = tablero?.numeroCasillasPorAspa;
    this.casillas = tablero.casillas?.map(
      (casilla) => new CasillaClass(casilla),
    );
  }

  public generarCasillas(
    size: number = this.numeroCasillasPorAspa,
  ): CasillaClass[] {
    let id = 0;
    const casillas: CasillaClass[] = [];
    for (let fila = 0; fila < size; fila++) {
      for (let columna = 0; columna < size; columna++) {
        const tipo = this.getTipoCasilla(size, fila, columna);
        const orientacion = this.getOrientacion(size, fila, columna);

        if (this.esCasillaDeCruz(size, fila, columna)) {
          // crear casilla
          const casilla = new CasillaClass({
            id: id++,
            ocupanteId: null,
            orientacion: orientacion,
            posicion: { X: columna, Y: fila },
            tipo: tipo,
          });
          casillas.push(casilla);
        } else {
          const casillaVacia = new CasillaClass({
            id: null,
            ocupanteId: null,
            orientacion: orientacion,
            posicion: { X: columna, Y: fila },
            tipo: CasillaTypeEnum.OCULTA,
          });
          casillas.push(casillaVacia);
        }
      }
    }
    this.casillas = casillas;
    return casillas;
  }

  private esCasillaDeCruz(
    size: number,
    fila: number,
    columna: number,
  ): boolean {
    const medio = size / 2;
    return (
      (fila >= medio - 1 && fila <= medio) ||
      (columna >= medio - 1 && columna <= medio) ||
      (fila >= 0 && fila < medio - 1 && columna === medio - 1) ||
      (fila > medio && fila < size && columna === medio - 1) ||
      (columna >= 0 && columna < medio - 1 && fila === medio - 1) ||
      (columna > medio && columna < size && fila === medio - 1)
    );
  }

  private esCasillaCentro(
    size: number,
    fila: number,
    columna: number,
  ): boolean {
    const medio = size / 2;
    return (
      (fila === medio - 1 || fila === medio) &&
      (columna === medio - 1 || columna === medio)
    );
  }

  private esCasillaFinal(size: number, fila: number, columna: number): boolean {
    const medio = size / 2;
    return (
      (fila === size - 1 && columna === medio - 1) ||
      (fila === 0 && columna === medio) ||
      (fila === medio - 1 && columna === 0) ||
      (fila === medio && columna === size - 1)
    );
  }

  private esCasillaInicio(
    size: number,
    fila: number,
    columna: number,
  ): boolean {
    const medio = size / 2;
    return (
      (fila === size - 1 && columna === medio) ||
      (fila === 0 && columna === medio - 1) ||
      (fila === medio && columna === 0) ||
      (fila === medio - 1 && columna === size - 1)
    );
  }

  private esCasillaTriangulo(
    size: number,
    fila: number,
    columna: number,
  ): boolean {
    const medio = size / 2;
    return (
      (fila === size - 3 && columna === medio - 1) ||
      (fila === size - 3 && columna === medio) ||
      (fila === medio - 1 && columna === size - 3) ||
      (fila === medio && columna === size - 3) ||
      (fila === 2 && columna === medio - 1) ||
      (fila === 2 && columna === medio) ||
      (fila === medio - 1 && columna === 2) ||
      (fila === medio && columna === 2)
    );
  }

  private esCasillaSalida(
    size: number,
    fila: number,
    columna: number,
  ): boolean {
    const medio = size / 2;
    return (
      (fila === medio - 2 && columna === medio) ||
      (fila === medio && columna === medio + 1) ||
      (fila === medio - 1 && columna === medio - 2) ||
      (fila === medio + 1 && columna === medio - 1)
    );
  }

  private getTipoCasilla(
    size: number,
    fila: number,
    columna: number,
  ): CasillaTypeEnum {
    if (this.esCasillaCentro(size, fila, columna))
      return CasillaTypeEnum.CENTRAL;
    if (this.esCasillaFinal(size, fila, columna)) return CasillaTypeEnum.FINAL;
    if (this.esCasillaInicio(size, fila, columna))
      return CasillaTypeEnum.INICIO;
    if (this.esCasillaTriangulo(size, fila, columna))
      return CasillaTypeEnum.TRIANGULO;
    if (this.esCasillaSalida(size, fila, columna))
      return CasillaTypeEnum.SALIDA;
    if (this.esCasillaSalida(size, fila, columna))
      return CasillaTypeEnum.SALIDA;
    return CasillaTypeEnum.NORMAL;
  }

  private getOrientacion(
    size: number,
    fila: number,
    columna: number,
  ): OrientacionCasilla {
    const medio = size / 2;

    // Casillas en el brazo izquierdo
    if (fila === medio - 1 && columna < medio)
      return OrientacionCasilla.IzquierdaSuperior;
    if (fila === medio && columna < medio)
      return OrientacionCasilla.IzquierdaInferior;

    // Casillas en el brazo derecho
    if (fila === medio - 1 && columna > medio)
      return OrientacionCasilla.DerechaSuperior;
    if (fila === medio && columna > medio)
      return OrientacionCasilla.DerechaInferior;

    // Casillas en el brazo superior
    if (fila < medio && columna === medio - 1)
      return OrientacionCasilla.SuperiorIzquierda;
    if (fila < medio && columna === medio)
      return OrientacionCasilla.SuperiorDerecha;

    // Casillas en el brazo inferior
    if (fila > medio && columna === medio - 1)
      return OrientacionCasilla.InferiorIzquierda;
    if (fila > medio && columna === medio)
      return OrientacionCasilla.InferiorDerecha;

    return OrientacionCasilla.InferiorDerecha; // Orientación por defecto
  }

  getData(): Tablero {
    return {
      numeroCasillasPorAspa: this.numeroCasillasPorAspa,
      casillas: this.casillas?.map((casilla) => casilla.getData()),
    };
  }
}
