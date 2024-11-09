import {
  Casilla,
  CasillaTypeEnum,
  Coordenadas,
  OrientacionCasilla,
} from '@prisma/client';
import { FichaModel } from './FichaModel';

export class CasillaModel {
  public id: number;
  public ocupantes: FichaModel[];
  public orientacion: OrientacionCasilla;
  public posicion: Coordenadas;
  public tipo?: CasillaTypeEnum;

  constructor(casillaData: Casilla) {
    this.id = casillaData.id;
    this.ocupantes =
      casillaData.ocupantes?.map((ficha) => new FichaModel(ficha)) || [];
    this.orientacion = casillaData.orientacion;
    this.posicion = casillaData.posicion;
    this.tipo = casillaData.tipo;
  }

  // Verificar si la casilla está ocupada
  estaOtroJugador(ficha: FichaModel): boolean {
    return (
      this.ocupantes.length > 0 &&
      !this.ocupantes.every((f) => f.color == ficha.color)
    );
  }

  eliminarFichasOcupantes() {
    this.ocupantes = [];
  }

  getData(): Casilla {
    return {
      id: this.id,
      ocupantes: this.ocupantes.map((ficha) => ficha.getData()),
      orientacion: this.orientacion,
      posicion: {
        X: this.posicion.X,
        Y: this.posicion.Y,
      },
      tipo: this.tipo,
    };
  }
}
