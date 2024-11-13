import { ICasillaState } from 'src/interface/ICasillaState';
import { CasillaModel } from '../CasillaModel';
import { FichaModel } from '../FichaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class NormalCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    return !casilla.estaOtroJugador(ficha);
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.NORMAL;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes.push(ficha);
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes = casilla.ocupantes.filter((f) => f.id !== ficha.id);
  }
}
