import { Jugador, Ficha } from '@prisma/client';
import { FichaModel } from './FichaModel';

export class JugadorModel {
  public fichas: FichaModel[] = [];
  public turnoFicha: number = 0;
  public id: number;
  public nombre: string;
  public color: string;
  public fondoApuesta: number;
  public haPerdido: boolean = false;
  public isDisconnect: boolean = false;
  // constructor para crear envace a parametros

  constructor(data: Jugador) {
    this.id = data?.id;
    this.nombre = data.nombre;
    this.color = data.color;
    this.fondoApuesta = data.fondoApuesta;
    this.fichas = data.fichas?.map((ficha) => new FichaModel(ficha));
    this.haPerdido = data.haPerdido;
    this.turnoFicha = data.turnoFicha;
    this.isDisconnect = data.isDisconnect;
  }

  // Buscar una ficha por su ID
  buscarFichaPorId(idFicha: number): FichaModel | undefined {
    return this.fichas.find((f) => f.id === idFicha);
  }

  public crearFichas(fichasTotales: number) {
    this.fichas = Array.from({ length: fichasTotales }, (_, index) => {
      const ficha: Ficha = {
        id: index + 1,
        color: this.color,
        eliminada: false,
        posicion: null,
        casillasAvanzadas: 0,
      };
      return new FichaModel(ficha);
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
      isDisconnect: this.isDisconnect,
    };
  }
}
