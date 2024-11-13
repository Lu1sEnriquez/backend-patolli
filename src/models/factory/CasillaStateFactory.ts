import { CasillaTypeEnum } from '@prisma/client';
import { ICasillaState } from 'src/interface/ICasillaState';
import { ICasillaStateFactory } from 'src/interface/ICasillaStateFactory';
import { NormalCasillaState } from '../state/NormalCasillaState';
import { TrianguloCasillaState } from '../state/TrianguloCasillaState';
import { CentralCasillaState } from '../state/CentralCasillaState';
import { InicioCasillaState } from '../state/InicioCasillaState';
import { FinalCasillaState } from '../state/FinalCasillaState';
import { SalidaCasillaState } from '../state/SalidaCasillaState';
import { SemicircularCasillaState } from '../state/SemicircularCasillaState';
import { OcultaCasillaState } from '../state/OcultaCasillaState';

export class CasillaStateFactory implements ICasillaStateFactory {
  // Usamos el patrón Singleton para asegurar una única instancia
  private static instance: CasillaStateFactory;

  // Constructor privado para prevenir creación directa de instancias
  private constructor() {}

  // Método para obtener la instancia única
  public static getInstance(): CasillaStateFactory {
    if (!CasillaStateFactory.instance) {
      CasillaStateFactory.instance = new CasillaStateFactory();
    }
    return CasillaStateFactory.instance;
  }

  // Método factory para crear los estados
  public createState(tipo: CasillaTypeEnum): ICasillaState {
    switch (tipo) {
      case CasillaTypeEnum.NORMAL:
        return new NormalCasillaState();
      case CasillaTypeEnum.TRIANGULO:
        return new TrianguloCasillaState();
      case CasillaTypeEnum.CENTRAL:
        return new CentralCasillaState();
      case CasillaTypeEnum.INICIO:
        return new InicioCasillaState();
      case CasillaTypeEnum.FINAL:
        return new FinalCasillaState();
      case CasillaTypeEnum.SALIDA:
        return new SalidaCasillaState();
      case CasillaTypeEnum.SEMICIRCULAR:
        return new SemicircularCasillaState();
      case CasillaTypeEnum.OCULTA:
        return new OcultaCasillaState();
      default:
        throw new Error(`Tipo de casilla no soportado: ${tipo}`);
    }
  }
}
