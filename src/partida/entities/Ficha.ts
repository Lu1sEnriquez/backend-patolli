import { Coordenadas, Ficha } from '@prisma/client';

export class FichaClass {
  public id: number;
  public color: string;
  public eliminada: boolean = false;
  public posicion: Coordenadas | null;
  constructor(data: Ficha) {
    this.id = data.id;
    this.color = data.color;
    this.eliminada = data.eliminada;
    this.posicion = data.posicion;
  }

  getData(): Ficha {
    return {
      id: this.id,
      color: this.color,
      eliminada: this.eliminada,
      posicion: this.posicion,
    };
  }
}
