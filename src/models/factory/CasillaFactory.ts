import { ICasillaStateFactory } from 'src/interface/ICasillaStateFactory';
import { CasillaTypeEnum } from '@prisma/client';
import { ICasillaState } from 'src/interface/ICasillaState';
import { NormalCasillaState } from '../state/NormalCasillaState';
import { TrianguloCasillaState } from '../state/TrianguloCasillaState';
import { CentralCasillaState } from '../state/CentralCasillaState';

class CasillaStateFactory implements ICasillaStateFactory {
  createState(tipo: CasillaTypeEnum): ICasillaState {
    switch (tipo) {
      case CasillaTypeEnum.NORMAL:
        return new NormalCasillaState();
      case CasillaTypeEnum.TRIANGULO:
        return new TrianguloCasillaState();
      case CasillaTypeEnum.CENTRAL:
        return new CentralCasillaState();
      // Agregar más casos según necesites...
      default:
        return new NormalCasillaState();
    }
  }
}
