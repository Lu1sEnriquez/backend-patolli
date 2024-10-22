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
