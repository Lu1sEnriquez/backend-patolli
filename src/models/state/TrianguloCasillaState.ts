import { ICasillaState } from 'src/interface/ICasillaState';
import { CasillaModel } from '../CasillaModel';
import { FichaModel } from '../FichaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class TrianguloCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    if (casilla.estaOtroJugador(ficha)) {
      casilla.eliminarFichasOcupantes();
    }
    return true;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.TRIANGULO;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes.push(ficha);
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes = casilla.ocupantes.filter((f) => f.id !== ficha.id);
  }
}
