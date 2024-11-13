import { ICasillaState } from 'src/interface/ICasillaState';
import { CasillaModel } from '../CasillaModel';
import { FichaModel } from '../FichaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class OcultaCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    // Las casillas ocultas no deberían permitir que las fichas se detengan en ellas
    return false;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.OCULTA;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    // Las casillas ocultas no deberían almacenar fichas
    throw new Error('No se puede entrar en una casilla oculta');
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    // No debería ser necesario, pero por completitud
    throw new Error('No se puede salir de una casilla oculta');
  }
}
