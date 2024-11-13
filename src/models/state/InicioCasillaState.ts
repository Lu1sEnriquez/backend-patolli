import { ICasillaState } from 'src/interface/ICasillaState';
import { CasillaModel } from '../CasillaModel';
import { FichaModel } from '../FichaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class InicioCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    // En casilla de inicio solo pueden estar fichas del mismo color
    const puedeEntrar = !casilla.ocupantes.some((f) => f.color !== ficha.color);
    return puedeEntrar;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.INICIO;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    // Cuando una ficha entra a su casilla de inicio
    ficha.casillasAvanzadas = 0; // Reinicia el contador de casillas
    casilla.ocupantes.push(ficha);
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes = casilla.ocupantes.filter((f) => f.id !== ficha.id);
    ficha.casillasAvanzadas = 1; // Comienza a contar su avance
  }
}
