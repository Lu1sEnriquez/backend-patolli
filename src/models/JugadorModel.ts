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

  getNextTurno(): FichaModel | undefined {
    // Filtramos las fichas que no están eliminadas
    const fichasActivas = this.fichas.filter((ficha) => !ficha.eliminada);

    // Si no hay fichas activas, no podemos continuar con el turno
    if (fichasActivas.length === 0) return undefined;

    // Calculamos la siguiente ficha válida que puede avanzar
    let nextIndex = this.turnoFicha + 1;
    if (nextIndex >= fichasActivas.length) {
      nextIndex = 0; // Reiniciamos el índice si llegamos al final
    }

    let fichaEnTurno = fichasActivas[nextIndex];

    // Avanzamos al siguiente turno si la ficha está eliminada
    while (
      fichaEnTurno &&
      fichaEnTurno.eliminada &&
      fichaEnTurno.casillasAvanzadas == 0
    ) {
      nextIndex = (nextIndex + 1) % fichasActivas.length; // Buscar la siguiente ficha activa
      fichaEnTurno = fichasActivas[nextIndex];
    }

    // Actualizamos el turno y retornamos la ficha que puede avanzar
    this.turnoFicha = fichaEnTurno ? fichaEnTurno.id : this.turnoFicha;
    return fichaEnTurno;
  }
  getProximaFicha(cantidad: number, meta: number): FichaModel | undefined {
    // Si no hay ninguna ficha ingresada, retornamos la primera ficha que debe entrar (solo si la cantidad es 1)
    const fichaIngresada = this.fichas.find((ficha) => ficha.posicion !== null);

    // Si ninguna ficha ha ingresado al tablero, la primera ficha entra (solo si el dado es 1)
    if (!fichaIngresada) {
      if (cantidad === 1) {
        return this.fichas[0]; // La primera ficha entra al tablero
      } else {
        return undefined; // Si no es 1, no avanza ninguna ficha
      }
    }

    // Si ya hay fichas en el tablero, buscamos la ficha más cercana a la meta
    if (cantidad === 1) {
      const fichaCercaDeMeta = this.fichas.find(
        (ficha) => ficha.casillasAvanzadas === meta - 1 && !ficha.eliminada,
      );
      if (fichaCercaDeMeta) {
        return fichaCercaDeMeta; // Avanzamos la ficha cerca de la meta
      }

      // // Si no hay ninguna ficha cerca de la meta, avanzamos la que está en la primera casilla
      // const fichaEnPrimeraCasilla = this.fichas.find(
      //   (ficha) => ficha.casillasAvanzadas === 1,
      // );
      // if (fichaEnPrimeraCasilla) {
      //   return fichaEnPrimeraCasilla; // Avanzamos la ficha en la primera casilla
      // }
    }

    // Si no se cumple la condición de 1, devolvemos la siguiente ficha en el turno
    return this.getNextTurno();
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
