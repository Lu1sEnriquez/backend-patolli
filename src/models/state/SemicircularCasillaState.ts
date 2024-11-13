import { ICasillaState } from 'src/interface/ICasillaState';
import { CasillaModel } from '../CasillaModel';
import { FichaModel } from '../FichaModel';
import { CasillaTypeEnum } from '@prisma/client';

export class SemicircularCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    // Las casillas semicirculares pueden tener reglas especiales
    // Por ejemplo, pueden permitir que la ficha cambie de dirección
    return true;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.SEMICIRCULAR;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes.push(ficha);
    // Aquí podrías implementar lógica especial para el cambio de dirección
    // Por ejemplo, permitir que el jugador elija una nueva dirección
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes = casilla.ocupantes.filter((f) => f.id !== ficha.id);
  }
}
