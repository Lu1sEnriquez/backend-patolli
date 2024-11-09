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

  getNextTurno(meta: number, cantidad: number): FichaModel | undefined {
    // Filtramos las fichas que no están eliminadas
    const fichasActivas = this.fichas.filter((ficha) => !ficha.eliminada);

    // Si no hay fichas activas, no podemos continuar con el turno
    if (fichasActivas.length === 0) return undefined;

    // Inicializamos el índice del siguiente turno
    let nextIndex = (this.turnoFicha + 1) % fichasActivas.length;
    let fichaEnTurno = fichasActivas[nextIndex];
    let intentos = 0; // Contador para prevenir el bucle infinito

    // Avanzamos al siguiente turno si la ficha está eliminada, no está en el tablero o ya alcanzó la meta
    while (
      fichaEnTurno &&
      (fichaEnTurno.eliminada ||
        !fichaEnTurno.dentroDelTablero() ||
        fichaEnTurno.haAlcanzadoMeta(meta) ||
        fichaEnTurno.casillasAvanzadas + cantidad >= meta)
    ) {
      nextIndex = (nextIndex + 1) % fichasActivas.length;
      fichaEnTurno = fichasActivas[nextIndex];

      // Incrementamos el contador y verificamos si hemos intentado todas las fichas
      intentos++;
      if (intentos >= fichasActivas.length) {
        // Si hemos recorrido todas las fichas sin encontrar una válida, salimos del bucle
        return undefined;
      }
    }

    // Actualizamos el turno a la ficha válida encontrada
    this.turnoFicha = fichaEnTurno ? fichaEnTurno.id : this.turnoFicha;
    return fichaEnTurno;
  }

  getProximaFicha(cantidad: number, meta: number): FichaModel | undefined {
    // buscamos la más cercana a la meta.
    const fichaCercaDeMeta = this.fichas.find((ficha) =>
      ficha.fichaCercaDeMeta(meta),
    );

    // Si la cantidad es 1 y alguna ficha no ha ingresado al tablero, retornamos la primera ficha no ingresada.
    if (cantidad === 1 && fichaCercaDeMeta) {
      return fichaCercaDeMeta; // Retorna la ficha más cercana a la meta
    }

    const fichaNoIngresada = this.fichas.find(
      (ficha) => !ficha.dentroDelTablero(),
    );

    if (cantidad === 1 && fichaNoIngresada) {
      return fichaNoIngresada; // Retorna la primera ficha no ingresada
    }

    // Si no se cumple la condición de 1, devolvemos la siguiente ficha en el turno
    return this.getNextTurno(meta, cantidad);
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

  gano(meta: number): boolean {
    return this.fichas.every((ficha) => ficha.haAlcanzadoMeta(meta));
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
