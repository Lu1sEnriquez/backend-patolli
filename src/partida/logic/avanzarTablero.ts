import {
  Casilla,
  CasillaTypeEnum,
  Coordenadas,
  Jugador,
  OrientacionCasilla,
  Tablero,
} from '@prisma/client';

export enum Direcciones {
  ADELANTE = 'ADELANTE',
  ATRAS = 'ATRAS',
}

export function moverFicha(
  jugador: Jugador,
  fichaId: number,
  tablero: Tablero,
  direccion: Direcciones,
  jugadores: Jugador[],
): void {
  // Buscar la ficha dentro del jugador
  const ficha = jugador.fichas.find((ficha) => ficha.id === jugador.turnoFicha);

  if (!ficha || !ficha.posicion) {
    throw new Error('Ficha no encontrada o no está en el tablero.');
  }

  const casillaActual = obtenerCasillaPorPosicion(tablero, ficha.posicion);

  if (!casillaActual) {
    throw new Error('Casilla actual no encontrada.');
  }

  // Calcular la nueva posición basada en la orientación y el tipo de casilla
  const nuevaPosicion =
    direccion === Direcciones.ADELANTE
      ? calcularNuevaPosicion(
          casillaActual.posicion,
          casillaActual.orientacion,
          casillaActual.tipo,
        )
      : calcularNuevaPosicionHaciaAtras(
          casillaActual.posicion,
          casillaActual.orientacion,
          casillaActual.tipo,
        );

  if (!nuevaPosicion) {
    throw new Error('Movimiento no permitido para el tipo de casilla actual.');
  }

  // Validar si la nueva casilla está disponible (no está ocupada por otra ficha)
  if (hayFichaEnPosicion(jugadores, nuevaPosicion)) {
    throw new Error('Movimiento no permitido, la casilla está ocupada.');
  }

  // Actualizar la posición de la ficha en el jugador
  ficha.posicion = nuevaPosicion;

  // Aquí no es necesario modificar el tablero porque las fichas se manejan desde los jugadores
}

function hayFichaEnPosicion(
  jugadores: Jugador[],
  posicion: Coordenadas,
): boolean {
  // Verifica si alguna ficha de cualquier jugador está en la posición dada
  for (const jugador of jugadores) {
    for (const ficha of jugador.fichas) {
      if (
        ficha.posicion &&
        ficha.posicion.X === posicion.X &&
        ficha.posicion.Y === posicion.Y &&
        !ficha.eliminada // Asegúrate de que la ficha no esté eliminada
      ) {
        return true; // Hay una ficha en la posición
      }
    }
  }
  return false; // Ninguna ficha está en la posición
}

// logica con la propiedad casilla.ocupante
// export function moverFicha(
//   jugador: Jugador,
//   fichaId: string,
//   tablero: Tablero,
//   direccion: Direcciones
// ): Tablero {
//   const casilla = tablero.casillas.find(
//     (casilla) => casilla?.ocupante?.id === fichaId
//   );

//   if (!casilla?.ocupante || !casilla?.ocupante.posicion) {
//     throw new Error("Ficha no encontrada o no está en el tablero.");
//   }

//   const casillaActual = obtenerCasillaPorPosicion(
//     tablero,
//     casilla?.ocupante.posicion
//   );

//   if (!casillaActual) {
//     throw new Error("Casilla actual no encontrada.");
//   }

//   // Calcular la nueva posición basada en la orientación y el tipo de casilla

//   const nuevaPosicion =
//     direccion === Direcciones.ADELANTE
//       ? calcularNuevaPosicion(
//           casillaActual.posicion,
//           casillaActual.orientacion,
//           casillaActual.tipo
//         )
//       : calcularNuevaPosicionHaciaAtras(
//           casillaActual.posicion,
//           casillaActual.orientacion,
//           casillaActual.tipo
//         );
//   // alert(casilla.ocupante.posicion?.X + " " + casilla?.ocupante?.posicion?.Y);
//   // alert(
//   //   `Nueva posición calculada: X=${nuevaPosicion?.X}, Y=${nuevaPosicion?.Y}`
//   // );

//   if (!nuevaPosicion) {
//     throw new Error("Movimiento no permitido para el tipo de casilla actual.");
//   }

//   const nuevaCasilla = obtenerCasillaPorPosicion(tablero, nuevaPosicion);

//   if (!nuevaCasilla || nuevaCasilla.ocupante) {
//     throw new Error("Movimiento no permitido, la casilla está ocupada.");
//   }
//   // Actualizar el tablero moviendo la ficha
//   nuevaCasilla.ocupante = casilla.ocupante;
//   nuevaCasilla.ocupante.posicion = nuevaPosicion;
//   casilla.ocupante = null;

//   const indexNuevaCasilla = tablero.casillas.findIndex(
//     (c) => c?.posicion.X === nuevaPosicion.X && c.posicion.Y === nuevaPosicion.Y
//   );

//   const indexCasillaActual = tablero.casillas.findIndex(
//     (c) =>
//       c?.posicion.X === casillaActual.posicion.X &&
//       c.posicion.Y === casillaActual.posicion.Y
//   );

//   // Usar `splice` para reemplazar las casillas en el arreglo del tablero
//   tablero.casillas.splice(indexNuevaCasilla, 1, nuevaCasilla); // Reemplaza la casilla con la ficha movida
//   tablero.casillas.splice(indexCasillaActual, 1, casillaActual); // Reemplaza la casilla actual sin ficha

