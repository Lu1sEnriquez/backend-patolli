import { ICasillaState } from "src/interface/ICasillaState";
import { FichaModel } from "../FichaModel";
import { CasillaModel } from "../CasillaModel";
import { CasillaTypeEnum } from "@prisma/client";

export class SalidaCasillaState implements ICasillaState {
  handleFichaMovement(casilla: CasillaModel, ficha: FichaModel): boolean {
    // En casillas de salida, verificar si la ficha puede salir (por ejemplo, según el resultado de los dados)
    if (casilla.estaOtroJugador(ficha)) {
      // Si hay otro jugador, la ficha debe ser eliminada o devuelta al inicio
      ficha.regresarAInicio = true; // Debes agregar esta propiedad a FichaModel
      return false;
    }
    return true;
  }

  getStateType(): CasillaTypeEnum {
    return CasillaTypeEnum.SALIDA;
  }

  onEnter(casilla: CasillaModel, ficha: FichaModel): void {
    if (casilla.ocupantes.length > 0) {
      // Si hay otras fichas, se devuelven a su inicio
      casilla.ocupantes.forEach((f) => {
        f.regresarAInicio = true;
      });
      casilla.eliminarFichasOcupantes();
    }
    casilla.ocupantes.push(ficha);
  }

  onExit(casilla: CasillaModel, ficha: FichaModel): void {
    casilla.ocupantes = casilla.ocupantes.filter((f) => f.id !== ficha.id);
  }
}
