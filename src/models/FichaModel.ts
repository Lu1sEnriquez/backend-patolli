import { Coordenadas, Ficha } from '@prisma/client';

export class FichaModel {
  public id: number;
  public color: string;
  public eliminada: boolean = false;
  public posicion: Coordenadas | null;
  public casillasAvanzadas: number;
  public haLlegadoAMeta: boolean;
  public regresarAInicio: boolean;

  constructor(data: Ficha) {
    this.id = data.id;
    this.color = data.color;
    this.eliminada = data.eliminada;
    this.posicion = data.posicion;
    this.casillasAvanzadas = data.casillasAvanzadas;

    this.haLlegadoAMeta = data.haLlegadoAMeta || false;
    this.regresarAInicio = data.regresarAInicio || false;
  }

  avanzar(cantidad: number): void {
    this.casillasAvanzadas += cantidad;
  }

  dentroDelTablero(): boolean {
    return this.casillasAvanzadas > 0;
  }

  fichaCercaDeMeta(meta: number): boolean {
    return this.casillasAvanzadas === meta - 1 && !this.eliminada;
  }

  haAlcanzadoMeta(meta: number): boolean {
    return this.casillasAvanzadas >= meta;
  }

  getData(): any {
    return {
      id: this.id,
      color: this.color,
      posicion: this.posicion,
      casillasAvanzadas: this.casillasAvanzadas,
      haLlegadoAMeta: this.haLlegadoAMeta,
      regresarAInicio: this.regresarAInicio,
    };
  }
}
