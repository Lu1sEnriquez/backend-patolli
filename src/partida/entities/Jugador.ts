import { Jugador } from '@prisma/client';
import { FichaClass } from './Ficha';

export class JugadorClass {
  public fichas: FichaClass[] = [];
  public turnoFicha: number = 0;
  public id: number;
  public nombre: string;
  public color: string;
  public fondoApuesta: number;
  public haPerdido: boolean = false;
  // constructor para crear envace a parametros

  constructor(data: Jugador) {
    this.id = data?.id;
    this.nombre = data.nombre;
    this.color = data.color;
    this.fondoApuesta = data.fondoApuesta;
    this.fichas = data.fichas?.map((ficha) => new FichaClass(ficha));
    this.haPerdido = data.haPerdido;
    this.turnoFicha = data.turnoFicha;
  }

  public crearFichas(fichasTotales: number) {
    this.fichas = Array.from({ length: fichasTotales }, (_, index) => {
      const ficha = {
        id: index + 1,
        color: this.color,
        eliminada: false,
        posicion: null,
      };
      return new FichaClass(ficha);
    });
  }

  getData(): Jugador {
    return {
      id: this.id,
      nombre: this.nombre,
      color: this.color,
      fondoApuesta: this.fondoApuesta,
      haPerdido: this.haPerdido,
      turnoFicha: this.turnoFicha,
      fichas: this.fichas.map((ficha) => ficha.getData()), // Mapeamos los datos de las fichas también
    };
  }
}
