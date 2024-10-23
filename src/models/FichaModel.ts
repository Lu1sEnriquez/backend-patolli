import { Coordenadas, Ficha } from '@prisma/client';

export class FichaModel {
  public id: number;
  public color: string;
  public eliminada: boolean = false;
  public posicion: Coordenadas | null;
  public casillasAvanzadas: number;

  constructor(data: Ficha) {
    this.id = data.id;
    this.color = data.color;
    this.eliminada = data.eliminada;
    this.posicion = data.posicion;
    this.casillasAvanzadas = data.casillasAvanzadas;
  }

  avanzar(cantidad: number): void {
    this.casillasAvanzadas += cantidad;
  }

  haAlcanzadoMeta(meta: number): boolean {
    return this.casillasAvanzadas >= meta;
  }

  getData(): Ficha {
    return {
      id: this.id,
      color: this.color,
      eliminada: this.eliminada,
      posicion: this.posicion,
      casillasAvanzadas: this.casillasAvanzadas,
    };
  }
}
