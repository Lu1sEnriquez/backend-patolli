import { CasillaTypeEnum } from '@prisma/client';
import { ICasillaState } from './ICasillaState';

export interface ICasillaStateFactory {
  createState(tipo: CasillaTypeEnum): ICasillaState;
}
