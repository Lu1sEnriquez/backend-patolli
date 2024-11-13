import { ICasillaState } from 'src/interface/ICasillaState';
import { CasillaModel } from '../CasillaModel';
import { FichaModel } from '../FichaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class CentralCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    // Las casillas centrales pueden tener reglas especiales
    return true;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.CENTRAL;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes.push(ficha);
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes = casilla.ocupantes.filter((f) => f.id !== ficha.id);
  }
}
