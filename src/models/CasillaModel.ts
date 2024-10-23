import {
  Casilla,
  CasillaTypeEnum,
  Coordenadas,
  Ficha,
  OrientacionCasilla,
} from '@prisma/client';

export class CasillaModel {
  public id: number;
  public ocupante: Ficha | null;
  public orientacion: OrientacionCasilla;
  public posicion: Coordenadas;
  public tipo: CasillaTypeEnum;

  constructor(casillaData: Casilla) {
    this.id = casillaData.id;
    this.ocupante = casillaData.ocupante;
    this.orientacion = casillaData.orientacion;
    this.posicion = casillaData.posicion;
    this.tipo = casillaData.tipo;
  }

  // Método para calcular la nueva casilla sumando la cantidad
  calcularNuevaCasilla(cantidad: number): number {
    return this.id + cantidad;
  }

  // Verificar si la casilla está ocupada
  estaOcupada(): boolean {
    return this.ocupante !== null;
  }

  getData(): Casilla {
    return {
      id: this.id,
      ocupante: this.ocupante,
      orientacion: this.orientacion,
      posicion: {
        X: this.posicion.X,
        Y: this.posicion.Y,
      },
      tipo: this.tipo,
    };
  }
}