//   // No retornes el resultado de `splice`, sino el tablero completo
//   return {
//     ...tablero,
//     casillas: [...tablero.casillas], // Asegúrate de mantener el estado actualizado de las casillas
//   };
// }

function obtenerCasillaPorPosicion(
  tablero: Tablero,
  posicion: Coordenadas,
): Casilla | null {
  return (
    tablero.casillas.find(
      (c) => c?.posicion.X === posicion.X && c?.posicion.Y === posicion.Y,
    ) || null
  );
}

function calcularNuevaPosicion(
  posicionActual: Coordenadas,
  orientacion: OrientacionCasilla,
  tipoCasilla: CasillaTypeEnum,
): Coordenadas | null {
  let nuevaPosicion: Coordenadas | null = null;

  switch (orientacion) {
    case OrientacionCasilla.SuperiorIzquierda:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.INICIO
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 };
      }
      break;
    case OrientacionCasilla.SuperiorDerecha:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.CENTRAL ||
        tipoCasilla === CasillaTypeEnum.SALIDA
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 };
      } else if (tipoCasilla === CasillaTypeEnum.FINAL) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y };
      }
      break;
    case OrientacionCasilla.InferiorIzquierda:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.INICIO ||
        tipoCasilla === CasillaTypeEnum.SALIDA
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 };
      } else if (tipoCasilla === CasillaTypeEnum.FINAL) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y };
      }
      break;
    case OrientacionCasilla.InferiorDerecha:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.INICIO
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 };
      } else if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y };
      }
      break;
    case OrientacionCasilla.IzquierdaSuperior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.INICIO ||
        tipoCasilla === CasillaTypeEnum.SALIDA ||
        tipoCasilla === CasillaTypeEnum.CENTRAL
      ) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y };
      }
      if (tipoCasilla === CasillaTypeEnum.FINAL) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 };
      }
      break;
    case OrientacionCasilla.IzquierdaInferior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.INICIO ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO
      ) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y };
      } else if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 };
      }
      break;
    case OrientacionCasilla.DerechaSuperior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.INICIO
      ) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y };
      } else if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 };
      }
      break;
    case OrientacionCasilla.DerechaInferior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.CENTRAL ||
        tipoCasilla === CasillaTypeEnum.SALIDA
      ) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y };
      } else if (tipoCasilla === CasillaTypeEnum.FINAL) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 };
      }
      break;
    default:
      return null; // Orientación no reconocida o movimiento no permitido
  }

  return nuevaPosicion;
}

function calcularNuevaPosicionHaciaAtras(
  posicionActual: Coordenadas,
  orientacion: OrientacionCasilla,
  tipoCasilla: CasillaTypeEnum,
): Coordenadas | null {
  let nuevaPosicion: Coordenadas | null = null;

  switch (orientacion) {
    case OrientacionCasilla.SuperiorIzquierda:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.CENTRAL
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 }; // Mover hacia abajo
      } else if (tipoCasilla === CasillaTypeEnum.INICIO) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y }; // Mover hacia abajo
      }
      break;
    case OrientacionCasilla.SuperiorDerecha:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.FINAL ||
        tipoCasilla === CasillaTypeEnum.SALIDA
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 }; // Mover hacia arriba
      } else if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y };
      }
      break;
    case OrientacionCasilla.InferiorIzquierda:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.FINAL ||
        tipoCasilla === CasillaTypeEnum.SALIDA
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 }; // Mover hacia abajo
      } else if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y };
      }
      break;
    case OrientacionCasilla.InferiorDerecha:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.CENTRAL
      ) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 }; // Mover hacia arriba
      } else if (tipoCasilla === CasillaTypeEnum.INICIO) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y };
      }
      break;
    case OrientacionCasilla.IzquierdaSuperior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.FINAL ||
        tipoCasilla === CasillaTypeEnum.SALIDA ||
        tipoCasilla === CasillaTypeEnum.CENTRAL
      ) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y }; // Mover hacia la derecha
      }
      if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 }; // Mover hacia arriba
      }
      break;
    case OrientacionCasilla.IzquierdaInferior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.CENTRAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO
      ) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y }; // Mover hacia la izquierda
      } else if (tipoCasilla === CasillaTypeEnum.INICIO) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y - 1 }; // Mover hacia arriba
      }
      break;
    case OrientacionCasilla.DerechaSuperior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.CENTRAL
      ) {
        nuevaPosicion = { X: posicionActual.X + 1, Y: posicionActual.Y }; // Mover hacia la derecha
      } else if (tipoCasilla === CasillaTypeEnum.INICIO) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 }; // Mover hacia abajo
      }
      break;
    case OrientacionCasilla.DerechaInferior:
      if (
        tipoCasilla === CasillaTypeEnum.NORMAL ||
        tipoCasilla === CasillaTypeEnum.TRIANGULO ||
        tipoCasilla === CasillaTypeEnum.FINAL ||
        tipoCasilla === CasillaTypeEnum.SALIDA
      ) {
        nuevaPosicion = { X: posicionActual.X - 1, Y: posicionActual.Y }; // Mover hacia la izquierda
      } else if (tipoCasilla === CasillaTypeEnum.CENTRAL) {
        nuevaPosicion = { X: posicionActual.X, Y: posicionActual.Y + 1 }; // Mover hacia abajo
      }
      break;
    default:
      return null; // Orientación no reconocida o movimiento no permitido
  }

  return nuevaPosicion;
}
