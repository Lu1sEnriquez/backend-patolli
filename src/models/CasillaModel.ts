import {
  Casilla,
  CasillaTypeEnum,
  Coordenadas,
  OrientacionCasilla,
} from '@prisma/client';

export class CasillaModel {
  public id: number;
  public ocupanteId: number | null;
  public orientacion: OrientacionCasilla;
  public posicion: Coordenadas;
  public tipo: CasillaTypeEnum;

  constructor(casillaData: Casilla) {
    this.id = casillaData.id;
    this.ocupanteId = casillaData.ocupanteId;
    this.orientacion = casillaData.orientacion;
    this.posicion = casillaData.posicion;
    this.tipo = casillaData.tipo;
  }

  getData(): Casilla {
    return {
      id: this.id,
      ocupanteId: this.ocupanteId,
      orientacion: this.orientacion,
      posicion: {
        X: this.posicion.X,
        Y: this.posicion.Y,
      },
      tipo: this.tipo,
    };
  }
}
