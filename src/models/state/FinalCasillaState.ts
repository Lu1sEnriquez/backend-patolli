import { ICasillaState } from 'src/interface/ICasillaState';
import { FichaModel } from '../FichaModel';
import { CasillaModel } from '../CasillaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class FinalCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    // Solo permite entrada si la ficha ha recorrido el número exacto de casillas necesarias
    const casillasNecesarias = casilla.getMeta(); // Debes implementar este método en CasillaModel
    return ficha.casillasAvanzadas === casillasNecesarias;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.FINAL;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes.push(ficha);
    ficha.haLlegadoAMeta = true; // Debes agregar esta propiedad a FichaModel
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    // Las fichas no deberían salir de la casilla final
    throw new Error('No se puede salir de una casilla final');
  }
}
