import {
  Casilla,
  CasillaTypeEnum,
  OrientacionCasilla,
  Tablero,
} from '@prisma/client';

const esCasillaDeCruz = (size: number, fila: number, columna: number) => {
  const medio = size / 2;
  return (
    (fila >= medio - 1 && fila <= medio) ||
    (columna >= medio - 1 && columna <= medio) ||
    (fila >= 0 && fila < medio - 1 && columna === medio - 1) ||
    (fila > medio && fila < size && columna === medio - 1) ||
    (columna >= 0 && columna < medio - 1 && fila === medio - 1) ||
    (columna > medio && columna < size && fila === medio - 1)
  );
};

const esCasillaCentro = (size: number, fila: number, columna: number) => {
  const medio = size / 2;
  return (
    (fila === medio - 1 || fila === medio) &&
    (columna === medio - 1 || columna === medio)
  );
};

const esCasillaFinal = (size: number, fila: number, columna: number) => {
  const medio = size / 2;
  return (
    (fila === size - 1 && columna === medio - 1) ||
    (fila === 0 && columna === medio) ||
    (fila === medio - 1 && columna === 0) ||
    (fila === medio && columna === size - 1)
  );
};

const esCasillaInicio = (size: number, fila: number, columna: number) => {
  const medio = size / 2;
  return (
    (fila === size - 1 && columna === medio) ||
    (fila === 0 && columna === medio - 1) ||
    (fila === medio && columna === 0) ||
    (fila === medio - 1 && columna === size - 1)
  );
};

const esCasillaTriangulo = (size: number, fila: number, columna: number) => {
  const medio = size / 2;
  return (
    (fila === size - 3 && columna === medio - 1) ||
    (fila === size - 3 && columna === medio) ||
    (fila === medio - 1 && columna === size - 3) ||
    (fila === medio && columna === size - 3) ||
    (fila === 2 && columna === medio - 1) ||
    (fila === 2 && columna === medio) ||
    (fila === medio - 1 && columna === 2) ||
    (fila === medio && columna === 2)
  );
};

const esCasillaSalida = (size: number, fila: number, columna: number) => {
  const medio = size / 2;
  return (
    (fila === medio - 2 && columna === medio) ||
    (fila === medio && columna === medio + 1) ||
    (fila === medio - 1 && columna === medio - 2) ||
    (fila === medio + 1 && columna === medio - 1)
  );
};

const getTipoCasilla = (
  size: number,
  fila: number,
  columna: number,
): CasillaTypeEnum => {
  if (esCasillaCentro(size, fila, columna)) return CasillaTypeEnum.CENTRAL;
  if (esCasillaFinal(size, fila, columna)) return CasillaTypeEnum.FINAL;
  if (esCasillaInicio(size, fila, columna)) return CasillaTypeEnum.INICIO;
  if (esCasillaTriangulo(size, fila, columna)) return CasillaTypeEnum.TRIANGULO;
  if (esCasillaSalida(size, fila, columna)) return CasillaTypeEnum.SALIDA;
  return CasillaTypeEnum.NORMAL;
};

const getOrientacion = (
  size: number,
  fila: number,
  columna: number,
): OrientacionCasilla => {
  const medio = size / 2;

  // Casillas en el brazo izquierdo
  if (fila === medio - 1 && columna < medio)
    return OrientacionCasilla.IzquierdaSuperior;
  if (fila === medio && columna < medio)
    return OrientacionCasilla.IzquierdaInferior;

  // Casillas en el brazo derecho
  if (fila === medio - 1 && columna > medio)
    return OrientacionCasilla.DerechaSuperior;
  if (fila === medio && columna > medio)
    return OrientacionCasilla.DerechaInferior;

  // Casillas en el brazo superior
  if (fila < medio && columna === medio - 1)
    return OrientacionCasilla.SuperiorIzquierda;
  if (fila < medio && columna === medio)
    return OrientacionCasilla.SuperiorDerecha;

  // Casillas en el brazo inferior
  if (fila > medio && columna === medio - 1)
    return OrientacionCasilla.InferiorIzquierda;
  if (fila > medio && columna === medio)
    return OrientacionCasilla.InferiorDerecha;

  return OrientacionCasilla.InferiorDerecha; // Default orientation
};

export const generarTablero = (size: number = 8) => {
  const casillas: Casilla[] = [];
  let id = 0;
  for (let fila = 0; fila < size; fila++) {
    for (let columna = 0; columna < size; columna++) {
      if (esCasillaDeCruz(size, fila, columna)) {
        const tipo = getTipoCasilla(size, fila, columna);
        const orientacion = getOrientacion(size, fila, columna);

        const Casilla: Casilla = {
          id: id++,
          ocupanteId: null,
          orientacion: orientacion,
          posicion: { X: columna, Y: fila },
          tipo: tipo,
        };
        casillas.push(Casilla);
      } else {
        // Aquí puedes crear una casilla "vacía" en lugar de `null`
        const casillaVacia: Casilla = {
          id: null, // O algún valor por defecto
          ocupanteId: null,
          orientacion: OrientacionCasilla.InferiorDerecha, // O algún valor por defecto
          posicion: { X: columna, Y: fila }, // O algún valor por defecto
          tipo: CasillaTypeEnum.OCULTA, // O algún valor por defecto
        };
        casillas.push(casillaVacia);
      }
    }
  }
  const tablero: Tablero = {
    casillas: casillas,
    numeroCasillasPorAspa: size,
  };
  return tablero;
};
