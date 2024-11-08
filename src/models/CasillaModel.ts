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

  // Método para calcular la nueva casilla sumando la cantidad
  calcularNuevaCasilla(cantidad: number): number {
    return this.id + cantidad;
  }

  // Verificar si la casilla está ocupada
  estaOcupada(): boolean {
    return this.ocupantes !== null;
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
