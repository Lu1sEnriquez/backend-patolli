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

  // Método para seleccionar la próxima ficha en orden de entrada
  getProximaFicha(meta: number): FichaModel | undefined {
    const totalFichas = this.fichas.length;

    // Si no hay fichas, retornamos undefined
    if (totalFichas === 0) return undefined;

    // Comenzamos desde la posición actual
    for (let i = 0; i < totalFichas; i++) {
      // Calculamos el índice de la próxima ficha a seleccionar
      const index = (this.turnoFicha + i) % totalFichas;
      const ficha = this.fichas[index];

      // Verificamos que la ficha no esté eliminada y que no haya alcanzado la meta
      if (!ficha.eliminada && !ficha.haAlcanzadoMeta(meta)) {
        // Actualizamos turnoFicha para la próxima selección
        this.turnoFicha = (index + 1) % totalFichas;
        return ficha; // Retornamos la ficha encontrada
      }
    }

    // Si todas las fichas han alcanzado la meta, retornamos undefined
    return undefined;
  }

  public crearFichas(fichasTotales: number) {
    this.fichas = Array.from({ length: fichasTotales }, (_, index) => {
      const ficha: Ficha = {
        id: index,
        color: this.color,
        eliminada: false,
        posicion: null,
        casillasAvanzadas: 0,
      };
      return new FichaModel(ficha);
    });
  }

  public pagarApuesta(monto: number) {
    this.fondoApuesta -= monto;

    if (this.fondoApuesta <= 0) {
      this.haPerdido = false;
    }

    return this.getData();
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
