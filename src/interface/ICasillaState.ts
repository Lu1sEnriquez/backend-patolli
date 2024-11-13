import { Casilla, CasillaTypeEnum } from '@prisma/client';
import { CasillaModel } from 'src/models/CasillaModel';
import { FichaModel } from 'src/models/FichaModel';

export interface ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean;
  getStateType(): CasillaTypeEnum;
  onEnter(casilla: CasillaModel, ficha: FichaModel): void;
  onExit(casilla: CasillaModel, ficha: FichaModel): void;
}

