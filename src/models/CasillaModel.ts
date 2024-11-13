import {
  Casilla,
  CasillaTypeEnum,
  Coordenadas,
  OrientacionCasilla,
} from '@prisma/client';
import { FichaModel } from './FichaModel';
import { ICasillaState } from 'src/interface/ICasillaState';
import { ICasillaStateFactory } from 'src/interface/ICasillaStateFactory';
import { CasillaStateFactory } from './factory/CasillaStateFactory';

export class CasillaModel {
  public id: number;
  public ocupantes: FichaModel[];
  public orientacion: OrientacionCasilla;
  public posicion: Coordenadas;
  public tipo?: CasillaTypeEnum;
  private state: ICasillaState;
  private meta?: number; // Nueva propiedad

  // Utilizamos el Singleton Factory
  private static stateFactory: ICasillaStateFactory =
    CasillaStateFactory.getInstance();

  constructor(casillaData: Casilla) {
    this.id = casillaData.id;
    this.ocupantes =
      casillaData.ocupantes?.map((ficha) => new FichaModel(ficha)) || [];
    this.orientacion = casillaData.orientacion;
    this.posicion = casillaData.posicion;
    // Usamos el factory para crear el estado apropiado
    this.state = CasillaModel.stateFactory.createState(casillaData.tipo);
    this.meta = casillaData.meta || 0; // Inicializar meta
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
      tipo: this.getTipo(),
      meta: this.meta,
    };
  }

  // Método para manejar el movimiento de fichas usando el estado
  puedeRecibirFicha(ficha: FichaModel): boolean {
    return this.state.handleFichaMovement(this, ficha);
  }

  // Métodos para el manejo de entrada y salida de fichas
  entrarFicha(ficha: FichaModel): void {
    this.state.onEnter(this, ficha);
  }

  salirFicha(ficha: FichaModel): void {
    this.state.onExit(this, ficha);
  }

  getTipo(): CasillaTypeEnum {
    return this.state.getStateType();
  }

  getMeta(): number {
    return this.meta;
  }
}
